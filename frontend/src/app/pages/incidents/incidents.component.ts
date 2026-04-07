import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ApiService } from '../../services/api.service';
import { Incident } from '../../models/interfaces';

@Component({
  selector: 'app-incidents',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NavbarComponent],
  template: `
    <div class="page">
      <app-navbar></app-navbar>

      <div class="page-content fade-in">
        <div class="page-header">
          <div>
            <h1 class="page-title">Solicitudes de emergencia</h1>
            <p class="page-subtitle">
              {{ filteredIncidents.length }} de {{ incidents.length }} incidentes
            </p>
          </div>
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
    </div>
  `,
  styles: [
    `
      /* Filters bar */
      .filters-bar {
        display: flex;
        gap: var(--space-md);
        margin-bottom: var(--space-lg);
        background: var(--color-surface);
        padding: var(--space-md);
        border-radius: var(--radius-lg);
        border: 1px solid var(--color-border);
        box-shadow: var(--shadow-sm);
        flex-wrap: wrap;
      }

      .search-box {
        position: relative;
        flex: 1;
        min-width: 240px;

        .material-symbols-rounded {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-tertiary);
          font-size: 20px;
          pointer-events: none;
        }
      }

      .search-input {
        width: 100%;
        padding: 10px 14px 10px 44px;
        background: var(--color-surface-alt);
        border: 1.5px solid transparent;
        border-radius: var(--radius-md);
        font-size: 14px;
        transition: all var(--transition-fast);

        &:focus {
          outline: none;
          background: var(--color-surface);
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.1);
        }
      }

      .filter-group {
        display: flex;
        gap: var(--space-sm);
        align-items: center;
      }

      .select-wrapper {
        position: relative;

        .material-symbols-rounded {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-tertiary);
          font-size: 18px;
          pointer-events: none;
        }
      }

      .filter-select {
        appearance: none;
        padding: 10px 32px 10px 38px;
        background: var(--color-surface-alt);
        border: 1.5px solid transparent;
        border-radius: var(--radius-md);
        font-size: 13px;
        font-weight: 500;
        color: var(--color-text-primary);
        cursor: pointer;
        transition: all var(--transition-fast);
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234a5568' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 12px center;

        &:focus {
          outline: none;
          background-color: var(--color-surface);
          border-color: var(--color-primary);
        }
      }

      /* Grid */
      .incidents-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: var(--space-md);
      }

      .incident-card {
        display: flex;
        flex-direction: column;
        padding: var(--space-lg);
        text-decoration: none;
        color: inherit;
      }

      .card-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--space-md);
      }

      .cat-icon {
        width: 44px;
        height: 44px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(30, 58, 95, 0.08);

        .material-symbols-rounded {
          font-size: 24px;
          color: var(--color-primary);
        }

        &.cat-battery {
          background: rgba(247, 127, 0, 0.12);
          .material-symbols-rounded {
            color: var(--color-warning);
          }
        }
        &.cat-tire {
          background: rgba(58, 134, 255, 0.12);
          .material-symbols-rounded {
            color: var(--color-info);
          }
        }
        &.cat-crash {
          background: rgba(230, 57, 70, 0.12);
          .material-symbols-rounded {
            color: var(--color-danger);
          }
        }
        &.cat-engine {
          background: rgba(108, 117, 125, 0.12);
          .material-symbols-rounded {
            color: var(--color-text-secondary);
          }
        }
        &.cat-keys {
          background: rgba(255, 107, 53, 0.12);
          .material-symbols-rounded {
            color: var(--color-accent);
          }
        }
      }

      .card-content {
        flex: 1;
      }

      .card-id {
        font-size: 11px;
        font-weight: 800;
        color: var(--color-text-tertiary);
        letter-spacing: 0.5px;
        margin-bottom: 4px;
      }

      .incident-card h3 {
        font-size: 16px;
        font-weight: 700;
        color: var(--color-text-primary);
        margin-bottom: var(--space-sm);
      }

      .summary {
        color: var(--color-text-secondary);
        font-size: 13px;
        line-height: 1.5;
        margin: 0 0 var(--space-md);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: var(--space-md);
        border-top: 1px solid var(--color-divider);
      }

      .date {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        color: var(--color-text-tertiary);
        font-weight: 500;

        .material-symbols-rounded {
          font-size: 14px;
        }
      }
    `,
  ],
})
export class IncidentsComponent implements OnInit {
  incidents: Incident[] = [];
  filteredIncidents: Incident[] = [];
  filterStatus = '';
  filterCategory = '';
  searchTerm = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getIncidents().subscribe((data) => {
      this.incidents = data;
      this.applyFilter();
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
