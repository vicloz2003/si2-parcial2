import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ApiService } from '../../services/api.service';
import { Incident } from '../../models/interfaces';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  template: `
    <div class="page">
      <app-navbar></app-navbar>

      <div class="page-content fade-in">
        <div class="page-header">
          <div>
            <h1 class="page-title">Historial de atenciones</h1>
            <p class="page-subtitle">
              {{ incidents.length }} servicios completados
            </p>
          </div>
        </div>

        <!-- Summary stats -->
        <div class="summary-row" *ngIf="incidents.length > 0">
          <div class="summary-card">
            <div class="summary-icon ingreso">
              <span class="material-symbols-rounded">payments</span>
            </div>
            <div class="summary-content">
              <div class="summary-label">Ingreso bruto</div>
              <div class="summary-value">
                Bs. {{ totalIngreso | number: '1.2-2' }}
              </div>
            </div>
          </div>

          <div class="summary-card">
            <div class="summary-icon comision">
              <span class="material-symbols-rounded">savings</span>
            </div>
            <div class="summary-content">
              <div class="summary-label">Comision pagada</div>
              <div class="summary-value">
                Bs. {{ totalComision | number: '1.2-2' }}
              </div>
            </div>
          </div>

          <div class="summary-card">
            <div class="summary-icon neto">
              <span class="material-symbols-rounded">trending_up</span>
            </div>
            <div class="summary-content">
              <div class="summary-label">Ganancia neta</div>
              <div class="summary-value">
                Bs. {{ totalNeto | number: '1.2-2' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="card" *ngIf="incidents.length > 0; else emptyTpl">
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Categoria</th>
                  <th>Prioridad</th>
                  <th>Estado</th>
                  <th class="text-right">Costo</th>
                  <th class="text-right">Comision</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  *ngFor="let inc of incidents"
                  [routerLink]="['/incidents', inc.id]"
                  class="clickable"
                >
                  <td>
                    <span class="row-id">#{{ inc.id }}</span>
                  </td>
                  <td>
                    <div class="date-cell">
                      {{ inc.created_at | date: 'dd/MM/yyyy' }}
                      <small>{{ inc.created_at | date: 'HH:mm' }}</small>
                    </div>
                  </td>
                  <td>
                    <div class="cat-cell">
                      <span
                        class="material-symbols-rounded cat-mini"
                        [class]="'cat-' + inc.category"
                      >
                        {{ getCategoryIcon(inc.category) }}
                      </span>
                      {{ getCategoryLabel(inc.category) }}
                    </div>
                  </td>
                  <td>
                    <span
                      class="badge"
                      [ngClass]="'badge-priority-' + inc.priority"
                    >
                      {{ inc.priority | uppercase }}
                    </span>
                  </td>
                  <td>
                    <span
                      class="badge badge-soft"
                      [ngClass]="'badge-status-' + inc.status"
                    >
                      {{ getStatusLabel(inc.status) }}
                    </span>
                  </td>
                  <td class="text-right">
                    <strong>{{
                      inc.final_cost
                        ? 'Bs. ' + (inc.final_cost | number: '1.2-2')
                        : '-'
                    }}</strong>
                  </td>
                  <td class="text-right commission-cell">
                    {{
                      inc.commission_amount
                        ? 'Bs. ' + (inc.commission_amount | number: '1.2-2')
                        : '-'
                    }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <ng-template #emptyTpl>
          <div class="empty-state card">
            <div class="empty-icon">
              <span class="material-symbols-rounded">history</span>
            </div>
            <h3>Sin historial</h3>
            <p>Cuando completes servicios apareceran aqui.</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [
    `
      /* Summary cards */
      .summary-row {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--space-md);
        margin-bottom: var(--space-lg);
      }

      .summary-card {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        padding: var(--space-lg);
        display: flex;
        align-items: center;
        gap: var(--space-md);
        transition: all var(--transition);

        &:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
      }

      .summary-icon {
        width: 56px;
        height: 56px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        .material-symbols-rounded {
          font-size: 28px;
        }

        &.ingreso {
          background: rgba(58, 134, 255, 0.12);
          .material-symbols-rounded {
            color: var(--color-info);
          }
        }
        &.comision {
          background: rgba(247, 127, 0, 0.12);
          .material-symbols-rounded {
            color: var(--color-warning);
          }
        }
        &.neto {
          background: rgba(6, 167, 125, 0.12);
          .material-symbols-rounded {
            color: var(--color-success);
          }
        }
      }

      .summary-label {
        font-size: 11px;
        font-weight: 600;
        color: var(--color-text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 4px;
      }

      .summary-value {
        font-size: 22px;
        font-weight: 800;
        color: var(--color-text-primary);
      }

      /* Table */
      .table-wrapper {
        overflow-x: auto;
      }

      .data-table {
        width: 100%;
        border-collapse: collapse;
      }

      .data-table th {
        background: var(--color-surface-alt);
        padding: 14px 16px;
        text-align: left;
        font-size: 11px;
        font-weight: 700;
        color: var(--color-text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 1px solid var(--color-border);
      }

      .data-table td {
        padding: 16px;
        border-bottom: 1px solid var(--color-divider);
        font-size: 13px;
        color: var(--color-text-primary);
      }

      .data-table tbody tr:last-child td {
        border-bottom: none;
      }

      .text-right {
        text-align: right;
      }

      .clickable {
        cursor: pointer;
        transition: background var(--transition-fast);

        &:hover {
          background: var(--color-surface-hover);
        }
      }

      .row-id {
        font-weight: 700;
        color: var(--color-text-tertiary);
      }

      .date-cell {
        display: flex;
        flex-direction: column;
        line-height: 1.3;

        small {
          font-size: 11px;
          color: var(--color-text-tertiary);
        }
      }

      .cat-cell {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
      }

      .cat-mini {
        font-size: 18px;
        color: var(--color-primary);

        &.cat-battery {
          color: var(--color-warning);
        }
        &.cat-tire {
          color: var(--color-info);
        }
        &.cat-crash {
          color: var(--color-danger);
        }
        &.cat-engine {
          color: var(--color-text-secondary);
        }
        &.cat-keys {
          color: var(--color-accent);
        }
      }

      .commission-cell {
        color: var(--color-text-tertiary);
      }

      @media (max-width: 768px) {
        .summary-row {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class HistoryComponent implements OnInit {
  incidents: Incident[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getIncidents().subscribe((data) => {
      this.incidents = data.filter((i) => i.status === 'completed');
    });
  }

  get totalIngreso(): number {
    return this.incidents.reduce((sum, i) => sum + (i.final_cost || 0), 0);
  }

  get totalComision(): number {
    return this.incidents.reduce(
      (sum, i) => sum + (i.commission_amount || 0),
      0,
    );
  }

  get totalNeto(): number {
    return this.totalIngreso - this.totalComision;
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
    const m: Record<string, string> = {
      battery: 'Bateria',
      tire: 'Llanta',
      crash: 'Choque',
      engine: 'Motor',
      keys: 'Llaves',
      other: 'Otro',
      uncertain: 'Incierto',
    };
    return m[cat] || cat;
  }

  getStatusLabel(s: string): string {
    const m: Record<string, string> = {
      pending: 'Pendiente',
      assigned: 'Asignado',
      in_progress: 'En proceso',
      completed: 'Completado',
      cancelled: 'Cancelado',
    };
    return m[s] || s;
  }
}
