import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Incident, Payment } from '../../models/interfaces';

interface MonthData {
  label: string;
  incidents: number;
  completed: number;
  revenue: number;
  commission: number;
}

interface CategoryStat {
  name: string;
  icon: string;
  count: number;
  pct: number;
  cssClass: string;
}

interface TechStat {
  name: string;
  completed: number;
  avgTime: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reports-page" *ngIf="!loading; else loadingTpl">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1>Reportes</h1>
          <p class="subtitle">Analisis y metricas de tu taller</p>
        </div>
        <div class="header-actions">
          <div class="period-select">
            <span class="material-symbols-rounded">calendar_today</span>
            <select [(ngModel)]="selectedPeriod" (ngModelChange)="onPeriodChange()">
              <option value="7">Ultimos 7 dias</option>
              <option value="30">Ultimos 30 dias</option>
              <option value="90">Ultimos 3 meses</option>
              <option value="365">Ultimo ano</option>
              <option value="0">Todo</option>
            </select>
          </div>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon kpi-blue">
            <span class="material-symbols-rounded">assignment</span>
          </div>
          <div class="kpi-body">
            <span class="kpi-value">{{ filteredIncidents.length }}</span>
            <span class="kpi-label">Total Incidentes</span>
          </div>
          <div class="kpi-trend" [class.up]="incidentsTrend >= 0" [class.down]="incidentsTrend < 0">
            <span class="material-symbols-rounded">{{ incidentsTrend >= 0 ? 'trending_up' : 'trending_down' }}</span>
            <span>{{ incidentsTrend | number:'1.0-0' }}%</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon kpi-green">
            <span class="material-symbols-rounded">check_circle</span>
          </div>
          <div class="kpi-body">
            <span class="kpi-value">{{ completedCount }}</span>
            <span class="kpi-label">Completados</span>
          </div>
          <div class="kpi-mini">
            <span>{{ completionRate | number:'1.0-0' }}% tasa</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon kpi-accent">
            <span class="material-symbols-rounded">payments</span>
          </div>
          <div class="kpi-body">
            <span class="kpi-value">Bs {{ totalRevenue | number:'1.2-2' }}</span>
            <span class="kpi-label">Ingresos</span>
          </div>
          <div class="kpi-trend" [class.up]="revenueTrend >= 0" [class.down]="revenueTrend < 0">
            <span class="material-symbols-rounded">{{ revenueTrend >= 0 ? 'trending_up' : 'trending_down' }}</span>
            <span>{{ revenueTrend | number:'1.0-0' }}%</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon kpi-red">
            <span class="material-symbols-rounded">receipt_long</span>
          </div>
          <div class="kpi-body">
            <span class="kpi-value">Bs {{ totalCommission | number:'1.2-2' }}</span>
            <span class="kpi-label">Comision plataforma</span>
          </div>
          <div class="kpi-mini">
            <span>Neto: Bs {{ totalRevenue - totalCommission | number:'1.2-2' }}</span>
          </div>
        </div>
      </div>

      <!-- Charts row -->
      <div class="charts-row">
        <!-- Monthly trend -->
        <div class="section-card">
          <div class="card-header">
            <div class="header-icon">
              <span class="material-symbols-rounded">show_chart</span>
            </div>
            <div>
              <h3>Tendencia Mensual</h3>
              <p>Incidentes e ingresos por mes</p>
            </div>
          </div>
          <div class="chart-body" *ngIf="monthlyData.length > 0; else noDataTpl">
            <div class="bar-chart">
              <div class="bar-item" *ngFor="let m of monthlyData">
                <div class="bar-stack">
                  <div class="bar-fill bar-completed" [style.height.px]="getBarHeight(m.completed, maxMonthIncidents)"></div>
                  <div class="bar-fill bar-pending" [style.height.px]="getBarHeight(m.incidents - m.completed, maxMonthIncidents)"></div>
                </div>
                <span class="bar-label">{{ m.label }}</span>
                <span class="bar-value">{{ m.incidents }}</span>
              </div>
            </div>
            <div class="chart-legend">
              <span class="legend-item"><span class="legend-dot dot-completed"></span> Completados</span>
              <span class="legend-item"><span class="legend-dot dot-pending"></span> Otros</span>
            </div>
          </div>
          <ng-template #noDataTpl>
            <div class="empty-state">
              <span class="material-symbols-rounded">bar_chart</span>
              <p>Sin datos para este periodo</p>
            </div>
          </ng-template>
        </div>

        <!-- Revenue trend -->
        <div class="section-card">
          <div class="card-header">
            <div class="header-icon accent-icon">
              <span class="material-symbols-rounded">account_balance_wallet</span>
            </div>
            <div>
              <h3>Ingresos Mensuales</h3>
              <p>Ingresos vs comisiones</p>
            </div>
          </div>
          <div class="chart-body" *ngIf="monthlyData.length > 0; else noRevenueTpl">
            <div class="revenue-bars">
              <div class="rev-item" *ngFor="let m of monthlyData">
                <div class="rev-bar-group">
                  <div class="rev-bar rev-income" [style.height.px]="getBarHeight(m.revenue, maxMonthRevenue)">
                    <span class="rev-tooltip" *ngIf="m.revenue > 0">Bs {{ m.revenue | number:'1.0-0' }}</span>
                  </div>
                  <div class="rev-bar rev-commission" [style.height.px]="getBarHeight(m.commission, maxMonthRevenue)"></div>
                </div>
                <span class="bar-label">{{ m.label }}</span>
              </div>
            </div>
            <div class="chart-legend">
              <span class="legend-item"><span class="legend-dot dot-income"></span> Ingresos</span>
              <span class="legend-item"><span class="legend-dot dot-commission"></span> Comision</span>
            </div>
          </div>
          <ng-template #noRevenueTpl>
            <div class="empty-state">
              <span class="material-symbols-rounded">payments</span>
              <p>Sin ingresos en este periodo</p>
            </div>
          </ng-template>
        </div>
      </div>

      <!-- Bottom row -->
      <div class="bottom-row">
        <!-- Categories breakdown -->
        <div class="section-card">
          <div class="card-header">
            <div class="header-icon cat-icon">
              <span class="material-symbols-rounded">category</span>
            </div>
            <div>
              <h3>Por Categoria</h3>
              <p>Distribucion de incidentes</p>
            </div>
          </div>
          <div class="card-body" *ngIf="categoryStats.length > 0; else noCatsTpl">
            <div class="category-row" *ngFor="let cat of categoryStats">
              <div class="cat-icon-sm" [ngClass]="cat.cssClass">
                <span class="material-symbols-rounded">{{ cat.icon }}</span>
              </div>
              <div class="cat-info">
                <div class="cat-head">
                  <span class="cat-name">{{ cat.name }}</span>
                  <span class="cat-count">{{ cat.count }}</span>
                </div>
                <div class="progress-track">
                  <div class="progress-fill" [ngClass]="'fill-' + cat.cssClass" [style.width.%]="cat.pct"></div>
                </div>
              </div>
              <span class="cat-pct">{{ cat.pct | number:'1.0-0' }}%</span>
            </div>
          </div>
          <ng-template #noCatsTpl>
            <div class="empty-state"><span class="material-symbols-rounded">category</span><p>Sin datos</p></div>
          </ng-template>
        </div>

        <!-- Status breakdown -->
        <div class="section-card">
          <div class="card-header">
            <div class="header-icon status-icon">
              <span class="material-symbols-rounded">donut_small</span>
            </div>
            <div>
              <h3>Por Estado</h3>
              <p>Estado actual de incidentes</p>
            </div>
          </div>
          <div class="card-body">
            <div class="status-grid">
              <div class="status-item" *ngFor="let s of statusStats">
                <div class="status-ring" [ngClass]="'ring-' + s.key">
                  <span class="status-num">{{ s.count }}</span>
                </div>
                <span class="status-name">{{ s.label }}</span>
                <span class="status-pct">{{ s.pct | number:'1.0-0' }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Technician performance -->
        <div class="section-card">
          <div class="card-header">
            <div class="header-icon tech-icon">
              <span class="material-symbols-rounded">engineering</span>
            </div>
            <div>
              <h3>Tecnicos</h3>
              <p>Rendimiento por tecnico</p>
            </div>
          </div>
          <div class="card-body" *ngIf="techStats.length > 0; else noTechTpl">
            <div class="tech-list">
              <div class="tech-row" *ngFor="let t of techStats; let i = index">
                <span class="tech-rank">{{ i + 1 }}</span>
                <div class="tech-info">
                  <span class="tech-name">{{ t.name }}</span>
                  <span class="tech-meta">{{ t.completed }} completados</span>
                </div>
                <div class="tech-bar-wrap">
                  <div class="tech-bar" [style.width.%]="techStats.length > 0 ? (t.completed / techStats[0].completed * 100) : 0"></div>
                </div>
              </div>
            </div>
          </div>
          <ng-template #noTechTpl>
            <div class="empty-state"><span class="material-symbols-rounded">engineering</span><p>Sin datos de tecnicos</p></div>
          </ng-template>
        </div>
      </div>

      <!-- Priority breakdown -->
      <div class="section-card priority-card">
        <div class="card-header">
          <div class="header-icon priority-icon">
            <span class="material-symbols-rounded">priority_high</span>
          </div>
          <div>
            <h3>Por Prioridad</h3>
            <p>Distribucion de prioridades</p>
          </div>
        </div>
        <div class="priority-grid">
          <div class="priority-item" *ngFor="let p of priorityStats">
            <div class="priority-badge" [ngClass]="'badge-' + p.key">
              <span class="p-count">{{ p.count }}</span>
              <span class="p-label">{{ p.label }}</span>
            </div>
            <div class="priority-bar">
              <div class="priority-fill" [ngClass]="'pfill-' + p.key" [style.width.%]="p.pct"></div>
            </div>
            <span class="priority-pct">{{ p.pct | number:'1.0-0' }}%</span>
          </div>
        </div>
      </div>
    </div>

    <ng-template #loadingTpl>
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Generando reportes...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .reports-page { animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

    /* Header */
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: var(--space-xl);
      h1 { font-size: 26px; font-weight: 800; color: var(--color-text-primary); margin-bottom: 4px; }
      .subtitle { color: var(--color-text-secondary); font-size: 14px; }
    }

    .period-select {
      display: flex; align-items: center; gap: var(--space-sm);
      background: var(--color-surface); border: 1px solid var(--color-border);
      border-radius: var(--radius-md); padding: 8px 14px;
      .material-symbols-rounded { font-size: 18px; color: var(--color-text-tertiary); }
      select {
        border: none; background: transparent; font-size: 13px; font-weight: 600;
        color: var(--color-text-primary); outline: none; cursor: pointer;
        option { background: var(--color-surface); color: var(--color-text-primary); }
      }
    }

    /* KPI grid */
    .kpi-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-md);
      margin-bottom: var(--space-xl);
    }

    .kpi-card {
      background: var(--color-surface); border: 1px solid var(--color-border);
      border-radius: var(--radius-xl); padding: var(--space-lg);
      display: flex; align-items: center; gap: var(--space-md);
      transition: all 0.25s ease;
      &:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
    }

    .kpi-icon {
      width: 48px; height: 48px; border-radius: var(--radius-lg);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      .material-symbols-rounded { font-size: 24px; }
    }
    .kpi-blue { background: var(--color-primary-50); .material-symbols-rounded { color: var(--color-primary); } }
    .kpi-green { background: rgba(15, 173, 115, 0.08); .material-symbols-rounded { color: var(--color-success); } }
    .kpi-accent { background: rgba(255, 122, 0, 0.08); .material-symbols-rounded { color: var(--color-accent); } }
    .kpi-red { background: rgba(229, 62, 62, 0.08); .material-symbols-rounded { color: var(--color-danger); } }

    .kpi-body { flex: 1; min-width: 0; }
    .kpi-value {
      display: block; font-family: 'JetBrains Mono', monospace;
      font-size: 22px; font-weight: 800; color: var(--color-text-primary);
      line-height: 1.2; letter-spacing: -0.02em;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .kpi-label {
      font-size: 12px; font-weight: 600; color: var(--color-text-tertiary);
      text-transform: uppercase; letter-spacing: 0.04em;
    }

    .kpi-trend {
      display: flex; align-items: center; gap: 2px;
      font-size: 12px; font-weight: 700; border-radius: var(--radius-sm); padding: 4px 8px;
      .material-symbols-rounded { font-size: 16px; }
      &.up { color: var(--color-success); background: rgba(15, 173, 115, 0.08); }
      &.down { color: var(--color-danger); background: rgba(229, 62, 62, 0.08); }
    }

    .kpi-mini {
      font-size: 11px; font-weight: 700; color: var(--color-text-tertiary);
      background: var(--color-surface-alt); padding: 4px 10px; border-radius: var(--radius-pill);
      white-space: nowrap;
    }

    /* Section card */
    .section-card {
      background: var(--color-surface); border: 1px solid var(--color-border);
      border-radius: var(--radius-xl); margin-bottom: var(--space-lg);
    }

    .card-header {
      display: flex; align-items: center; gap: var(--space-md);
      padding: var(--space-lg); border-bottom: 1px solid var(--color-divider);
      h3 { font-size: 16px; font-weight: 700; color: var(--color-text-primary); }
      p { font-size: 13px; color: var(--color-text-tertiary); margin-top: 2px; }
    }

    .header-icon {
      width: 40px; height: 40px; border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      background: var(--color-primary-50);
      .material-symbols-rounded { font-size: 22px; color: var(--color-primary); }
    }
    .accent-icon { background: rgba(255, 122, 0, 0.08); .material-symbols-rounded { color: var(--color-accent); } }
    .cat-icon { background: rgba(0, 122, 255, 0.08); .material-symbols-rounded { color: var(--color-info); } }
    .status-icon { background: rgba(15, 173, 115, 0.08); .material-symbols-rounded { color: var(--color-success); } }
    .tech-icon { background: rgba(108, 117, 125, 0.08); .material-symbols-rounded { color: var(--color-text-secondary); } }
    .priority-icon { background: rgba(229, 62, 62, 0.08); .material-symbols-rounded { color: var(--color-danger); } }

    .card-body { padding: var(--space-lg); }

    /* Charts row */
    .charts-row {
      display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg);
      margin-bottom: 0;
    }

    .chart-body { padding: var(--space-lg); }

    /* Bar chart */
    .bar-chart {
      display: flex; align-items: flex-end; gap: var(--space-sm); height: 180px;
    }

    .bar-item {
      flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%;
    }

    .bar-stack {
      flex: 1; width: 100%; display: flex; flex-direction: column; justify-content: flex-end; align-items: center;
    }

    .bar-fill {
      width: 60%; min-width: 12px; border-radius: 4px 4px 0 0; transition: height 0.6s ease;
    }
    .bar-completed { background: var(--color-success); border-radius: 4px 4px 0 0; }
    .bar-pending { background: var(--color-border); border-radius: 0; }

    .bar-label { font-size: 10px; font-weight: 600; color: var(--color-text-tertiary); text-transform: uppercase; }
    .bar-value { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; color: var(--color-text-secondary); }

    .chart-legend {
      display: flex; gap: var(--space-lg); justify-content: center; margin-top: var(--space-md);
      padding-top: var(--space-md); border-top: 1px solid var(--color-divider);
    }
    .legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: var(--color-text-secondary); }
    .legend-dot { width: 10px; height: 10px; border-radius: 3px; }
    .dot-completed { background: var(--color-success); }
    .dot-pending { background: var(--color-border); }
    .dot-income { background: var(--color-accent); }
    .dot-commission { background: var(--color-danger); }

    /* Revenue bars */
    .revenue-bars {
      display: flex; align-items: flex-end; gap: var(--space-md); height: 180px;
    }

    .rev-item {
      flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%;
    }

    .rev-bar-group {
      flex: 1; width: 100%; display: flex; gap: 4px; align-items: flex-end; justify-content: center;
    }

    .rev-bar {
      width: 40%; min-width: 8px; border-radius: 4px 4px 0 0; transition: height 0.6s ease;
      position: relative;
    }
    .rev-income { background: var(--color-accent); }
    .rev-commission { background: var(--color-danger); opacity: 0.7; }

    .rev-tooltip {
      position: absolute; top: -22px; left: 50%; transform: translateX(-50%);
      font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 700;
      color: var(--color-text-secondary); white-space: nowrap;
    }

    /* Bottom row */
    .bottom-row {
      display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-lg);
    }

    /* Category rows */
    .category-row {
      display: flex; align-items: center; gap: var(--space-md); margin-bottom: var(--space-md);
      &:last-child { margin-bottom: 0; }
    }

    .cat-icon-sm {
      width: 36px; height: 36px; border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      .material-symbols-rounded { font-size: 18px; }
    }
    .cat-battery { background: rgba(247, 127, 0, 0.1); .material-symbols-rounded { color: var(--color-warning); } }
    .cat-tire { background: rgba(0, 122, 255, 0.1); .material-symbols-rounded { color: var(--color-info); } }
    .cat-crash { background: rgba(229, 62, 62, 0.1); .material-symbols-rounded { color: var(--color-danger); } }
    .cat-engine { background: rgba(108, 117, 125, 0.1); .material-symbols-rounded { color: var(--color-text-secondary); } }
    .cat-keys { background: rgba(255, 122, 0, 0.1); .material-symbols-rounded { color: var(--color-accent); } }
    .cat-other { background: var(--color-primary-50); .material-symbols-rounded { color: var(--color-primary); } }

    .cat-info { flex: 1; }
    .cat-head { display: flex; justify-content: space-between; margin-bottom: 4px; }
    .cat-name { font-size: 13px; font-weight: 600; color: var(--color-text-primary); }
    .cat-count { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; color: var(--color-text-secondary); }
    .cat-pct { font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; color: var(--color-text-tertiary); min-width: 36px; text-align: right; }

    .progress-track { height: 6px; background: var(--color-surface-alt); border-radius: var(--radius-pill); overflow: hidden; }
    .progress-fill { height: 100%; border-radius: var(--radius-pill); transition: width 0.6s ease; }
    .fill-cat-battery { background: var(--color-warning); }
    .fill-cat-tire { background: var(--color-info); }
    .fill-cat-crash { background: var(--color-danger); }
    .fill-cat-engine { background: var(--color-text-secondary); }
    .fill-cat-keys { background: var(--color-accent); }
    .fill-cat-other { background: var(--color-primary); }

    /* Status grid */
    .status-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-md);
    }

    .status-item {
      display: flex; flex-direction: column; align-items: center; gap: var(--space-sm);
      padding: var(--space-md); border-radius: var(--radius-lg);
      background: var(--color-surface-alt);
    }

    .status-ring {
      width: 56px; height: 56px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      border: 3px solid var(--color-border);
    }
    .ring-pending { border-color: var(--color-status-pending); background: rgba(255, 122, 0, 0.08); }
    .ring-assigned { border-color: var(--color-status-assigned); background: rgba(0, 122, 255, 0.08); }
    .ring-in_progress { border-color: var(--color-status-progress); background: rgba(30, 136, 229, 0.08); }
    .ring-completed { border-color: var(--color-success); background: rgba(15, 173, 115, 0.08); }
    .ring-cancelled { border-color: var(--color-text-tertiary); background: var(--color-surface-alt); }

    .status-num { font-family: 'JetBrains Mono', monospace; font-size: 18px; font-weight: 800; color: var(--color-text-primary); }
    .status-name { font-size: 12px; font-weight: 600; color: var(--color-text-primary); text-transform: capitalize; }
    .status-pct { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; color: var(--color-text-tertiary); }

    /* Tech list */
    .tech-list { display: flex; flex-direction: column; gap: var(--space-sm); }

    .tech-row {
      display: flex; align-items: center; gap: var(--space-md);
      padding: var(--space-sm) 0;
    }

    .tech-rank {
      font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 800;
      color: var(--color-text-tertiary); width: 24px; text-align: center;
    }

    .tech-info { min-width: 0; }
    .tech-name { display: block; font-size: 13px; font-weight: 600; color: var(--color-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .tech-meta { font-size: 11px; color: var(--color-text-tertiary); }

    .tech-bar-wrap {
      flex: 1; height: 8px; background: var(--color-surface-alt); border-radius: var(--radius-pill); overflow: hidden;
    }
    .tech-bar { height: 100%; background: var(--color-primary); border-radius: var(--radius-pill); transition: width 0.6s ease; }

    /* Priority card */
    .priority-card .priority-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-md);
      padding: var(--space-lg);
    }

    .priority-item {
      display: flex; flex-direction: column; align-items: center; gap: var(--space-sm);
    }

    .priority-badge {
      width: 100%; padding: var(--space-md); border-radius: var(--radius-lg);
      text-align: center;
    }
    .badge-low { background: rgba(15, 173, 115, 0.08); }
    .badge-medium { background: rgba(255, 122, 0, 0.08); }
    .badge-high { background: rgba(229, 62, 62, 0.08); }
    .badge-critical { background: rgba(153, 27, 27, 0.1); }

    .p-count { display: block; font-family: 'JetBrains Mono', monospace; font-size: 24px; font-weight: 800; color: var(--color-text-primary); }
    .p-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
    .badge-low .p-label { color: var(--color-success); }
    .badge-medium .p-label { color: var(--color-accent); }
    .badge-high .p-label { color: var(--color-danger); }
    .badge-critical .p-label { color: #991b1b; }

    .priority-bar { width: 100%; height: 6px; background: var(--color-surface-alt); border-radius: var(--radius-pill); overflow: hidden; }
    .priority-fill { height: 100%; border-radius: var(--radius-pill); transition: width 0.6s ease; }
    .pfill-low { background: var(--color-success); }
    .pfill-medium { background: var(--color-accent); }
    .pfill-high { background: var(--color-danger); }
    .pfill-critical { background: #991b1b; }

    .priority-pct { font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; color: var(--color-text-tertiary); }

    /* Empty & loading */
    .empty-state {
      text-align: center; padding: var(--space-2xl); color: var(--color-text-tertiary);
      .material-symbols-rounded { font-size: 40px; display: block; margin: 0 auto var(--space-sm); }
      p { font-size: 14px; }
    }

    .loading-state {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: var(--space-md); padding: var(--space-3xl); color: var(--color-text-secondary);
    }

    .spinner {
      width: 36px; height: 36px; border: 3px solid var(--color-border);
      border-top-color: var(--color-primary); border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Responsive */
    @media (max-width: 1100px) {
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .bottom-row { grid-template-columns: 1fr; }
      .priority-card .priority-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 768px) {
      .charts-row { grid-template-columns: 1fr; }
      .kpi-grid { grid-template-columns: 1fr; }
      .status-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class ReportsComponent implements OnInit {
  loading = true;
  selectedPeriod = '30';

  allIncidents: Incident[] = [];
  allPayments: Payment[] = [];
  filteredIncidents: Incident[] = [];
  filteredPayments: Payment[] = [];

  completedCount = 0;
  completionRate = 0;
  totalRevenue = 0;
  totalCommission = 0;
  incidentsTrend = 0;
  revenueTrend = 0;

  monthlyData: MonthData[] = [];
  maxMonthIncidents = 1;
  maxMonthRevenue = 1;

  categoryStats: CategoryStat[] = [];
  statusStats: { key: string; label: string; count: number; pct: number }[] = [];
  priorityStats: { key: string; label: string; count: number; pct: number }[] = [];
  techStats: TechStat[] = [];

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    let loaded = 0;
    const checkDone = () => {
      loaded++;
      if (loaded >= 2) {
        this.applyFilters();
        this.loading = false;
        this.cdr.markForCheck();
      }
    };

    this.api.getIncidents().subscribe({
      next: (data) => { this.allIncidents = data; checkDone(); },
      error: () => { this.allIncidents = []; checkDone(); }
    });

    this.api.getPayments().subscribe({
      next: (data) => { this.allPayments = data; checkDone(); },
      error: () => { this.allPayments = []; checkDone(); }
    });
  }

  onPeriodChange() {
    this.applyFilters();
    this.cdr.markForCheck();
  }

  applyFilters() {
    const days = parseInt(this.selectedPeriod);
    const now = new Date();

    if (days > 0) {
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      this.filteredIncidents = this.allIncidents.filter(i => new Date(i.created_at) >= cutoff);
      this.filteredPayments = this.allPayments.filter(p => new Date(p.created_at) >= cutoff);
    } else {
      this.filteredIncidents = [...this.allIncidents];
      this.filteredPayments = [...this.allPayments];
    }

    this.computeKPIs();
    this.computeMonthly();
    this.computeCategories();
    this.computeStatuses();
    this.computePriorities();
    this.computeTechs();
  }

  computeKPIs() {
    const fi = this.filteredIncidents;
    this.completedCount = fi.filter(i => i.status === 'completed').length;
    this.completionRate = fi.length > 0 ? (this.completedCount / fi.length * 100) : 0;
    this.totalRevenue = fi.reduce((s, i) => s + (i.final_cost || 0), 0);
    this.totalCommission = fi.reduce((s, i) => s + (i.commission_amount || 0), 0);

    // Trends: compare current half vs previous half of period
    const days = parseInt(this.selectedPeriod);
    if (days > 0 && fi.length > 0) {
      const now = new Date();
      const midpoint = new Date(now.getTime() - (days / 2) * 24 * 60 * 60 * 1000);
      const recent = fi.filter(i => new Date(i.created_at) >= midpoint).length;
      const older = fi.filter(i => new Date(i.created_at) < midpoint).length;
      this.incidentsTrend = older > 0 ? ((recent - older) / older * 100) : (recent > 0 ? 100 : 0);

      const recentRev = fi.filter(i => new Date(i.created_at) >= midpoint).reduce((s, i) => s + (i.final_cost || 0), 0);
      const olderRev = fi.filter(i => new Date(i.created_at) < midpoint).reduce((s, i) => s + (i.final_cost || 0), 0);
      this.revenueTrend = olderRev > 0 ? ((recentRev - olderRev) / olderRev * 100) : (recentRev > 0 ? 100 : 0);
    } else {
      this.incidentsTrend = 0;
      this.revenueTrend = 0;
    }
  }

  computeMonthly() {
    const map = new Map<string, MonthData>();
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    this.filteredIncidents.forEach(i => {
      const d = new Date(i.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const label = `${months[d.getMonth()]}`;
      if (!map.has(key)) map.set(key, { label, incidents: 0, completed: 0, revenue: 0, commission: 0 });
      const m = map.get(key)!;
      m.incidents++;
      if (i.status === 'completed') m.completed++;
      m.revenue += i.final_cost || 0;
      m.commission += i.commission_amount || 0;
    });

    this.monthlyData = Array.from(map.values()).slice(-6);
    this.maxMonthIncidents = Math.max(1, ...this.monthlyData.map(m => m.incidents));
    this.maxMonthRevenue = Math.max(1, ...this.monthlyData.map(m => m.revenue));
  }

  computeCategories() {
    const catMap: Record<string, string> = {
      battery: 'Bateria', tire: 'Neumatico', crash: 'Choque',
      engine: 'Motor', keys: 'Llaves', other: 'Otro', uncertain: 'Incierto'
    };
    const iconMap: Record<string, string> = {
      battery: 'battery_alert', tire: 'tire_repair', crash: 'car_crash',
      engine: 'settings', keys: 'key', other: 'help', uncertain: 'help'
    };
    const cssMap: Record<string, string> = {
      battery: 'cat-battery', tire: 'cat-tire', crash: 'cat-crash',
      engine: 'cat-engine', keys: 'cat-keys', other: 'cat-other', uncertain: 'cat-other'
    };

    const counts = new Map<string, number>();
    this.filteredIncidents.forEach(i => {
      const cat = i.category || 'other';
      counts.set(cat, (counts.get(cat) || 0) + 1);
    });

    const total = this.filteredIncidents.length || 1;
    this.categoryStats = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([key, count]) => ({
        name: catMap[key] || key,
        icon: iconMap[key] || 'help',
        count,
        pct: count / total * 100,
        cssClass: cssMap[key] || 'cat-other'
      }));
  }

  computeStatuses() {
    const labels: Record<string, string> = {
      pending: 'Pendiente', assigned: 'Asignado', in_progress: 'En Proceso',
      completed: 'Completado', cancelled: 'Cancelado'
    };
    const counts = new Map<string, number>();
    this.filteredIncidents.forEach(i => counts.set(i.status, (counts.get(i.status) || 0) + 1));

    const total = this.filteredIncidents.length || 1;
    this.statusStats = ['pending', 'assigned', 'in_progress', 'completed', 'cancelled']
      .map(key => ({
        key,
        label: labels[key] || key,
        count: counts.get(key) || 0,
        pct: (counts.get(key) || 0) / total * 100
      }))
      .filter(s => s.count > 0);
  }

  computePriorities() {
    const labels: Record<string, string> = { low: 'Baja', medium: 'Media', high: 'Alta', critical: 'Critica' };
    const counts = new Map<string, number>();
    this.filteredIncidents.forEach(i => counts.set(i.priority, (counts.get(i.priority) || 0) + 1));

    const total = this.filteredIncidents.length || 1;
    this.priorityStats = ['low', 'medium', 'high', 'critical']
      .map(key => ({
        key,
        label: labels[key] || key,
        count: counts.get(key) || 0,
        pct: (counts.get(key) || 0) / total * 100
      }));
  }

  computeTechs() {
    const map = new Map<string, number>();
    this.filteredIncidents
      .filter(i => i.technician_name && i.status === 'completed')
      .forEach(i => map.set(i.technician_name!, (map.get(i.technician_name!) || 0) + 1));

    this.techStats = Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, completed]) => ({ name, completed, avgTime: '' }));
  }

  getBarHeight(value: number, max: number): number {
    if (max <= 0) return 0;
    return Math.max(4, (value / max) * 140);
  }
}
