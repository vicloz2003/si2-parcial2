import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PublicNavbarComponent } from '../../components/public-navbar/public-navbar.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, PublicNavbarComponent],
  template: `
    <main class="landing-page">
      <app-public-navbar></app-public-navbar>

      <section class="hero-section" aria-labelledby="landing-title">
        <div class="hero-media" aria-hidden="true">
          <div class="road-scene">
            <div class="route-line"></div>
            <div class="service-pin pin-one"><span class="material-symbols-rounded">build</span></div>
            <div class="service-pin pin-two"><span class="material-symbols-rounded">local_shipping</span></div>
            <div class="service-pin pin-three"><span class="material-symbols-rounded">location_on</span></div>
          </div>
        </div>

        <div class="hero-content">
          <div class="eyebrow">
            <span class="material-symbols-rounded">verified</span>
            Red operativa para talleres
          </div>
          <h1 id="landing-title">AsisteCar para talleres</h1>
          <p class="hero-copy">
            Recibe emergencias vehiculares cercanas, asigna tecnicos disponibles y gestiona cada servicio desde un panel pensado para operar rapido y con trazabilidad.
          </p>
          <div class="hero-actions">
            <a routerLink="/register" class="btn btn-primary btn-large">
              <span>Unir mi taller</span>
              <span class="material-symbols-rounded">store</span>
            </a>
            <a routerLink="/login" class="btn btn-secondary btn-large">
              <span>Ya tengo cuenta</span>
              <span class="material-symbols-rounded">login</span>
            </a>
          </div>
          <div class="hero-stats" aria-label="Indicadores del servicio">
            <div>
              <strong>24/7</strong>
              <span>Solicitudes activas</span>
            </div>
            <div>
              <strong>GPS</strong>
              <span>Ubicacion del incidente</span>
            </div>
            <div>
              <strong>IA</strong>
              <span>Clasificacion inicial</span>
            </div>
          </div>
        </div>

        <div class="operations-panel" aria-label="Vista previa del panel AsisteCar">
          <div class="panel-header">
            <div>
              <span class="panel-label">Panel del taller</span>
              <h2>Emergencias entrantes</h2>
            </div>
            <span class="live-badge">En vivo</span>
          </div>
          <div class="incident-card active">
            <div class="incident-icon"><span class="material-symbols-rounded">car_crash</span></div>
            <div>
              <strong>Auxilio por falla mecanica</strong>
              <span>2.4 km · Prioridad media · Bs 120 estimado</span>
            </div>
          </div>
          <div class="incident-card">
            <div class="incident-icon orange"><span class="material-symbols-rounded">tire_repair</span></div>
            <div>
              <strong>Cambio de llanta</strong>
              <span>4.1 km · Tecnico sugerido: Luis R.</span>
            </div>
          </div>
          <div class="panel-grid">
            <div>
              <span>Asignados hoy</span>
              <strong>18</strong>
            </div>
            <div>
              <span>Tiempo medio</span>
              <strong>22 min</strong>
            </div>
          </div>
        </div>
      </section>

      <section class="info-section" aria-labelledby="benefits-title">
        <div class="section-heading">
          <span class="section-kicker">Lo que obtiene tu taller</span>
          <h2 id="benefits-title">Mas servicios, mejor control operativo</h2>
          <p>AsisteCar conecta a los conductores con talleres disponibles y entrega contexto suficiente para decidir, asignar y cerrar cada atencion sin perder informacion.</p>
        </div>

        <div class="benefit-grid">
          <article class="benefit-card">
            <span class="material-symbols-rounded">near_me</span>
            <h3>Solicitudes por cercania</h3>
            <p>Recibe casos cerca de tu zona de cobertura con ubicacion, tipo de emergencia y prioridad.</p>
          </article>
          <article class="benefit-card">
            <span class="material-symbols-rounded">engineering</span>
            <h3>Gestion de tecnicos</h3>
            <p>Organiza tu equipo, asigna responsables y consulta el historial de atenciones realizadas.</p>
          </article>
          <article class="benefit-card">
            <span class="material-symbols-rounded">payments</span>
            <h3>Control de costos</h3>
            <p>Registra costos finales, pagos y evidencia para mantener claridad en cada servicio.</p>
          </article>
          <article class="benefit-card">
            <span class="material-symbols-rounded">analytics</span>
            <h3>Reportes del taller</h3>
            <p>Revisa volumen de incidentes, rendimiento del equipo y tiempos de respuesta desde el panel.</p>
          </article>
        </div>
      </section>

      <section class="workflow-section" aria-labelledby="workflow-title">
        <div class="workflow-copy">
          <span class="section-kicker">Como funciona</span>
          <h2 id="workflow-title">Del aviso al servicio completado</h2>
        </div>
        <div class="workflow-list">
          <div class="workflow-item">
            <span>01</span>
            <div>
              <h3>Llega una emergencia</h3>
              <p>El sistema muestra el tipo de incidente, ubicacion y evidencia enviada por el conductor.</p>
            </div>
          </div>
          <div class="workflow-item">
            <span>02</span>
            <div>
              <h3>Asignas el tecnico</h3>
              <p>Seleccionas al responsable disponible y mantienes el seguimiento desde el detalle del caso.</p>
            </div>
          </div>
          <div class="workflow-item">
            <span>03</span>
            <div>
              <h3>Cierras con evidencia</h3>
              <p>Actualizas el estado, registras el costo y dejas historial para futuras consultas.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="cta-section" aria-label="Registro de taller">
        <div>
          <span class="section-kicker">Empieza hoy</span>
          <h2>Convierte tu taller en punto de respuesta AsisteCar</h2>
        </div>
        <a routerLink="/register" class="btn btn-primary btn-large">
          <span>Crear cuenta de taller</span>
          <span class="material-symbols-rounded">arrow_forward</span>
        </a>
      </section>
    </main>
  `,
  styles: [`
    .landing-page {
      min-height: 100vh;
      background: var(--color-bg);
      color: var(--color-text-primary);
    }

    :host-context([data-theme="dark"]) .hero-section {
      background: #111820;
    }

    :host-context([data-theme="dark"]) .hero-media {
      background:
        linear-gradient(90deg, rgba(17,24,32,0.98) 0%, rgba(17,24,32,0.82) 46%, rgba(17,24,32,0.64) 100%),
        repeating-linear-gradient(110deg, rgba(255,255,255,0.05) 0 2px, transparent 2px 62px);
    }

    :host-context([data-theme="dark"]) .eyebrow,
    :host-context([data-theme="dark"]) .hero-stats {
      background: rgba(22, 27, 34, 0.78);
    }

    .hero-actions,
    .eyebrow,
    .btn,
    .panel-header,
    .incident-card,
    .cta-section {
      display: flex;
      align-items: center;
    }

    .btn {
      justify-content: center;
      gap: var(--space-sm);
      min-height: 2.75rem;
      padding: 0.75rem 1rem;
      border-radius: var(--radius-sm);
      font-weight: 800;
      line-height: 1;
      transition: transform var(--transition-fast), box-shadow var(--transition-fast), background var(--transition-fast);
    }

    .btn:hover {
      transform: translateY(-1px);
    }

    .btn-primary {
      background: var(--color-primary);
      color: var(--color-text-on-primary);
      box-shadow: var(--shadow-sm);
    }

    .btn-primary:hover {
      background: var(--color-primary-dark);
      box-shadow: var(--shadow-md);
    }

    .btn-secondary {
      color: var(--color-text-primary);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
    }

    .btn-large {
      min-height: 3.25rem;
      padding-inline: 1.25rem;
    }

    .material-symbols-rounded {
      font-size: 1.25rem;
      line-height: 1;
    }

    .hero-section {
      position: relative;
      min-height: 82vh;
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(18rem, 29rem);
      align-items: center;
      gap: var(--space-2xl);
      padding: clamp(var(--space-xl), 6vw, var(--space-3xl)) clamp(var(--space-md), 6vw, 5rem);
      overflow: hidden;
      background: #eef4f8;
      border-bottom: 1px solid var(--color-border);
    }

    .hero-media {
      position: absolute;
      inset: 0;
      z-index: 0;
      opacity: 0.72;
      background:
        linear-gradient(90deg, rgba(238,244,248,0.98) 0%, rgba(238,244,248,0.8) 46%, rgba(238,244,248,0.62) 100%),
        repeating-linear-gradient(110deg, rgba(28,43,57,0.05) 0 2px, transparent 2px 62px);
    }

    .road-scene {
      position: absolute;
      right: -8rem;
      top: 8%;
      width: min(58rem, 74vw);
      height: 84%;
      border-left: 7rem solid rgba(28, 43, 57, 0.08);
      transform: skewX(-18deg);
    }

    .route-line {
      position: absolute;
      left: 22%;
      top: 0;
      width: 0.375rem;
      height: 100%;
      background: rgba(255, 122, 0, 0.55);
      border-radius: var(--radius-pill);
    }

    .service-pin {
      position: absolute;
      display: grid;
      place-items: center;
      width: 3.25rem;
      height: 3.25rem;
      border-radius: 50%;
      color: white;
      background: var(--color-primary);
      box-shadow: var(--shadow-lg);
      transform: skewX(18deg);
    }

    .pin-one { left: 18%; top: 18%; }
    .pin-two { left: 44%; top: 48%; background: var(--color-accent); }
    .pin-three { left: 66%; top: 28%; background: var(--color-success); }

    .hero-content,
    .operations-panel {
      position: relative;
      z-index: 1;
    }

    .hero-content {
      max-width: 45rem;
    }

    .eyebrow {
      width: fit-content;
      gap: var(--space-xs);
      margin-bottom: var(--space-md);
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      background: rgba(255,255,255,0.78);
      color: var(--color-primary);
      font-size: 0.8125rem;
      font-weight: 800;
    }

    h1 {
      max-width: 38rem;
      font-size: clamp(2.5rem, 8vw, 5.75rem);
      line-height: 0.98;
      font-weight: 800;
      margin-bottom: var(--space-lg);
    }

    .hero-copy {
      max-width: 42rem;
      color: var(--color-text-secondary);
      font-size: clamp(1rem, 2vw, 1.25rem);
      line-height: 1.75;
      margin-bottom: var(--space-xl);
    }

    .hero-actions {
      flex-wrap: wrap;
      gap: var(--space-sm);
      margin-bottom: var(--space-xl);
    }

    .hero-stats {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      max-width: 38rem;
      overflow: hidden;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      background: rgba(255,255,255,0.78);
    }

    .hero-stats div {
      padding: var(--space-md);
      border-right: 1px solid var(--color-divider);
    }

    .hero-stats div:last-child {
      border-right: 0;
    }

    .hero-stats strong,
    .panel-grid strong {
      display: block;
      font-family: 'JetBrains Mono', monospace;
      font-size: 1.25rem;
      color: var(--color-text-primary);
    }

    .hero-stats span,
    .incident-card span,
    .panel-grid span,
    .panel-label {
      color: var(--color-text-secondary);
      font-size: 0.8125rem;
      font-weight: 700;
    }

    .operations-panel,
    .benefit-card,
    .workflow-item,
    .cta-section {
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      background: var(--color-surface);
      box-shadow: var(--shadow-md);
    }

    .operations-panel {
      padding: var(--space-lg);
    }

    .panel-header {
      justify-content: space-between;
      gap: var(--space-md);
      margin-bottom: var(--space-lg);
    }

    .panel-header h2 {
      font-size: 1.25rem;
      margin-top: 0.125rem;
    }

    .live-badge {
      padding: 0.375rem 0.625rem;
      border-radius: var(--radius-sm);
      background: var(--color-success-light);
      color: var(--color-success);
      font-size: 0.75rem;
      font-weight: 800;
    }

    .incident-card {
      gap: var(--space-md);
      padding: var(--space-md);
      margin-bottom: var(--space-sm);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      background: var(--color-surface-alt);
    }

    .incident-card.active {
      background: var(--color-primary-50);
      border-color: rgba(0, 122, 255, 0.2);
    }

    .incident-card strong {
      display: block;
      margin-bottom: 0.125rem;
    }

    .incident-icon {
      display: grid;
      place-items: center;
      flex: 0 0 2.75rem;
      height: 2.75rem;
      border-radius: var(--radius-sm);
      color: white;
      background: var(--color-primary);
    }

    .incident-icon.orange {
      background: var(--color-accent);
    }

    .panel-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--space-sm);
      margin-top: var(--space-md);
    }

    .panel-grid div {
      padding: var(--space-md);
      border-radius: var(--radius-sm);
      background: var(--color-bg);
    }

    .info-section,
    .workflow-section,
    .cta-section {
      width: min(72rem, calc(100% - 2rem));
      margin-inline: auto;
    }

    .info-section,
    .workflow-section {
      padding-block: var(--space-3xl);
    }

    .section-heading {
      max-width: 44rem;
      margin-bottom: var(--space-xl);
    }

    .section-kicker {
      display: block;
      color: var(--color-accent);
      font-size: 0.8125rem;
      font-weight: 800;
      margin-bottom: var(--space-sm);
      text-transform: uppercase;
    }

    .section-heading h2,
    .workflow-copy h2,
    .cta-section h2 {
      font-size: clamp(1.75rem, 4vw, 2.75rem);
      line-height: 1.12;
      margin-bottom: var(--space-md);
    }

    .section-heading p,
    .workflow-item p {
      color: var(--color-text-secondary);
      font-size: 1rem;
    }

    .benefit-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: var(--space-md);
    }

    .benefit-card {
      padding: var(--space-lg);
      box-shadow: none;
    }

    .benefit-card .material-symbols-rounded {
      display: grid;
      place-items: center;
      width: 2.75rem;
      height: 2.75rem;
      margin-bottom: var(--space-md);
      border-radius: var(--radius-sm);
      background: var(--color-primary-50);
      color: var(--color-primary);
    }

    .benefit-card h3,
    .workflow-item h3 {
      font-size: 1rem;
      margin-bottom: var(--space-sm);
    }

    .benefit-card p {
      color: var(--color-text-secondary);
    }

    .workflow-section {
      display: grid;
      grid-template-columns: minmax(0, 0.75fr) minmax(0, 1fr);
      gap: var(--space-xl);
      align-items: start;
      border-top: 1px solid var(--color-divider);
    }

    .workflow-list {
      display: grid;
      gap: var(--space-md);
    }

    .workflow-item {
      display: grid;
      grid-template-columns: 3.5rem 1fr;
      gap: var(--space-md);
      padding: var(--space-lg);
      box-shadow: none;
    }

    .workflow-item > span {
      font-family: 'JetBrains Mono', monospace;
      color: var(--color-primary);
      font-size: 1rem;
      font-weight: 800;
    }

    .cta-section {
      justify-content: space-between;
      gap: var(--space-lg);
      margin-bottom: var(--space-3xl);
      padding: var(--space-xl);
      background: var(--color-surface);
      color: var(--color-text-primary);
    }

    :host-context([data-theme="dark"]) .cta-section {
      background: var(--color-surface-alt);
    }

    .cta-section h2 {
      max-width: 42rem;
      margin-bottom: 0;
    }

    @media (max-width: 980px) {
      .hero-section,
      .workflow-section {
        grid-template-columns: 1fr;
      }

      .operations-panel {
        max-width: 38rem;
      }

      .benefit-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 640px) {
      .hero-section {
        min-height: auto;
        padding-block: var(--space-xl);
      }

      .hero-actions,
      .cta-section {
        align-items: stretch;
        flex-direction: column;
      }

      .hero-stats,
      .benefit-grid,
      .panel-grid {
        grid-template-columns: 1fr;
      }

      .hero-stats div {
        border-right: 0;
        border-bottom: 1px solid var(--color-divider);
      }

      .hero-stats div:last-child {
        border-bottom: 0;
      }

      .operations-panel,
      .benefit-card,
      .workflow-item,
      .cta-section {
        padding: var(--space-md);
      }

      .workflow-item {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class LandingComponent {}