import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { WebSocketService } from '../../services/websocket.service';
import { WorkshopInvitation } from '../../models/interfaces';

@Component({
  selector: 'app-invitations',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-content reveal">
      <div class="page-header">
        <div>
          <h1 class="page-title">Invitaciones</h1>
          <p class="page-subtitle">Emergencias a las que tu taller fue invitado. Responde antes de que expire.</p>
        </div>
        <button class="btn-refresh" (click)="load()" [disabled]="loading">
          <span class="material-symbols-rounded">refresh</span> Actualizar
        </button>
      </div>

      <div class="kpi-row">
        <div class="kpi"><span class="kpi-val">{{ pending.length }}</span><span class="kpi-lbl">Pendientes</span></div>
        <div class="kpi"><span class="kpi-val">{{ countBy('accepted') }}</span><span class="kpi-lbl">Aceptadas</span></div>
        <div class="kpi"><span class="kpi-val">{{ countBy('rejected') }}</span><span class="kpi-lbl">Rechazadas</span></div>
        <div class="kpi danger"><span class="kpi-val">{{ countBy('expired') }}</span><span class="kpi-lbl">Expiradas</span></div>
      </div>

      <h2 class="section-title">Pendientes de respuesta</h2>
      <div *ngIf="pending.length === 0" class="empty">No tienes invitaciones pendientes.</div>
      <div class="cards">
        <div class="inv-card" *ngFor="let inv of pending">
          <div class="inv-head">
            <span class="cat-badge" [attr.data-cat]="inv.incident_category">{{ inv.incident_category || 'incidente' }}</span>
            <span class="countdown" [class.urgent]="remaining(inv) <= 30">
              <span class="material-symbols-rounded">timer</span>
              {{ remaining(inv) > 0 ? (remaining(inv) + 's') : 'expirando...' }}
            </span>
          </div>
          <div class="inv-body">
            <div class="inv-row"><span class="material-symbols-rounded">warning</span> Solicitud #{{ inv.incident_id }}</div>
            <div class="inv-row" *ngIf="inv.distance_km != null"><span class="material-symbols-rounded">near_me</span> {{ inv.distance_km }} km</div>
            <div class="inv-row" *ngIf="inv.incident_priority"><span class="material-symbols-rounded">priority_high</span> Prioridad: {{ inv.incident_priority }}</div>
            <div class="inv-row" *ngIf="inv.incident_address"><span class="material-symbols-rounded">location_on</span> {{ inv.incident_address }}</div>
          </div>
          <div class="inv-actions">
            <button class="btn-accept" (click)="respond(inv, true)" [disabled]="busy.has(inv.id)">
              <span class="material-symbols-rounded">check</span> Yo atiendo
            </button>
            <button class="btn-reject" (click)="respond(inv, false)" [disabled]="busy.has(inv.id)">
              <span class="material-symbols-rounded">close</span> No puedo
            </button>
            <a class="btn-view" [routerLink]="['/incidents', inv.incident_id]">Ver caso</a>
          </div>
        </div>
      </div>

      <h2 class="section-title">Historial reciente</h2>
      <div *ngIf="responded.length === 0" class="empty">Sin respuestas registradas aun.</div>
      <table class="hist" *ngIf="responded.length > 0">
        <thead><tr><th>#</th><th>Categoria</th><th>Distancia</th><th>Respuesta</th><th>Tiempo resp.</th></tr></thead>
        <tbody>
          <tr *ngFor="let inv of responded">
            <td>{{ inv.incident_id }}</td>
            <td>{{ inv.incident_category || '-' }}</td>
            <td>{{ inv.distance_km != null ? inv.distance_km + ' km' : '-' }}</td>
            <td><span class="status-pill" [attr.data-st]="inv.status">{{ statusLabel(inv.status) }}</span></td>
            <td>{{ inv.response_time_seconds != null ? inv.response_time_seconds + 's' : '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .page-header { display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; margin-bottom:1.25rem; }
    .page-title { font-size:1.6rem; font-weight:800; color:var(--color-text-primary); }
    .page-subtitle { color:var(--color-text-secondary); font-size:.9rem; }
    .btn-refresh { display:flex; align-items:center; gap:.4rem; padding:.5rem .9rem; border-radius:var(--radius-md); background:var(--color-surface-alt); color:var(--color-text-secondary); font-weight:600; }
    .btn-refresh:hover { color:var(--color-text-primary); }
    .kpi-row { display:grid; grid-template-columns:repeat(4,1fr); gap:.75rem; margin-bottom:1.5rem; }
    .kpi { background:var(--color-surface); border:1px solid var(--color-border); border-radius:var(--radius-lg); padding:1rem; display:flex; flex-direction:column; gap:.25rem; }
    .kpi-val { font-size:1.8rem; font-weight:800; color:var(--color-primary); }
    .kpi.danger .kpi-val { color:var(--color-danger); }
    .kpi-lbl { font-size:.75rem; text-transform:uppercase; letter-spacing:.04em; color:var(--color-text-tertiary); font-weight:600; }
    .section-title { font-size:1rem; font-weight:700; margin:1.5rem 0 .75rem; color:var(--color-text-primary); }
    .empty { color:var(--color-text-tertiary); padding:1rem; background:var(--color-surface-alt); border-radius:var(--radius-md); }
    .cards { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:1rem; }
    .inv-card { background:var(--color-surface); border:1px solid var(--color-border); border-radius:var(--radius-lg); padding:1rem; display:flex; flex-direction:column; gap:.75rem; box-shadow:var(--shadow-sm); }
    .inv-head { display:flex; justify-content:space-between; align-items:center; }
    .cat-badge { text-transform:capitalize; font-weight:700; font-size:.8rem; padding:.25rem .6rem; border-radius:var(--radius-pill); background:var(--color-primary-50); color:var(--color-primary); }
    .countdown { display:flex; align-items:center; gap:.25rem; font-weight:700; font-size:.85rem; color:var(--color-text-secondary); }
    .countdown .material-symbols-rounded { font-size:1rem; }
    .countdown.urgent { color:var(--color-danger); }
    .inv-row { display:flex; align-items:center; gap:.5rem; font-size:.85rem; color:var(--color-text-secondary); }
    .inv-row .material-symbols-rounded { font-size:1.05rem; color:var(--color-text-tertiary); }
    .inv-actions { display:flex; gap:.5rem; margin-top:.25rem; flex-wrap:wrap; }
    .btn-accept, .btn-reject, .btn-view { display:flex; align-items:center; gap:.3rem; padding:.5rem .75rem; border-radius:var(--radius-md); font-weight:700; font-size:.85rem; }
    .btn-accept { background:var(--color-primary); color:var(--color-text-on-primary); }
    .btn-accept:disabled, .btn-reject:disabled { opacity:.5; }
    .btn-reject { background:rgba(230,57,70,.1); color:var(--color-danger); }
    .btn-view { background:var(--color-surface-alt); color:var(--color-text-secondary); }
    .hist { width:100%; border-collapse:collapse; background:var(--color-surface); border:1px solid var(--color-border); border-radius:var(--radius-lg); overflow:hidden; }
    .hist th, .hist td { text-align:left; padding:.6rem .8rem; font-size:.85rem; border-bottom:1px solid var(--color-border); }
    .hist th { background:var(--color-surface-alt); color:var(--color-text-tertiary); text-transform:uppercase; font-size:.7rem; letter-spacing:.04em; }
    .status-pill { font-size:.7rem; font-weight:700; padding:.15rem .5rem; border-radius:var(--radius-pill); text-transform:uppercase; }
    .status-pill[data-st=accepted] { background:rgba(45,180,120,.15); color:#2db478; }
    .status-pill[data-st=rejected] { background:rgba(230,57,70,.12); color:var(--color-danger); }
    .status-pill[data-st=expired] { background:var(--color-surface-alt); color:var(--color-text-tertiary); }
    @media (max-width:640px){ .kpi-row{ grid-template-columns:repeat(2,1fr); } }
  `],
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

  respond(inv: WorkshopInvitation, accept: boolean): void {
    this.busy.add(inv.id);
    const call = accept ? this.api.acceptInvitation(inv.id) : this.api.rejectInvitation(inv.id);
    call.subscribe({
      next: () => { this.busy.delete(inv.id); this.load(); },
      error: () => { this.busy.delete(inv.id); this.load(); },
    });
  }
}
