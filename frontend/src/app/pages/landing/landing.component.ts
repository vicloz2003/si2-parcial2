import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PublicNavbarComponent } from '../../components/public-navbar/public-navbar.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, PublicNavbarComponent],
  template: `
    <main class="min-h-screen bg-white dark:bg-[#0d1117]">
      <app-public-navbar></app-public-navbar>

      <!-- ===== HERO (oscuro, inmersivo) ===== -->
      <section class="relative overflow-hidden border-b border-white/10 bg-hero text-white" aria-labelledby="landing-title">
        <!-- glow de marca -->
        <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_55%_at_70%_0%,rgba(255,107,0,0.28),transparent_70%)]"></div>
        <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_45%_at_15%_90%,rgba(230,57,70,0.20),transparent_70%)]"></div>

        <div class="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-8 lg:px-12 lg:py-24">
          <!-- columna texto -->
          <div class="animate-reveal">
            <div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-semibold text-brand-300">
              <span class="relative flex h-2.5 w-2.5">
                <span class="absolute inline-flex h-full w-full rounded-full bg-brand-400 animate-beacon"></span>
                <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-500"></span>
              </span>
              Red operativa para talleres
            </div>

            <h1 id="landing-title" class="mt-6 font-display text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              Rescate vial,<br><span class="text-gradient">al instante.</span>
            </h1>

            <p class="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
              Recibe emergencias vehiculares cercanas, asigna técnicos disponibles y gestiona cada servicio
              desde un panel pensado para operar rápido y con trazabilidad.
            </p>

            <div class="mt-8 flex flex-wrap gap-3">
              <a routerLink="/register"
                 class="inline-flex h-13 items-center gap-2 rounded-xl bg-gradient-to-br from-brand-400 to-emergency-500 px-6 py-3.5 font-extrabold text-white shadow-brand transition-transform hover:-translate-y-0.5">
                <span>Unir mi taller</span>
                <span class="material-symbols-rounded">store</span>
              </a>
              <a routerLink="/login"
                 class="inline-flex h-13 items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 font-bold text-white backdrop-blur transition-colors hover:bg-white/10">
                <span>Ya tengo cuenta</span>
                <span class="material-symbols-rounded">login</span>
              </a>
            </div>

            <dl class="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-6">
              <div>
                <dt class="font-mono text-2xl font-bold text-brand-400">24/7</dt>
                <dd class="mt-1 text-sm text-slate-400">Solicitudes activas</dd>
              </div>
              <div>
                <dt class="font-mono text-2xl font-bold text-brand-400">GPS</dt>
                <dd class="mt-1 text-sm text-slate-400">Ubicación del incidente</dd>
              </div>
              <div>
                <dt class="font-mono text-2xl font-bold text-brand-400">IA</dt>
                <dd class="mt-1 text-sm text-slate-400">Clasificación inicial</dd>
              </div>
            </dl>
          </div>

          <!-- columna mock flotante -->
          <div class="relative lg:pl-6">
            <div class="animate-float rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl">
              <div class="flex items-center justify-between">
                <div>
                  <span class="text-xs font-semibold uppercase tracking-wide text-slate-400">Panel del taller</span>
                  <h2 class="font-display text-lg font-bold text-white">Emergencias entrantes</h2>
                </div>
                <span class="inline-flex items-center gap-1.5 rounded-full bg-emergency-500/15 px-2.5 py-1 text-xs font-bold text-emergency-300">
                  <span class="h-1.5 w-1.5 rounded-full bg-emergency-400 animate-beacon"></span> En vivo
                </span>
              </div>

              <div class="mt-4 space-y-3">
                <div class="flex items-center gap-3 rounded-2xl border border-brand-500/30 bg-brand-500/10 p-3">
                  <div class="grid h-11 w-11 place-items-center rounded-xl bg-emergency-500/20 text-emergency-300">
                    <span class="material-symbols-rounded">car_crash</span>
                  </div>
                  <div class="min-w-0">
                    <strong class="block text-sm text-white">Auxilio por falla mecánica</strong>
                    <span class="text-xs text-slate-400">2.4 km · Prioridad media · Bs 120 estimado</span>
                  </div>
                </div>
                <div class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div class="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/20 text-brand-300">
                    <span class="material-symbols-rounded">tire_repair</span>
                  </div>
                  <div class="min-w-0">
                    <strong class="block text-sm text-white">Cambio de llanta</strong>
                    <span class="text-xs text-slate-400">4.1 km · Técnico sugerido: Luis R.</span>
                  </div>
                </div>
              </div>

              <div class="mt-4 grid grid-cols-2 gap-3">
                <div class="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <span class="text-xs text-slate-400">Asignados hoy</span>
                  <strong class="block font-mono text-2xl font-bold text-white">18</strong>
                </div>
                <div class="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <span class="text-xs text-slate-400">Tiempo medio</span>
                  <strong class="block font-mono text-2xl font-bold text-white">22 min</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ===== BENEFICIOS (bento) ===== -->
      <section class="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-12" aria-labelledby="benefits-title">
        <div class="max-w-2xl">
          <span class="text-sm font-bold uppercase tracking-widest text-brand-500">Lo que obtiene tu taller</span>
          <h2 id="benefits-title" class="mt-3 font-display text-3xl font-extrabold text-slate-900 sm:text-4xl dark:text-white">
            Más servicios, mejor control operativo
          </h2>
          <p class="mt-4 text-lg text-slate-600 dark:text-slate-400">
            RescateYa conecta a los conductores con talleres disponibles y entrega contexto suficiente para
            decidir, asignar y cerrar cada atención sin perder información.
          </p>
        </div>

        <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:grid-rows-2">
          <article class="group rounded-3xl border border-slate-200 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover lg:col-span-3 lg:row-span-2 dark:border-white/10 dark:bg-white/5">
            <div class="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-emergency-500 text-white shadow-brand">
              <span class="material-symbols-rounded">near_me</span>
            </div>
            <h3 class="mt-5 font-display text-xl font-bold text-slate-900 dark:text-white">Solicitudes por cercanía</h3>
            <p class="mt-2 text-slate-600 dark:text-slate-400">Recibe casos cerca de tu zona de cobertura con ubicación, tipo de emergencia y prioridad en tiempo real.</p>
          </article>

          <article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover lg:col-span-3 dark:border-white/10 dark:bg-white/5">
            <div class="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
              <span class="material-symbols-rounded">engineering</span>
            </div>
            <h3 class="mt-4 font-display text-lg font-bold text-slate-900 dark:text-white">Gestión de técnicos</h3>
            <p class="mt-1.5 text-sm text-slate-600 dark:text-slate-400">Organiza tu equipo, asigna responsables y consulta el historial de atenciones.</p>
          </article>

          <article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover lg:col-span-3 dark:border-white/10 dark:bg-white/5">
            <div class="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
              <span class="material-symbols-rounded">payments</span>
            </div>
            <h3 class="mt-4 font-display text-lg font-bold text-slate-900 dark:text-white">Control de costos</h3>
            <p class="mt-1.5 text-sm text-slate-600 dark:text-slate-400">Registra costos finales, pagos y evidencia para mantener claridad en cada servicio.</p>
          </article>
        </div>
      </section>

      <!-- ===== HIGHLIGHT zig-zag ===== -->
      <section class="border-y border-slate-200 bg-slate-50 py-24 dark:border-white/10 dark:bg-white/[0.03]">
        <div class="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-12">
          <div class="order-2 lg:order-1">
            <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-card-hover dark:border-white/10 dark:bg-white/5">
              <div class="flex items-center gap-3">
                <div class="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-emergency-500 text-white"><span class="material-symbols-rounded">analytics</span></div>
                <div>
                  <span class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Reportes del taller</span>
                  <h3 class="font-display font-bold text-slate-900 dark:text-white">Decisiones con datos</h3>
                </div>
              </div>
              <div class="mt-5 grid grid-cols-3 gap-3 text-center">
                <div class="rounded-2xl bg-slate-50 p-3 dark:bg-white/5"><strong class="block font-mono text-xl text-brand-600 dark:text-brand-400">12m</strong><span class="text-xs text-slate-500">asignación</span></div>
                <div class="rounded-2xl bg-slate-50 p-3 dark:bg-white/5"><strong class="block font-mono text-xl text-brand-600 dark:text-brand-400">94%</strong><span class="text-xs text-slate-500">SLA</span></div>
                <div class="rounded-2xl bg-slate-50 p-3 dark:bg-white/5"><strong class="block font-mono text-xl text-brand-600 dark:text-brand-400">4.7</strong><span class="text-xs text-slate-500">rating</span></div>
              </div>
            </div>
          </div>
          <div class="order-1 lg:order-2">
            <span class="text-sm font-bold uppercase tracking-widest text-brand-500">Del panel a la calle</span>
            <h2 class="mt-3 font-display text-3xl font-extrabold text-slate-900 sm:text-4xl dark:text-white">Volumen, rendimiento y tiempos en un solo lugar</h2>
            <p class="mt-4 text-lg text-slate-600 dark:text-slate-400">Revisa volumen de incidentes, rendimiento del equipo y tiempos de respuesta desde el panel, con reportes que puedes generar en lenguaje natural y exportar.</p>
            <a routerLink="/register" class="mt-6 inline-flex items-center gap-2 font-bold text-brand-600 hover:gap-3 transition-all dark:text-brand-400">
              Explorar el panel <span class="material-symbols-rounded">arrow_forward</span>
            </a>
          </div>
        </div>
      </section>

      <!-- ===== CÓMO FUNCIONA (timeline horizontal) ===== -->
      <section class="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-12" aria-labelledby="workflow-title">
        <div class="text-center">
          <span class="text-sm font-bold uppercase tracking-widest text-brand-500">Cómo funciona</span>
          <h2 id="workflow-title" class="mt-3 font-display text-3xl font-extrabold text-slate-900 sm:text-4xl dark:text-white">Del aviso al servicio completado</h2>
        </div>
        <div class="relative mt-12 grid gap-8 md:grid-cols-3">
          <div class="pointer-events-none absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-brand-300 via-brand-400 to-emergency-400 md:block"></div>
          <div class="relative text-center">
            <div class="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-emergency-500 font-mono text-lg font-bold text-white shadow-brand">01</div>
            <h3 class="mt-5 font-display text-lg font-bold text-slate-900 dark:text-white">Llega una emergencia</h3>
            <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">El sistema muestra el tipo de incidente, ubicación y evidencia enviada por el conductor.</p>
          </div>
          <div class="relative text-center">
            <div class="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-emergency-500 font-mono text-lg font-bold text-white shadow-brand">02</div>
            <h3 class="mt-5 font-display text-lg font-bold text-slate-900 dark:text-white">Asignas el técnico</h3>
            <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">Seleccionas al responsable disponible y mantienes el seguimiento desde el detalle del caso.</p>
          </div>
          <div class="relative text-center">
            <div class="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-emergency-500 font-mono text-lg font-bold text-white shadow-brand">03</div>
            <h3 class="mt-5 font-display text-lg font-bold text-slate-900 dark:text-white">Cierras con evidencia</h3>
            <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">Actualizas el estado, registras el costo y dejas historial para futuras consultas.</p>
          </div>
        </div>
      </section>

      <!-- ===== CTA ===== -->
      <section class="px-4 pb-20 sm:px-6 lg:px-12" aria-label="Registro de taller">
        <div class="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 via-brand-600 to-emergency-600 px-6 py-14 text-center shadow-brand sm:px-12">
          <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_80%_at_50%_0%,rgba(255,255,255,0.18),transparent)]"></div>
          <div class="relative">
            <span class="text-sm font-bold uppercase tracking-widest text-white/80">Empieza hoy</span>
            <h2 class="mx-auto mt-3 max-w-2xl font-display text-3xl font-extrabold text-white sm:text-4xl">Convierte tu taller en punto de respuesta RescateYa</h2>
            <a routerLink="/register"
               class="mt-8 inline-flex h-13 items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-extrabold text-brand-600 shadow-lg transition-transform hover:-translate-y-0.5">
              <span>Crear cuenta de taller</span>
              <span class="material-symbols-rounded">arrow_forward</span>
            </a>
          </div>
        </div>
      </section>

      <!-- ===== FOOTER ===== -->
      <footer class="border-t border-slate-200 bg-white dark:border-white/10 dark:bg-[#0d1117]">
        <div class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-12">
          <a routerLink="/" class="flex items-center gap-2 font-display text-lg font-extrabold text-slate-900 dark:text-white">
            <img src="logo.svg" alt="RescateYa" class="h-8 w-8 rounded-lg object-contain"> RescateYa
          </a>
          <p class="text-sm text-slate-500 dark:text-slate-400">© 2026 RescateYa · Plataforma de emergencias vehiculares</p>
          <div class="flex items-center gap-3">
            <a routerLink="/login" class="text-sm font-semibold text-slate-600 hover:text-brand-600 dark:text-slate-300">Ingresar</a>
            <a routerLink="/register" class="text-sm font-semibold text-brand-600 dark:text-brand-400">Registrar taller</a>
          </div>
        </div>
      </footer>
    </main>
  `,
})
export class LandingComponent {}
