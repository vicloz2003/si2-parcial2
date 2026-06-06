import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PublicNavbarComponent } from '../../components/public-navbar/public-navbar.component';
import { AppIconComponent } from '../../shared/app-icon.component';

/*
 * Paleta: Spotify blacks (#111111 base · #181818 card · #282828 raised · #333333 border)
 * Acento principal: blanco puro — sin naranja en botones ni logotipos
 * Rojo #E63946 reservado SOLO para estado de emergencia funcional (badges, alertas)
 *
 * Taste Skill: DESIGN_VARIANCE 7 · MOTION_INTENSITY 5 · VISUAL_DENSITY 5
 * — 0 eyebrows · 6 layout families · bento diversity · 4-step numbered flow
 */
@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, PublicNavbarComponent, AppIconComponent],
  template: `
<main class="min-h-screen bg-white dark:bg-[#111111]">
  <app-public-navbar></app-public-navbar>

  <!-- ══════════════════════════════════════════════════════════
       1. HERO — split screen  |  bg Spotify #111111
  ══════════════════════════════════════════════════════════ -->
  <section
    class="relative overflow-hidden bg-[#111111] text-white"
    aria-labelledby="landing-title">

    <!-- Sutil textura de cuadrícula — sin glows de colores -->
    <div class="pointer-events-none absolute inset-0 opacity-[0.04]"
         style="background-image:linear-gradient(#fff 1px,transparent 1px),
                linear-gradient(90deg,#fff 1px,transparent 1px);
                background-size:48px 48px"></div>
    <!-- Vignette lateral derecha muy suave -->
    <div class="pointer-events-none absolute inset-0
                bg-[radial-gradient(50%_80%_at_100%_50%,rgba(255,255,255,0.03),transparent)]"></div>

    <div class="relative mx-auto grid max-w-7xl items-center gap-10
                px-4 pb-20 pt-16 sm:px-6
                lg:grid-cols-[1fr_480px] lg:gap-6 lg:px-12 lg:pb-24 lg:pt-20">

      <!-- ── Columna izquierda: copy ── -->
      <div class="animate-reveal">

        <!-- Pill badge (beacon blanco) -->
        <div class="inline-flex items-center gap-2 rounded-full
                    border border-white/15 bg-white/8 px-3 py-1.5
                    text-sm font-semibold text-white/70">
          <span class="relative flex h-2.5 w-2.5">
            <span class="absolute inline-flex h-full w-full animate-beacon
                         rounded-full bg-white/60"></span>
            <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-white"></span>
          </span>
          Red activa · Bolivia
        </div>

        <!-- Headline -->
        <h1 id="landing-title"
            class="mt-5 font-display text-5xl font-extrabold
                   leading-[1.04] tracking-tight sm:text-[3.75rem]">
          Rescate vial,<br>
          <span class="text-white">al instante.</span>
        </h1>

        <!-- Subtext ≤ 20 palabras -->
        <p class="mt-5 max-w-[46ch] text-lg leading-relaxed text-white/55">
          Recibe emergencias cercanas, asigna tu equipo y cierra cada servicio
          con trazabilidad total.
        </p>

        <!-- CTAs -->
        <div class="mt-7 flex flex-wrap gap-3">
          <a routerLink="/register"
             class="inline-flex h-12 items-center gap-2 rounded-xl
                    bg-white px-6 font-extrabold text-[#111111]
                    shadow-[0_4px_20px_rgba(255,255,255,0.18)]
                    transition-all hover:-translate-y-0.5
                    hover:shadow-[0_8px_32px_rgba(255,255,255,0.25)]
                    active:scale-[0.98]">
            Unir mi taller
            <app-icon name="arrow_forward" [size]="18" />
          </a>
          <a routerLink="/login"
             class="inline-flex h-12 items-center gap-2 rounded-xl
                    border border-white/20 bg-white/5 px-6
                    font-bold text-white backdrop-blur
                    transition-colors hover:bg-white/10 active:scale-[0.98]">
            Acceder
            <app-icon name="login" [size]="18" />
          </a>
        </div>

        <!-- Mini stats -->
        <dl class="mt-9 flex flex-wrap gap-x-8 gap-y-3
                   border-t border-white/10 pt-6">
          <div class="flex items-baseline gap-2">
            <dt class="font-mono text-2xl font-bold text-white">24/7</dt>
            <dd class="text-sm text-white/45">Operación continua</dd>
          </div>
          <div class="flex items-baseline gap-2">
            <dt class="font-mono text-2xl font-bold text-white">GPS</dt>
            <dd class="text-sm text-white/45">Ubicación del caso</dd>
          </div>
          <div class="flex items-baseline gap-2">
            <dt class="font-mono text-2xl font-bold text-white">IA</dt>
            <dd class="text-sm text-white/45">Clasificación inicial</dd>
          </div>
        </dl>
      </div>

      <!-- ── Columna derecha: Network Pulse Display ── -->
      <div class="animate-float" style="animation-delay:0.2s">
        <div class="overflow-hidden rounded-[28px] border border-white/10
                    bg-[#181818]
                    shadow-[0_32px_80px_rgba(0,0,0,0.7)]">

          <!-- Header strip -->
          <div class="flex items-center justify-between border-b border-white/6 px-5 py-3.5">
            <div class="flex items-center gap-2">
              <span class="grid h-6 w-6 place-items-center rounded-lg bg-white text-[#111111] text-[10px] font-black">R</span>
              <span class="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">Red activa</span>
            </div>
            <span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
              <span class="h-1.5 w-1.5 animate-beacon rounded-full bg-emerald-400"></span>
              En línea
            </span>
          </div>

          <!-- Métrica principal — número grande -->
          <div class="px-5 pt-5 pb-3">
            <p class="font-mono text-[9px] uppercase tracking-[0.18em] text-white/25">Emergencias atendidas</p>
            <p class="font-display mt-1 text-6xl font-black leading-none text-white">847</p>
            <p class="mt-1.5 text-[11px] text-white/35">+12% vs ayer · Tiempo prom.&nbsp;<span class="text-white/60">18 min</span></p>
          </div>

          <!-- Grilla de nodos — talleres en la red -->
          <div class="px-5 pb-4">
            <p class="mb-2.5 font-mono text-[9px] uppercase tracking-[0.15em] text-white/25">Talleres en la red</p>
            <div class="grid grid-cols-10 gap-1">
              <ng-container *ngFor="let node of networkNodes; let i = index">
                <span class="h-2.5 w-2.5 rounded-full transition-opacity"
                      [style.animation-delay]="(i * 120) + 'ms'"
                      [ngClass]="{
                        'bg-emerald-400 animate-beacon': node === 'active',
                        'bg-blue-400':                   node === 'busy',
                        'bg-white/15':                   node === 'idle'
                      }"></span>
              </ng-container>
            </div>
            <div class="mt-2 flex items-center gap-4 text-[9px] text-white/25">
              <span class="flex items-center gap-1"><span class="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>Disponible</span>
              <span class="flex items-center gap-1"><span class="h-1.5 w-1.5 rounded-full bg-blue-400"></span>En servicio</span>
              <span class="flex items-center gap-1"><span class="h-1.5 w-1.5 rounded-full bg-white/20"></span>Inactivo</span>
            </div>
          </div>

          <!-- Barras de actividad CSS-only — últimas 8 horas -->
          <div class="border-t border-white/6 px-5 py-4">
            <p class="mb-3 font-mono text-[9px] uppercase tracking-[0.15em] text-white/25">Actividad · últimas 8h</p>
            <div class="flex items-end gap-1.5" style="height:40px">
              <div *ngFor="let bar of activityBars; let i = index"
                   class="flex-1 rounded-t-sm transition-all"
                   [ngClass]="i === 7 ? 'bg-blue-400' : 'bg-white/20'"
                   [style.height]="bar + '%'"
                   [style.animation-delay]="(i * 80) + 'ms'"></div>
            </div>
            <div class="mt-2 flex items-center justify-between text-[9px] text-white/20">
              <span>00:00</span><span>04:00</span><span>08:00</span><span>Ahora</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ══════════════════════════════════════════════════════════
       2. NUMBERS STRIP — bg #121212 (negro profundo Spotify)
  ══════════════════════════════════════════════════════════ -->
  <section class="border-y border-white/8 bg-[#121212] text-white"
           aria-label="Cifras de la plataforma">
    <div class="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-white/8
                px-4 sm:px-6 lg:grid-cols-4 lg:px-12">
      <div class="px-8 py-10">
        <strong class="block font-display text-4xl font-extrabold
                       tracking-tight text-white">
          3,200<span class="text-white/40">+</span>
        </strong>
        <span class="mt-1 block text-sm text-white/45">Servicios completados</span>
      </div>
      <div class="px-8 py-10">
        <strong class="block font-display text-4xl font-extrabold
                       tracking-tight text-white">
          180<span class="text-white/40">+</span>
        </strong>
        <span class="mt-1 block text-sm text-white/45">Talleres activos</span>
      </div>
      <div class="px-8 py-10">
        <strong class="block font-display text-4xl font-extrabold
                       tracking-tight text-white">
          4<span class="text-white/40">m</span>
        </strong>
        <span class="mt-1 block text-sm text-white/45">Primera respuesta promedio</span>
      </div>
      <div class="px-8 py-10">
        <strong class="block font-display text-4xl font-extrabold
                       tracking-tight text-white">
          94<span class="text-white/40">%</span>
        </strong>
        <span class="mt-1 block text-sm text-white/45">Satisfacción del cliente</span>
      </div>
    </div>
  </section>

  <!-- ══════════════════════════════════════════════════════════
       3. FEATURES BENTO — bg claro en light mode / #111111 en dark
       Bento diversity: célula hero #181818 + célula tinted + estándar
  ══════════════════════════════════════════════════════════ -->
  <section class="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-12"
           aria-labelledby="features-title">

    <h2 id="features-title"
        class="max-w-2xl font-display text-3xl font-extrabold
               tracking-tight text-slate-900 sm:text-4xl dark:text-white">
      Todo lo que necesita tu taller para operar rápido
    </h2>
    <p class="mt-4 max-w-[55ch] text-lg
              text-slate-600 dark:text-white/45">
      RescateYa entrega el contexto justo para decidir, asignar y cerrar
      sin perder información en el camino.
    </p>

    <!-- Bento fila principal: lg = 6 cols -->
    <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:grid-rows-2">

      <!-- Célula HERO — dark Spotify, col-span-3, row-span-2 -->
      <article class="relative overflow-hidden rounded-3xl
                      border border-white/10 bg-[#111111] p-7
                      shadow-[0_4px_32px_rgba(0,0,0,0.4)]
                      transition hover:-translate-y-0.5
                      lg:col-span-3 lg:row-span-2">
        <!-- Textura subtle -->
        <div class="pointer-events-none absolute inset-0 opacity-[0.03]"
             style="background-image:linear-gradient(#fff 1px,transparent 1px),
                    linear-gradient(90deg,#fff 1px,transparent 1px);
                    background-size:32px 32px"></div>
        <div class="relative">
          <div class="grid h-12 w-12 place-items-center rounded-2xl
                      bg-white text-[#111111]
                      shadow-[0_4px_20px_rgba(255,255,255,0.15)]">
            <app-icon name="near_me" [size]="22" />
          </div>
          <h3 class="mt-6 font-display text-2xl font-extrabold text-white">
            Solicitudes<br>por cercanía
          </h3>
          <p class="mt-3 text-base leading-relaxed text-white/50">
            Recibe casos dentro de tu zona de cobertura con ubicación exacta,
            tipo de emergencia, prioridad y evidencias del conductor — antes de
            aceptar cualquier servicio.
          </p>
          <div class="mt-8 flex items-center gap-4">
            <div class="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <strong class="block font-mono text-lg font-bold text-white">≤ 5km</strong>
              <span class="text-[11px] text-white/35">radio configurable</span>
            </div>
            <div class="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <strong class="block font-mono text-lg font-bold text-white">GPS</strong>
              <span class="text-[11px] text-white/35">tiempo real</span>
            </div>
          </div>
        </div>
      </article>

      <!-- Célula 2 — tinted (slate claro / dark raised) -->
      <article class="rounded-3xl border border-slate-200 bg-slate-50 p-6
                      transition hover:-translate-y-1
                      lg:col-span-3
                      dark:border-white/10 dark:bg-[#282828]">
        <div class="grid h-11 w-11 place-items-center rounded-2xl
                    bg-slate-200 text-slate-700
                    dark:bg-white/10 dark:text-white/80">
          <app-icon name="engineering" [size]="20" />
        </div>
        <h3 class="mt-4 font-display text-lg font-bold
                   text-slate-900 dark:text-white">Gestión de técnicos</h3>
        <p class="mt-2 text-sm leading-relaxed
                  text-slate-600 dark:text-white/45">
          Crea perfiles, define especialidades y controla la disponibilidad
          de tu equipo en tiempo real. El sistema sugiere el técnico más cercano.
        </p>
      </article>

      <!-- Célula 3 -->
      <article class="rounded-3xl border border-slate-200 bg-white p-6
                      transition hover:-translate-y-1
                      lg:col-span-3
                      dark:border-white/10 dark:bg-[#282828]">
        <div class="grid h-11 w-11 place-items-center rounded-2xl
                    bg-slate-100 text-slate-600
                    dark:bg-white/10 dark:text-white/80">
          <app-icon name="payments" [size]="20" />
        </div>
        <h3 class="mt-4 font-display text-lg font-bold
                   text-slate-900 dark:text-white">Control de costos</h3>
        <p class="mt-2 text-sm leading-relaxed
                  text-slate-600 dark:text-white/45">
          Registra el costo final, confirma el pago del cliente y mantén
          historial de cada servicio sin papeles.
        </p>
      </article>
    </div>

    <!-- Segunda fila del bento -->
    <div class="mt-4 grid gap-4 sm:grid-cols-2">
      <article class="rounded-3xl border border-slate-200 bg-white p-6
                      transition hover:-translate-y-1
                      dark:border-white/10 dark:bg-[#282828]">
        <div class="grid h-11 w-11 place-items-center rounded-2xl
                    bg-slate-100 text-slate-600
                    dark:bg-white/10 dark:text-white/80">
          <app-icon name="auto_awesome" [size]="20" />
        </div>
        <h3 class="mt-4 font-display text-lg font-bold
                   text-slate-900 dark:text-white">Reportes con IA</h3>
        <p class="mt-2 text-sm leading-relaxed
                  text-slate-600 dark:text-white/45">
          Pregunta en lenguaje natural: "¿cuáles son mis 3 categorías más
          frecuentes este mes?" y obtén el análisis al instante.
        </p>
      </article>

      <article class="rounded-3xl border border-slate-200 bg-white p-6
                      transition hover:-translate-y-1
                      dark:border-white/10 dark:bg-[#282828]">
        <div class="grid h-11 w-11 place-items-center rounded-2xl
                    bg-slate-100 text-slate-600
                    dark:bg-white/10 dark:text-white/80">
          <app-icon name="history" [size]="20" />
        </div>
        <h3 class="mt-4 font-display text-lg font-bold
                   text-slate-900 dark:text-white">Historial con trazabilidad</h3>
        <p class="mt-2 text-sm leading-relaxed
                  text-slate-600 dark:text-white/45">
          Cada servicio guarda estados, evidencias fotográficas, chat y costos.
          Consulta cualquier caso semanas después sin ambigüedad.
        </p>
      </article>
    </div>
  </section>

  <!-- ══════════════════════════════════════════════════════════
       4. CÓMO FUNCIONA — bg #121212, pasos numerados asimétricos
  ══════════════════════════════════════════════════════════ -->
  <section class="border-y border-white/8 bg-[#121212] py-24 text-white"
           aria-labelledby="workflow-title">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">

      <h2 id="workflow-title"
          class="font-display text-3xl font-extrabold
                 tracking-tight sm:text-4xl">
        Del aviso al servicio completado
      </h2>

      <div class="mt-12 grid gap-0 lg:grid-cols-4">
        <div *ngFor="let step of steps; let last = last"
             class="relative flex flex-col lg:flex-row">
          <!-- Línea conectora desktop -->
          <div *ngIf="!last"
               class="absolute right-0 top-8 hidden h-px w-8
                      bg-gradient-to-r from-white/20 to-transparent lg:block"></div>

          <div class="group flex flex-col pb-10 pr-0 lg:pb-0 lg:pr-10">
            <!-- Número grande como ancla visual -->
            <span class="font-display text-6xl font-extrabold leading-none
                         text-white/8 transition-colors
                         group-hover:text-white/15">
              {{ step.num }}
            </span>
            <div class="mt-4 flex items-start gap-3">
              <!-- Icono blanco sobre #282828 -->
              <div class="mt-0.5 grid h-9 w-9 flex-shrink-0 place-items-center
                          rounded-xl bg-white text-[#111111]">
                <app-icon [name]="step.icon" [size]="16" />
              </div>
              <div>
                <h3 class="font-display text-base font-bold text-white">
                  {{ step.title }}
                </h3>
                <p class="mt-1.5 text-sm leading-relaxed text-white/45">
                  {{ step.desc }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ══════════════════════════════════════════════════════════
       5. DASHBOARD PREVIEW — split left-heavy
  ══════════════════════════════════════════════════════════ -->
  <section class="mx-auto grid max-w-7xl items-center gap-12
                  px-4 py-24 sm:px-6
                  lg:grid-cols-[520px_1fr] lg:gap-16 lg:px-12"
           aria-labelledby="proof-title">

    <!-- Izquierda: tarjeta de métricas -->
    <div class="rounded-3xl border border-slate-200 bg-white p-6
                shadow-[0_8px_48px_rgba(0,0,0,0.08)]
                dark:border-white/10 dark:bg-[#181818]">
      <div class="flex items-center gap-3">
        <div class="grid h-10 w-10 place-items-center rounded-xl
                    bg-[#111111] text-white
                    dark:bg-white dark:text-[#111111]">
          <app-icon name="analytics" [size]="18" />
        </div>
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-[0.14em]
                    text-slate-400 dark:text-white/35">Vista del taller</p>
          <h3 class="font-display font-bold
                     text-slate-900 dark:text-white">Rendimiento del mes</h3>
        </div>
      </div>

      <!-- Grid de métricas -->
      <div class="mt-6 grid grid-cols-3 gap-3 text-center">
        <div class="rounded-2xl bg-slate-50 py-4 dark:bg-[#282828]">
          <strong class="block font-mono text-2xl font-bold
                         text-slate-900 dark:text-white">12m</strong>
          <span class="mt-0.5 block text-[11px]
                       text-slate-500 dark:text-white/35">asignación</span>
        </div>
        <div class="rounded-2xl bg-slate-50 py-4 dark:bg-[#282828]">
          <strong class="block font-mono text-2xl font-bold
                         text-slate-900 dark:text-white">94%</strong>
          <span class="mt-0.5 block text-[11px]
                       text-slate-500 dark:text-white/35">SLA</span>
        </div>
        <div class="rounded-2xl bg-slate-50 py-4 dark:bg-[#282828]">
          <strong class="block font-mono text-2xl font-bold
                         text-slate-900 dark:text-white">4.7</strong>
          <span class="mt-0.5 block text-[11px]
                       text-slate-500 dark:text-white/35">rating</span>
        </div>
      </div>

      <!-- Barras KPI — blancas -->
      <div class="mt-5 space-y-3">
        <div *ngFor="let bar of kpiBars" class="space-y-1.5">
          <div class="flex justify-between text-[12px]">
            <span class="font-medium
                         text-slate-600 dark:text-white/55">{{ bar.label }}</span>
            <span class="font-bold
                         text-slate-900 dark:text-white">{{ bar.value }}</span>
          </div>
          <div class="h-1.5 overflow-hidden rounded-full
                      bg-slate-100 dark:bg-white/8">
            <div class="h-full rounded-full
                        bg-slate-900 dark:bg-white
                        transition-all duration-700"
                 [style.width]="bar.pct"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Derecha: copy -->
    <div>
      <h2 id="proof-title"
          class="font-display text-3xl font-extrabold tracking-tight
                 text-slate-900 sm:text-4xl dark:text-white">
        Volumen, tiempos y rendimiento en un solo lugar
      </h2>
      <p class="mt-5 text-lg leading-relaxed
                text-slate-600 dark:text-white/50">
        El panel consolida incidentes, técnicos, pagos y reportes.
        Genera análisis en lenguaje natural y exporta lo que necesites
        sin tocar una hoja de cálculo.
      </p>
      <ul class="mt-7 space-y-3">
        <li *ngFor="let feat of proofFeatures"
            class="flex items-start gap-3
                   text-slate-700 dark:text-white/70">
          <app-icon name="check_circle" [size]="18"
                    class="mt-0.5 flex-shrink-0
                           text-slate-900 dark:text-white" />
          <span class="text-sm leading-relaxed">{{ feat }}</span>
        </li>
      </ul>
    </div>
  </section>

  <!-- ══════════════════════════════════════════════════════════
       6. CTA FINAL — full-width banner #111111
  ══════════════════════════════════════════════════════════ -->
  <section class="px-4 pb-20 sm:px-6 lg:px-12" aria-label="Llamada a la acción">
    <div class="relative mx-auto max-w-7xl overflow-hidden rounded-3xl
                border border-white/10 bg-[#111111] px-8 py-16 text-center
                sm:px-16">
      <!-- Textura grid -->
      <div class="pointer-events-none absolute inset-0 opacity-[0.04]"
           style="background-image:linear-gradient(#fff 1px,transparent 1px),
                  linear-gradient(90deg,#fff 1px,transparent 1px);
                  background-size:48px 48px"></div>

      <div class="relative">
        <div class="mx-auto inline-flex items-center gap-2 rounded-full
                    border border-white/15 bg-white/8 px-4 py-2
                    text-sm font-semibold text-white/60">
          <app-icon name="bolt" [size]="14" />
          Sin costo inicial · Comisión solo por servicio cerrado
        </div>

        <h2 class="mx-auto mt-5 max-w-2xl font-display text-3xl font-extrabold
                   leading-[1.1] tracking-tight text-white sm:text-4xl">
          Convierte tu taller en<br>
          punto de respuesta RescateYa
        </h2>

        <p class="mx-auto mt-4 max-w-[45ch] text-base text-white/45">
          Registro en menos de 5 minutos. Empieza a recibir solicitudes hoy mismo.
        </p>

        <a routerLink="/register"
           class="mt-8 inline-flex h-12 items-center gap-2 rounded-xl
                  bg-white px-8 font-extrabold text-[#111111]
                  shadow-[0_4px_24px_rgba(255,255,255,0.2)]
                  transition-all hover:-translate-y-0.5
                  hover:shadow-[0_8px_40px_rgba(255,255,255,0.3)]
                  active:scale-[0.98]">
          Unir mi taller
          <app-icon name="arrow_forward" [size]="18" />
        </a>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="border-t border-slate-200 bg-white
                 dark:border-white/8 dark:bg-[#111111]">
    <div class="mx-auto flex max-w-7xl flex-col items-center justify-between
                gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-12">

      <!-- Logo B&W -->
      <a routerLink="/"
         class="flex items-center gap-2 font-display text-lg
                font-extrabold text-slate-900 dark:text-white"
         aria-label="Inicio RescateYa">
        <span class="grid h-8 w-8 place-items-center rounded-lg
                     bg-[#111111] text-white text-xs font-black
                     dark:bg-white dark:text-[#111111]">
          R
        </span>
        RescateYa
      </a>

      <p class="text-sm text-slate-500 dark:text-white/35">
        © 2026 RescateYa · Plataforma de emergencias vehiculares · Bolivia
      </p>

      <div class="flex items-center gap-4">
        <a routerLink="/login"
           class="text-sm font-semibold text-slate-500
                  transition-colors hover:text-slate-900
                  dark:text-white/40 dark:hover:text-white">
          Ingresar
        </a>
        <a routerLink="/register"
           class="text-sm font-semibold text-slate-900
                  hover:text-slate-700 transition-colors
                  dark:text-white dark:hover:text-white/70">
          Registrar taller →
        </a>
      </div>
    </div>
  </footer>
</main>
  `,
})
export class LandingComponent {
  /** 30 nodos: estado de talleres en la red (10×3 grid) */
  readonly networkNodes: ('active' | 'busy' | 'idle')[] = [
    'active','active','busy','active','idle','active','busy','active','active','idle',
    'busy','active','active','idle','active','active','busy','idle','active','active',
    'idle','active','busy','active','idle','busy','active','active','idle','active',
  ];

  /** Alturas de barras en % para las últimas 8h */
  readonly activityBars = [30, 45, 60, 40, 70, 55, 80, 95];

  readonly steps = [
    {
      num: '01',
      icon: 'notifications',
      title: 'Llega una emergencia',
      desc: 'El conductor reporta el incidente desde la app con ubicación, foto y descripción de voz.',
    },
    {
      num: '02',
      icon: 'local_offer',
      title: 'Tu taller envía oferta',
      desc: 'Revisas el caso, ves el tipo y la prioridad, y envías tu oferta de precio al conductor.',
    },
    {
      num: '03',
      icon: 'engineering',
      title: 'Asignas y haces seguimiento',
      desc: 'El cliente acepta. Asignas tu técnico disponible y el sistema rastrea el servicio en tiempo real.',
    },
    {
      num: '04',
      icon: 'check_circle',
      title: 'Cierras con evidencia',
      desc: 'Actualizas el estado, registras el costo final y el historial queda guardado automáticamente.',
    },
  ];

  readonly kpiBars = [
    { label: 'Tiempo de asignación', value: '12 min', pct: '78%' },
    { label: 'Tasa de cierre',        value: '91%',   pct: '91%' },
    { label: 'Satisfacción',          value: '4.7/5', pct: '94%' },
  ];

  readonly proofFeatures = [
    'Panel web para el taller, app móvil para el técnico y el conductor.',
    'Clasificación con IA del tipo de emergencia antes de que aceptes.',
    'Chat en tiempo real entre taller, técnico y cliente.',
    'Reportes exportables con análisis en lenguaje natural.',
    'Sin costo fijo — comisión solo por servicio cerrado.',
  ];
}
