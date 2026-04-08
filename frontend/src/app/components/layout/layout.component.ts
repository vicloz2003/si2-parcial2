import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { WebSocketService } from '../../services/websocket.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, SidebarComponent],
  template: `
    <div class="layout" [class.sidebar-collapsed]="sidebarCollapsed">
      <app-sidebar
        [collapsed]="sidebarCollapsed"
        [pendingCount]="pendingCount"
        (collapsedChange)="sidebarCollapsed = $event"
      ></app-sidebar>

      <div class="layout-main">
        <!-- Top bar -->
        <header class="topbar">
          <div class="topbar-left">
            <div class="breadcrumb">
              <span class="material-symbols-rounded">home</span>
              <span>Panel Taller</span>
            </div>
          </div>

          <div class="topbar-right">
            <button class="topbar-btn theme-toggle" (click)="toggleTheme()" [title]="themeSvc.theme() === 'dark' ? 'Modo claro' : 'Modo oscuro'">
              <span class="material-symbols-rounded">{{ themeSvc.theme() === 'dark' ? 'light_mode' : 'dark_mode' }}</span>
            </button>

            <button class="topbar-btn" title="Notificaciones">
              <span class="material-symbols-rounded">notifications</span>
              <span class="notif-badge" *ngIf="unreadCount > 0">
                {{ unreadCount > 9 ? '9+' : unreadCount }}
              </span>
            </button>

            <div class="topbar-divider"></div>

            <a class="user-pill" routerLink="/profile" title="Mi Perfil">
              <div class="user-avatar">{{ initials }}</div>
              <div class="user-info">
                <span class="user-name">{{ userName || 'Taller' }}</span>
                <span class="user-role">Workshop</span>
              </div>
            </a>

            <button class="topbar-btn logout-btn" (click)="logout()" title="Cerrar sesion">
              <span class="material-symbols-rounded">logout</span>
            </button>
          </div>
        </header>

        <!-- Page content -->
        <main class="layout-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .layout { display: flex; min-height: 100vh; background: var(--color-bg); }

    .layout-main {
      flex: 1; margin-left: var(--sidebar-width);
      display: flex; flex-direction: column;
      transition: margin-left 0.3s var(--ease-spring);
    }
    .sidebar-collapsed .layout-main { margin-left: var(--sidebar-collapsed); }

    .topbar {
      position: sticky; top: 0; z-index: 100;
      height: var(--navbar-height);
      background: var(--color-bg);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 var(--space-xl); flex-shrink: 0;
    }

    .topbar-left { display: flex; align-items: center; gap: var(--space-md); }

    .breadcrumb {
      display: flex; align-items: center; gap: 6px;
      color: var(--color-text-tertiary); font-size: 13px; font-weight: 500;
      .material-symbols-rounded { font-size: 18px; }
    }

    .topbar-right { display: flex; align-items: center; gap: var(--space-sm); }

    .topbar-btn {
      position: relative; width: 38px; height: 38px;
      border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center;
      color: var(--color-text-secondary); transition: all 0.2s var(--ease-out);
      .material-symbols-rounded { font-size: 22px; }
      &:hover { background: var(--color-surface-alt); color: var(--color-text-primary); }
      &.logout-btn:hover { background: var(--color-danger-light); color: var(--color-danger); }
    }

    .notif-badge {
      position: absolute; top: 3px; right: 3px;
      min-width: 18px; height: 18px; padding: 0 5px;
      background: var(--color-accent); color: white;
      border-radius: var(--radius-pill);
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      border: 2px solid var(--color-surface);
      animation: notifPulse 2s infinite;
    }
    @keyframes notifPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }

    .topbar-divider { width: 1px; height: 26px; background: var(--color-divider); margin: 0 4px; }

    .user-pill {
      display: flex; align-items: center; gap: 10px;
      padding: 5px 12px 5px 5px; border-radius: var(--radius-pill);
      transition: all 0.2s var(--ease-out); cursor: pointer;
      &:hover { background: var(--color-surface-alt); }
    }

    .user-avatar {
      width: 34px; height: 34px; border-radius: 50%;
      background: var(--color-primary);
      color: white; display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 13px; flex-shrink: 0;
    }

    .user-info { display: flex; flex-direction: column; line-height: 1.2; }
    .user-name { font-size: 13px; font-weight: 600; color: var(--color-text-primary); max-width: 120px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .user-role { font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 700; color: var(--color-text-tertiary); text-transform: uppercase; letter-spacing: 0.08em; }

    .layout-content { flex: 1; padding: var(--space-xl); width: 100%; }

    @media (max-width: 768px) {
      .layout-main { margin-left: 0 !important; }
      .user-info { display: none; }
    }
  `]
})
export class LayoutComponent implements OnInit, OnDestroy {
  sidebarCollapsed = false;
  userName = '';
  initials = '';
  unreadCount = 0;
  pendingCount = 0;
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
    this.wsSub = this.ws.notifications$.subscribe(() => {
      this.api.getUnreadCount().subscribe({
        next: (res) => { this.unreadCount = res.count; this.cdr.markForCheck(); },
        error: () => {}
      });
    });
  }

  ngOnDestroy() {
    this.wsSub?.unsubscribe();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  toggleTheme() {
    this.themeSvc.toggle();
  }
}
