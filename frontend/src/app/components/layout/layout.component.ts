import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { WebSocketService } from '../../services/websocket.service';
import { ThemeService } from '../../services/theme.service';
import { Notification } from '../../models/interfaces';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, SidebarComponent],
  template: `
    <div class="flex min-h-screen bg-slate-50 dark:bg-[#0b0f14]">
      <app-sidebar
        [collapsed]="sidebarCollapsed"
        [pendingCount]="pendingCount"
        [mobileOpen]="mobileOpen"
        [role]="userRole"
        (collapsedChange)="sidebarCollapsed = $event"
        (mobileOpenChange)="mobileOpen = $event"
      ></app-sidebar>

      <div class="flex min-w-0 flex-1 flex-col transition-all duration-300"
           [ngClass]="sidebarCollapsed ? 'md:ml-[76px]' : 'md:ml-64'">
        <!-- Top bar -->
        <header class="sticky top-0 z-[100] flex h-16 flex-shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/80 px-4 backdrop-blur-md md:px-6 lg:px-8 dark:border-white/10 dark:bg-[#0b0f14]/80">
          <div class="flex items-center gap-2">
            <button class="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 md:hidden dark:text-slate-400 dark:hover:bg-white/5" (click)="mobileOpen = !mobileOpen">
              <span class="material-symbols-rounded">menu</span>
            </button>
            <div class="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">
              <span class="material-symbols-rounded text-lg">home</span>
              <span>{{ getWorkspaceLabel() }}</span>
            </div>
          </div>

          <div class="flex items-center gap-1 md:gap-2">
            <button class="grid h-9 w-9 place-items-center rounded-lg text-brand-500 transition hover:bg-brand-50 dark:hover:bg-brand-500/10" (click)="toggleAssistant()" title="Asistente IA">
              <span class="material-symbols-rounded">support_agent</span>
            </button>

            <button class="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5" (click)="toggleTheme()" [title]="themeSvc.theme() === 'dark' ? 'Modo claro' : 'Modo oscuro'">
              <span class="material-symbols-rounded">{{ themeSvc.theme() === 'dark' ? 'light_mode' : 'dark_mode' }}</span>
            </button>

            <div class="relative">
              <button class="relative grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5" title="Notificaciones" (click)="toggleNotifications()">
                <span class="material-symbols-rounded">notifications</span>
                <span class="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full border-2 border-slate-50 bg-emergency-500 px-1 font-mono text-[0.55rem] font-bold text-white dark:border-[#0b0f14]" *ngIf="unreadCount > 0">
                  {{ unreadCount > 9 ? '9+' : unreadCount }}
                </span>
              </button>

              <section class="absolute right-0 top-[calc(100%+0.625rem)] z-[250] w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#161b22]" *ngIf="notificationsOpen">
                <header class="flex items-center justify-between gap-2 border-b border-slate-200 p-4 dark:border-white/10">
                  <div class="grid">
                    <strong class="text-slate-900 dark:text-white">Notificaciones</strong>
                    <span class="text-xs text-slate-500 dark:text-slate-400">{{ unreadCount }} sin leer</span>
                  </div>
                  <button class="rounded-lg px-2.5 py-1.5 text-xs font-bold text-brand-600 disabled:text-slate-400 dark:text-brand-400" (click)="markAllNotificationsRead()" [disabled]="unreadCount === 0 || notificationsLoading">
                    Marcar leidas
                  </button>
                </header>

                <div class="max-h-96 overflow-y-auto p-1" *ngIf="!notificationsLoading; else notificationsLoadingTpl">
                  <button
                    class="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-2 rounded-xl p-2.5 text-left text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
                    *ngFor="let notification of notifications"
                    [class.bg-brand-50]="!notification.is_read"
                    [class.dark:bg-brand-500/10]="!notification.is_read"
                    (click)="openNotification(notification)"
                  >
                    <span class="mt-1.5 h-2 w-2 rounded-full" [class.bg-brand-500]="!notification.is_read"></span>
                    <span class="grid min-w-0 gap-0.5">
                      <strong class="truncate text-[0.8rem] text-slate-900 dark:text-white">{{ notification.title }}</strong>
                      <span class="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{{ notification.message }}</span>
                      <small class="text-[0.7rem] text-slate-400">{{ notification.created_at | date: 'dd/MM HH:mm' }}</small>
                    </span>
                    <span class="material-symbols-rounded text-slate-400" *ngIf="notification.incident_id">chevron_right</span>
                  </button>

                  <div class="grid place-items-center gap-1 p-8 text-center text-slate-400" *ngIf="notifications.length === 0">
                    <span class="material-symbols-rounded text-3xl">notifications_off</span>
                    <p class="text-sm">No tienes notificaciones.</p>
                  </div>
                </div>

                <ng-template #notificationsLoadingTpl>
                  <div class="grid place-items-center gap-1 p-8 text-center text-slate-400">
                    <span class="material-symbols-rounded text-3xl">hourglass_top</span>
                    <p class="text-sm">Cargando notificaciones...</p>
                  </div>
                </ng-template>
              </section>
            </div>

            <div class="mx-1 hidden h-6 w-px bg-slate-200 md:block dark:bg-white/10"></div>

            <a class="flex items-center gap-2.5 rounded-full p-1 transition hover:bg-slate-100 lg:py-1 lg:pl-1 lg:pr-3 dark:hover:bg-white/5" routerLink="/profile" title="Mi Perfil">
              <div class="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-emergency-500 text-xs font-bold text-white">{{ initials }}</div>
              <div class="hidden flex-col leading-tight lg:flex">
                <span class="max-w-32 truncate text-sm font-semibold text-slate-900 dark:text-white">{{ userName || 'Taller' }}</span>
                <span class="font-mono text-[0.6rem] font-bold uppercase tracking-wider text-slate-400">{{ getRoleLabel() }}</span>
              </div>
            </a>

            <button class="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-emergency-50 hover:text-emergency-600 dark:text-slate-400 dark:hover:bg-emergency-500/10" (click)="logout()" title="Cerrar sesion">
              <span class="material-symbols-rounded">logout</span>
            </button>
          </div>
        </header>

        <!-- Page content -->
        <main class="w-full max-w-full flex-1 overflow-x-hidden p-3 md:p-5 lg:p-7 2xl:mx-auto 2xl:max-w-[1500px]">
          <div class="mb-4 grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 rounded-2xl border border-brand-100 bg-white p-3 shadow-card dark:border-brand-500/20 dark:bg-[#161b22]" *ngIf="notificationToast">
            <div class="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
              <span class="material-symbols-rounded">notifications_active</span>
            </div>
            <div class="grid min-w-0 gap-0.5">
              <strong class="text-sm text-slate-900 dark:text-white">{{ notificationToast.title }}</strong>
              <span class="truncate text-xs text-slate-500 dark:text-slate-400">{{ notificationToast.message }}</span>
            </div>
            <button class="rounded-lg bg-gradient-to-br from-brand-400 to-emergency-500 px-3 py-2 text-xs font-bold text-white" (click)="openIncidentAlert()">
              Ver solicitudes
            </button>
            <button class="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5" (click)="notificationToast = null" title="Cerrar">
              <span class="material-symbols-rounded">close</span>
            </button>
          </div>
          <router-outlet></router-outlet>
        </main>
      </div>

      <section class="fixed bottom-4 right-4 z-[220] flex w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#161b22]" *ngIf="assistantOpen" aria-label="Asistente IA contextual">
        <div class="flex items-start justify-between gap-3 border-b border-slate-200 p-4 dark:border-white/10">
          <div>
            <span class="block text-[0.7rem] font-extrabold uppercase tracking-wide text-brand-500">Asistente IA</span>
            <h2 class="mt-0.5 font-display text-base font-extrabold text-slate-900 dark:text-white">RescateYa te guia</h2>
          </div>
          <button class="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5" (click)="assistantOpen = false" title="Cerrar asistente">
            <span class="material-symbols-rounded">close</span>
          </button>
        </div>

        <div class="grid max-h-[48vh] gap-2 overflow-y-auto p-4">
          <div class="rounded-xl border border-brand-100 bg-brand-50 p-4 text-sm leading-relaxed text-slate-700 dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-slate-200">
            {{ assistantMessage || 'Puedo ayudarte segun la pantalla actual. Preguntame que hacer ahora o pulsa el boton para recibir una guia rapida.' }}
          </div>

          <div class="flex flex-wrap gap-1.5" *ngIf="assistantActions.length > 0">
            <button *ngFor="let action of assistantActions" (click)="handleAssistantAction(action)"
              class="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10">
              {{ formatAssistantAction(action) }}
            </button>
          </div>
        </div>

        <form class="flex gap-1.5 border-t border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-[#0d1117]" (ngSubmit)="askAssistant(assistantQuestion)">
          <input
            name="assistantQuestion"
            [(ngModel)]="assistantQuestion"
            placeholder="Pregunta sobre esta pantalla"
            [disabled]="assistantLoading"
            class="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
          <button type="submit" [disabled]="assistantLoading"
            class="grid w-11 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-emergency-500 text-white disabled:opacity-60">
            <span class="material-symbols-rounded">send</span>
          </button>
        </form>
      </section>
    </div>
  `,
})
export class LayoutComponent implements OnInit, OnDestroy {
  sidebarCollapsed = false;
  mobileOpen = false;
  userName = '';
  userRole: 'workshop' | 'admin' | null = null;
  initials = '';
  unreadCount = 0;
  pendingCount = 0;
  notificationsOpen = false;
  notificationsLoading = false;
  notifications: Notification[] = [];
  notificationToast: { title: string; message: string; incidentId?: number } | null = null;
  private notificationToastTimer?: ReturnType<typeof setTimeout>;
  assistantOpen = false;
  assistantLoading = false;
  assistantQuestion = '';
  assistantMessage = '';
  assistantActions: string[] = [];
  private assistantRoutes: Record<string, string> = {
    abrir_incidente: '/incidents',
    ir_a_incidentes: '/incidents',
    ir_a_tecnicos: '/technicians',
    crear_tecnico: '/technicians',
    ir_a_historial: '/history',
    ir_a_reportes: '/reports',
    ir_a_perfil: '/profile',
    actualizar_perfil: '/profile',
    ir_a_usuarios: '/admin/users',
    ir_a_talleres: '/admin/workshops',
    ir_a_pagos: '/admin/payments',
  };
  private wsSub?: Subscription;

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private ws: WebSocketService,
    private router: Router,
    public themeSvc: ThemeService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    const user = this.auth.getCurrentUser();
    if (user) {
      this.userName = user.full_name;
      this.userRole = user.role === 'admin' ? 'admin' : 'workshop';
      const parts = user.full_name.split(' ');
      this.initials = parts.length >= 2
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : (parts[0]?.[0] || '?').toUpperCase();
    }

    this.api.getUnreadCount().subscribe({
      next: (res) => { this.unreadCount = res.count; this.cdr.markForCheck(); },
      error: () => {}
    });

    this.api.getIncidents().subscribe({
      next: (incidents) => {
        this.pendingCount = incidents.filter(i => i.status === 'pending').length;
        this.cdr.markForCheck();
      },
      error: () => {}
    });

    this.ws.connect();
    this.wsSub = this.ws.notifications$.subscribe((message) => {
      if (message.type === 'new_incident') {
        this.showNotificationToast(
          message.title || 'Nueva emergencia cercana',
          message.message || 'Un cliente solicito auxilio mecanico.',
          message.incident_id,
        );
        if (this.notificationsOpen) this.loadNotifications();
      }
      this.api.getUnreadCount().subscribe({
        next: (res) => { this.unreadCount = res.count; this.cdr.markForCheck(); },
        error: () => {}
      });
      this.api.getIncidents().subscribe({
        next: (incidents) => {
          this.pendingCount = incidents.filter(i => i.status === 'pending').length;
          this.cdr.markForCheck();
        },
        error: () => {}
      });
    });
  }

  ngOnDestroy() {
    this.wsSub?.unsubscribe();
    if (this.notificationToastTimer) clearTimeout(this.notificationToastTimer);
  }

  private showNotificationToast(title: string, message: string, incidentId?: number) {
    this.notificationToast = { title, message, incidentId };
    if (this.notificationToastTimer) clearTimeout(this.notificationToastTimer);
    this.notificationToastTimer = setTimeout(() => {
      this.notificationToast = null;
      this.cdr.markForCheck();
    }, 10000);
    this.cdr.markForCheck();
  }

  openIncidentAlert() {
    const incidentId = this.notificationToast?.incidentId;
    this.notificationToast = null;
    this.router.navigate(incidentId ? ['/incidents', incidentId] : ['/incidents']);
  }

  toggleNotifications() {
    this.notificationsOpen = !this.notificationsOpen;
    if (this.notificationsOpen) this.loadNotifications();
  }

  private loadNotifications() {
    this.notificationsLoading = true;
    this.api.getNotifications().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.notificationsLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.notifications = [];
        this.notificationsLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  openNotification(notification: Notification) {
    const navigate = () => {
      this.notificationsOpen = false;
      this.router.navigate(notification.incident_id ? ['/incidents', notification.incident_id] : ['/incidents']);
    };

    if (!notification.is_read) {
      this.api.markAsRead(notification.id).subscribe({
        next: () => {
          notification.is_read = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
          this.cdr.markForCheck();
          navigate();
        },
        error: () => navigate(),
      });
      return;
    }

    navigate();
  }

  markAllNotificationsRead() {
    this.api.markAllAsRead().subscribe({
      next: () => {
        this.unreadCount = 0;
        this.notifications = this.notifications.map(notification => ({ ...notification, is_read: true }));
        this.cdr.markForCheck();
      },
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  toggleTheme() {
    this.themeSvc.toggle();
  }

  toggleAssistant() {
    this.assistantOpen = !this.assistantOpen;
    if (this.assistantOpen && !this.assistantMessage) {
      this.askAssistant('explicar esta pantalla');
    }
  }

  askAssistant(question?: string | null) {
    const cleanQuestion = (question || '').trim();
    this.assistantLoading = true;
    this.api.askAssistant({
      platform: 'web',
      screen: this.router.url.split('?')[0],
      question: cleanQuestion || null,
      visible_state: {
        route: this.router.url,
        role: this.userRole,
        workspace: this.getWorkspaceLabel(),
        unread_notifications: this.unreadCount,
        pending_incidents: this.pendingCount,
      },
    }).subscribe({
      next: (response) => {
        this.assistantMessage = response.message;
        this.assistantActions = response.suggested_actions || [];
        this.assistantQuestion = '';
        this.assistantLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.assistantMessage = 'No pude conectar con el asistente ahora. Revisa que el backend este corriendo e intenta de nuevo.';
        this.assistantActions = [];
        this.assistantLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  handleAssistantAction(action: string) {
    const route = this.assistantRoutes[action];
    if (route) {
      this.router.navigate([route]).then(() => {
        this.askAssistant(`explica que hago en ${this.formatAssistantAction(action)}`);
      });
      return;
    }
    this.askAssistant(action);
  }

  formatAssistantAction(action: string) {
    const labels: Record<string, string> = {
      abrir_incidente: 'Abrir incidentes',
      crear_tecnico: 'Crear tecnico',
      enviar_oferta: 'Como enviar oferta',
      ir_a_historial: 'Ir a historial',
      ir_a_incidentes: 'Ir a incidentes',
      ir_a_pagos: 'Ir a pagos',
      ir_a_perfil: 'Ir a perfil',
      ir_a_reportes: 'Ir a reportes',
      ir_a_talleres: 'Ir a talleres',
      ir_a_tecnicos: 'Ir a tecnicos',
      ir_a_usuarios: 'Ir a usuarios',
    };
    return labels[action] || action.replace(/_/g, ' ');
  }

  getRoleLabel() {
    if (this.userRole === 'admin') return 'Admin';
    return 'Taller';
  }

  getWorkspaceLabel() {
    if (this.userRole === 'admin') return 'Administracion Plataforma';
    return 'Panel Taller';
  }
}
