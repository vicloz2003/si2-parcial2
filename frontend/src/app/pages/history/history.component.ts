import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Incident } from '../../models/interfaces';
import { AppIconComponent } from '../../shared/app-icon.component';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterLink, AppIconComponent],
  template: `
    <div class="animate-reveal space-y-6">
      <header class="space-y-1">
        <h1 class="font-display text-3xl font-bold text-slate-900 dark:text-white">Historial de atenciones</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ incidents.length }} servicios completados</p>
      </header>

      <div *ngIf="error && !loading"
           class="flex flex-wrap items-center gap-3 rounded-2xl border border-emergency-200 bg-emergency-50 px-4 py-3 text-sm text-emergency-700 dark:border-emergency-500/30 dark:bg-emergency-500/10 dark:text-emergency-300">
        <app-icon name="cloud_off" />
        <span>No se pudo cargar el historial</span>
        <button (click)="loadData()"
                class="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-emergency-300 px-3 py-1.5 text-xs font-semibold transition hover:bg-emergency-100 dark:border-emergency-500/40 dark:hover:bg-emergency-500/20">
          <app-icon name="refresh" [size]="16" />
          Reintentar
        </button>
      </div>

      <!-- Summary stats -->
      <section class="grid grid-cols-1 gap-4 sm:grid-cols-3" *ngIf="incidents.length > 0">
        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover dark:border-hero-line dark:bg-hero-soft">
          <div class="flex items-center gap-3">
            <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-info/10 text-info">
              <app-icon name="payments" [size]="22" />
            </div>
            <div>
              <div class="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">Ingreso bruto</div>
              <div class="font-mono text-xl font-bold text-slate-900 dark:text-white">Bs. {{ totalIngreso | number: '1.2-2' }}</div>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover dark:border-hero-line dark:bg-hero-soft">
          <div class="flex items-center gap-3">
            <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/8 text-slate-900 dark:text-white">
              <app-icon name="savings" [size]="22" />
            </div>
            <div>
              <div class="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">Comisión pagada</div>
              <div class="font-mono text-xl font-bold text-slate-900 dark:text-white">Bs. {{ totalComision | number: '1.2-2' }}</div>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover dark:border-hero-line dark:bg-hero-soft">
          <div class="flex items-center gap-3">
            <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-success/10 text-success">
              <app-icon name="trending_up" [size]="22" />
            </div>
            <div>
              <div class="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">Ganancia neta</div>
              <div class="font-mono text-xl font-bold text-slate-900 dark:text-white">Bs. {{ totalNeto | number: '1.2-2' }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Table -->
      <div *ngIf="incidents.length > 0; else emptyTpl"
           class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card dark:border-hero-line dark:bg-hero-soft">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-400 dark:border-hero-line dark:bg-white/5">
                <th class="whitespace-nowrap px-4 py-3 font-semibold">ID</th>
                <th class="whitespace-nowrap px-4 py-3 font-semibold">Fecha</th>
                <th class="whitespace-nowrap px-4 py-3 font-semibold">Categoría</th>
                <th class="whitespace-nowrap px-4 py-3 font-semibold">Prioridad</th>
                <th class="whitespace-nowrap px-4 py-3 font-semibold">Estado</th>
                <th class="whitespace-nowrap px-4 py-3 text-right font-semibold">Costo</th>
                <th class="whitespace-nowrap px-4 py-3 text-right font-semibold">Comisión</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let inc of incidents" [routerLink]="['/incidents', inc.id]"
                  class="cursor-pointer border-b border-slate-100 transition last:border-0 hover:bg-slate-50 dark:border-hero-line/50 dark:hover:bg-white/5">
                <td class="px-4 py-3 font-mono font-bold text-slate-400">#{{ inc.id }}</td>
                <td class="px-4 py-3">
                  <div class="flex flex-col leading-tight text-slate-700 dark:text-slate-200">
                    {{ inc.created_at | date: 'dd/MM/yyyy' }}
                    <small class="text-xs text-slate-400">{{ inc.created_at | date: 'HH:mm' }}</small>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    <app-icon [name]="getCategoryIcon(inc.category)" [size]="18" [ngClass]="catIconCls(inc.category)" />
                    {{ getCategoryLabel(inc.category) }}
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span class="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide" [ngClass]="priorityCls(inc.priority)">{{ inc.priority }}</span>
                </td>
                <td class="px-4 py-3">
                  <span class="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">{{ getStatusLabel(inc.status) }}</span>
                </td>
                <td class="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">
                  {{ inc.final_cost ? 'Bs. ' + (inc.final_cost | number: '1.2-2') : '-' }}
                </td>
                <td class="px-4 py-3 text-right text-slate-400">
                  {{ inc.commission_amount ? 'Bs. ' + (inc.commission_amount | number: '1.2-2') : '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <ng-template #emptyTpl>
        <div class="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-16 text-center shadow-card dark:border-hero-line dark:bg-hero-soft">
          <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/5">
            <app-icon name="history" [size]="36" />
          </div>
          <h3 class="font-display text-lg font-bold text-slate-700 dark:text-slate-200">Sin historial</h3>
          <p class="text-sm text-slate-400">Cuando completes servicios aparecerán aquí.</p>
        </div>
      </ng-template>
    </div>
  `,
})
export class HistoryComponent implements OnInit {
  incidents: Incident[] = [];
  loading = true;
  error = false;

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.error = false;
    this.api.getIncidents().subscribe({
      next: (data) => {
        this.incidents = data.filter((i) => i.status === 'completed');
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => { this.loading = false; this.error = true; this.cdr.markForCheck(); }
    });
  }

  get totalIngreso(): number {
    return this.incidents.reduce((sum, i) => sum + (i.final_cost || 0), 0);
  }

  get totalComision(): number {
    return this.incidents.reduce(
      (sum, i) => sum + (i.commission_amount || 0),
      0,
    );
  }

  get totalNeto(): number {
    return this.totalIngreso - this.totalComision;
  }

  catIconCls(cat: string): string {
    const map: Record<string, string> = {
      battery: 'text-amber-500',
      tire: 'text-info',
      crash: 'text-emergency-500',
      engine: 'text-slate-500',
      keys: 'text-slate-700 dark:text-white',
    };
    return map[cat] || 'text-slate-700 dark:text-white';
  }

  priorityCls(priority: string): string {
    const map: Record<string, string> = {
      critical: 'bg-emergency-500/15 text-emergency-600 dark:text-emergency-300',
      high: 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white',
      medium: 'bg-amber-400/15 text-amber-600 dark:text-amber-300',
      low: 'bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300',
    };
    return map[priority] || map['low'];
  }

  getCategoryIcon(cat: string): string {
    const icons: Record<string, string> = {
      battery: 'battery_alert',
      tire: 'tire_repair',
      crash: 'car_crash',
      engine: 'settings',
      keys: 'key',
      other: 'help',
      uncertain: 'psychology',
    };
    return icons[cat] || 'help';
  }

  getCategoryLabel(cat: string): string {
    const m: Record<string, string> = {
      battery: 'Bateria',
      tire: 'Llanta',
      crash: 'Choque',
      engine: 'Motor',
      keys: 'Llaves',
      other: 'Otro',
      uncertain: 'Incierto',
    };
    return m[cat] || cat;
  }

  getStatusLabel(s: string): string {
    const m: Record<string, string> = {
      pending: 'Pendiente',
      assigned: 'Asignado',
      in_progress: 'En proceso',
      completed: 'Completado',
      cancelled: 'Cancelado',
    };
    return m[s] || s;
  }
}
