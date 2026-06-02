import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { MetricsSummary } from '../../models/interfaces';

@Component({
  selector: 'app-kpis',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-content reveal" *ngIf="m as data; else loadingTpl">
      <div class="page-header">
        <div>
          <h1 class="page-title">KPIs {{ data.scope === 'global' ? '— Plataforma' : '— Mi taller' }}</h1>
          <p class="page-subtitle">Indicadores clave de atencion de emergencias.</p>
        </div>
        <button class="btn-refresh" (click)="load()"><span class="material-symbols-rounded">refresh</span> Actualizar</button>
      </div>

      <!-- KPI cards -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <span class="material-symbols-rounded ic">schedule</span>
          <div><span class="val">{{ data.avg_assignment_min ?? '—' }}<small>min</small></span><span class="lbl">Tiempo prom. asignacion</span></div>
        </div>
        <div class="kpi-card">
          <span class="material-symbols-rounded ic">local_shipping</span>
          <div><span class="val">{{ data.avg_arrival_min ?? '—' }}<small>min</small></span><span class="lbl">Tiempo prom. llegada</span></div>
        </div>
        <div class="kpi-card">
          <span class="material-symbols-rounded ic">verified</span>
          <div><span class="val">{{ pct(data.sla.compliance_rate) }}</span><span class="lbl">Dentro del tiempo esperado (SLA)</span></div>
        </div>
        <div class="kpi-card danger">
          <span class="material-symbols-rounded ic">cancel</span>
          <div><span class="val">{{ pct(data.cancelled.cancellation_rate) }}</span><span class="lbl">Casos cancelados ({{ data.cancelled.cancelled }})</span></div>
        </div>
      </div>

      <div class="grid-2">
        <!-- Incidentes por categoria -->
        <div class="panel">
          <h3>Incidentes mas frecuentes</h3>
          <div class="bars">
            <div class="bar-row" *ngFor="let c of data.incidents_by_category">
              <span class="bar-lbl">{{ c.category }}</span>
              <div class="bar-track"><div class="bar-fill" [style.width.%]="rel(c.count, maxCategory)"></div></div>
              <span class="bar-val">{{ c.count }}</span>
            </div>
          </div>
        </div>

        <!-- Estado -->
        <div class="panel">
          <h3>Distribucion por estado</h3>
          <div class="bars">
            <div class="bar-row" *ngFor="let s of data.status_breakdown">
              <span class="bar-lbl">{{ s.status }}</span>
              <div class="bar-track"><div class="bar-fill alt" [style.width.%]="rel(s.count, maxStatus)"></div></div>
              <span class="bar-val">{{ s.count }}</span>
            </div>
          </div>
        </div>

        <!-- Talleres mas eficientes -->
        <div class="panel">
          <h3>Talleres mas eficientes</h3>
          <table class="tbl">
            <thead><tr><th>Taller</th><th>Compl.</th><th>Rating</th><th>Prom. atencion</th></tr></thead>
            <tbody>
              <tr *ngFor="let w of data.top_workshops">
                <td>{{ w.workshop_name }}</td>
                <td>{{ w.completed }}</td>
                <td>{{ w.rating }}</td>
                <td>{{ w.avg_completion_min != null ? w.avg_completion_min + ' min' : '—' }}</td>
              </tr>
              <tr *ngIf="data.top_workshops.length === 0"><td colspan="4" class="muted">Sin datos aun</td></tr>
            </tbody>
          </table>
        </div>

        <!-- Zonas -->
        <div class="panel">
          <h3>Zonas con mas incidencias</h3>
          <table class="tbl">
            <thead><tr><th>Lat</th><th>Lng</th><th>Incidencias</th></tr></thead>
            <tbody>
              <tr *ngFor="let z of data.zones">
                <td>{{ z.latitude }}</td><td>{{ z.longitude }}</td><td>{{ z.count }}</td>
              </tr>
              <tr *ngIf="data.zones.length === 0"><td colspan="3" class="muted">Sin datos aun</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Motivos de cancelacion -->
      <div class="panel" *ngIf="data.cancelled.reasons.length">
        <h3>Motivos de cancelacion</h3>
        <div class="chips">
          <span class="chip" *ngFor="let r of data.cancelled.reasons">{{ r.reason }} <b>{{ r.count }}</b></span>
        </div>
      </div>
    </div>

    <ng-template #loadingTpl>
      <div class="page-content"><p class="muted">Cargando KPIs...</p></div>
    </ng-template>
  `,
  styles: [`
    .page-header { display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; margin-bottom:1.25rem; }
    .page-title { font-size:1.6rem; font-weight:800; color:var(--color-text-primary); }
    .page-subtitle { color:var(--color-text-secondary); font-size:.9rem; }
    .btn-refresh { display:flex; align-items:center; gap:.4rem; padding:.5rem .9rem; border-radius:var(--radius-md); background:var(--color-surface-alt); color:var(--color-text-secondary); font-weight:600; }
    .kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:.9rem; margin-bottom:1.5rem; }
    .kpi-card { background:var(--color-surface); border:1px solid var(--color-border); border-radius:var(--radius-lg); padding:1rem; display:flex; gap:.85rem; align-items:center; box-shadow:var(--shadow-sm); }
    .kpi-card .ic { font-size:2rem; color:var(--color-primary); background:var(--color-primary-50); border-radius:var(--radius-md); padding:.4rem; }
    .kpi-card.danger .ic { color:var(--color-danger); background:rgba(230,57,70,.1); }
    .kpi-card .val { font-size:1.7rem; font-weight:800; color:var(--color-text-primary); display:block; }
    .kpi-card .val small { font-size:.8rem; font-weight:600; color:var(--color-text-tertiary); margin-left:.2rem; }
    .kpi-card .lbl { font-size:.72rem; text-transform:uppercase; letter-spacing:.04em; color:var(--color-text-tertiary); font-weight:600; }
    .grid-2 { display:grid; grid-template-columns:repeat(2,1fr); gap:1rem; }
    .panel { background:var(--color-surface); border:1px solid var(--color-border); border-radius:var(--radius-lg); padding:1.1rem; margin-bottom:1rem; }
    .panel h3 { font-size:.95rem; font-weight:700; margin-bottom:.9rem; color:var(--color-text-primary); }
    .bars { display:flex; flex-direction:column; gap:.6rem; }
    .bar-row { display:grid; grid-template-columns:90px 1fr 40px; align-items:center; gap:.6rem; }
    .bar-lbl { font-size:.8rem; color:var(--color-text-secondary); text-transform:capitalize; }
    .bar-track { height:.7rem; background:var(--color-surface-alt); border-radius:var(--radius-pill); overflow:hidden; }
    .bar-fill { height:100%; background:var(--color-primary); border-radius:var(--radius-pill); }
    .bar-fill.alt { background:var(--color-accent); }
    .bar-val { font-size:.8rem; font-weight:700; text-align:right; color:var(--color-text-secondary); }
    .tbl { width:100%; border-collapse:collapse; }
    .tbl th, .tbl td { text-align:left; padding:.45rem .5rem; font-size:.82rem; border-bottom:1px solid var(--color-border); }
    .tbl th { color:var(--color-text-tertiary); text-transform:uppercase; font-size:.68rem; letter-spacing:.04em; }
    .muted { color:var(--color-text-tertiary); }
    .chips { display:flex; flex-wrap:wrap; gap:.5rem; }
    .chip { background:var(--color-surface-alt); border-radius:var(--radius-pill); padding:.35rem .7rem; font-size:.8rem; color:var(--color-text-secondary); }
    .chip b { color:var(--color-primary); }
    @media (max-width:880px){ .kpi-grid{ grid-template-columns:repeat(2,1fr);} .grid-2{ grid-template-columns:1fr; } }
  `],
})
export class KpisComponent implements OnInit {
  m: MetricsSummary | null = null;
  maxCategory = 1;
  maxStatus = 1;

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.api.getMetricsSummary().subscribe({
      next: (data) => {
        this.m = data;
        this.maxCategory = Math.max(1, ...data.incidents_by_category.map((c) => c.count));
        this.maxStatus = Math.max(1, ...data.status_breakdown.map((s) => s.count));
      },
    });
  }

  rel(v: number, max: number): number { return Math.round((v / max) * 100); }
  pct(rate: number | null): string { return rate == null ? '—' : Math.round(rate * 100) + '%'; }
}
