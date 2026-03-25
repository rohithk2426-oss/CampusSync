import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-hod-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTableModule],
  template: `
    <div class="page-container">
      <div class="page-header"><h1 class="page-title">Dashboard</h1></div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon blue"><mat-icon>people</mat-icon></div>
          <div><div class="stat-value">{{stats.totalStudents}}</div><div class="stat-label">Total Students</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green"><mat-icon>person</mat-icon></div>
          <div><div class="stat-value">{{stats.totalFaculty}}</div><div class="stat-label">Faculty Members</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon purple"><mat-icon>book</mat-icon></div>
          <div><div class="stat-value">{{stats.totalSubjects}}</div><div class="stat-label">Subjects</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon teal"><mat-icon>class</mat-icon></div>
          <div><div class="stat-value">{{stats.totalClasses}}</div><div class="stat-label">Classes</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon yellow"><mat-icon>pending_actions</mat-icon></div>
          <div><div class="stat-value">{{stats.pendingBookings}}</div><div class="stat-label">Pending Bookings</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon red"><mat-icon>assignment</mat-icon></div>
          <div><div class="stat-value">{{stats.totalAssignments}}</div><div class="stat-label">Assignments</div></div>
        </div>
      </div>
      <div class="dashboard-grid">
        <div class="data-table-container">
          <div class="data-table-header"><span class="data-table-title">Recent Assignments</span></div>
          @if (recentAssignments.length > 0) {
            <table mat-table [dataSource]="recentAssignments" class="full-width">
              <ng-container matColumnDef="title"><th mat-header-cell *matHeaderCellDef>Title</th><td mat-cell *matCellDef="let a">{{a.title}}</td></ng-container>
              <ng-container matColumnDef="subject"><th mat-header-cell *matHeaderCellDef>Subject</th><td mat-cell *matCellDef="let a">{{a.subject?.name}}</td></ng-container>
              <ng-container matColumnDef="faculty"><th mat-header-cell *matHeaderCellDef>Faculty</th><td mat-cell *matCellDef="let a">{{a.faculty?.user?.name}}</td></ng-container>
              <ng-container matColumnDef="deadline"><th mat-header-cell *matHeaderCellDef>Deadline</th><td mat-cell *matCellDef="let a">{{a.deadline | date:'mediumDate'}}</td></ng-container>
              <tr mat-header-row *matHeaderRowDef="['title','subject','faculty','deadline']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['title','subject','faculty','deadline'];"></tr>
            </table>
          }
          @if (recentAssignments.length === 0) {
            <div class="empty-state"><mat-icon>assignment</mat-icon><p>No recent assignments</p></div>
          }
        </div>
        <div class="data-table-container">
          <div class="data-table-header"><span class="data-table-title">Recent Lab Bookings</span></div>
          @if (recentBookings.length > 0) {
            <table mat-table [dataSource]="recentBookings" class="full-width">
              <ng-container matColumnDef="cr"><th mat-header-cell *matHeaderCellDef>CR</th><td mat-cell *matCellDef="let b">{{b.cr?.user?.name}}</td></ng-container>
              <ng-container matColumnDef="subject"><th mat-header-cell *matHeaderCellDef>Subject</th><td mat-cell *matCellDef="let b">{{b.subject?.name}}</td></ng-container>
              <ng-container matColumnDef="date"><th mat-header-cell *matHeaderCellDef>Date</th><td mat-cell *matCellDef="let b">{{b.date | date:'mediumDate'}}</td></ng-container>
              <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef>Status</th><td mat-cell *matCellDef="let b"><span class="status-badge" [ngClass]="b.status">{{b.status}}</span></td></ng-container>
              <tr mat-header-row *matHeaderRowDef="['cr','subject','date','status']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['cr','subject','date','status'];"></tr>
            </table>
          }
          @if (recentBookings.length === 0) {
            <div class="empty-state"><mat-icon>event_note</mat-icon><p>No recent bookings</p></div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .full-width { width: 100%; }
    @media (max-width: 1024px) { .dashboard-grid { grid-template-columns: 1fr; } }
  `]
})
export class HodDashboardComponent implements OnInit {
  stats: any = {};
  recentAssignments: any[] = [];
  recentBookings: any[] = [];
  constructor(private api: ApiService) { }
  ngOnInit() {
    this.api.getHodDashboard().subscribe(data => this.stats = data);
    this.api.getActivity().subscribe(data => {
      this.recentAssignments = data.recentAssignments || [];
      this.recentBookings = data.recentBookings || [];
    });
  }
}
