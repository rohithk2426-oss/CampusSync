import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-lab-schedule',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="page-container">
      <div class="page-header"><h1 class="page-title">Lab Schedule</h1></div>
      @if (schedule.length > 0) {
        <div class="schedule-grid">
          @for (s of schedule; track s._id) {
            <div class="schedule-card">
              <div class="schedule-date"><mat-icon>calendar_today</mat-icon> {{s.date | date:'EEE, MMM d'}}</div>
              <div class="schedule-subject"><h3>{{s.subject?.name}}</h3><span>{{s.subject?.code}}</span></div>
              <div class="schedule-periods">
                @for (p of s.periods; track p) { <span class="period">P{{p}}</span> }
              </div>
              <div class="schedule-cr"><mat-icon>person</mat-icon> {{s.cr?.user?.name}}</div>
            </div>
          }
        </div>
      }
      @if (schedule.length === 0) {
        <div class="empty-state"><mat-icon>calendar_today</mat-icon><p>No approved bookings this week</p></div>
      }
    </div>
  `,
  styles: [`
    .schedule-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
    .schedule-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; border-left: 4px solid var(--accent); }
    .schedule-date { display: flex; align-items: center; gap: 8px; color: var(--accent); font-weight: 600; margin-bottom: 12px; }
    .schedule-subject h3 { margin: 0; font-size: 16px; }
    .schedule-subject span { color: var(--text-secondary); font-size: 12px; }
    .schedule-periods { display: flex; gap: 6px; margin: 12px 0; }
    .period { background: rgba(0,191,165,0.15); color: var(--accent); padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; }
    .schedule-cr { display: flex; align-items: center; gap: 4px; color: var(--text-secondary); font-size: 13px; }
    .schedule-cr mat-icon { font-size: 16px; width: 16px; height: 16px; }
  `]
})
export class LabScheduleComponent implements OnInit {
  schedule: any[] = [];
  constructor(private api: ApiService) { }
  ngOnInit() { this.api.getSchedule().subscribe(data => this.schedule = data); }
}
