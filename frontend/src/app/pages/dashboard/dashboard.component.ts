import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Incident, Workshop, Review } from '../../models/interfaces';
import { AppIconComponent } from '../../shared/app-icon.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, AppIconComponent],
  template: `
    <div class="animate-reveal space-y-6">
      <!-- Header -->
      <header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div class="space-y-2">
          <!-- Live badge — command-center aesthetic -->
          <div class="inline-flex items-center gap-2 rounded-lg border border-slate-200/60 bg-white px-3 py-1.5 shadow-sm dark:border-white/8 dark:bg-white/5">
            <span class="relative flex h-2 w-2">
              <span class="absolute inline-flex h-full w-full animate-beacon rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span class="font-mono text-[0.65rem] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-white/50">Panel en vivo</span>
            <span class="h-3.5 w-px bg-slate-200 dark:bg-white/10"></span>
            <span class="font-mono text-[0.65rem] text-slate-400 dark:text-white/30">{{ today }}</span>
          </div>
          <h1 class="font-display text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {{ greeting }},&nbsp;<span class="text-slate-500 dark:text-white/50">{{ firstName }}</span>
          </h1>
          <p class="text-sm text-slate-400 dark:text-white/35">
            {{ isAdmin ? 'Resumen general de la plataforma RescateYa' : 'Centro de operaciones de tu taller' }}
          </p>
        </div>
        <a routerLink="/incidents"
           class="inline-flex items-center justify-center gap-2 rounded-xl bg-[#111111] dark:bg-white dark:text-[#111111] px-5 py-3 text-sm font-semibold text-white shadow-[0_2px_12px_rgba(0,0,0,0.12)] transition hover:brightness-110 active:scale-[0.98]">
          <app-icon name="visibility" />
          Ver incidentes
        </a>
      </header>

      <!-- Workshop setup card -->
      <div *ngIf="!isAdmin && !workshop && !loading"
           class="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center dark:border-slate-300 dark:border-white/15 dark:bg-white/5">
        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white">
          <app-icon name="store" />
        </div>
        <div class="flex-1">
          <h3 class="font-display text-base font-bold text-slate-900 dark:text-white">Configura tu taller</h3>
          <p class="text-sm text-slate-600 dark:text-slate-300">
            Necesitas registrar la información de tu taller para empezar a recibir solicitudes de emergencia.
          </p>
        </div>
        <button class="inline-flex items-center justify-center gap-2 rounded-xl bg-[#111111] dark:bg-white px-4 py-2.5 text-sm font-semibold text-white shadow-[0_2px_12px_rgba(0,0,0,0.12)] transition hover:bg-slate-800 dark:hover:bg-white/90">
          <app-icon name="settings" />
          Configurar
        </button>
      </div>

      <!-- Error banner -->
      <div *ngIf="error && !loading"
           class="flex flex-wrap items-center gap-3 rounded-2xl border border-emergency-200 bg-emergency-50 px-4 py-3 text-sm text-emergency-700 dark:border-emergency-500/30 dark:bg-emergency-500/10 dark:text-emergency-300">
        <app-icon name="cloud_off" />
        <span>No se pudo cargar la información</span>
        <button (click)="loadData()"
                class="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-emergency-300 px-3 py-1.5 text-xs font-semibold transition hover:bg-emergency-100 dark:border-emergency-500/40 dark:hover:bg-emergency-500/20">
          <app-icon name="refresh" [size]="16" />
          Reintentar
        </button>
      </div>

      <!-- Stats -->
      <section *ngIf="isAdmin || workshop || loading"
               class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div *ngFor="let s of statCards()"
             class="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-card-hover dark:border-white/8 dark:bg-hero-soft">
          <!-- Colored left accent bar -->
          <div class="absolute left-0 top-0 h-full w-[3px] rounded-l-2xl" [ngClass]="s.accentBar"></div>
          <!-- Glow blob — 20% opacity, grows on hover -->
          <span class="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 blur-xl transition-all duration-500 group-hover:scale-125 group-hover:opacity-30"
                [ngClass]="s.glow"></span>
          <div class="p-5">
            <div class="flex items-start justify-between">
              <div class="flex h-11 w-11 items-center justify-center rounded-xl" [ngClass]="s.tile">
                <app-icon [name]="s.icon" [size]="22" />
              </div>
              <app-icon [name]="s.trendUp ? 'trending_up' : 'trending_down'" [size]="20"
                        [ngClass]="s.trendUp ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-600'" />
            </div>
            <div class="mt-4">
              <div class="font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-white/30">{{ s.label }}</div>
              <div class="font-display mt-1 text-3xl font-black tracking-tight text-slate-900 dark:text-white">{{ s.value }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Bento: charts row -->
      <section *ngIf="isAdmin || workshop" class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <!-- Weekly activity (2/3) -->
        <div class="rounded-2xl border border-slate-200 bg-white shadow-card lg:col-span-2 dark:border-white/8 dark:bg-hero-soft">
          <!-- Card header with accent top strip -->
          <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-white/6">
            <div class="flex items-center gap-2.5">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
                <app-icon name="bar_chart" [size]="18" />
              </div>
              <h3 class="font-display text-sm font-bold text-slate-900 dark:text-white">Actividad semanal</h3>
            </div>
            <span class="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-[0.6rem] font-semibold uppercase tracking-wide text-slate-400 dark:border-white/8 dark:bg-white/4 dark:text-white/30">7 días</span>
          </div>
          <div class="p-5">
            <div class="relative h-60">
              <canvas id="dash-weekly"></canvas>
            </div>
          </div>
        </div>

        <!-- Category distribution (1/3) -->
        <div class="rounded-2xl border border-slate-200 bg-white shadow-card dark:border-white/8 dark:bg-hero-soft">
          <div class="flex items-center gap-2.5 border-b border-slate-100 px-5 py-4 dark:border-white/6">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-emergency-500/10 text-emergency-600 dark:bg-emergency-500/15 dark:text-emergency-400">
              <app-icon name="donut_large" [size]="18" />
            </div>
            <h3 class="font-display text-sm font-bold text-slate-900 dark:text-white">Por categoría</h3>
          </div>
          <div class="p-5">
            <div class="relative h-60" *ngIf="categoryStats.length > 0; else emptyCat">
              <canvas id="dash-cat"></canvas>
            </div>
            <ng-template #emptyCat>
              <div class="flex h-60 flex-col items-center justify-center gap-2 text-slate-400">
                <app-icon name="pie_chart" [size]="36" />
                <p class="text-sm">Sin datos aún</p>
              </div>
            </ng-template>
          </div>
        </div>
      </section>

      <!-- Bottom row: recent incidents + activity timeline -->
      <section *ngIf="isAdmin || workshop" class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <!-- Recent incidents (2/3) -->
        <div class="rounded-2xl border border-slate-200 bg-white shadow-card lg:col-span-2 dark:border-white/8 dark:bg-hero-soft">
          <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-white/6">
            <div class="flex items-center gap-2.5">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-white/8 dark:text-white">
                <app-icon name="notifications_active" [size]="18" />
              </div>
              <h3 class="font-display text-sm font-bold text-slate-900 dark:text-white">Solicitudes recientes</h3>
            </div>
            <a routerLink="/incidents"
               class="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-white/40 dark:hover:bg-white/8 dark:hover:text-white">
              Ver todas
              <app-icon name="arrow_forward" [size]="16" />
            </a>
          </div>

          <div class="p-2">
            <div *ngIf="recentIncidents.length > 0; else emptyTpl" class="divide-y divide-slate-100 dark:divide-white/5">
              <a *ngFor="let inc of recentIncidents"
                 [routerLink]="['/incidents', inc.id]"
                 class="group flex items-center gap-3 rounded-xl p-3 transition hover:bg-slate-50 dark:hover:bg-white/4">
                <!-- Category icon with priority left accent -->
                <div class="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/8 text-slate-600 dark:text-white/70">
                  <app-icon [name]="getCategoryIcon(inc.category)" />
                  <!-- Priority dot -->
                  <span class="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-[#181818]"
                        [ngClass]="priorityDotCls(inc.priority)"></span>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="font-mono text-xs font-bold text-slate-400 dark:text-white/30">#{{ inc.id }}</span>
                    <span class="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                          [ngClass]="priorityCls(inc.priority)">{{ inc.priority }}</span>
                    <span class="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-white/8 dark:text-slate-300">
                      {{ getStatusLabel(inc.status) }}
                    </span>
                  </div>
                  <p class="mt-0.5 truncate text-sm text-slate-700 dark:text-slate-200">
                    {{ inc.ai_summary || inc.description || 'Sin descripción' }}
                  </p>
                  <div class="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span class="inline-flex items-center gap-1">
                      <app-icon name="location_on" [size]="13" />
                      {{ inc.address || ('Lat: ' + inc.latitude.toFixed(4)) }}
                    </span>
                    <span class="inline-flex items-center gap-1">
                      <app-icon name="schedule" [size]="13" />
                      {{ inc.created_at | date: 'short' }}
                    </span>
                  </div>
                </div>
                <app-icon name="chevron_right" [size]="18" class="shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-600 dark:text-white/20 dark:group-hover:text-white/60" />
              </a>
            </div>
          </div>

          <ng-template #emptyTpl>
            <div class="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/5">
                <app-icon name="inbox" [size]="30" />
              </div>
              <h3 class="font-display text-sm font-bold text-slate-600 dark:text-slate-300">Sin solicitudes</h3>
              <p class="text-sm text-slate-400">Las nuevas emergencias aparecerán aquí.</p>
            </div>
          </ng-template>
        </div>

        <!-- Activity timeline (1/3) -->
        <div class="rounded-2xl border border-slate-200 bg-white shadow-card dark:border-white/8 dark:bg-hero-soft">
          <div class="flex items-center gap-2.5 border-b border-slate-100 px-5 py-4 dark:border-white/6">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-emergency-500/10 text-emergency-600 dark:bg-emergency-500/15 dark:text-emergency-400">
              <app-icon name="timeline" [size]="18" />
            </div>
            <h3 class="font-display text-sm font-bold text-slate-900 dark:text-white">Actividad reciente</h3>
          </div>
          <div class="p-5">
            <div *ngIf="timelineItems.length > 0; else emptyTimelineTpl" class="space-y-5">
              <div *ngFor="let item of timelineItems; let last = last" class="relative flex gap-3">
                <!-- Connector line -->
                <div *ngIf="!last" class="absolute left-[5px] top-4 h-full w-px bg-slate-100 dark:bg-white/6"></div>
                <div class="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ring-[3px]" [ngClass]="timelineDotCls(item.type)"></div>
                <div class="min-w-0 flex-1 -mt-0.5 pb-0.5">
                  <p class="text-sm leading-snug text-slate-700 dark:text-slate-200">{{ item.text }}</p>
                  <span class="font-mono text-[0.65rem] text-slate-400">{{ item.time }}</span>
                </div>
              </div>
            </div>
            <ng-template #emptyTimelineTpl>
              <div class="flex flex-col items-center justify-center gap-2 py-12 text-slate-400">
                <app-icon name="history" [size]="30" />
                <p class="text-sm">Sin actividad reciente</p>
              </div>
            </ng-template>
          </div>
        </div>
      </section>

      <!-- Reviews section -->
      <section *ngIf="workshop && reviews.length > 0"
               class="rounded-2xl border border-slate-200 bg-white p-5 shadow-card dark:border-hero-line dark:bg-hero-soft">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="flex items-center gap-2 font-display text-base font-bold text-slate-900 dark:text-white">
            <app-icon name="reviews" class="text-slate-700 dark:text-white" />
            Reseñas de clientes
          </h3>
          <span class="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
            <app-icon name="star" [size]="18" />
            {{ (workshop.rating || 0) | number: '1.1-1' }}
            <small class="font-medium text-amber-500/70">({{ reviews.length }})</small>
          </span>
        </div>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div *ngFor="let r of reviews"
               class="rounded-xl border border-slate-200 p-4 dark:border-hero-line">
            <div class="flex items-center gap-3">
              <div class="flex h-9 w-9 items-center justify-center rounded-full bg-[#111111] dark:bg-white dark:text-[#111111] text-sm font-bold text-white">
                {{ r.user_name.charAt(0) || '?' }}
              </div>
              <div class="min-w-0 flex-1">
                <div class="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{{ r.user_name }}</div>
                <div class="text-xs text-slate-400">{{ r.created_at | date: 'mediumDate' }}</div>
              </div>
              <div class="flex">
                <app-icon *ngFor="let s of [1,2,3,4,5]" name="star" [size]="16"
                          [ngClass]="s <= r.rating ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'" />
              </div>
            </div>
            <p *ngIf="r.comment" class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{{ r.comment }}</p>
          </div>
        </div>
      </section>
    </div>
  `,
})
export class DashboardComponent implements OnInit, OnDestroy {
  workshop: Workshop | null = null;
  recentIncidents: Incident[] = [];
  allIncidents: Incident[] = [];
  pendingCount = 0;
  inProgressCount = 0;
  completedCount = 0;
  totalCommission = 0;
  loading = true;
  error = false;

  weeklyBars: { day: string; count: number; pct: number; color: string }[] = [];
  categoryStats: { key: string; label: string; count: number; pct: number }[] = [];
  timelineItems: { type: string; text: string; time: string }[] = [];
  reviews: Review[] = [];

  private weeklyChart?: Chart;
  private catChart?: Chart;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    this.weeklyChart?.destroy();
    this.catChart?.destroy();
  }

  loadData() {
    this.loading = true;
    this.error = false;

    this.api.getMyWorkshop().subscribe({
      next: (w) => {
        this.workshop = w;
        this.loading = false;
        this.cdr.markForCheck();
        this.renderCharts();
      },
      error: () => {
        this.workshop = null;
        this.loading = false;
        this.cdr.markForCheck();
      },
    });

    this.api.getIncidents().subscribe({
      next: (incidents) => {
        this.allIncidents = incidents;
        this.recentIncidents = incidents.slice(0, 6);
        this.pendingCount = incidents.filter(
          (i) => i.status === 'pending',
        ).length;
        this.inProgressCount = incidents.filter((i) =>
          ['assigned', 'in_progress'].includes(i.status),
        ).length;
        this.completedCount = incidents.filter(
          (i) => i.status === 'completed',
        ).length;
        this.totalCommission = incidents.reduce((sum, i) => sum + (i.commission_amount || 0), 0);
        this.buildWeeklyBars(incidents);
        this.buildCategoryStats(incidents);
        this.buildTimeline(incidents);
        this.cdr.markForCheck();
        this.renderCharts();
      },
      error: () => {
        this.error = true;
        this.cdr.markForCheck();
      },
    });

    if (!this.isAdmin) {
      this.api.getMyReviews().subscribe({
        next: (reviews) => {
          this.reviews = reviews;
          this.cdr.markForCheck();
        },
        error: () => {},
      });
    } else {
      this.reviews = [];
    }
  }

  /** Stat cards — colored left accent + semantic glow per KPI type. */
  statCards() {
    return [
      {
        label: 'Pendientes', value: this.pendingCount, icon: 'schedule',
        tile: 'bg-amber-400/15 text-amber-600 dark:text-amber-400',
        glow: 'bg-amber-400',
        accentBar: 'bg-amber-400',
        trendUp: this.pendingCount > 0,
      },
      {
        label: 'En proceso', value: this.inProgressCount, icon: 'build',
        tile: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
        glow: 'bg-blue-500',
        accentBar: 'bg-blue-500',
        trendUp: false,
      },
      {
        label: 'Completados', value: this.completedCount, icon: 'check_circle',
        tile: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
        glow: 'bg-emerald-500',
        accentBar: 'bg-emerald-500',
        trendUp: true,
      },
      {
        label: this.isAdmin ? 'Comisión' : 'Rating',
        value: this.isAdmin
          ? 'Bs ' + (this.totalCommission || 0).toLocaleString('es-BO', { maximumFractionDigits: 0 })
          : (this.workshop?.rating || 0).toFixed(1),
        icon: 'star',
        tile: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
        glow: 'bg-violet-500',
        accentBar: 'bg-violet-500',
        trendUp: true,
      },
    ];
  }

  priorityCls(priority: string): string {
    const map: Record<string, string> = {
      critical: 'bg-emergency-500/15 text-emergency-600 dark:bg-emergency-500/20 dark:text-emergency-300',
      high:     'bg-orange-500/15 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
      medium:   'bg-amber-400/15 text-amber-700 dark:bg-amber-400/20 dark:text-amber-300',
      low:      'bg-slate-100 text-slate-600 dark:bg-white/8 dark:text-slate-300',
    };
    return map[priority] || map['low'];
  }

  priorityDotCls(priority: string): string {
    const map: Record<string, string> = {
      critical: 'bg-emergency-500',
      high:     'bg-orange-500',
      medium:   'bg-amber-400',
      low:      'bg-slate-300 dark:bg-slate-600',
    };
    return map[priority] || 'bg-slate-300';
  }

  timelineDotCls(type: string): string {
    const map: Record<string, string> = {
      new: 'bg-[#111111] dark:bg-white ring-black/8 dark:ring-white/10',
      assigned: 'bg-info ring-info/15',
      progress: 'bg-amber-400 ring-amber-400/15',
      completed: 'bg-success ring-success/15',
    };
    return map[type] || map['new'];
  }

  private renderCharts() {
    // Flush *ngIf so the <canvas> elements exist before we query them.
    this.cdr.detectChanges();
    this.renderWeeklyChart();
    this.renderCategoryChart();
  }

  private renderWeeklyChart() {
    const el = document.getElementById('dash-weekly') as HTMLCanvasElement | null;
    if (!el) return;
    this.weeklyChart?.destroy();
    const todayIdx = this.weeklyBars.length - 1;
    // Semantic palette: blue bars for normal days, emergency-red for today
    const barColors = this.weeklyBars.map((_, i) =>
      i === todayIdx ? '#E63946' : '#3B82F6',
    );
    this.weeklyChart = new Chart(el, {
      type: 'bar',
      data: {
        labels: this.weeklyBars.map((b) => b.day),
        datasets: [
          {
            label: 'Incidentes',
            data: this.weeklyBars.map((b) => b.count),
            backgroundColor: barColors,
            borderRadius: 8,
            maxBarThickness: 40,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e293b',
            titleColor: '#94a3b8',
            bodyColor: '#f8fafc',
            padding: 10,
            cornerRadius: 8,
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8', font: { size: 11 } },
          },
          y: {
            beginAtZero: true,
            ticks: { color: '#94a3b8', precision: 0, font: { size: 11 } },
            grid: { color: 'rgba(148,163,184,0.10)' },
            border: { dash: [4, 4] },
          },
        },
      },
    });
  }

  private renderCategoryChart() {
    const el = document.getElementById('dash-cat') as HTMLCanvasElement | null;
    if (!el || this.categoryStats.length === 0) return;
    this.catChart?.destroy();
    // Semantic palette — each slice has a distinct, meaningful color
    // battery=blue, crash=red, engine=violet, tire=emerald, keys=amber, other=slate
    const palette = ['#3B82F6', '#E63946', '#8B5CF6', '#10B981', '#F59E0B', '#64748B'];
    this.catChart = new Chart(el, {
      type: 'doughnut',
      data: {
        labels: this.categoryStats.map((c) => c.label),
        datasets: [
          {
            data: this.categoryStats.map((c) => c.count),
            backgroundColor: this.categoryStats.map((_, i) => palette[i % palette.length]),
            borderWidth: 2,
            borderColor: 'transparent',
            hoverBorderColor: '#ffffff20',
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#94a3b8',
              boxWidth: 10,
              boxHeight: 10,
              padding: 16,
              usePointStyle: true,
              pointStyleWidth: 10,
              font: { size: 11 },
            },
          },
          tooltip: {
            backgroundColor: '#1e293b',
            titleColor: '#94a3b8',
            bodyColor: '#f8fafc',
            padding: 10,
            cornerRadius: 8,
          },
        },
      },
    });
  }

  private buildWeeklyBars(incidents: Incident[]) {
    const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    const counts = new Array(7).fill(0);
    const now = new Date();
    incidents.forEach(inc => {
      const d = new Date(inc.created_at);
      const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      if (diff < 7) {
        counts[d.getDay()]++;
      }
    });
    const max = Math.max(...counts, 1);
    const todayIdx = now.getDay();
    this.weeklyBars = [];
    for (let i = 6; i >= 0; i--) {
      const idx = (todayIdx - i + 7) % 7;
      const pct = (counts[idx] / max) * 100;
      this.weeklyBars.push({
        day: days[idx],
        count: counts[idx],
        pct: Math.max(pct, 4),
        color: i === 0 ? 'accent' : pct > 50 ? 'primary' : 'success',
      });
    }
  }

  private buildCategoryStats(incidents: Incident[]) {
    const labels: Record<string, string> = {
      battery: 'Bateria', tire: 'Llanta', crash: 'Choque',
      engine: 'Motor', keys: 'Llaves', other: 'Otro', uncertain: 'Incierto',
    };
    const map = new Map<string, number>();
    incidents.forEach(inc => {
      const cat = inc.category || 'other';
      map.set(cat, (map.get(cat) || 0) + 1);
    });
    const total = incidents.length || 1;
    this.categoryStats = Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([key, count]) => ({
        key,
        label: labels[key] || key,
        count,
        pct: (count / total) * 100,
      }));
  }

  private buildTimeline(incidents: Incident[]) {
    const sorted = [...incidents]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 8);

    this.timelineItems = sorted.map(inc => {
      let type = 'new';
      let text = `Nuevo incidente #${inc.id}`;
      if (inc.status === 'completed') {
        type = 'completed';
        text = `Incidente #${inc.id} completado`;
      } else if (inc.status === 'in_progress') {
        type = 'progress';
        text = `Incidente #${inc.id} en proceso`;
      } else if (inc.status === 'assigned') {
        type = 'assigned';
        text = `Incidente #${inc.id} asignado`;
      }
      return { type, text, time: this.timeAgo(inc.created_at) };
    });
  }

  private timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Justo ahora';
    if (mins < 60) return `Hace ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Hace ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Hace ${days}d`;
  }

  get firstName(): string {
    const user = this.auth.getCurrentUser();
    if (!user?.full_name) return 'Taller';
    return user.full_name.split(' ')[0];
  }

  get isAdmin(): boolean {
    return this.auth.getCurrentUser()?.role === 'admin';
  }

  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }

  get today(): string {
    return new Date().toLocaleDateString('es-BO', { weekday: 'short', day: 'numeric', month: 'short' });
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
    const labels: Record<string, string> = {
      battery: 'Bateria',
      tire: 'Llanta',
      crash: 'Choque',
      engine: 'Motor',
      keys: 'Llaves',
      other: 'Otro',
      uncertain: 'Incierto',
    };
    return labels[cat] || cat;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      assigned: 'Asignado',
      in_progress: 'En proceso',
      completed: 'Completado',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  }
}
