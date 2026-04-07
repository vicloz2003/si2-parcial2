import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Incident, Workshop } from '../../models/interfaces';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  template: `
    <div class="page">
      <app-navbar></app-navbar>

      <div class="page-content fade-in">
        <!-- Header -->
        <div class="page-header">
          <div>
            <h1 class="page-title">{{ greeting }}, {{ firstName }} 👋</h1>
            <p class="page-subtitle">Aqui tienes un resumen de tu taller</p>
          </div>
          <a routerLink="/incidents" class="btn btn-primary">
            <span class="material-symbols-rounded">visibility</span>
            Ver incidentes
          </a>
        </div>

        <!-- Workshop setup card -->
        <div class="setup-card" *ngIf="!workshop && !loading">
          <div class="setup-icon">
            <span class="material-symbols-rounded">store</span>
          </div>
          <div class="setup-content">
            <h3>Configura tu taller</h3>
            <p>
              Necesitas registrar la informacion de tu taller para empezar a
              recibir solicitudes de emergencia.
            </p>
          </div>
          <button class="btn btn-primary">
            <span class="material-symbols-rounded">settings</span>
            Configurar
          </button>
        </div>

        <!-- Stats -->
        <div class="stats-grid" *ngIf="workshop || loading">
          <div class="stat-card stat-pending">
            <div class="stat-icon">
              <span class="material-symbols-rounded">schedule</span>
            </div>
            <div class="stat-content">
              <div class="stat-label">Pendientes</div>
              <div class="stat-number">{{ pendingCount }}</div>
            </div>
          </div>

          <div class="stat-card stat-progress">
            <div class="stat-icon">
              <span class="material-symbols-rounded">build</span>
            </div>
            <div class="stat-content">
              <div class="stat-label">En proceso</div>
              <div class="stat-number">{{ inProgressCount }}</div>
            </div>
          </div>

          <div class="stat-card stat-completed">
            <div class="stat-icon">
              <span class="material-symbols-rounded">check_circle</span>
            </div>
            <div class="stat-content">
              <div class="stat-label">Completados</div>
              <div class="stat-number">{{ completedCount }}</div>
            </div>
          </div>

          <div class="stat-card stat-rating">
            <div class="stat-icon">
              <span class="material-symbols-rounded">star</span>
            </div>
            <div class="stat-content">
              <div class="stat-label">Rating</div>
              <div class="stat-number">
                {{ (workshop?.rating || 0) | number: '1.1-1' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Recent incidents -->
        <div class="card" *ngIf="workshop">
          <div class="card-header">
            <h3>
              <span class="material-symbols-rounded">notifications_active</span>
              Solicitudes recientes
            </h3>
            <a routerLink="/incidents" class="see-all">
              Ver todas
              <span class="material-symbols-rounded">arrow_forward</span>
            </a>
          </div>

          <div class="incident-list" *ngIf="recentIncidents.length > 0; else emptyTpl">
            <a
              *ngFor="let inc of recentIncidents"
              [routerLink]="['/incidents', inc.id]"
              class="incident-row"
            >
              <div class="incident-icon" [class]="'cat-' + inc.category">
                <span class="material-symbols-rounded">{{
                  getCategoryIcon(inc.category)
                }}</span>
              </div>
              <div class="incident-body">
                <div class="incident-title-row">
                  <span class="incident-id">#{{ inc.id }}</span>
                  <span
                    class="badge"
                    [ngClass]="'badge-priority-' + inc.priority"
                  >
                    {{ inc.priority | uppercase }}
                  </span>
                  <span
                    class="badge badge-soft"
                    [ngClass]="'badge-status-' + inc.status"
                  >
                    {{ getStatusLabel(inc.status) }}
                  </span>
                </div>
                <p class="incident-summary">
                  {{ inc.ai_summary || inc.description || 'Sin descripcion' }}
                </p>
                <div class="incident-meta">
                  <span>
                    <span class="material-symbols-rounded">location_on</span>
                    {{ inc.address || ('Lat: ' + inc.latitude.toFixed(4)) }}
                  </span>
                  <span>
                    <span class="material-symbols-rounded">schedule</span>
                    {{ inc.created_at | date: 'short' }}
                  </span>
                </div>
              </div>
              <span class="material-symbols-rounded chevron">chevron_right</span>
            </a>
          </div>

          <ng-template #emptyTpl>
            <div class="empty-state">
              <div class="empty-icon">
                <span class="material-symbols-rounded">inbox</span>
              </div>
              <h3>Sin solicitudes</h3>
              <p>Las nuevas emergencias apareceran aqui.</p>
            </div>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .setup-card {
        display: flex;
        align-items: center;
        gap: var(--space-lg);
        background: linear-gradient(
          135deg,
          rgba(247, 127, 0, 0.08) 0%,
          rgba(255, 107, 53, 0.04) 100%
        );
        border: 1px solid rgba(247, 127, 0, 0.25);
        border-radius: var(--radius-lg);
        padding: var(--space-lg);
        margin-bottom: var(--space-xl);
      }

      .setup-icon {
        width: 64px;
        height: 64px;
        border-radius: var(--radius-md);
        background: var(--gradient-accent);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        .material-symbols-rounded {
          font-size: 32px;
          color: white;
        }
      }

      .setup-content {
        flex: 1;

        h3 {
          font-size: 18px;
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: 4px;
        }

        p {
          color: var(--color-text-secondary);
          font-size: 14px;
        }
      }

      /* Stats grid */
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--space-md);
        margin-bottom: var(--space-xl);
      }

      .stat-card {
        background: var(--color-surface);
        border-radius: var(--radius-lg);
        border: 1px solid var(--color-border);
        padding: var(--space-lg);
        display: flex;
        align-items: center;
        gap: var(--space-md);
        transition: all var(--transition);
        position: relative;
        overflow: hidden;

        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: var(--color-primary);
        }

        &:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
      }

      .stat-icon {
        width: 52px;
        height: 52px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        .material-symbols-rounded {
          font-size: 28px;
        }
      }

      .stat-pending {
        &::before {
          background: var(--color-status-pending);
        }
        .stat-icon {
          background: rgba(247, 127, 0, 0.12);
          .material-symbols-rounded {
            color: var(--color-status-pending);
          }
        }
      }
      .stat-progress {
        &::before {
          background: var(--color-status-progress);
        }
        .stat-icon {
          background: rgba(0, 180, 216, 0.12);
          .material-symbols-rounded {
            color: var(--color-status-progress);
          }
        }
      }
      .stat-completed {
        &::before {
          background: var(--color-success);
        }
        .stat-icon {
          background: rgba(6, 167, 125, 0.12);
          .material-symbols-rounded {
            color: var(--color-success);
          }
        }
      }
      .stat-rating {
        &::before {
          background: var(--color-accent);
        }
        .stat-icon {
          background: rgba(255, 107, 53, 0.12);
          .material-symbols-rounded {
            color: var(--color-accent);
          }
        }
      }

      .stat-content {
        flex: 1;
      }

      .stat-label {
        font-size: 12px;
        font-weight: 600;
        color: var(--color-text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 4px;
      }

      .stat-number {
        font-size: 32px;
        font-weight: 800;
        color: var(--color-text-primary);
        line-height: 1;
      }

      /* Card header */
      .card-header h3 {
        display: flex;
        align-items: center;
        gap: var(--space-sm);

        .material-symbols-rounded {
          font-size: 20px;
          color: var(--color-primary);
        }
      }

      .see-all {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        font-weight: 600;
        color: var(--color-primary);
        padding: 6px 10px;
        border-radius: var(--radius-sm);
        transition: all var(--transition-fast);

        .material-symbols-rounded {
          font-size: 16px;
        }

        &:hover {
          background: rgba(30, 58, 95, 0.08);
        }
      }

      /* Incident list */
      .incident-list {
        display: flex;
        flex-direction: column;
      }

      .incident-row {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        padding: var(--space-md) var(--space-lg);
        border-top: 1px solid var(--color-divider);
        transition: all var(--transition-fast);

        &:hover {
          background: var(--color-surface-hover);

          .chevron {
            transform: translateX(4px);
            color: var(--color-primary);
          }
        }
      }

      .incident-icon {
        width: 44px;
        height: 44px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
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
      }

      .incident-body {
        flex: 1;
        min-width: 0;
      }

      .incident-title-row {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        margin-bottom: 4px;
        flex-wrap: wrap;
      }

      .incident-id {
        font-weight: 800;
        color: var(--color-text-primary);
        font-size: 14px;
      }

      .incident-summary {
        color: var(--color-text-secondary);
        font-size: 13px;
        margin: 4px 0 6px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
      }

      .incident-meta {
        display: flex;
        gap: var(--space-md);
        font-size: 12px;
        color: var(--color-text-tertiary);

        span {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .material-symbols-rounded {
          font-size: 14px;
        }
      }

      .chevron {
        color: var(--color-text-tertiary);
        font-size: 24px;
        transition: all var(--transition-fast);
      }

      @media (max-width: 900px) {
        .stats-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  workshop: Workshop | null = null;
  recentIncidents: Incident[] = [];
  pendingCount = 0;
  inProgressCount = 0;
  completedCount = 0;
  loading = true;

  constructor(
    private api: ApiService,
    private auth: AuthService,
  ) {}

  ngOnInit() {
    this.api.getMyWorkshop().subscribe({
      next: (w) => {
        this.workshop = w;
        this.loading = false;
      },
      error: () => {
        this.workshop = null;
        this.loading = false;
      },
    });

    this.api.getIncidents().subscribe({
      next: (incidents) => {
        this.recentIncidents = incidents.slice(0, 8);
        this.pendingCount = incidents.filter(
          (i) => i.status === 'pending',
        ).length;
        this.inProgressCount = incidents.filter((i) =>
          ['assigned', 'in_progress'].includes(i.status),
        ).length;
        this.completedCount = incidents.filter(
          (i) => i.status === 'completed',
        ).length;
      },
      error: () => {},
    });
  }

  get firstName(): string {
    const user = this.auth.getCurrentUser();
    if (!user?.full_name) return 'Taller';
    return user.full_name.split(' ')[0];
  }

  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos dias';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
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
