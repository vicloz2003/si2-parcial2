import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { WebSocketService } from '../../services/websocket.service';
import { Incident } from '../../models/interfaces';

@Component({
  selector: 'app-incidents',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page-content reveal">
        <div class="page-header">
          <div>
            <h1 class="page-title">Solicitudes de emergencia</h1>
            <p class="page-subtitle">
              {{ filteredIncidents.length }} de {{ incidents.length }} incidentes
            </p>
          </div>
        </div>

        <!-- Error banner -->
        <div class="error-banner" *ngIf="error && !loading">
          <span class="material-symbols-rounded">cloud_off</span>
          <span>No se pudo cargar los incidentes</span>
          <button class="retry-btn" (click)="loadData()">
            <span class="material-symbols-rounded">refresh</span>
            Reintentar
          </button>
        </div>

        <!-- Filters bar -->
        <div class="filters-bar">
          <div class="search-box">
            <span class="material-symbols-rounded">search</span>
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (input)="applyFilter()"
              placeholder="Buscar por descripcion, ID..."
              class="search-input"
            />
          </div>

          <div class="filter-group">
            <div class="select-wrapper">
              <span class="material-symbols-rounded">filter_alt</span>
              <select
                [(ngModel)]="filterStatus"
                (change)="applyFilter()"
                class="filter-select"
              >
                <option value="">Todos los estados</option>
                <option value="pending">Pendientes</option>
                <option value="assigned">Asignados</option>
                <option value="in_progress">En proceso</option>
                <option value="completed">Completados</option>
                <option value="cancelled">Cancelados</option>
              </select>
            </div>

            <div class="select-wrapper">
              <span class="material-symbols-rounded">category</span>
              <select
                [(ngModel)]="filterCategory"
                (change)="applyFilter()"
                class="filter-select"
              >
                <option value="">Todas las categorias</option>
                <option value="battery">Bateria</option>
                <option value="tire">Llanta</option>
                <option value="crash">Choque</option>
                <option value="engine">Motor</option>
                <option value="keys">Llaves</option>
                <option value="other">Otro</option>
              </select>
            </div>

            <button
              class="btn btn-ghost btn-sm"
              (click)="clearFilters()"
              *ngIf="hasFilters()"
            >
              <span class="material-symbols-rounded">close</span>
              Limpiar
            </button>
          </div>
        </div>

        <!-- Grid -->
        <div class="incidents-grid" *ngIf="filteredIncidents.length > 0; else emptyTpl">
          <a
            *ngFor="let inc of filteredIncidents"
            [routerLink]="['/incidents', inc.id]"
            class="incident-card card card-hover"
          >
            <div class="card-top">
              <div class="cat-icon" [class]="'cat-' + inc.category">
                <span class="material-symbols-rounded">{{
                  getCategoryIcon(inc.category)
                }}</span>
              </div>
              <span
                class="badge"
                [ngClass]="'badge-priority-' + inc.priority"
              >
                {{ inc.priority | uppercase }}
              </span>
            </div>

            <div class="card-content">
              <div class="card-id">#{{ inc.id }}</div>
              <h3>{{ getCategoryLabel(inc.category) }}</h3>
              <p class="summary">
                {{ inc.ai_summary || inc.description || 'Sin descripcion' }}
              </p>
            </div>

            <div class="card-footer">
              <span
                class="badge badge-soft"
                [ngClass]="'badge-status-' + inc.status"
              >
                {{ getStatusLabel(inc.status) }}
              </span>
              <span class="date">
                <span class="material-symbols-rounded">schedule</span>
                {{ inc.created_at | date: 'dd/MM HH:mm' }}
              </span>
            </div>
          </a>
        </div>

        <ng-template #emptyTpl>
          <div class="empty-state card">
            <div class="empty-icon">
              <span class="material-symbols-rounded">search_off</span>
            </div>
            <h3>Sin resultados</h3>
            <p *ngIf="hasFilters()">
              Prueba ajustando los filtros de busqueda.
            </p>
            <p *ngIf="!hasFilters()">
              Aun no hay solicitudes registradas.
            </p>
            <button
              class="btn btn-outline"
              (click)="clearFilters()"
              *ngIf="hasFilters()"
            >
              <span class="material-symbols-rounded">refresh</span>
              Limpiar filtros
            </button>
          </div>
        </ng-template>
    </div>
  `,
  styles: [
    `
      .error-banner {
        display: flex; align-items: center; gap: var(--space-sm);
        background: var(--color-surface); border: 1px solid var(--color-border);
        border-radius: var(--radius-lg); padding: var(--space-sm) var(--space-md);
        margin-bottom: var(--space-md); color: var(--color-text-secondary);
        flex-wrap: wrap;
        .material-symbols-rounded { font-size: 1.25rem; color: var(--color-danger); }
      }
      .retry-btn {
        margin-left: auto; padding: 0.375rem 0.875rem; font-size: 0.8125rem;
        border: 1px solid var(--color-border); border-radius: var(--radius-md);
        color: var(--color-text-primary); display: flex; align-items: center; gap: 0.375rem;
        &:hover { background: var(--color-surface-alt); }
        .material-symbols-rounded { font-size: 1rem; color: var(--color-text-primary); }
      }

      /* ── Mobile-first: Filters stacked ── */
      .filters-bar {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
        margin-bottom: var(--space-md);
        background: var(--color-surface);
        padding: var(--space-sm);
        border-radius: var(--radius-xl);
        border: 1px solid var(--color-border);
        box-shadow: var(--shadow-card);
      }

      .search-box {
        position: relative;
        width: 100%;
        .material-symbols-rounded {
          position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%);
          color: var(--color-text-tertiary); font-size: 1.25rem; pointer-events: none;
        }
      }

      .search-input {
        width: 100%;
        padding: 0.625rem 0.875rem 0.625rem 2.75rem;
        background: var(--color-surface-alt);
        border: 1.5px solid transparent;
        border-radius: var(--radius-md);
        font-size: 0.875rem;
        transition: all 0.2s var(--ease-out);
        &:focus {
          outline: none; background: var(--color-surface);
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px var(--color-primary-50);
        }
      }

      .filter-group {
        display: flex; flex-wrap: wrap;
        gap: var(--space-sm); align-items: center;
      }

      .select-wrapper {
        position: relative; flex: 1; min-width: 0;
        .material-symbols-rounded {
          position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%);
          color: var(--color-text-tertiary); font-size: 1.125rem; pointer-events: none;
        }
      }

      .filter-select {
        appearance: none; width: 100%;
        padding: 0.625rem 2rem 0.625rem 2.375rem;
        background: var(--color-surface-alt);
        border: 1.5px solid transparent; border-radius: var(--radius-md);
        font-size: 0.8125rem; font-weight: 500;
        color: var(--color-text-primary); cursor: pointer;
        transition: all 0.2s var(--ease-out);
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234a5568' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
        background-repeat: no-repeat; background-position: right 0.75rem center;
        &:focus { outline: none; background-color: var(--color-surface); border-color: var(--color-primary); }
      }

      /* ── Mobile-first: single column grid ── */
      .incidents-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--space-sm);
      }

      .incident-card {
        display: flex; flex-direction: column;
        padding: var(--space-md);
        text-decoration: none; color: inherit;
        border-radius: var(--radius-xl);
        transition: all 0.25s var(--ease-out);
        &:hover { transform: translateY(-2px); box-shadow: var(--shadow-card-hover); }
      }

      .card-top {
        display: flex; justify-content: space-between;
        align-items: flex-start; margin-bottom: var(--space-sm);
      }

      .cat-icon {
        width: 2.5rem; height: 2.5rem;
        border-radius: var(--radius-lg);
        display: flex; align-items: center; justify-content: center;
        background: var(--color-primary-50);
        .material-symbols-rounded { font-size: 1.25rem; color: var(--color-primary); }
        &.cat-battery { background: rgba(247, 127, 0, 0.1); .material-symbols-rounded { color: var(--color-warning); } }
        &.cat-tire { background: rgba(58, 134, 255, 0.1); .material-symbols-rounded { color: var(--color-info); } }
        &.cat-crash { background: rgba(230, 57, 70, 0.1); .material-symbols-rounded { color: var(--color-danger); } }
        &.cat-engine { background: rgba(108, 117, 125, 0.1); .material-symbols-rounded { color: var(--color-text-secondary); } }
        &.cat-keys { background: rgba(255, 107, 53, 0.1); .material-symbols-rounded { color: var(--color-accent); } }
      }

      .card-content { flex: 1; }

      .card-id {
        font-size: 0.6875rem; font-weight: 800;
        color: var(--color-text-tertiary);
        letter-spacing: 0.5px; margin-bottom: 0.25rem;
      }

      .incident-card h3 {
        font-size: 1rem; font-weight: 700;
        color: var(--color-text-primary);
        margin-bottom: var(--space-xs);
      }

      .summary {
        color: var(--color-text-secondary);
        font-size: 0.8125rem; line-height: 1.5;
        margin: 0 0 var(--space-sm);
        display: -webkit-box; -webkit-line-clamp: 2;
        -webkit-box-orient: vertical; overflow: hidden;
      }

      .card-footer {
        display: flex; justify-content: space-between;
        align-items: center; padding-top: var(--space-sm);
        border-top: 1px solid var(--color-divider);
      }

      .date {
        display: inline-flex; align-items: center;
        gap: 0.25rem; font-size: 0.6875rem;
        color: var(--color-text-tertiary); font-weight: 500;
        .material-symbols-rounded { font-size: 0.875rem; }
      }

      /* ── Tablet (≥576px): 2-col grid ── */
      @media (min-width: 576px) {
        .incidents-grid { grid-template-columns: repeat(2, 1fr); gap: var(--space-md); }
      }

      /* ── Tablet (≥768px): filter bar row, icon sizes up ── */
      @media (min-width: 768px) {
        .filters-bar { flex-direction: row; align-items: center; padding: var(--space-md) var(--space-lg); gap: var(--space-md); }
        .search-box { flex: 1; min-width: 15rem; }
        .select-wrapper { flex: none; }
        .cat-icon { width: 2.75rem; height: 2.75rem; .material-symbols-rounded { font-size: 1.5rem; } }
        .incident-card { padding: var(--space-lg); }
      }

      /* ── Desktop (≥1024px): auto-fill grid ── */
      @media (min-width: 1024px) {
        .incidents-grid { grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr)); }
      }
    `,
  ],
})
export class IncidentsComponent implements OnInit, OnDestroy {
  incidents: Incident[] = [];
  filteredIncidents: Incident[] = [];
  filterStatus = '';
  filterCategory = '';
  searchTerm = '';
  loading = true;
  error = false;
  private wsSub?: Subscription;

  constructor(
    private api: ApiService,
    private ws: WebSocketService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadData();
    this.ws.connect();
    this.wsSub = this.ws.notifications$.subscribe((message) => {
      if (message.type === 'new_incident') {
        this.loadData(false);
      }
    });
  }

  ngOnDestroy() {
    this.wsSub?.unsubscribe();
  }

  loadData(showLoading = true) {
    if (showLoading) this.loading = true;
    this.error = false;
    this.api.getIncidents().subscribe({
      next: (data) => {
        this.incidents = data;
        this.applyFilter();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.error = true;
        this.cdr.markForCheck();
      },
    });
  }

  applyFilter() {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredIncidents = this.incidents.filter((i) => {
      if (this.filterStatus && i.status !== this.filterStatus) return false;
      if (this.filterCategory && i.category !== this.filterCategory)
        return false;
      if (term) {
        const haystack = [
          String(i.id),
          i.description || '',
          i.ai_summary || '',
          i.address || '',
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }

  hasFilters(): boolean {
    return !!(this.filterStatus || this.filterCategory || this.searchTerm);
  }

  clearFilters() {
    this.filterStatus = '';
    this.filterCategory = '';
    this.searchTerm = '';
    this.applyFilter();
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
      battery: 'Problema de bateria',
      tire: 'Pinchazo de llanta',
      crash: 'Accidente / choque',
      engine: 'Problema de motor',
      keys: 'Problema de llaves',
      other: 'Otro',
      uncertain: 'Sin clasificar',
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
