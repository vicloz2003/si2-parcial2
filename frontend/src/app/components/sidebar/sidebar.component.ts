import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AppIconComponent } from '../../shared/app-icon.component';

/*
 * frontend-design skill — Spotify palette
 * Logo: B&W — "R" blanca sobre #111111 / invertido en light mode
 * Nav activo: border-white/60 bg-white/10 text-white (dark) | border-slate-900/60 bg-black/6 text-slate-900 (light)
 * Sidebar dark bg: #111111 (Spotify signature, antes era #0d1117)
 * Badges de emergencia: rojo (funcional, no branding)
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, AppIconComponent],
  template: `
    <aside
      class="group fixed inset-y-0 left-0 z-[200] flex w-64 flex-col
             overflow-hidden border-r border-slate-200 bg-white
             transition-all duration-300 md:translate-x-0
             dark:border-white/8 dark:bg-[#111111]"
      [ngClass]="{
        '-translate-x-full': !mobileOpen,
        'translate-x-0':      mobileOpen,
        'is-collapsed md:w-[76px]': collapsed
      }">

      <!-- ── Brand / Logo ── -->
      <div class="flex h-16 flex-shrink-0 items-center justify-between
                  px-3.5 group-[.is-collapsed]:md:justify-center
                  group-[.is-collapsed]:md:px-0">

        <a routerLink="/dashboard"
           class="flex items-center gap-2.5 overflow-hidden
                  group-[.is-collapsed]:md:hidden">
          <!-- Logo B&W: negro sobre blanco en light, blanco sobre negro en dark -->
          <span class="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl
                       bg-[#111111] text-white text-sm font-black
                       dark:bg-white dark:text-[#111111]
                       shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
            R
          </span>
          <span class="font-display text-lg font-extrabold tracking-tight
                       text-slate-900 dark:text-white"
                *ngIf="!collapsed">RescateYa</span>
        </a>

        <!-- Logo colapsado (solo ícono) -->
        <a routerLink="/dashboard"
           class="hidden group-[.is-collapsed]:md:flex"
           title="Dashboard">
          <span class="grid h-9 w-9 place-items-center rounded-xl
                       bg-[#111111] text-white text-sm font-black
                       dark:bg-white dark:text-[#111111]">
            R
          </span>
        </a>

        <button (click)="toggle()"
                [title]="collapsed ? 'Expandir' : 'Colapsar'"
                class="hidden h-8 w-8 flex-shrink-0 items-center justify-center
                       rounded-lg text-slate-400 transition
                       hover:bg-slate-100 hover:text-slate-700
                       md:flex
                       dark:hover:bg-white/8 dark:hover:text-white">
          <app-icon [name]="collapsed ? 'menu' : 'menu_open'" />
        </button>
      </div>

      <!-- ── Navigation ── -->
      <nav class="flex flex-1 flex-col gap-1 overflow-y-auto
                  overflow-x-hidden px-2.5 py-4">

        <ng-container *ngIf="role === 'admin'; else nonAdminNav">
          <span class="px-3.5 pb-1 pt-1 font-mono text-[0.6rem] font-bold
                       uppercase tracking-[0.14em] text-slate-400
                       group-[.is-collapsed]:md:hidden"
                *ngIf="!collapsed">PRINCIPAL</span>

          <a routerLink="/dashboard" [routerLinkActiveOptions]="{exact: true}"
             [routerLinkActive]="activeClass" [class]="navCls" [title]="collapsed ? 'Resumen' : ''">
            <app-icon name="dashboard" />
            <span class="truncate group-[.is-collapsed]:md:hidden" *ngIf="!collapsed">Resumen</span>
          </a>
          <a routerLink="/incidents" [routerLinkActive]="activeClass"
             [class]="navCls" [title]="collapsed ? 'Incidentes' : ''">
            <app-icon name="warning" />
            <span class="truncate group-[.is-collapsed]:md:hidden" *ngIf="!collapsed">Incidentes</span>
            <span *ngIf="pendingCount > 0 && !collapsed" [class]="badgeCls">{{ pendingCount }}</span>
            <span *ngIf="pendingCount > 0 && collapsed"  [class]="dotCls"></span>
          </a>

          <span class="px-3.5 pb-1 pt-4 font-mono text-[0.6rem] font-bold
                       uppercase tracking-[0.14em] text-slate-400
                       group-[.is-collapsed]:md:hidden"
                *ngIf="!collapsed">ADMINISTRACION</span>

          <a routerLink="/admin/workshops" [routerLinkActive]="activeClass" [class]="navCls" [title]="collapsed ? 'Talleres' : ''">
            <app-icon name="store" /><span class="truncate group-[.is-collapsed]:md:hidden" *ngIf="!collapsed">Talleres</span>
          </a>
          <a routerLink="/admin/users" [routerLinkActive]="activeClass" [class]="navCls" [title]="collapsed ? 'Usuarios' : ''">
            <app-icon name="groups" /><span class="truncate group-[.is-collapsed]:md:hidden" *ngIf="!collapsed">Usuarios</span>
          </a>
          <a routerLink="/admin/notifications" [routerLinkActive]="activeClass" [class]="navCls" [title]="collapsed ? 'Notificaciones' : ''">
            <app-icon name="campaign" /><span class="truncate group-[.is-collapsed]:md:hidden" *ngIf="!collapsed">Notificaciones</span>
          </a>
          <a routerLink="/admin/payments" [routerLinkActive]="activeClass" [class]="navCls" [title]="collapsed ? 'Pagos' : ''">
            <app-icon name="payments" /><span class="truncate group-[.is-collapsed]:md:hidden" *ngIf="!collapsed">Pagos</span>
          </a>
          <a routerLink="/kpis" [routerLinkActive]="activeClass" [class]="navCls" [title]="collapsed ? 'KPIs' : ''">
            <app-icon name="insights" /><span class="truncate group-[.is-collapsed]:md:hidden" *ngIf="!collapsed">KPIs</span>
          </a>
          <a routerLink="/reports-ai" [routerLinkActive]="activeClass" [class]="navCls" [title]="collapsed ? 'Reportes IA' : ''">
            <app-icon name="auto_awesome" /><span class="truncate group-[.is-collapsed]:md:hidden" *ngIf="!collapsed">Reportes IA</span>
          </a>
          <a routerLink="/reports" [routerLinkActive]="activeClass" [class]="navCls" [title]="collapsed ? 'Reportes' : ''">
            <app-icon name="bar_chart" /><span class="truncate group-[.is-collapsed]:md:hidden" *ngIf="!collapsed">Reportes</span>
          </a>
        </ng-container>

        <ng-template #nonAdminNav>
          <span class="px-3.5 pb-1 pt-1 font-mono text-[0.6rem] font-bold
                       uppercase tracking-[0.14em] text-slate-400
                       group-[.is-collapsed]:md:hidden"
                *ngIf="!collapsed">PRINCIPAL</span>

          <a routerLink="/dashboard" [routerLinkActiveOptions]="{exact: true}"
             [routerLinkActive]="activeClass" [class]="navCls" [title]="collapsed ? 'Dashboard' : ''">
            <app-icon name="dashboard" /><span class="truncate group-[.is-collapsed]:md:hidden" *ngIf="!collapsed">Dashboard</span>
          </a>
          <a routerLink="/incidents" [routerLinkActive]="activeClass"
             [class]="navCls" [title]="collapsed ? 'Solicitudes' : ''">
            <app-icon name="warning" />
            <span class="truncate group-[.is-collapsed]:md:hidden" *ngIf="!collapsed">Solicitudes</span>
            <span *ngIf="pendingCount > 0 && !collapsed" [class]="badgeCls">{{ pendingCount }}</span>
            <span *ngIf="pendingCount > 0 && collapsed"  [class]="dotCls"></span>
          </a>
          <a routerLink="/invitations" [routerLinkActive]="activeClass"
             [class]="navCls" [title]="collapsed ? 'Invitaciones' : ''">
            <app-icon name="mark_email_unread" /><span class="truncate group-[.is-collapsed]:md:hidden" *ngIf="!collapsed">Invitaciones</span>
          </a>

          <span class="px-3.5 pb-1 pt-4 font-mono text-[0.6rem] font-bold
                       uppercase tracking-[0.14em] text-slate-400
                       group-[.is-collapsed]:md:hidden"
                *ngIf="!collapsed">GESTION DEL TALLER</span>

          <a *ngIf="role === 'workshop'" routerLink="/technicians"
             [routerLinkActive]="activeClass" [class]="navCls" [title]="collapsed ? 'Tecnicos' : ''">
            <app-icon name="engineering" /><span class="truncate group-[.is-collapsed]:md:hidden" *ngIf="!collapsed">Tecnicos</span>
          </a>
          <a routerLink="/history" [routerLinkActive]="activeClass" [class]="navCls" [title]="collapsed ? 'Historial' : ''">
            <app-icon name="history" /><span class="truncate group-[.is-collapsed]:md:hidden" *ngIf="!collapsed">Historial</span>
          </a>
          <a routerLink="/kpis" [routerLinkActive]="activeClass" [class]="navCls" [title]="collapsed ? 'KPIs' : ''">
            <app-icon name="insights" /><span class="truncate group-[.is-collapsed]:md:hidden" *ngIf="!collapsed">KPIs</span>
          </a>
          <a routerLink="/reports-ai" [routerLinkActive]="activeClass" [class]="navCls" [title]="collapsed ? 'Reportes IA' : ''">
            <app-icon name="auto_awesome" /><span class="truncate group-[.is-collapsed]:md:hidden" *ngIf="!collapsed">Reportes IA</span>
          </a>
          <a routerLink="/reports" [routerLinkActive]="activeClass" [class]="navCls" [title]="collapsed ? 'Reportes' : ''">
            <app-icon name="bar_chart" /><span class="truncate group-[.is-collapsed]:md:hidden" *ngIf="!collapsed">Reportes</span>
          </a>
        </ng-template>

        <span class="px-3.5 pb-1 pt-4 font-mono text-[0.6rem] font-bold
                     uppercase tracking-[0.14em] text-slate-400
                     group-[.is-collapsed]:md:hidden"
              *ngIf="!collapsed">CUENTA</span>
        <a routerLink="/profile" [routerLinkActive]="activeClass"
           [class]="navCls" [title]="collapsed ? 'Mi Perfil' : ''">
          <app-icon name="settings" /><span class="truncate group-[.is-collapsed]:md:hidden" *ngIf="!collapsed">Mi Perfil</span>
        </a>
      </nav>

      <!-- ── Footer ── -->
      <div class="flex-shrink-0 border-t border-slate-200 p-3
                  dark:border-white/8">
        <div class="flex items-center gap-2 px-2 font-mono text-[0.6rem]
                    text-slate-400 group-[.is-collapsed]:md:hidden"
             *ngIf="!collapsed">
          <app-icon name="info" [size]="14" /><span>RescateYa v2.0</span>
        </div>
      </div>
    </aside>

    <!-- Overlay móvil -->
    <div *ngIf="mobileOpen" (click)="closeMobile()"
         class="fixed inset-0 z-[199] bg-black/50 backdrop-blur-sm md:hidden">
    </div>
  `,
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Input() pendingCount = 0;
  @Input() mobileOpen = false;
  @Input() role: 'workshop' | 'admin' | null = null;
  @Output() collapsedChange = new EventEmitter<boolean>();
  @Output() mobileOpenChange = new EventEmitter<boolean>();

  /** Clases base de cada item nav */
  readonly navCls =
    'relative flex items-center gap-3 rounded-xl border-l-2 border-transparent ' +
    'px-3.5 py-2.5 text-sm font-medium text-slate-500 transition ' +
    'hover:bg-slate-100 hover:text-slate-900 ' +
    'dark:text-slate-400 dark:hover:bg-white/6 dark:hover:text-white ' +
    'group-[.is-collapsed]:md:justify-center group-[.is-collapsed]:md:px-2';

  /** Estado activo — B&W: negro en light, blanco en dark */
  readonly activeClass =
    '!border-slate-800 !bg-black/6 !text-slate-900 font-semibold ' +
    'dark:!border-white/50 dark:!bg-white/10 dark:!text-white';

  /** Badge de pendientes (emergencias) — rojo funcional */
  readonly badgeCls =
    'ml-auto inline-flex h-5 min-w-5 items-center justify-center ' +
    'rounded-full bg-emergency-500 px-1.5 font-mono text-[0.625rem] font-bold text-white';

  readonly dotCls =
    'absolute right-2 top-2 h-2 w-2 rounded-full bg-emergency-500';

  toggle() {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }

  closeMobile() {
    this.mobileOpen = false;
    this.mobileOpenChange.emit(false);
  }

  @HostListener('click', ['$event'])
  onNavClick(event: Event) {
    const target = event.target as HTMLElement;
    if (target.closest('a') && this.mobileOpen) {
      this.closeMobile();
    }
  }
}
