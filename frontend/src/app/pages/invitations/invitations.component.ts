import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { WebSocketService } from '../../services/websocket.service';
import { WorkshopInvitation } from '../../models/interfaces';
import { AppIconComponent } from '../../shared/app-icon.component';

@Component({
  selector: 'app-invitations',
  standalone: true,
  imports: [CommonModule, RouterLink, AppIconComponent],
  template: `
    <div class="animate-reveal space-y-6">
      <header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div class="space-y-1">
          <h1 class="font-display text-3xl font-bold text-slate-900 dark:text-white">Invitaciones</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400">Emergencias a las que tu taller fue invitado. Responde antes de que expire.</p>
        </div>
        <button (click)="load()" [disabled]="loading"
                class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-hero-line dark:bg-hero-soft dark:text-slate-300 dark:hover:bg-white/5">
          <app-icon name="refresh" [size]="18" /> Actualizar
        </button>
      </header>

      <section class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-card dark:border-hero-line dark:bg-hero-soft">
          <span class="block font-display text-3xl font-bold text-slate-700 dark:text-white">{{ pending.length }}</span>
          <span class="text-xs font-semibold uppercase tracking-wide text-slate-400">Pendientes</span>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-card dark:border-hero-line dark:bg-hero-soft">
          <span class="block font-display text-3xl font-bold text-success">{{ countBy('accepted') }}</span>
          <span class="text-xs font-semibold uppercase tracking-wide text-slate-400">Aceptadas</span>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-card dark:border-hero-line dark:bg-hero-soft">
          <span class="block font-display text-3xl font-bold text-slate-500">{{ countBy('rejected') }}</span>
          <span class="text-xs font-semibold uppercase tracking-wide text-slate-400">Rechazadas</span>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-card dark:border-hero-line dark:bg-hero-soft">
          <span class="block font-display text-3xl font-bold text-emergency-500">{{ countBy('expired') }}</span>
          <span class="text-xs font-semibold uppercase tracking-wide text-slate-400">Expiradas</span>
        </div>
      </section>

      <h2 class="font-display text-lg font-bold text-slate-900 dark:text-white">Pendientes de respuesta</h2>
      <div *ngIf="pending.length === 0" class="rounded-2xl bg-slate-100 p-4 text-sm text-slate-400 dark:bg-white/5">No tienes invitaciones pendientes.</div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div *ngFor="let inv of pending"
             class="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-card dark:border-hero-line dark:bg-hero-soft">
          <div class="flex items-center justify-between">
            <span class="rounded-full bg-slate-100 dark:bg-white/8 px-3 py-1 text-xs font-bold capitalize text-slate-900 dark:text-white">{{ inv.incident_category || 'incidente' }}</span>
            <span class="inline-flex items-center gap-1 text-sm font-bold" [ngClass]="remaining(inv) <= 30 ? 'text-emergency-500' : 'text-slate-500 dark:text-slate-400'">
              <app-icon name="timer" [size]="18" />
              {{ remaining(inv) > 0 ? (remaining(inv) + 's') : 'expirando...' }}
            </span>
          </div>
          <div class="space-y-1.5">
            <div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><app-icon name="warning" [size]="18" class="text-slate-400" /> Solicitud #{{ inv.incident_id }}</div>
            <div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300" *ngIf="inv.distance_km != null"><app-icon name="near_me" [size]="18" class="text-slate-400" /> {{ inv.distance_km }} km</div>
            <div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300" *ngIf="inv.incident_priority"><app-icon name="priority_high" [size]="18" class="text-slate-400" /> Prioridad: {{ inv.incident_priority }}</div>
            <div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300" *ngIf="inv.incident_address"><app-icon name="location_on" [size]="18" class="text-slate-400" /> {{ inv.incident_address }}</div>
          </div>
          <div class="mt-1 flex flex-wrap gap-2">
            <button (click)="respond(inv, true)" [disabled]="busy.has(inv.id)"
              class="inline-flex items-center gap-1.5 rounded-lg bg-success px-3.5 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50">
              <app-icon name="check" [size]="18" /> Yo atiendo
            </button>
            <button (click)="respond(inv, false)" [disabled]="busy.has(inv.id)"
              class="inline-flex items-center gap-1.5 rounded-lg bg-emergency-500/10 px-3.5 py-2 text-sm font-semibold text-emergency-600 transition hover:bg-emergency-500/20 disabled:opacity-50 dark:text-emergency-300">
              <app-icon name="close" [size]="18" /> No puedo
            </button>
            <a [routerLink]="['/incidents', inv.incident_id]"
               class="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10">
              Ver caso
            </a>
          </div>
        </div>
      </div>

      <h2 class="font-display text-lg font-bold text-slate-900 dark:text-white">Historial reciente</h2>
      <div *ngIf="responded.length === 0" class="rounded-2xl bg-slate-100 p-4 text-sm text-slate-400 dark:bg-white/5">Sin respuestas registradas aún.</div>
      <div *ngIf="responded.length > 0" class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card dark:border-hero-line dark:bg-hero-soft">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-400 dark:border-hero-line dark:bg-white/5">
                <th class="px-4 py-3 font-semibold">#</th>
                <th class="px-4 py-3 font-semibold">Categoría</th>
                <th class="px-4 py-3 font-semibold">Distancia</th>
                <th class="px-4 py-3 font-semibold">Respuesta</th>
                <th class="px-4 py-3 font-semibold">Tiempo resp.</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let inv of responded" class="border-b border-slate-100 last:border-0 dark:border-hero-line/50">
                <td class="px-4 py-3 font-mono font-bold text-slate-400">{{ inv.incident_id }}</td>
                <td class="px-4 py-3 capitalize text-slate-700 dark:text-slate-200">{{ inv.incident_category || '-' }}</td>
                <td class="px-4 py-3 text-slate-600 dark:text-slate-300">{{ inv.distance_km != null ? inv.distance_km + ' km' : '-' }}</td>
                <td class="px-4 py-3">
                  <span class="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide" [ngClass]="statusPillCls(inv.status)">{{ statusLabel(inv.status) }}</span>
                </td>
                <td class="px-4 py-3 text-slate-600 dark:text-slate-300">{{ inv.response_time_seconds != null ? inv.response_time_seconds + 's' : '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class InvitationsComponent implements OnInit, OnDestroy {
  invitations: WorkshopInvitation[] = [];
  loading = false;
  busy = new Set<number>();
  now = Date.now();
  private wsSub: Subscription | null = null;
  private ticker: ReturnType<typeof setInterval> | null = null;

  constructor(private api: ApiService, private ws: WebSocketService) {}

  ngOnInit(): void {
    this.load();
    this.ws.connect();
    this.wsSub = this.ws.notifications$.subscribe((n) => {
      if (n.type === 'invitation') this.load();
    });
    this.ticker = setInterval(() => {
      this.now = Date.now();
      // Quita de pendientes las que ya expiraron localmente.
      if (this.pending.some((i) => this.remaining(i) <= -2)) this.load();
    }, 1000);
  }

  ngOnDestroy(): void {
    this.wsSub?.unsubscribe();
    if (this.ticker) clearInterval(this.ticker);
  }

  load(): void {
    this.loading = true;
    this.api.getMyInvitations().subscribe({
      next: (list) => { this.invitations = list; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  get pending(): WorkshopInvitation[] {
    return this.invitations.filter((i) => i.status === 'pending');
  }

  get responded(): WorkshopInvitation[] {
    return this.invitations.filter((i) => i.status !== 'pending').slice(0, 15);
  }

  countBy(status: string): number {
    return this.invitations.filter((i) => i.status === status).length;
  }

  remaining(inv: WorkshopInvitation): number {
    return Math.round((new Date(inv.expires_at).getTime() - this.now) / 1000);
  }

  statusLabel(s: string): string {
    return { accepted: 'Aceptada', rejected: 'Rechazada', expired: 'Expirada', pending: 'Pendiente' }[s] || s;
  }

  statusPillCls(s: string): string {
    const map: Record<string, string> = {
      accepted: 'bg-success/15 text-success',
      rejected: 'bg-emergency-500/10 text-emergency-600 dark:text-emergency-300',
      expired: 'bg-slate-100 text-slate-400 dark:bg-white/5',
      pending: 'bg-slate-100 dark:bg-white/8 text-slate-900 dark:text-white',
    };
    return map[s] || map['expired'];
  }

  respond(inv: WorkshopInvitation, accept: boolean): void {
    this.busy.add(inv.id);
    const call = accept ? this.api.acceptInvitation(inv.id) : this.api.rejectInvitation(inv.id);
    call.subscribe({
      next: () => { this.busy.delete(inv.id); this.load(); },
      error: () => { this.busy.delete(inv.id); this.load(); },
    });
  }
}
