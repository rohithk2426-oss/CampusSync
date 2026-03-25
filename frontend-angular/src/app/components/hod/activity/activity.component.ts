import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-hod-activity',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="page-container">
      <div class="page-header"><h1 class="page-title">System Activity</h1></div>
      <div class="activity-grid">
        <div class="data-table-container">
          <div class="data-table-header"><span class="data-table-title">Recent Assignments</span></div>
          <div class="activity-list">
            @for (a of assignments; track a._id) {
              <div class="activity-item">
                <div class="activity-icon blue"><mat-icon>assignment</mat-icon></div>
                <div class="activity-content">
                  <div class="activity-title">{{a.title}}</div>
                  <div class="activity-meta">{{a.subject?.name}} · by {{a.faculty?.user?.name}}</div>
                  <div class="activity-time">{{a.createdAt | date:'medium'}}</div>
                </div>
              </div>
            }
            @if (assignments.length === 0) { <div class="empty-state"><mat-icon>assignment</mat-icon><p>No activity</p></div> }
          </div>
        </div>
        <div class="data-table-container">
          <div class="data-table-header"><span class="data-table-title">Recent Lab Bookings</span></div>
          <div class="activity-list">
            @for (b of bookings; track b._id) {
              <div class="activity-item">
                <div class="activity-icon green"><mat-icon>science</mat-icon></div>
                <div class="activity-content">
                  <div class="activity-title">{{b.subject?.name}}</div>
                  <div class="activity-meta">by {{b.cr?.user?.name}} · Periods: {{b.periods?.join(', ')}}</div>
                  <div class="activity-status"><span class="status-badge" [ngClass]="b.status">{{b.status}}</span></div>
                  <div class="activity-time">{{b.createdAt | date:'medium'}}</div>
                </div>
              </div>
            }
            @if (bookings.length === 0) { <div class="empty-state"><mat-icon>event_note</mat-icon><p>No activity</p></div> }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .activity-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .activity-list { padding: 8px; }
    .activity-item { display: flex; gap: 12px; padding: 12px; border-bottom: 1px solid var(--border-color); }
    .activity-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .activity-icon.blue { background: rgba(59,130,246,0.15); color: var(--info); }
    .activity-icon.green { background: rgba(16,185,129,0.15); color: var(--success); }
    .activity-title { font-weight: 600; font-size: 14px; }
    .activity-meta { color: var(--text-secondary); font-size: 12px; margin-top: 2px; }
    .activity-time { color: var(--text-secondary); font-size: 11px; margin-top: 4px; }
    @media (max-width: 1024px) { .activity-grid { grid-template-columns: 1fr; } }
  `]
})
export class HodActivityComponent implements OnInit {
  assignments: any[] = [];
  bookings: any[] = [];
  constructor(private api: ApiService) { }
  ngOnInit() {
    this.api.getActivity().subscribe(data => {
      this.assignments = data.recentAssignments || [];
      this.bookings = data.recentBookings || [];
    });
  }
}
