import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-lab-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="page-container">
      <div class="page-header"><h1 class="page-title">Lab Dashboard</h1></div>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-icon yellow"><mat-icon>pending_actions</mat-icon></div><div><div class="stat-value">{{stats.pending}}</div><div class="stat-label">Pending</div></div></div>
        <div class="stat-card"><div class="stat-icon green"><mat-icon>check_circle</mat-icon></div><div><div class="stat-value">{{stats.approved}}</div><div class="stat-label">Approved</div></div></div>
        <div class="stat-card"><div class="stat-icon red"><mat-icon>cancel</mat-icon></div><div><div class="stat-value">{{stats.rejected}}</div><div class="stat-label">Rejected</div></div></div>
        <div class="stat-card"><div class="stat-icon blue"><mat-icon>event</mat-icon></div><div><div class="stat-value">{{stats.total}}</div><div class="stat-label">Total</div></div></div>
      </div>
      <div class="data-table-container">
        <div class="data-table-header"><span class="data-table-title">Recent Requests</span></div>
        <div class="booking-list">
          @for (b of recentBookings; track b._id) {
            <div class="booking-item">
              <div class="booking-main">
                <div class="booking-icon"><mat-icon>science</mat-icon></div>
                <div>
                  <div class="booking-title">{{b.subject?.name}} ({{b.subject?.code}})</div>
                  <div class="booking-meta">CR: {{b.cr?.user?.name}} · Periods: {{b.periods?.join(', ')}}</div>
                  <div class="booking-date">{{b.date | date:'mediumDate'}}</div>
                </div>
              </div>
              <span class="status-badge" [ngClass]="b.status">{{b.status}}</span>
            </div>
          }
          @if (recentBookings.length === 0) { <div class="empty-state"><mat-icon>event_note</mat-icon><p>No requests</p></div> }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .booking-list { padding: 8px; }
    .booking-item { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border-bottom: 1px solid var(--border-color); }
    .booking-main { display: flex; gap: 12px; align-items: center; }
    .booking-icon { width: 40px; height: 40px; border-radius: 10px; background: rgba(0,191,165,0.15); color: var(--accent); display: flex; align-items: center; justify-content: center; }
    .booking-title { font-weight: 600; }
    .booking-meta { color: var(--text-secondary); font-size: 13px; }
    .booking-date { color: var(--text-secondary); font-size: 12px; }
  `]
})
export class LabDashboardComponent implements OnInit {
  stats: any = {};
  recentBookings: any[] = [];
  constructor(private api: ApiService) { }
  ngOnInit() {
    this.api.getLabDashboard().subscribe(data => { this.stats = data; this.recentBookings = data.recentBookings || []; });
  }
}
