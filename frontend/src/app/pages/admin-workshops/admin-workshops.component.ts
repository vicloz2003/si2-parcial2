import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { User, Workshop } from '../../models/interfaces';
import { AppIconComponent } from '../../shared/app-icon.component';

@Component({
  selector: 'app-admin-workshops',
  standalone: true,
  imports: [CommonModule, FormsModule, AppIconComponent],
  template: `
    <div class="animate-reveal space-y-6">

      <!-- ── Header ── -->
      <header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div class="space-y-2">
          <div class="inline-flex items-center gap-2 rounded-lg border border-slate-200/60 bg-white px-3 py-1.5 shadow-sm dark:border-white/8 dark:bg-white/5">
            <div class="flex h-4 w-4 items-center justify-center text-emerald-500">
              <app-icon name="hub" [size]="14" />
            </div>
            <span class="font-mono text-[0.65rem] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-white/50">Red de socios</span>
            <span class="h-3.5 w-px bg-slate-200 dark:bg-white/10"></span>
            <span class="font-mono text-[0.65rem] font-bold text-emerald-600 dark:text-emerald-400">{{ availableCount }} activos</span>
          </div>
          <h1 class="font-display text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Talleres&nbsp;<span class="text-slate-400 dark:text-white/40">/ red</span>
          </h1>
          <p class="text-sm text-slate-400 dark:text-white/35">Supervisión de talleres registrados en RescateYa</p>
        </div>
      </header>

      <!-- ── Stats — mismo sistema que dashboard ── -->
      <section class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div *ngFor="let s of statCards()"
             class="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-card-hover dark:border-white/8 dark:bg-hero-soft">
          <div class="absolute left-0 top-0 h-full w-[3px] rounded-l-2xl" [ngClass]="s.accentBar"></div>
          <span class="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 blur-xl transition-all duration-500 group-hover:scale-125 group-hover:opacity-30" [ngClass]="s.glow"></span>
          <div class="p-5">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl" [ngClass]="s.tile">
              <app-icon [name]="s.icon" [size]="20" />
            </div>
            <div class="mt-4">
              <div class="font-display text-3xl font-black tracking-tight text-slate-900 dark:text-white">{{ s.value }}</div>
              <div class="font-mono mt-1 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-white/30">{{ s.label }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Búsqueda ── -->
      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-card dark:border-white/8 dark:bg-hero-soft">
        <div class="relative">
          <app-icon name="search" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30" />
          <input [(ngModel)]="searchTerm" (input)="applyFilter()" placeholder="Buscar por nombre, dirección, teléfono o servicio…"
                 class="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-700 outline-none transition
                        focus:border-slate-400 focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-black/8
                        dark:border-white/8 dark:bg-white/5 dark:text-white dark:placeholder:text-white/25
                        dark:focus:border-white/30 dark:focus:ring-white/8">
        </div>
      </div>

      <!-- ── Error ── -->
      <div *ngIf="error && !loading"
           class="flex flex-wrap items-center gap-3 rounded-2xl border border-emergency-200 bg-emergency-50 px-4 py-3 text-sm text-emergency-700 dark:border-emergency-500/30 dark:bg-emergency-500/10 dark:text-emergency-300">
        <app-icon name="cloud_off" />
        <span>No se pudo cargar talleres</span>
        <button (click)="loadData()" class="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-emergency-300 px-3 py-1.5 text-xs font-semibold transition hover:bg-emergency-100">
          <app-icon name="refresh" [size]="16" /> Reintentar
        </button>
      </div>

      <!-- ── Grid de talleres ── -->
      <div *ngIf="filteredWorkshops.length > 0; else emptyTpl"
           class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <article *ngFor="let w of filteredWorkshops"
                 class="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-card-hover dark:border-white/8 dark:bg-hero-soft">

          <!-- Barra izquierda: verde si disponible, gris si no -->
          <div class="absolute left-0 top-0 h-full w-[3px] rounded-l-2xl"
               [ngClass]="w.is_available ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'"></div>

          <!-- ── Card header ── -->
          <div class="flex items-start justify-between p-5 pb-4 pl-[1.4rem]">
            <div class="flex items-center gap-3">
              <!-- Avatar con inicial generada por nombre -->
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-black text-white shadow-sm"
                   [ngClass]="workshopAvatarCls(w.name)">
                {{ w.name.charAt(0).toUpperCase() }}
              </div>
              <div class="min-w-0">
                <h3 class="font-display text-[0.95rem] font-extrabold leading-tight text-slate-900 dark:text-white">{{ w.name }}</h3>
                <span class="font-mono text-[0.65rem] text-slate-400 dark:text-white/30">{{ ownerName(w.user_id) }}</span>
              </div>
            </div>
            <!-- Disponibilidad badge — más prominente -->
            <span class="shrink-0 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold"
                  [ngClass]="w.is_available
                    ? 'bg-emerald-500/12 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
                    : 'bg-slate-100 text-slate-500 dark:bg-white/6 dark:text-white/30'">
              <span class="h-1.5 w-1.5 rounded-full"
                    [ngClass]="w.is_available ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'"></span>
              {{ w.is_available ? 'Disponible' : 'Inactivo' }}
            </span>
          </div>

          <!-- ── Descripción ── -->
          <p class="px-5 pb-3 pl-[1.4rem] text-xs leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
            {{ w.description || 'Sin descripción registrada.' }}
          </p>

          <!-- ── Contacto ── -->
          <div class="space-y-1.5 px-5 pb-4 pl-[1.4rem]">
            <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <app-icon name="call" [size]="14" class="shrink-0 text-slate-400 dark:text-white/25" />
              {{ w.phone }}
            </div>
            <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <app-icon name="location_on" [size]="14" class="shrink-0 text-slate-400 dark:text-white/25" />
              {{ w.address }}
            </div>
          </div>

          <!-- ── Stats row ── -->
          <div class="mx-5 ml-[1.4rem] mb-4 flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-white/6 dark:bg-white/4">
            <!-- Rating con estrella -->
            <div class="flex flex-1 flex-col items-center">
              <div class="flex items-center gap-1">
                <app-icon name="star" [size]="14" class="text-amber-400" />
                <span class="font-mono text-base font-black text-slate-900 dark:text-white">{{ w.rating | number: '1.1-1' }}</span>
              </div>
              <span class="font-mono text-[0.58rem] font-bold uppercase tracking-wider text-slate-400">Rating</span>
            </div>
            <div class="h-8 w-px bg-slate-200 dark:bg-white/8"></div>
            <!-- Capacidad -->
            <div class="flex flex-1 flex-col items-center">
              <span class="font-mono text-base font-black text-slate-900 dark:text-white">{{ w.capacity }}</span>
              <span class="font-mono text-[0.58rem] font-bold uppercase tracking-wider text-slate-400">Técnicos</span>
            </div>
            <div class="h-8 w-px bg-slate-200 dark:bg-white/8"></div>
            <!-- Reviews -->
            <div class="flex flex-1 flex-col items-center">
              <span class="font-mono text-base font-black text-slate-900 dark:text-white">{{ w.total_ratings }}</span>
              <span class="font-mono text-[0.58rem] font-bold uppercase tracking-wider text-slate-400">Reviews</span>
            </div>
          </div>

          <!-- ── Servicios — chips coloreados por categoría ── -->
          <div class="flex flex-wrap gap-1.5 px-5 pb-5 pl-[1.4rem]">
            <span *ngFor="let svc of w.services.split(',')"
                  class="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
                  [ngClass]="serviceCls(svc.trim())">
              <app-icon [name]="serviceIcon(svc.trim())" [size]="11" />
              {{ getServiceLabel(svc) }}
            </span>
          </div>
        </article>
      </div>

      <!-- ── Estado vacío ── -->
      <ng-template #emptyTpl>
        <div class="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-20 text-center shadow-card dark:border-white/8 dark:bg-hero-soft">
          <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/5">
            <app-icon name="storefront" [size]="32" />
          </div>
          <div>
            <h3 class="font-display text-base font-bold text-slate-700 dark:text-slate-200">Sin talleres</h3>
            <p class="mt-1 text-sm text-slate-400">No hay talleres que coincidan con la búsqueda.</p>
          </div>
        </div>
      </ng-template>
    </div>
  `,
})
export class AdminWorkshopsComponent implements OnInit {
  workshops: Workshop[] = [];
  filteredWorkshops: Workshop[] = [];
  users: User[] = [];
  searchTerm = '';
  loading = true;
  error = false;

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.error = false;
    this.api.getUsers().subscribe({ next: users => { this.users = users; this.cdr.markForCheck(); }, error: () => {} });
    this.api.getWorkshops().subscribe({
      next: (workshops) => {
        this.workshops = workshops;
        this.applyFilter();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = true;
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  applyFilter() {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredWorkshops = this.workshops.filter(workshop => !term || [workshop.name, workshop.address, workshop.services, workshop.phone].some(value => value.toLowerCase().includes(term)));
  }

  get availableCount() {
    return this.workshops.filter(workshop => workshop.is_available).length;
  }

  get totalCapacity() {
    return this.workshops.reduce((sum, workshop) => sum + workshop.capacity, 0);
  }

  get averageRating() {
    if (!this.workshops.length) return 0;
    return this.workshops.reduce((sum, workshop) => sum + workshop.rating, 0) / this.workshops.length;
  }

  ownerName(userId: number) {
    return this.users.find(user => user.id === userId)?.full_name || `Usuario #${userId}`;
  }

  getServiceLabel(service: string) {
    const labels: Record<string, string> = {
      battery: 'Batería', tire: 'Llantas', crash: 'Chaperio',
      engine: 'Motor', keys: 'Llaves', other: 'Otros',
    };
    return labels[service.trim()] || service.trim();
  }

  /** Chips de servicio coloreados — mismo sistema que categorías de incidentes */
  serviceCls(svc: string): string {
    const map: Record<string, string> = {
      battery: 'bg-amber-400/12 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300',
      tire:    'bg-blue-500/12 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
      crash:   'bg-emergency-500/12 text-emergency-700 dark:bg-emergency-500/15 dark:text-emergency-300',
      engine:  'bg-violet-500/12 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
      keys:    'bg-slate-100 text-slate-600 dark:bg-white/8 dark:text-slate-300',
      other:   'bg-slate-100 text-slate-500 dark:bg-white/6 dark:text-slate-400',
    };
    return map[svc] || map['other'];
  }

  /** Ícono por tipo de servicio */
  serviceIcon(svc: string): string {
    const map: Record<string, string> = {
      battery: 'battery_alert',
      tire:    'tire_repair',
      crash:   'car_crash',
      engine:  'settings',
      keys:    'key',
      other:   'build',
    };
    return map[svc] || 'build';
  }

  /** Avatar con color generado a partir del nombre del taller */
  workshopAvatarCls(name: string): string {
    const palettes = [
      'bg-blue-500',
      'bg-emerald-500',
      'bg-violet-500',
      'bg-amber-500',
      'bg-rose-500',
      'bg-cyan-500',
      'bg-indigo-500',
      'bg-orange-500',
      'bg-teal-500',
      'bg-pink-500',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = (hash * 31 + name.charCodeAt(i)) & 0xff;
    }
    return palettes[hash % palettes.length];
  }

  /** Stat cards — misma estructura que dashboard */
  statCards() {
    return [
      {
        label: 'Talleres registrados', icon: 'store',
        value: this.workshops.length,
        tile: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
        glow: 'bg-blue-500', accentBar: 'bg-blue-500',
      },
      {
        label: 'Disponibles ahora', icon: 'task_alt',
        value: this.availableCount,
        tile: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
        glow: 'bg-emerald-500', accentBar: 'bg-emerald-500',
      },
      {
        label: 'Capacidad total', icon: 'engineering',
        value: this.totalCapacity,
        tile: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
        glow: 'bg-violet-500', accentBar: 'bg-violet-500',
      },
      {
        label: 'Rating promedio', icon: 'star',
        value: (this.averageRating | 0) === 0 && this.averageRating > 0
          ? this.averageRating.toFixed(1)
          : (this.averageRating || 0).toFixed(1),
        tile: 'bg-amber-400/15 text-amber-600 dark:text-amber-400',
        glow: 'bg-amber-400', accentBar: 'bg-amber-400',
      },
    ];
  }
}