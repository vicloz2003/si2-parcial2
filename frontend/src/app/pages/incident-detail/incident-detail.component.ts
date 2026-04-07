import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ApiService } from '../../services/api.service';
import { Incident, Technician } from '../../models/interfaces';

@Component({
  selector: 'app-incident-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <div class="page">
      <app-navbar></app-navbar>

      <div class="page-content fade-in" *ngIf="incident; else loadingTpl">
        <button class="btn-back" (click)="goBack()">
          <span class="material-symbols-rounded">arrow_back</span>
          Volver a incidentes
        </button>

        <div class="detail-header">
          <div class="header-left">
            <div class="cat-icon" [class]="'cat-' + incident.category">
              <span class="material-symbols-rounded">{{
                getCategoryIcon(incident.category)
              }}</span>
            </div>
            <div>
              <div class="header-meta">
                <span class="header-id">Incidente #{{ incident.id }}</span>
                <span
                  class="badge"
                  [ngClass]="'badge-priority-' + incident.priority"
                >
                  {{ incident.priority | uppercase }}
                </span>
                <span
                  class="badge badge-soft"
                  [ngClass]="'badge-status-' + incident.status"
                >
                  {{ getStatusLabel(incident.status) }}
                </span>
              </div>
              <h1 class="page-title">{{ getCategoryLabel(incident.category) }}</h1>
              <p class="page-subtitle">
                <span class="material-symbols-rounded">schedule</span>
                {{ incident.created_at | date: 'dd/MM/yyyy HH:mm' }}
              </p>
            </div>
          </div>
        </div>

        <div class="detail-grid">
          <!-- Main column -->
          <div class="main-column">
            <!-- AI Analysis -->
            <div class="card card-padded">
              <div class="card-section-header">
                <span class="material-symbols-rounded">auto_awesome</span>
                <h3>Analisis de IA</h3>
              </div>

              <div class="info-rows">
                <div class="info-row">
                  <span class="info-label">Categoria</span>
                  <span class="info-value">
                    {{ getCategoryLabel(incident.category) }}
                  </span>
                </div>
                <div class="info-row" *ngIf="incident.ai_summary">
                  <span class="info-label">Resumen</span>
                  <span class="info-value">{{ incident.ai_summary }}</span>
                </div>
                <div class="info-row" *ngIf="incident.ai_diagnosis">
                  <span class="info-label">Diagnostico</span>
                  <span class="info-value">{{ incident.ai_diagnosis }}</span>
                </div>
              </div>
            </div>

            <!-- Location -->
            <div class="card card-padded">
              <div class="card-section-header">
                <span class="material-symbols-rounded">location_on</span>
                <h3>Ubicacion</h3>
              </div>
              <p class="location-text">
                {{
                  incident.address ||
                    'Lat: ' + incident.latitude + ', Lng: ' + incident.longitude
                }}
              </p>
            </div>

            <!-- User description -->
            <div class="card card-padded" *ngIf="incident.description">
              <div class="card-section-header">
                <span class="material-symbols-rounded">format_quote</span>
                <h3>Descripcion del usuario</h3>
              </div>
              <p class="quote">{{ incident.description }}</p>
            </div>

            <!-- Evidences -->
            <div class="card card-padded" *ngIf="incident.evidences.length > 0">
              <div class="card-section-header">
                <span class="material-symbols-rounded">collections</span>
                <h3>Evidencias ({{ incident.evidences.length }})</h3>
              </div>

              <div class="evidences">
                <div class="evidence" *ngFor="let ev of incident.evidences">
                  <div class="ev-type-row">
                    <span class="ev-type" [class]="'ev-' + ev.type">
                      <span class="material-symbols-rounded">{{
                        getEvidenceIcon(ev.type)
                      }}</span>
                      {{ ev.type | uppercase }}
                    </span>
                  </div>
                  <img
                    *ngIf="ev.type === 'image' && ev.file_url"
                    [src]="'http://localhost:8000' + ev.file_url"
                    alt="Evidencia"
                  />
                  <p
                    *ngIf="ev.type === 'audio' && ev.transcription"
                    class="ev-text"
                  >
                    <strong>Transcripcion:</strong> {{ ev.transcription }}
                  </p>
                  <p *ngIf="ev.type === 'text'" class="ev-text">
                    {{ ev.content }}
                  </p>
                  <div class="ai-tag" *ngIf="ev.ai_analysis">
                    <span class="material-symbols-rounded">psychology</span>
                    <span>{{ ev.ai_analysis }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Status timeline -->
            <div class="card card-padded">
              <div class="card-section-header">
                <span class="material-symbols-rounded">history</span>
                <h3>Historial de estados</h3>
              </div>

              <div class="timeline">
                <div
                  class="timeline-item"
                  *ngFor="let h of incident.status_history; let last = last"
                  [class.last]="last"
                >
                  <div class="timeline-marker">
                    <div
                      class="timeline-dot"
                      [class]="'dot-' + h.status"
                    ></div>
                    <div class="timeline-line" *ngIf="!last"></div>
                  </div>
                  <div class="timeline-content">
                    <strong>{{ getStatusLabel(h.status) }}</strong>
                    <span *ngIf="h.notes" class="timeline-notes">
                      — {{ h.notes }}
                    </span>
                    <div class="timeline-date">
                      {{ h.created_at | date: 'dd/MM/yyyy HH:mm' }} ·
                      {{ h.changed_by }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Side panel -->
          <div class="side-column">
            <!-- Status hero -->
            <div
              class="status-hero"
              [class]="'hero-' + incident.status"
            >
              <div class="hero-icon">
                <span class="material-symbols-rounded">{{
                  getStatusIcon(incident.status)
                }}</span>
              </div>
              <div class="hero-label">Estado actual</div>
              <div class="hero-status">{{ getStatusLabel(incident.status) }}</div>
              <div class="hero-eta" *ngIf="incident.estimated_arrival">
                <span class="material-symbols-rounded">timer</span>
                ETA {{ incident.estimated_arrival }} min
              </div>
            </div>

            <!-- Pending: accept/reject -->
            <div class="card card-padded" *ngIf="incident.status === 'pending'">
              <div class="card-section-header">
                <span class="material-symbols-rounded">handshake</span>
                <h3>Aceptar solicitud</h3>
              </div>

              <div class="field">
                <label class="field-label">Asignar tecnico (opcional)</label>
                <select [(ngModel)]="selectedTechnician" class="select">
                  <option [ngValue]="null">Sin asignar</option>
                  <option *ngFor="let t of technicians" [ngValue]="t.id">
                    {{ t.name }}
                  </option>
                </select>
              </div>

              <button class="btn btn-success btn-block" (click)="acceptIncident()">
                <span class="material-symbols-rounded">check</span>
                Aceptar solicitud
              </button>
              <button
                class="btn btn-outline btn-block reject-btn"
                (click)="rejectIncident()"
              >
                <span class="material-symbols-rounded">close</span>
                Rechazar
              </button>
            </div>

            <!-- Assigned/in_progress: update -->
            <div
              class="card card-padded"
              *ngIf="incident.status === 'assigned' || incident.status === 'in_progress'"
            >
              <div class="card-section-header">
                <span class="material-symbols-rounded">build</span>
                <h3>Actualizar estado</h3>
              </div>

              <button
                class="btn btn-primary btn-block"
                *ngIf="incident.status === 'assigned'"
                (click)="updateStatus('in_progress')"
              >
                <span class="material-symbols-rounded">play_arrow</span>
                Iniciar servicio
              </button>

              <div *ngIf="incident.status === 'in_progress'">
                <div class="field">
                  <label class="field-label">Costo final (Bs.)</label>
                  <input
                    type="number"
                    [(ngModel)]="finalCost"
                    placeholder="0.00"
                    class="input"
                  />
                </div>
                <button class="btn btn-success btn-block" (click)="completeService()">
                  <span class="material-symbols-rounded">task_alt</span>
                  Completar servicio
                </button>
              </div>
            </div>

            <!-- Final cost -->
            <div
              class="cost-card"
              *ngIf="incident.final_cost"
            >
              <div class="cost-icon">
                <span class="material-symbols-rounded">payments</span>
              </div>
              <div class="cost-label">Costo del servicio</div>
              <div class="cost-amount">
                Bs. {{ incident.final_cost | number: '1.2-2' }}
              </div>
              <div class="cost-commission">
                Comision (10%): Bs.
                {{ incident.commission_amount | number: '1.2-2' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ng-template #loadingTpl>
        <div class="page-content">
          <div class="skeleton-detail">
            <div class="skeleton" style="height: 60px; margin-bottom: 24px;"></div>
            <div class="skeleton" style="height: 200px; margin-bottom: 16px;"></div>
            <div class="skeleton" style="height: 120px;"></div>
          </div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [
    `
      .btn-back {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: none;
        color: var(--color-text-secondary);
        font-size: 13px;
        font-weight: 500;
        padding: 8px 12px;
        margin-left: -12px;
        margin-bottom: var(--space-md);
        border-radius: var(--radius-sm);
        transition: all var(--transition-fast);

        .material-symbols-rounded {
          font-size: 18px;
        }

        &:hover {
          background: var(--color-surface-alt);
          color: var(--color-text-primary);
        }
      }

      /* Header */
      .detail-header {
        margin-bottom: var(--space-xl);
      }

      .header-left {
        display: flex;
        align-items: flex-start;
        gap: var(--space-md);
      }

      .cat-icon {
        width: 64px;
        height: 64px;
        border-radius: var(--radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(30, 58, 95, 0.08);
        flex-shrink: 0;

        .material-symbols-rounded {
          font-size: 36px;
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

      .header-meta {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        margin-bottom: 4px;
      }

      .header-id {
        font-size: 12px;
        font-weight: 800;
        color: var(--color-text-tertiary);
        letter-spacing: 0.5px;
      }

      .page-subtitle {
        display: inline-flex;
        align-items: center;
        gap: 4px;

        .material-symbols-rounded {
          font-size: 14px;
        }
      }

      /* Detail grid */
      .detail-grid {
        display: grid;
        grid-template-columns: 1fr 360px;
        gap: var(--space-lg);
      }

      .main-column,
      .side-column {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
      }

      /* Section headers */
      .card-section-header {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        margin-bottom: var(--space-md);

        .material-symbols-rounded {
          font-size: 22px;
          color: var(--color-primary);
        }

        h3 {
          font-size: 15px;
          font-weight: 700;
          color: var(--color-text-primary);
        }
      }

      /* Info rows */
      .info-rows {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
      }

      .info-row {
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: var(--space-sm) 0;
        border-bottom: 1px solid var(--color-divider);

        &:last-child {
          border-bottom: none;
        }
      }

      .info-label {
        font-size: 11px;
        font-weight: 700;
        color: var(--color-text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .info-value {
        font-size: 14px;
        color: var(--color-text-primary);
        line-height: 1.5;
      }

      .location-text {
        font-size: 14px;
        color: var(--color-text-primary);
        background: var(--color-surface-alt);
        padding: var(--space-md);
        border-radius: var(--radius-md);
      }

      .quote {
        font-size: 14px;
        color: var(--color-text-primary);
        line-height: 1.6;
        padding-left: var(--space-md);
        border-left: 3px solid var(--color-primary);
        font-style: italic;
      }

      /* Evidences */
      .evidences {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
      }

      .evidence {
        background: var(--color-surface-alt);
        padding: var(--space-md);
        border-radius: var(--radius-md);

        img {
          max-width: 100%;
          border-radius: var(--radius-sm);
          margin-top: var(--space-sm);
        }
      }

      .ev-type {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        border-radius: var(--radius-pill);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.5px;
        background: rgba(30, 58, 95, 0.08);
        color: var(--color-primary);

        .material-symbols-rounded {
          font-size: 14px;
        }

        &.ev-image {
          background: rgba(58, 134, 255, 0.12);
          color: var(--color-info);
        }
        &.ev-audio {
          background: rgba(255, 107, 53, 0.12);
          color: var(--color-accent);
        }
        &.ev-text {
          background: rgba(108, 117, 125, 0.12);
          color: var(--color-text-secondary);
        }
      }

      .ev-text {
        font-size: 13px;
        margin-top: var(--space-sm);
        color: var(--color-text-primary);
      }

      .ai-tag {
        margin-top: var(--space-sm);
        padding: var(--space-sm) var(--space-md);
        background: rgba(58, 134, 255, 0.08);
        border: 1px solid rgba(58, 134, 255, 0.25);
        border-radius: var(--radius-sm);
        font-size: 12px;
        color: var(--color-info);
        display: flex;
        align-items: flex-start;
        gap: 6px;

        .material-symbols-rounded {
          font-size: 16px;
          flex-shrink: 0;
        }
      }

      /* Timeline */
      .timeline {
        display: flex;
        flex-direction: column;
      }

      .timeline-item {
        display: flex;
        gap: var(--space-md);
      }

      .timeline-marker {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex-shrink: 0;
      }

      .timeline-dot {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: var(--color-primary);
        margin-top: 4px;
        box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.15);

        &.dot-pending {
          background: var(--color-status-pending);
          box-shadow: 0 0 0 3px rgba(247, 127, 0, 0.15);
        }
        &.dot-assigned {
          background: var(--color-status-assigned);
          box-shadow: 0 0 0 3px rgba(58, 134, 255, 0.15);
        }
        &.dot-in_progress {
          background: var(--color-status-progress);
          box-shadow: 0 0 0 3px rgba(0, 180, 216, 0.15);
        }
        &.dot-completed {
          background: var(--color-success);
          box-shadow: 0 0 0 3px rgba(6, 167, 125, 0.15);
        }
        &.dot-cancelled {
          background: var(--color-status-cancelled);
          box-shadow: 0 0 0 3px rgba(108, 117, 125, 0.15);
        }
      }

      .timeline-line {
        flex: 1;
        width: 2px;
        background: var(--color-divider);
        margin-top: 4px;
      }

      .timeline-content {
        flex: 1;
        padding-bottom: var(--space-md);
        font-size: 13px;
        color: var(--color-text-primary);

        strong {
          font-weight: 700;
        }
      }

      .timeline-item.last .timeline-content {
        padding-bottom: 0;
      }

      .timeline-notes {
        color: var(--color-text-secondary);
      }

      .timeline-date {
        font-size: 11px;
        color: var(--color-text-tertiary);
        margin-top: 2px;
      }

      /* Status hero */
      .status-hero {
        background: var(--gradient-primary);
        color: white;
        border-radius: var(--radius-lg);
        padding: var(--space-lg);
        text-align: center;

        &.hero-pending {
          background: linear-gradient(135deg, #f77f00 0%, #d96f00 100%);
        }
        &.hero-assigned {
          background: linear-gradient(135deg, #3a86ff 0%, #2563eb 100%);
        }
        &.hero-in_progress {
          background: linear-gradient(135deg, #00b4d8 0%, #0096c7 100%);
        }
        &.hero-completed {
          background: var(--gradient-success);
        }
        &.hero-cancelled {
          background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
        }
      }

      .hero-icon {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        border: 2px solid rgba(255, 255, 255, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto var(--space-sm);

        .material-symbols-rounded {
          font-size: 36px;
          color: white;
        }
      }

      .hero-label {
        font-size: 11px;
        font-weight: 600;
        opacity: 0.85;
        text-transform: uppercase;
        letter-spacing: 0.8px;
      }

      .hero-status {
        font-size: 22px;
        font-weight: 800;
        margin-top: 4px;
      }

      .hero-eta {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        margin-top: var(--space-sm);
        padding: 4px 12px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: var(--radius-pill);
        font-size: 12px;
        font-weight: 700;

        .material-symbols-rounded {
          font-size: 14px;
        }
      }

      .reject-btn {
        margin-top: var(--space-sm);
        color: var(--color-danger);
        border-color: rgba(230, 57, 70, 0.3);

        &:hover {
          background: rgba(230, 57, 70, 0.08);
          border-color: var(--color-danger);
        }
      }

      /* Cost card */
      .cost-card {
        background: var(--gradient-success);
        color: white;
        border-radius: var(--radius-lg);
        padding: var(--space-lg);
        text-align: center;
      }

      .cost-icon {
        width: 56px;
        height: 56px;
        border-radius: var(--radius-md);
        background: rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto var(--space-sm);

        .material-symbols-rounded {
          font-size: 32px;
          color: white;
        }
      }

      .cost-label {
        font-size: 12px;
        opacity: 0.9;
        font-weight: 600;
      }

      .cost-amount {
        font-size: 32px;
        font-weight: 800;
        margin: 4px 0;
      }

      .cost-commission {
        font-size: 12px;
        opacity: 0.85;
      }

      /* Skeleton */
      .skeleton-detail {
        max-width: 800px;
      }

      @media (max-width: 1024px) {
        .detail-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class IncidentDetailComponent implements OnInit {
  incident: Incident | null = null;
  technicians: Technician[] = [];
  selectedTechnician: number | null = null;
  finalCost = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getIncident(id).subscribe((inc) => (this.incident = inc));
    this.api.getTechnicians().subscribe({
      next: (t) => (this.technicians = t),
      error: () => (this.technicians = []),
    });
  }

  goBack() {
    this.router.navigate(['/incidents']);
  }

  acceptIncident() {
    if (!this.incident) return;
    this.api
      .acceptIncident(this.incident.id, this.selectedTechnician || undefined)
      .subscribe((inc) => {
        this.incident = inc;
      });
  }

  rejectIncident() {
    if (!this.incident) return;
    this.api.rejectIncident(this.incident.id).subscribe(() => {
      this.router.navigate(['/incidents']);
    });
  }

  updateStatus(status: string) {
    if (!this.incident) return;
    this.api
      .updateIncident(this.incident.id, { status } as any)
      .subscribe((inc) => {
        this.incident = inc;
      });
  }

  completeService() {
    if (!this.incident) return;
    this.api
      .updateIncident(this.incident.id, {
        status: 'completed',
        final_cost: this.finalCost,
      } as any)
      .subscribe((inc) => {
        this.incident = inc;
      });
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

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      pending: 'schedule',
      assigned: 'handshake',
      in_progress: 'build',
      completed: 'check_circle',
      cancelled: 'cancel',
    };
    return icons[status] || 'help';
  }

  getEvidenceIcon(type: string): string {
    const icons: Record<string, string> = {
      image: 'image',
      audio: 'mic',
      text: 'description',
    };
    return icons[type] || 'attach_file';
  }
}
