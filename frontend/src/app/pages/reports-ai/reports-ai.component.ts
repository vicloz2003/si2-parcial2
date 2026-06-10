import { ChangeDetectorRef, Component, NgZone, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ReportResult } from '../../models/interfaces';
import { AppIconComponent } from '../../shared/app-icon.component';

// API de reconocimiento de voz del navegador (no tipada en TS por defecto).
declare const window: any;

@Component({
  selector: 'app-reports-ai',
  standalone: true,
  imports: [CommonModule, FormsModule, AppIconComponent],
  template: `
    <div class="animate-reveal space-y-6">
      <header class="space-y-1">
        <span class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-white/8 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-900 dark:text-white">
          <app-icon name="auto_awesome" [size]="14" />
          Asistente de reportes
        </span>
        <h1 class="font-display text-3xl font-bold text-slate-900 dark:text-white">Reportes IA</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">Describe en lenguaje natural el reporte que necesitas y la IA lo genera.</p>
      </header>

      <!-- Command bar -->
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-card dark:border-hero-line dark:bg-hero-soft">
        <div class="relative">
          <textarea [(ngModel)]="prompt" rows="3" [disabled]="loading"
            placeholder="Ej: Clientes con más incidencias en el último mes; o talleres ordenados por servicios completados..."
            class="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-14 text-sm text-slate-700 outline-none transition focus:border-slate-900 dark:border-white/60 focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-slate-900 dark:ring-white/20 disabled:opacity-60 dark:border-hero-line dark:bg-white/5 dark:text-slate-200"></textarea>
          <button type="button" *ngIf="voiceSupported" (click)="toggleVoice()"
            [title]="recording ? 'Detener dictado' : 'Dictar por voz'"
            class="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border transition"
            [ngClass]="recording
              ? 'border-emergency-500 bg-emergency-500 text-white animate-beacon'
              : 'border-slate-200 bg-white text-slate-500 hover:border-slate-900 dark:border-white/60 hover:text-slate-700 dark:text-white dark:border-hero-line dark:bg-white/5 dark:text-slate-300'">
            <app-icon [name]="recording ? 'stop_circle' : 'mic'" />
          </button>
        </div>

        <div class="mt-2 flex items-center gap-2 text-sm font-semibold text-emergency-500" *ngIf="recording">
          <span class="h-2 w-2 rounded-full bg-emergency-500"></span> Escuchando... habla tu consulta
        </div>

        <div class="mt-3 flex flex-wrap gap-2">
          <button type="button" *ngFor="let e of examples" (click)="setExample(e)" [disabled]="loading"
            class="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:bg-white/8 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white/5 dark:text-slate-300 dark:hover:text-brand-300">
            {{ e }}
          </button>
        </div>

        <button (click)="generate()" [disabled]="loading || !prompt.trim()"
          class="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#111111] dark:bg-white dark:text-[#111111] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_2px_12px_rgba(0,0,0,0.12)] transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50">
          <app-icon [name]="loading ? 'progress_activity' : 'auto_awesome'" [size]="20" />
          {{ loading ? 'Generando...' : 'Generar reporte' }}
        </button>
      </div>

      <div *ngIf="error"
           class="flex items-center gap-2 rounded-2xl border border-emergency-200 bg-emergency-50 px-4 py-3 text-sm text-emergency-700 dark:border-emergency-500/30 dark:bg-emergency-500/10 dark:text-emergency-300">
        <app-icon name="error" /> {{ error }}
      </div>

      <!-- Result -->
      <div *ngIf="result as r" class="rounded-2xl border border-slate-200 bg-white p-5 shadow-card dark:border-hero-line dark:bg-hero-soft">
        <div class="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 class="font-display text-lg font-bold text-slate-900 dark:text-white">{{ r.title }}</h2>
            <span class="text-sm text-slate-400">{{ r.row_count }} fila(s)</span>
            <span class="text-xs font-semibold text-slate-900 dark:text-white" *ngIf="r.rows.length > previewLimit">
              · Vista previa de {{ previewLimit }}; exporta para ver todas
            </span>
          </div>
          <div class="flex flex-wrap gap-2" *ngIf="r.columns.length">
            <button (click)="exportAs('xlsx')" [disabled]="exporting"
              class="inline-flex items-center gap-1.5 rounded-lg bg-[#1e7a46] px-3 py-2 text-xs font-bold text-white transition hover:brightness-110 disabled:opacity-60">
              <app-icon name="table_view" [size]="18" /> Excel
            </button>
            <button (click)="exportAs('docx')" [disabled]="exporting"
              class="inline-flex items-center gap-1.5 rounded-lg bg-[#2b579a] px-3 py-2 text-xs font-bold text-white transition hover:brightness-110 disabled:opacity-60">
              <app-icon name="description" [size]="18" /> Word
            </button>
            <button (click)="exportAs('pdf')" [disabled]="exporting"
              class="inline-flex items-center gap-1.5 rounded-lg bg-[#c0392b] px-3 py-2 text-xs font-bold text-white transition hover:brightness-110 disabled:opacity-60">
              <app-icon name="picture_as_pdf" [size]="18" /> PDF
            </button>
          </div>
        </div>

        <details class="mb-4 group">
          <summary class="cursor-pointer text-sm font-semibold text-slate-500 transition hover:text-slate-900 dark:text-slate-400">Ver SQL generado</summary>
          <pre class="mt-2 overflow-x-auto rounded-xl bg-slate-900 p-4 font-mono text-xs text-slate-100 dark:bg-black/40">{{ r.sql }}</pre>
        </details>

        <div *ngIf="r.rows.length; else noRows"
             class="overflow-hidden rounded-xl border border-slate-200 dark:border-hero-line">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-slate-200 bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-400 dark:border-hero-line dark:bg-white/5">
                  <th *ngFor="let col of r.columns" class="whitespace-nowrap px-4 py-2.5 font-semibold">{{ col }}</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let row of previewRows" class="border-b border-slate-100 last:border-0 dark:border-hero-line/50">
                  <td *ngFor="let cell of row" class="whitespace-nowrap px-4 py-2.5 text-slate-700 dark:text-slate-200">{{ cell }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p *ngIf="r.rows.length > previewLimit"
             class="border-t border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-400 dark:border-hero-line dark:bg-white/5">
            + {{ r.rows.length - previewLimit }} fila(s) más. Usa Excel/Word/PDF para el reporte completo.
          </p>
        </div>
        <ng-template #noRows><p class="text-sm text-slate-400">La consulta no devolvió resultados.</p></ng-template>
      </div>
    </div>
  `,
})
export class ReportsAiComponent implements OnDestroy {
  prompt = '';
  loading = false;
  exporting = false;
  error = '';
  result: ReportResult | null = null;
  recording = false;

  // La vista previa solo renderiza estas filas para no congelar el DOM
  // (una consulta puede traer hasta 500 filas; el export las incluye todas).
  readonly previewLimit = 20;
  // Propiedad (no getter): se calcula UNA vez cuando llega la respuesta.
  // Un getter se reevalúa en cada ciclo de change detection → slice() repetido
  // → el DOM tarda en responder aunque la API ya devolvió 200.
  previewRows: (string | number | null)[][] = [];

  private recognition: any = null;

  examples = [
    'Incidentes por categoria de mayor a menor',
    'Talleres ordenados por servicios completados',
    'Clientes con mas de un incidente',
    'Incidentes cancelados con su motivo',
  ];

  constructor(private api: ApiService, private zone: NgZone, private cdr: ChangeDetectorRef) {}

  get voiceSupported(): boolean {
    return typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  setExample(e: string): void {
    if (this.loading) return;
    this.prompt = e;
  }

  generate(): void {
    this.loading = true;
    this.error = '';
    this.result = null;
    this.previewRows = [];
    // Sin pipe(timeout): el backend ya acota la latencia de Gemini (10s/intento
    // + fallback de modelos). El timeout del front era el que escapaba NgZone
    // mediante su scheduler interno, impidiendo que Angular detectara el cambio
    // y dejando el spinner "congelado" aunque el 200 ya habia llegado.
    this.api.generateReport(this.prompt.trim()).subscribe({
      next: (r) => {
        this.zone.run(() => {
          this.previewRows = r.rows.slice(0, this.previewLimit);
          this.result = r;
          this.loading = false;
          this.cdr.markForCheck();
        });
      },
      error: (e) => {
        this.zone.run(() => {
          this.error = e?.error?.detail || 'No se pudo generar el reporte.';
          this.loading = false;
          this.cdr.markForCheck();
        });
      },
    });
  }

  toggleVoice(): void {
    if (this.recording) { this.stopVoice(); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { this.error = 'Tu navegador no soporta dictado por voz.'; return; }
    const rec = new SR();
    rec.lang = 'es-ES';
    rec.interimResults = true;
    rec.continuous = false;
    let finalText = '';
    rec.onresult = (ev: any) => {
      let interim = '';
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const t = ev.results[i][0].transcript;
        if (ev.results[i].isFinal) finalText += t; else interim += t;
      }
      this.zone.run(() => { this.prompt = (finalText + interim).trim(); });
    };
    rec.onerror = () => this.zone.run(() => { this.recording = false; });
    rec.onend = () => this.zone.run(() => { this.recording = false; });
    this.recognition = rec;
    this.recording = true;
    rec.start();
  }

  private stopVoice(): void {
    try { this.recognition?.stop(); } catch { /* ignore */ }
    this.recording = false;
  }

  ngOnDestroy(): void { this.stopVoice(); }

  exportAs(format: 'xlsx' | 'docx' | 'pdf'): void {
    if (!this.result) return;
    this.exporting = true;
    this.api.exportReport({
      title: this.result.title,
      columns: this.result.columns,
      rows: this.result.rows,
      format,
    }).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte.${format}`;
        a.click();
        URL.revokeObjectURL(url);
        this.exporting = false;
      },
      error: () => { this.error = 'No se pudo exportar el reporte.'; this.exporting = false; },
    });
  }
}
