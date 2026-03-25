import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule, MatMenuModule, MatBadgeModule, MatTooltipModule],
  template: `
    <div class="layout-container">
      <div class="sidebar" [class.collapsed]="sidebarCollapsed">
        <div class="sidebar-header">
          @if (!sidebarCollapsed) {
            <div class="brand">
              <mat-icon class="brand-icon">school</mat-icon>
              <span class="brand-name">CampusSync</span>
            </div>
          }
          @if (sidebarCollapsed) {
            <mat-icon class="brand-icon-small">school</mat-icon>
          }
          <button mat-icon-button (click)="sidebarCollapsed = !sidebarCollapsed" class="toggle-btn">
            <mat-icon>{{sidebarCollapsed ? 'chevron_right' : 'chevron_left'}}</mat-icon>
          </button>
        </div>
        @if (!sidebarCollapsed) {
          <div class="sidebar-role">
            <span class="role-badge">{{userRole === 'hod' ? 'HOD' : 'Lab Incharge'}}</span>
          </div>
        }
        <nav class="sidebar-nav">
          @if (userRole === 'hod') {
            <a class="nav-item" routerLink="/hod/dashboard" routerLinkActive="active" [matTooltip]="sidebarCollapsed ? 'Dashboard' : ''">
              <mat-icon>dashboard</mat-icon>@if (!sidebarCollapsed) {<span>Dashboard</span>}
            </a>
            <a class="nav-item" routerLink="/hod/students" routerLinkActive="active" [matTooltip]="sidebarCollapsed ? 'Students' : ''">
              <mat-icon>people</mat-icon>@if (!sidebarCollapsed) {<span>Students</span>}
            </a>
            <a class="nav-item" routerLink="/hod/faculty" routerLinkActive="active" [matTooltip]="sidebarCollapsed ? 'Faculty' : ''">
              <mat-icon>person</mat-icon>@if (!sidebarCollapsed) {<span>Faculty</span>}
            </a>
            <a class="nav-item" routerLink="/hod/subjects" routerLinkActive="active" [matTooltip]="sidebarCollapsed ? 'Subjects' : ''">
              <mat-icon>book</mat-icon>@if (!sidebarCollapsed) {<span>Subjects</span>}
            </a>
            <a class="nav-item" routerLink="/hod/feedback" routerLinkActive="active" [matTooltip]="sidebarCollapsed ? 'Feedback' : ''">
              <mat-icon>rate_review</mat-icon>@if (!sidebarCollapsed) {<span>Feedback</span>}
            </a>
            <a class="nav-item" routerLink="/hod/activity" routerLinkActive="active" [matTooltip]="sidebarCollapsed ? 'Activity' : ''">
              <mat-icon>timeline</mat-icon>@if (!sidebarCollapsed) {<span>Activity</span>}
            </a>
          }
          @if (userRole === 'labincharge') {
            <a class="nav-item" routerLink="/lab/dashboard" routerLinkActive="active" [matTooltip]="sidebarCollapsed ? 'Dashboard' : ''">
              <mat-icon>dashboard</mat-icon>@if (!sidebarCollapsed) {<span>Dashboard</span>}
            </a>
            <a class="nav-item" routerLink="/lab/bookings" routerLinkActive="active" [matTooltip]="sidebarCollapsed ? 'Bookings' : ''">
              <mat-icon>event_note</mat-icon>@if (!sidebarCollapsed) {<span>Bookings</span>}
            </a>
            <a class="nav-item" routerLink="/lab/schedule" routerLinkActive="active" [matTooltip]="sidebarCollapsed ? 'Schedule' : ''">
              <mat-icon>calendar_today</mat-icon>@if (!sidebarCollapsed) {<span>Schedule</span>}
            </a>
          }
        </nav>
        @if (!sidebarCollapsed) {
          <div class="sidebar-footer">
            <button mat-button class="logout-btn" (click)="logout()">
              <mat-icon>logout</mat-icon> Logout
            </button>
          </div>
        }
      </div>

      <div class="main-content" [class.expanded]="sidebarCollapsed">
        <div class="top-bar">
          <h2 class="greeting">Welcome, {{userName}}</h2>
          <div class="top-bar-right">
            <button mat-icon-button [matMenuTriggerFor]="notifMenu" [matBadge]="unreadCount" matBadgeColor="warn" [matBadgeHidden]="unreadCount === 0">
              <mat-icon>notifications</mat-icon>
            </button>
            <mat-menu #notifMenu="matMenu">
              <div class="notif-header" (click)="$event.stopPropagation()">
                <span>Notifications</span>
                @if (unreadCount > 0) {
                  <button mat-button (click)="markAllRead()">Mark all read</button>
                }
              </div>
              @for (n of notifications; track n._id) {
                <div mat-menu-item class="notif-item" [class.unread]="!n.isRead" (click)="markRead(n)">
                  <mat-icon>{{getNotifIcon(n.type)}}</mat-icon>
                  <div><div class="notif-title">{{n.title}}</div><div class="notif-msg">{{n.message}}</div></div>
                </div>
              }
              @if (notifications.length === 0) {
                <div class="notif-empty">No notifications</div>
              }
            </mat-menu>
            <button mat-icon-button [matMenuTriggerFor]="profileMenu">
              <mat-icon>account_circle</mat-icon>
            </button>
            <mat-menu #profileMenu="matMenu">
              <div mat-menu-item disabled><mat-icon>person</mat-icon> {{userName}}</div>
              <div mat-menu-item disabled><mat-icon>badge</mat-icon> {{userRole === 'hod' ? 'Head of Department' : 'Lab Incharge'}}</div>
              <button mat-menu-item (click)="logout()"><mat-icon>logout</mat-icon> Logout</button>
            </mat-menu>
          </div>
        </div>
        <div class="content-area">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .layout-container { display: flex; min-height: 100vh; }
    .sidebar {
      width: 260px; background: #111827; border-right: 1px solid var(--border-color);
      display: flex; flex-direction: column; transition: width 0.3s ease;
      position: fixed; top: 0; left: 0; height: 100vh; z-index: 100;
    }
    .sidebar.collapsed { width: 64px; }
    .sidebar-header { display: flex; align-items: center; justify-content: space-between; padding: 16px; border-bottom: 1px solid var(--border-color); }
    .brand { display: flex; align-items: center; gap: 10px; }
    .brand-icon { color: #00bfa5; font-size: 28px; width: 28px; height: 28px; }
    .brand-icon-small { color: #00bfa5; font-size: 28px; width: 28px; height: 28px; margin: 0 auto; }
    .brand-name { font-size: 20px; font-weight: 700; color: #e2e8f0; }
    .toggle-btn { color: #94a3b8; }
    .sidebar-role { padding: 12px 16px; }
    .role-badge { background: linear-gradient(135deg, #00bfa5, #5df2d6); color: #0f1724; padding: 4px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; }
    .sidebar-nav { flex: 1; padding: 8px; overflow-y: auto; }
    .nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; color: #94a3b8; text-decoration: none; border-radius: 10px; margin-bottom: 2px; transition: all 0.2s; cursor: pointer; }
    .nav-item:hover { background: rgba(255,255,255,0.05); color: #e2e8f0; }
    .nav-item.active { background: rgba(0,191,165,0.15); color: #00bfa5; }
    .sidebar-footer { padding: 16px; border-top: 1px solid var(--border-color); }
    .logout-btn { color: #ef4444 !important; width: 100%; justify-content: flex-start; }
    .main-content { flex: 1; margin-left: 260px; transition: margin-left 0.3s ease; min-height: 100vh; display: flex; flex-direction: column; }
    .main-content.expanded { margin-left: 64px; }
    .top-bar { display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; background: #111827; border-bottom: 1px solid var(--border-color); position: sticky; top: 0; z-index: 50; }
    .greeting { font-size: 18px; font-weight: 600; color: #e2e8f0; }
    .top-bar-right { display: flex; align-items: center; gap: 8px; }
    .top-bar-right button { color: #94a3b8; }
    .content-area { flex: 1; padding: 24px; overflow-y: auto; }
    .notif-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; font-weight: 600; border-bottom: 1px solid #2d3748; }
    .notif-item { display: flex; gap: 12px; padding: 12px 16px; }
    .notif-item.unread { background: rgba(0,191,165,0.05); }
    .notif-title { font-weight: 600; font-size: 13px; }
    .notif-msg { font-size: 12px; color: #94a3b8; }
    .notif-empty { padding: 24px; text-align: center; color: #64748b; }
  `]
})
export class LayoutComponent implements OnInit {
  sidebarCollapsed = false;
  userName = '';
  userRole = '';
  notifications: any[] = [];
  unreadCount = 0;

  constructor(private authService: AuthService, private apiService: ApiService, private router: Router) { }

  ngOnInit() {
    this.userName = this.authService.currentUser?.name || 'User';
    this.userRole = this.authService.userRole;
    this.loadNotifications();
  }

  loadNotifications() {
    this.apiService.getNotifications().subscribe({
      next: (data) => { this.notifications = data.notifications || []; this.unreadCount = data.unreadCount || 0; },
      error: () => { }
    });
  }

  markRead(notif: any) {
    this.apiService.markNotificationRead(notif._id).subscribe(() => { notif.isRead = true; this.unreadCount = Math.max(0, this.unreadCount - 1); });
  }

  markAllRead() {
    this.apiService.markAllRead().subscribe(() => { this.notifications.forEach(n => n.isRead = true); this.unreadCount = 0; });
  }

  getNotifIcon(type: string): string {
    switch (type) { case 'assignment': return 'assignment'; case 'lab_booking': return 'science'; case 'feedback': return 'rate_review'; default: return 'notifications'; }
  }

  logout() { this.authService.logout(); }
}
