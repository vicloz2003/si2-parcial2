import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside
      class="group fixed inset-y-0 left-0 z-[200] flex w-64 flex-col overflow-hidden border-r border-slate-200 bg-white transition-all duration-300 md:translate-x-0 dark:border-white/10 dark:bg-[#0d1117]"
      [ngClass]="{
        '-translate-x-full': !mobileOpen,
        'translate-x-0': mobileOpen,
        'is-collapsed md:w-[76px]': collapsed
      }">

      <!-- Brand -->
      <div class="flex h-16 flex-shrink-0 items-center justify-between px-3.5 group-[.is-collapsed]:md:justify-center group-[.is-collapsed]:md:px-0">
        <a routerLink="/dashboard" class="flex items-center gap-2.5 overflow-hidden group-[.is-collapsed]:md:hidden">
          <span class="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-emergency-500 shadow-brand">
            <img src="logo.svg" alt="RescateYa" class="h-6 w-6 object-contain">
          </span>
          <span class="font-display text-lg font-extrabold tracking-tight text-slate-900 dark:text-white" *ngIf="!collapsed">RescateYa</span>
        </a>
        <button (click)="toggle()" [title]="collapsed ? 'Expandir' : 'Colapsar'"
          class="hidden h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 md:flex dark:hover:bg-white/5 dark:hover:text-white">
          <span class="material-symbols-rounded text-xl">{{ collapsed ? 'menu' : 'menu_open' }}</span>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden px-2.5 py-4">
        <ng-container *ngIf="role === 'admin'; else nonAdminNav">
          <span class="px-3.5 pb-1 pt-1 font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em] text-slate-400 group-[.is-collapsed]:md:hidden" *ngIf="!collapsed">PRINCIPAL</span>
          <a routerLink="/dashboard" routerLinkActive="!border-brand-500 !bg-brand-500/10 !text-brand-600 font-semibold dark:!text-brand-300 dark:!bg-brand-500/15" [routerLinkActiveOptions]="{exact: true}" [class]="navCls" [title]="collapsed ? 'Resumen' : ''">
            <span class="material-symbols-rounded text-[1.3rem]">dashboard</span>
            <span class="truncate group-[.is-collapsed]:md:hidden" *ngIf="!collapsed">Resumen</span>
          </a>
          <a routerLink="/incidents" routerLinkActive="!border-brand-500 !bg-brand-500/10 !text-brand-600 font-semibold dark:!text-brand-300 dark:!bg-brand-500/15" [class]="navCls" [title]="collapsed ? 'Incidentes' : ''">
            <span class="material-symbols-rounded text-[1.3rem]">warning</span>
            <span class="truncate group-[.is-collapsed]:md:hidden" *ngIf="!collapsed">Incidentes</span>
            <span *ngIf="pendingCount > 0 && !collapsed" [class]="badgeCls">{{ pendingCount }}</span>
            <span *ngIf="pendingCount > 0 && collapsed" [class]="dotCls"></span>
          </a>

          <span class="px-3.5 pb-1 pt-4 font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em] text-slate-400 group-[.is-collapsed]:md:hidden" *ngIf="!collapsed">ADMINISTRACION</span>
          <a routerLink="/admin/workshops" routerLinkActive="!border-brand-500 !bg-brand-500/10 !text-brand-600 font-semibold dark:!text-brand-300 dark:!bg-brand-500/15" [class]="navCls" [title]="collapsed ? 'Talleres' : ''">
            <span class="material-symbols-rounded text-[1.3rem]">store</span><span class="truncate group-[.is-collapsed]:md:hidden" *ngIf="!collapsed">Talleres</span>
          </a>
          <a routerLink="/admin/users" routerLinkActive="!border-brand-500 !bg-brand-500/10 !text-brand-600 font-semibold dark:!text-brand-300 dark:!bg-brand-500/15" [class]="navCls" [title]="collapsed ? 'Usuarios' : ''">
            <span class="material-symbols-rounded text-[1.3rem]">groups</span><span class="truncate group-[.is-collapsed]:md:hidden" *ngIf="!collapsed">Usuarios</span>
          </a>
          <a routerLink="/admin/notifications" routerLinkActive="!border-brand-500 !bg-brand-500/10 !text-brand-600 font-semibold dark:!text-brand-300 dark:!bg-brand-500/15" [class]="navCls" [title]="collapsed ? 'Notificaciones' : ''">
            <span class="material-symbols-rounded text-[1.3rem]">campaign</span><span class="truncate group-[.is-collapsed]:md:hidden" *ngIf="!collapsed">Notificaciones</span>
          </a>
          <a routerLink="/admin/payments" routerLinkActive="!border-brand-500 !bg-brand-500/10 !text-brand-600 font-semibold dark:!text-brand-300 dark:!bg-brand-500/15" [class]="navCls" [title]="collapsed ? 'Pagos' : ''">
            <span class="material-symbols-rounded text-[1.3rem]">payments</span><span class="truncate group-[.is-collapsed]:md:hidden" *ngIf="!collapsed">Pagos</span>
          </a>
          <a routerLink="/kpis" routerLinkActive="!border-brand-500 !bg-brand-500/10 !text-brand-600 font-semibold dark:!text-brand-300 dark:!bg-brand-500/15" [class]="navCls" [title]="collapsed ? 'KPIs' : ''">
            <span class="material-symbols-rounded text-[1.3rem]">insights</span><span class="truncate group-[.is-collapsed]:md:hidden" *ngIf="!collapsed">KPIs</span>
          </a>
          <a routerLink="/reports-ai" routerLinkActive="!border-brand-500 !bg-brand-500/10 !text-brand-600 font-semibold dark:!text-brand-300 dark:!bg-brand-500/15" [class]="navCls" [title]="collapsed ? 'Reportes IA' : ''">
            <span class="material-symbols-rounded text-[1.3rem]">auto_awesome</span><span class="truncate group-[.is-collapsed]:md:hidden" *ngIf="!collapsed">Reportes IA</span>
          </a>
          <a routerLink="/reports" routerLinkActive="!border-brand-500 !bg-brand-500/10 !text-brand-600 font-semibold dark:!text-brand-300 dark:!bg-brand-500/15" [class]="navCls" [title]="collapsed ? 'Reportes' : ''">
            <span class="material-symbols-rounded text-[1.3rem]">bar_chart</span><span class="truncate group-[.is-collapsed]:md:hidden" *ngIf="!collapsed">Reportes</span>
          </a>
        </ng-container>

        <ng-template #nonAdminNav>
          <span class="px-3.5 pb-1 pt-1 font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em] text-slate-400 group-[.is-collapsed]:md:hidden" *ngIf="!collapsed">PRINCIPAL</span>
          <a routerLink="/dashboard" routerLinkActive="!border-brand-500 !bg-brand-500/10 !text-brand-600 font-semibold dark:!text-brand-300 dark:!bg-brand-500/15" [routerLinkActiveOptions]="{exact: true}" [class]="navCls" [title]="collapsed ? 'Dashboard' : ''">
            <span class="material-symbols-rounded text-[1.3rem]">dashboard</span><span class="truncate group-[.is-collapsed]:md:hidden" *ngIf="!collapsed">Dashboard</span>
          </a>
          <a routerLink="/incidents" routerLinkActive="!border-brand-500 !bg-brand-500/10 !text-brand-600 font-semibold dark:!text-brand-300 dark:!bg-brand-500/15" [class]="navCls" [title]="collapsed ? 'Solicitudes' : ''">
            <span class="material-symbols-rounded text-[1.3rem]">warning</span>
            <span class="truncate group-[.is-collapsed]:md:hidden" *ngIf="!collapsed">Solicitudes</span>
            <span *ngIf="pendingCount > 0 && !collapsed" [class]="badgeCls">{{ pendingCount }}</span>
            <span *ngIf="pendingCount > 0 && collapsed" [class]="dotCls"></span>
          </a>
          <a routerLink="/invitations" routerLinkActive="!border-brand-500 !bg-brand-500/10 !text-brand-600 font-semibold dark:!text-brand-300 dark:!bg-brand-500/15" [class]="navCls" [title]="collapsed ? 'Invitaciones' : ''">
            <span class="material-symbols-rounded text-[1.3rem]">mark_email_unread</span><span class="truncate group-[.is-collapsed]:md:hidden" *ngIf="!collapsed">Invitaciones</span>
          </a>

          <span class="px-3.5 pb-1 pt-4 font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em] text-slate-400 group-[.is-collapsed]:md:hidden" *ngIf="!collapsed">GESTION DEL TALLER</span>
          <a *ngIf="role === 'workshop'" routerLink="/technicians" routerLinkActive="!border-brand-500 !bg-brand-500/10 !text-brand-600 font-semibold dark:!text-brand-300 dark:!bg-brand-500/15" [class]="navCls" [title]="collapsed ? 'Tecnicos' : ''">
            <span class="material-symbols-rounded text-[1.3rem]">engineering</span><span class="truncate group-[.is-collapsed]:md:hidden" *ngIf="!collapsed">Tecnicos</span>
          </a>
          <a routerLink="/history" routerLinkActive="!border-brand-500 !bg-brand-500/10 !text-brand-600 font-semibold dark:!text-brand-300 dark:!bg-brand-500/15" [class]="navCls" [title]="collapsed ? 'Historial' : ''">
            <span class="material-symbols-rounded text-[1.3rem]">history</span><span class="truncate group-[.is-collapsed]:md:hidden" *ngIf="!collapsed">Historial</span>
          </a>
          <a routerLink="/kpis" routerLinkActive="!border-brand-500 !bg-brand-500/10 !text-brand-600 font-semibold dark:!text-brand-300 dark:!bg-brand-500/15" [class]="navCls" [title]="collapsed ? 'KPIs' : ''">
            <span class="material-symbols-rounded text-[1.3rem]">insights</span><span class="truncate group-[.is-collapsed]:md:hidden" *ngIf="!collapsed">KPIs</span>
          </a>
          <a routerLink="/reports-ai" routerLinkActive="!border-brand-500 !bg-brand-500/10 !text-brand-600 font-semibold dark:!text-brand-300 dark:!bg-brand-500/15" [class]="navCls" [title]="collapsed ? 'Reportes IA' : ''">
            <span class="material-symbols-rounded text-[1.3rem]">auto_awesome</span><span class="truncate group-[.is-collapsed]:md:hidden" *ngIf="!collapsed">Reportes IA</span>
          </a>
          <a routerLink="/reports" routerLinkActive="!border-brand-500 !bg-brand-500/10 !text-brand-600 font-semibold dark:!text-brand-300 dark:!bg-brand-500/15" [class]="navCls" [title]="collapsed ? 'Reportes' : ''">
            <span class="material-symbols-rounded text-[1.3rem]">bar_chart</span><span class="truncate group-[.is-collapsed]:md:hidden" *ngIf="!collapsed">Reportes</span>
          </a>
        </ng-template>

        <span class="px-3.5 pb-1 pt-4 font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em] text-slate-400 group-[.is-collapsed]:md:hidden" *ngIf="!collapsed">CUENTA</span>
        <a routerLink="/profile" routerLinkActive="!border-brand-500 !bg-brand-500/10 !text-brand-600 font-semibold dark:!text-brand-300 dark:!bg-brand-500/15" [class]="navCls" [title]="collapsed ? 'Mi Perfil' : ''">
          <span class="material-symbols-rounded text-[1.3rem]">settings</span><span class="truncate group-[.is-collapsed]:md:hidden" *ngIf="!collapsed">Mi Perfil</span>
        </a>
      </nav>

      <!-- Footer -->
      <div class="flex-shrink-0 border-t border-slate-200 p-3 dark:border-white/10">
        <div class="flex items-center gap-2 px-2 font-mono text-[0.6rem] text-slate-400 group-[.is-collapsed]:md:hidden" *ngIf="!collapsed">
          <span class="material-symbols-rounded text-sm">info</span><span>RescateYa v2.0</span>
        </div>
      </div>
    </aside>

    <div *ngIf="mobileOpen" (click)="closeMobile()" class="fixed inset-0 z-[199] bg-black/50 backdrop-blur-sm md:hidden"></div>
  `,
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Input() pendingCount = 0;
  @Input() mobileOpen = false;
  @Input() role: 'workshop' | 'admin' | null = null;
  @Output() collapsedChange = new EventEmitter<boolean>();
  @Output() mobileOpenChange = new EventEmitter<boolean>();

  readonly navCls =
    'relative flex items-center gap-3 rounded-xl border-l-2 border-transparent px-3.5 py-2.5 text-sm font-medium text-slate-500 transition ' +
    'hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white ' +
    'group-[.is-collapsed]:md:justify-center group-[.is-collapsed]:md:px-2';
  readonly badgeCls =
    'ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-emergency-500 px-1.5 font-mono text-[0.625rem] font-bold text-white';
  readonly dotCls = 'absolute right-2 top-2 h-2 w-2 rounded-full bg-emergency-500';

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
