import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Technician } from '../../models/interfaces';
import { AppIconComponent } from '../../shared/app-icon.component';

@Component({
  selector: 'app-technicians',
  standalone: true,
  imports: [CommonModule, FormsModule, AppIconComponent],
  template: `
    <div class="animate-reveal space-y-6">
      <header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div class="space-y-1">
          <h1 class="font-display text-3xl font-bold text-slate-900 dark:text-white">Técnicos</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400">{{ technicians.length }} técnicos en tu equipo</p>
        </div>
        <button (click)="toggleForm()"
          class="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition active:scale-[0.98]"
          [ngClass]="showForm
            ? 'border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-hero-line dark:text-slate-300 dark:hover:bg-white/5'
            : 'bg-[#111111] dark:bg-white dark:text-[#111111] text-white shadow-[0_2px_12px_rgba(0,0,0,0.12)] hover:brightness-110'">
          <app-icon [name]="showForm ? 'close' : 'person_add'" />
          {{ showForm ? 'Cancelar' : 'Nuevo técnico' }}
        </button>
      </header>

      <div *ngIf="error && !loading"
           class="flex flex-wrap items-center gap-3 rounded-2xl border border-emergency-200 bg-emergency-50 px-4 py-3 text-sm text-emergency-700 dark:border-emergency-500/30 dark:bg-emergency-500/10 dark:text-emergency-300">
        <app-icon name="cloud_off" />
        <span>No se pudo cargar los técnicos</span>
        <button (click)="loadData()"
                class="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-emergency-300 px-3 py-1.5 text-xs font-semibold transition hover:bg-emergency-100 dark:border-emergency-500/40 dark:hover:bg-emergency-500/20">
          <app-icon name="refresh" [size]="16" /> Reintentar
        </button>
      </div>

      <!-- Form -->
      <div *ngIf="showForm"
           class="overflow-hidden rounded-2xl border border-slate-200 border-l-4 border-l-slate-900 dark:border-l-white/60 bg-white shadow-card dark:border-hero-line dark:border-l-slate-900 dark:border-l-white/60 dark:bg-hero-soft">
        <div class="flex items-center gap-3 border-b border-slate-100 p-5 dark:border-hero-line">
          <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/8 text-slate-900 dark:text-white">
            <app-icon [name]="editing ? 'edit' : 'person_add'" />
          </div>
          <div>
            <h3 class="font-display text-base font-bold text-slate-900 dark:text-white">{{ editing ? 'Editar técnico' : 'Nuevo técnico' }}</h3>
            <p class="text-xs text-slate-400">Completa la información del técnico</p>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-sm font-semibold text-slate-600 dark:text-slate-300">Nombre completo</label>
            <div class="relative">
              <app-icon name="badge" [size]="18" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2  text-slate-400" />
              <input [(ngModel)]="newTech.name" placeholder="Juan Pérez" [ngClass]="inputCls">
            </div>
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-semibold text-slate-600 dark:text-slate-300">Teléfono</label>
            <div class="relative">
              <app-icon name="call" [size]="18" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2  text-slate-400" />
              <input [(ngModel)]="newTech.phone" placeholder="77712345" [ngClass]="inputCls">
            </div>
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-semibold text-slate-600 dark:text-slate-300">Correo electrónico</label>
            <div class="relative">
              <app-icon name="mail" [size]="18" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2  text-slate-400" />
              <input type="email" [(ngModel)]="newTech.email" placeholder="tecnico@email.com" [ngClass]="inputCls">
            </div>
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-semibold text-slate-600 dark:text-slate-300">{{ editing ? 'Nueva contraseña' : 'Contraseña' }}</label>
            <div class="relative">
              <app-icon name="lock_reset" [size]="18" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2  text-slate-400" />
              <input type="password" [(ngModel)]="newTech.password" [placeholder]="editing ? 'Dejar vacío para no cambiar' : '12345678*'" [ngClass]="inputCls">
            </div>
          </div>
          <div class="sm:col-span-2">
            <label class="mb-1.5 block text-sm font-semibold text-slate-600 dark:text-slate-300">Especialidades</label>
            <div class="flex flex-wrap gap-2">
              <button type="button" *ngFor="let opt of specOptions" (click)="toggleSpec(opt.value)"
                class="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition"
                [ngClass]="isSpecSelected(opt.value)
                  ? 'border-slate-900 dark:border-white/60 bg-slate-100 dark:bg-white/8 font-semibold text-slate-900 dark:text-white'
                  : 'border-transparent bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'">
                <app-icon [name]="opt.icon" [size]="16" />
                {{ opt.label }}
              </button>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2 border-t border-slate-100 p-5 dark:border-hero-line">
          <button (click)="resetForm()"
                  class="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-hero-line dark:text-slate-300 dark:hover:bg-white/5">
            Cancelar
          </button>
          <button (click)="saveTechnician()" [disabled]="!canSave()"
            class="inline-flex items-center gap-2 rounded-xl bg-success px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50">
            <app-icon [name]="editing ? 'save' : 'check'" [size]="18" />
            {{ editing ? 'Actualizar' : 'Guardar' }}
          </button>
        </div>
      </div>

      <!-- List -->
      <div *ngIf="technicians.length > 0; else emptyTpl" class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div *ngFor="let t of technicians"
             class="rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover dark:border-hero-line dark:bg-hero-soft">
          <div class="mb-3 flex items-start justify-between">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-[#111111] dark:bg-white dark:text-[#111111] font-bold text-white">{{ getInitials(t.name) }}</div>
            <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  [ngClass]="t.is_available ? 'bg-success/10 text-success' : 'bg-emergency-500/10 text-emergency-600 dark:text-emergency-300'">
              <span class="h-1.5 w-1.5 rounded-full" [ngClass]="t.is_available ? 'bg-success' : 'bg-emergency-500'"></span>
              {{ t.is_available ? 'Disponible' : 'Ocupado' }}
            </span>
          </div>

          <h3 class="font-display text-base font-bold text-slate-900 dark:text-white">{{ t.name }}</h3>

          <div class="mt-2 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
            <app-icon name="call" [size]="16" class="text-slate-400" />
            <a href="tel:{{ t.phone }}" class="transition hover:text-slate-900">{{ t.phone }}</a>
          </div>
          <div class="mt-1 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
            <app-icon name="mail" [size]="16" class="text-slate-400" />
            <a *ngIf="t.user_email; else noEmailTpl" href="mailto:{{ t.user_email }}" class="truncate transition hover:text-slate-900">{{ t.user_email }}</a>
            <ng-template #noEmailTpl><span>Sin correo asociado</span></ng-template>
          </div>

          <div class="mt-3 flex flex-wrap gap-1.5 border-b border-slate-100 pb-4 dark:border-hero-line/60">
            <span *ngFor="let s of t.specialties.split(',')"
                  class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-white/5 dark:text-slate-300">
              <app-icon [name]="getSpecIcon(s)" [size]="14" />
              {{ getSpecLabel(s) }}
            </span>
          </div>

          <div class="mt-3 flex gap-2">
            <button (click)="toggleAvailability(t)" [title]="t.is_available ? 'Marcar como ocupado' : 'Marcar como disponible'"
              class="flex h-10 flex-1 items-center justify-center rounded-lg border border-slate-200 transition hover:bg-slate-50 dark:border-hero-line dark:hover:bg-white/5"
              [ngClass]="t.is_available ? 'text-success' : 'text-amber-500'">
              <app-icon [name]="t.is_available ? 'pause_circle' : 'play_circle'" />
            </button>
            <button (click)="editTechnician(t)" title="Editar"
              class="flex h-10 flex-1 items-center justify-center rounded-lg border border-slate-200 text-info transition hover:bg-slate-50 dark:border-hero-line dark:hover:bg-white/5">
              <app-icon name="edit" />
            </button>
            <button (click)="deleteTechnician(t.id)" title="Eliminar"
              class="flex h-10 flex-1 items-center justify-center rounded-lg border border-slate-200 text-emergency-500 transition hover:bg-emergency-50 dark:border-hero-line dark:hover:bg-emergency-500/10">
              <app-icon name="delete" />
            </button>
          </div>
        </div>
      </div>

      <ng-template #emptyTpl>
        <div class="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-16 text-center shadow-card dark:border-hero-line dark:bg-hero-soft">
          <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/5">
            <app-icon name="engineering" [size]="36" />
          </div>
          <h3 class="font-display text-lg font-bold text-slate-700 dark:text-slate-200">Sin técnicos</h3>
          <p class="text-sm text-slate-400">Agrega tu primer técnico para empezar a asignar servicios.</p>
          <button *ngIf="!showForm" (click)="toggleForm()"
                  class="inline-flex items-center gap-1.5 rounded-xl bg-[#111111] dark:bg-white px-4 py-2 text-sm font-semibold text-white shadow-[0_2px_12px_rgba(0,0,0,0.12)] transition hover:bg-slate-800 dark:hover:bg-white/90">
            <app-icon name="person_add" [size]="18" /> Agregar técnico
          </button>
        </div>
      </ng-template>
    </div>
  `,
})
export class TechniciansComponent implements OnInit {
  technicians: Technician[] = [];
  loading = true;
  error = false;
  showForm = false;
  editing: number | null = null;
  newTech = {
    name: '',
    phone: '',
    email: '',
    password: '',
    specialties: 'battery,tire,crash,engine',
  };

  readonly inputCls =
    'w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-slate-900 dark:border-white/60 focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-slate-900 dark:ring-white/20 dark:border-hero-line dark:bg-white/5 dark:text-slate-200';

  specOptions = [
    { value: 'battery', label: 'Bateria', icon: 'battery_alert' },
    { value: 'tire', label: 'Llanta', icon: 'tire_repair' },
    { value: 'crash', label: 'Choque', icon: 'car_crash' },
    { value: 'engine', label: 'Motor', icon: 'settings' },
    { value: 'keys', label: 'Llaves', icon: 'key' },
    { value: 'other', label: 'Otro', icon: 'help' },
  ];

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.error = false;
    this.api.getTechnicians().subscribe({
      next: (data) => { this.technicians = data; this.loading = false; this.cdr.markForCheck(); },
      error: () => { this.loading = false; this.error = true; this.cdr.markForCheck(); }
    });
  }

  toggleForm() {
    if (this.showForm) {
      this.resetForm();
    } else {
      this.showForm = true;
    }
  }

  isSpecSelected(value: string): boolean {
    return this.newTech.specialties
      .split(',')
      .map((s) => s.trim())
      .includes(value);
  }

  toggleSpec(value: string) {
    const current = this.newTech.specialties
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const idx = current.indexOf(value);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(value);
    }
    this.newTech.specialties = current.join(',');
  }

  canSave(): boolean {
    return (
      this.newTech.name.trim().length > 0 &&
      this.newTech.phone.trim().length > 0 &&
      (!this.newTech.email.trim() || this.newTech.email.includes('@')) &&
      (!this.newTech.password || this.newTech.password.length >= 8) &&
      this.newTech.specialties.trim().length > 0
    );
  }

  saveTechnician() {
    if (!this.canSave()) return;
    const payload = {
      ...this.newTech,
      email: this.newTech.email.trim() || undefined,
      password: this.newTech.password || undefined,
    };
    if (this.editing) {
      this.api.updateTechnician(this.editing, payload).subscribe(() => {
        this.resetForm();
        this.loadData();
      });
    } else {
      this.api.createTechnician(payload).subscribe(() => {
        this.resetForm();
        this.loadData();
      });
    }
  }

  editTechnician(t: Technician) {
    this.editing = t.id;
    this.newTech = {
      name: t.name,
      phone: t.phone,
      email: t.user_email || '',
      password: '',
      specialties: t.specialties,
    };
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteTechnician(id: number) {
    if (confirm('Eliminar este tecnico?')) {
      this.api.deleteTechnician(id).subscribe(() => this.loadData());
    }
  }

  toggleAvailability(t: Technician) {
    this.api
      .updateTechnician(t.id, { is_available: !t.is_available })
      .subscribe(() => this.loadData());
  }

  resetForm() {
    this.showForm = false;
    this.editing = null;
    this.newTech = {
      name: '',
      phone: '',
      email: '',
      password: '',
      specialties: 'battery,tire,crash,engine',
    };
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }

  getSpecIcon(s: string): string {
    const icons: Record<string, string> = {
      battery: 'battery_alert',
      tire: 'tire_repair',
      crash: 'car_crash',
      engine: 'settings',
      keys: 'key',
      other: 'help',
    };
    return icons[s.trim()] || 'help';
  }

  getSpecLabel(s: string): string {
    const labels: Record<string, string> = {
      battery: 'Bateria',
      tire: 'Llanta',
      crash: 'Choque',
      engine: 'Motor',
      keys: 'Llaves',
      other: 'Otro',
    };
    return labels[s.trim()] || s;
  }
}
