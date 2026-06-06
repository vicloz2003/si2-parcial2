import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AdminPayment, AdminPaymentSummary } from '../../models/interfaces';
import { AppIconComponent } from '../../shared/app-icon.component';

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [CommonModule, FormsModule, AppIconComponent],
  template: `
    <div class="animate-reveal space-y-6">

      <!-- ── Header ── -->
      <header class="space-y-2">
        <div class="inline-flex items-center gap-2 rounded-lg border border-slate-200/60 bg-white px-3 py-1.5 shadow-sm dark:border-white/8 dark:bg-white/5">
          <div class="flex h-4 w-4 items-center justify-center text-emerald-500">
            <app-icon name="payments" [size]="14" />
          </div>
          <span class="font-mono text-[0.65rem] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-white/50">Tesorería</span>
          <span class="h-3.5 w-px bg-slate-200 dark:bg-white/10"></span>
          <span class="font-mono text-[0.65rem] text-slate-400 dark:text-white/30">{{ payments.length }} transacciones</span>
        </div>
        <h1 class="font-display text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Pagos&nbsp;<span class="text-slate-400 dark:text-white/40">/ comisiones</span>
        </h1>
        <p class="text-sm text-slate-400 dark:text-white/35">Control económico global de la plataforma</p>
      </header>

      <!-- ── Stats ── -->
      <section class="grid grid-cols-2 gap-4 lg:grid-cols-4" *ngIf="summary">
        <div *ngFor="let s of statCards()"
             class="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-card-hover dark:border-white/8 dark:bg-hero-soft">
          <div class="absolute left-0 top-0 h-full w-[3px] rounded-l-2xl" [ngClass]="s.accentBar"></div>
          <span class="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 blur-xl transition-all duration-500 group-hover:scale-125 group-hover:opacity-30" [ngClass]="s.glow"></span>
          <div class="p-5">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl" [ngClass]="s.tile">
              <app-icon [name]="s.icon" [size]="20" />
            </div>
            <div class="mt-4">
              <div class="font-display text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none">{{ s.value }}</div>
              <div class="font-mono mt-1.5 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-white/30">{{ s.label }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Filtros ── -->
      <div class="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:flex-row dark:border-white/8 dark:bg-hero-soft">
        <div class="relative flex-1">
          <app-icon name="search" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30" />
          <input [(ngModel)]="searchTerm" (input)="applyFilter()" placeholder="Buscar cliente, taller o ID de incidente…"
                 class="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-700 outline-none transition
                        focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-black/8
                        dark:border-white/8 dark:bg-white/5 dark:text-white dark:placeholder:text-white/25
                        dark:focus:border-white/30 dark:focus:ring-white/8">
        </div>
        <select [(ngModel)]="methodFilter" (change)="applyFilter()"
                class="h-10 cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none transition
                       focus:border-slate-400 focus:ring-2 focus:ring-black/8
                       dark:border-white/8 dark:bg-white/5 dark:text-white dark:[color-scheme:dark]
                       dark:focus:border-white/30 sm:w-48">
          <option value="">Todos los métodos</option>
          <option value="card">Tarjeta</option>
          <option value="cash">Efectivo</option>
        </select>
      </div>

      <!-- ── Tabla ── -->
      <div *ngIf="filteredPayments.length > 0; else emptyTpl"
           class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card dark:border-white/8 dark:bg-hero-soft">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-100 bg-slate-50/80 text-left dark:border-white/6 dark:bg-white/4">
                <th class="whitespace-nowrap px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 dark:text-white/30">Inc.</th>
                <th class="whitespace-nowrap px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 dark:text-white/30">Cliente</th>
                <th class="whitespace-nowrap px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 dark:text-white/30">Taller</th>
                <th class="whitespace-nowrap px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 dark:text-white/30">Método</th>
                <th class="whitespace-nowrap px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 dark:text-white/30">Monto</th>
                <th class="whitespace-nowrap px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 dark:text-white/30">Comisión</th>
                <th class="whitespace-nowrap px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 dark:text-white/30">Fecha</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-white/5">
              <tr *ngFor="let p of filteredPayments"
                  class="group transition hover:bg-slate-50/80 dark:hover:bg-white/4">
                <!-- ID incidente -->
                <td class="whitespace-nowrap px-4 py-3">
                  <span class="font-mono text-xs font-bold text-slate-400 dark:text-white/30">#{{ p.incident_id }}</span>
                </td>
                <!-- Cliente -->
                <td class="whitespace-nowrap px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{{ p.client_name || 'Cliente' }}</td>
                <!-- Taller -->
                <td class="whitespace-nowrap px-4 py-3 text-slate-500 dark:text-slate-400">{{ p.workshop_name || '—' }}</td>
                <!-- Método — coloreado -->
                <td class="whitespace-nowrap px-4 py-3">
                  <span class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold"
                        [ngClass]="p.payment_method === 'cash'
                          ? 'bg-emerald-500/12 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
                          : 'bg-blue-500/12 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300'">
                    <app-icon [name]="p.payment_method === 'cash' ? 'payments' : 'credit_card'" [size]="11" />
                    {{ p.payment_method === 'cash' ? 'Efectivo' : 'Tarjeta' }}
                  </span>
                </td>
                <!-- Monto — protagonista -->
                <td class="whitespace-nowrap px-4 py-3">
                  <span class="font-mono text-sm font-black text-slate-900 dark:text-white">
                    Bs {{ p.amount | number:'1.2-2' }}
                  </span>
                </td>
                <!-- Comisión con tasa % -->
                <td class="whitespace-nowrap px-4 py-3">
                  <div class="flex items-center gap-1.5">
                    <span class="font-mono text-xs text-slate-500 dark:text-slate-400">Bs {{ p.commission_amount | number:'1.2-2' }}</span>
                    <span class="rounded bg-violet-500/10 px-1 py-0.5 font-mono text-[9px] font-bold text-violet-600 dark:bg-violet-500/15 dark:text-violet-400">
                      {{ commissionRate(p.amount, p.commission_amount) }}%
                    </span>
                  </div>
                </td>
                <!-- Fecha -->
                <td class="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-400 dark:text-white/30">
                  {{ p.created_at | date:'dd/MM/yy HH:mm' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <ng-template #emptyTpl>
        <div class="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-20 text-center shadow-card dark:border-white/8 dark:bg-hero-soft">
          <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/5"><app-icon name="receipt_long" [size]="32" /></div>
          <div>
            <h3 class="font-display text-base font-bold text-slate-700 dark:text-slate-200">Sin pagos</h3>
            <p class="mt-1 text-sm text-slate-400">No hay transacciones que coincidan con los filtros.</p>
          </div>
        </div>
      </ng-template>
    </div>
  `,
})
export class AdminPaymentsComponent implements OnInit {
  payments: AdminPayment[] = [];
  filteredPayments: AdminPayment[] = [];
  summary: AdminPaymentSummary | null = null;
  searchTerm = '';
  methodFilter = '';

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.api.getAdminPaymentSummary().subscribe(summary => { this.summary = summary; this.cdr.markForCheck(); });
    this.api.getAdminPayments().subscribe(payments => { this.payments = payments; this.applyFilter(); this.cdr.markForCheck(); });
  }

  applyFilter() {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredPayments = this.payments.filter(payment => {
      const matchesMethod = !this.methodFilter || payment.payment_method === this.methodFilter;
      const haystack = [payment.client_name || '', payment.workshop_name || '', payment.transaction_id || '', String(payment.incident_id)].join(' ').toLowerCase();
      const matchesTerm = !term || haystack.includes(term);
      return matchesMethod && matchesTerm;
    });
  }

  /** Tasa de comisión como porcentaje redondeado */
  commissionRate(amount: number, commission: number): string {
    if (!amount) return '0';
    return Math.round((commission / amount) * 100).toString();
  }

  /** Stat cards — sistema visual unificado */
  statCards() {
    if (!this.summary) return [];
    return [
      { label: 'Total transacciones', icon: 'receipt_long',
        value: this.summary.total_payments,
        tile: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
        glow: 'bg-blue-500', accentBar: 'bg-blue-500' },
      { label: 'Volumen cobrado', icon: 'trending_up',
        value: 'Bs ' + (this.summary.total_amount || 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        tile: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
        glow: 'bg-emerald-500', accentBar: 'bg-emerald-500' },
      { label: 'Comisión plataforma', icon: 'account_balance',
        value: 'Bs ' + (this.summary.total_commission || 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        tile: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
        glow: 'bg-violet-500', accentBar: 'bg-violet-500' },
      { label: 'Pagos con tarjeta', icon: 'credit_card',
        value: 'Bs ' + (this.summary.card_amount || 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        tile: 'bg-amber-400/15 text-amber-600 dark:text-amber-400',
        glow: 'bg-amber-400', accentBar: 'bg-amber-400' },
    ];
  }
}