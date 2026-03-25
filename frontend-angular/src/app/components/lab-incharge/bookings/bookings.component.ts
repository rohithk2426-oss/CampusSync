import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-lab-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatSnackBarModule],
  template: `
    <div class="page-container">
      <div class="page-header"><h1 class="page-title">Lab Booking Requests</h1></div>
      <div class="filters">
        <mat-form-field appearance="outline">
          <mat-label>Filter by Status</mat-label>
          <mat-select [(ngModel)]="statusFilter" (selectionChange)="loadBookings()">
            <mat-option value="">All</mat-option>
            <mat-option value="pending">Pending</mat-option>
            <mat-option value="approved">Approved</mat-option>
            <mat-option value="rejected">Rejected</mat-option>
          </mat-select>
        </mat-form-field>
        <input class="search-field" placeholder="Search..." [(ngModel)]="searchText" (input)="filterBookings()">
      </div>
      <div class="bookings-list">
        @for (b of filteredBookings; track b._id) {
          <div class="booking-card" [class]="b.status">
            <div class="booking-header">
              <div><h3>{{b.subject?.name}}</h3><span class="code">{{b.subject?.code}} · {{b.subject?.category}}</span></div>
              <span class="status-badge" [ngClass]="b.status">{{b.status}}</span>
            </div>
            <div class="booking-details">
              <div class="detail"><mat-icon>person</mat-icon> CR: {{b.cr?.user?.name}}</div>
              <div class="detail"><mat-icon>calendar_today</mat-icon> {{b.date | date:'mediumDate'}}</div>
              <div class="detail"><mat-icon>schedule</mat-icon> Periods: {{b.periods?.join(', ')}}</div>
            </div>
            @if (b.status === 'rejected' && b.rejectionReason) {
              <div class="rejection-reason"><mat-icon>info</mat-icon> {{b.rejectionReason}}</div>
            }
            @if (b.status === 'pending') {
              <div class="booking-actions">
                <button mat-raised-button color="primary" (click)="approve(b._id)"><mat-icon>check</mat-icon> Approve</button>
                <button mat-raised-button color="warn" (click)="openReject(b)"><mat-icon>close</mat-icon> Reject</button>
              </div>
            }
            @if (rejectingId === b._id) {
              <div class="reject-form">
                <mat-form-field appearance="outline" class="full-width"><mat-label>Rejection Reason</mat-label><input matInput [(ngModel)]="rejectionReason"></mat-form-field>
                <button mat-raised-button color="warn" (click)="reject(b._id)">Confirm</button>
                <button mat-button (click)="rejectingId = ''">Cancel</button>
              </div>
            }
          </div>
        }
        @if (filteredBookings.length === 0) {
          <div class="empty-state"><mat-icon>event_note</mat-icon><p>No booking requests found</p></div>
        }
      </div>
    </div>
  `,
  styles: [`
    .filters { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; }
    .bookings-list { display: grid; gap: 16px; }
    .booking-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; transition: all 0.3s; }
    .booking-card:hover { border-color: var(--accent); }
    .booking-card.pending { border-left: 4px solid var(--warning); }
    .booking-card.approved { border-left: 4px solid var(--success); }
    .booking-card.rejected { border-left: 4px solid var(--danger); }
    .booking-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
    .booking-header h3 { font-size: 16px; margin: 0; }
    .code { color: var(--text-secondary); font-size: 12px; }
    .booking-details { display: flex; gap: 24px; margin-bottom: 12px; }
    .detail { display: flex; align-items: center; gap: 4px; color: var(--text-secondary); font-size: 13px; }
    .detail mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .booking-actions { display: flex; gap: 8px; }
    .rejection-reason { display: flex; align-items: center; gap: 8px; color: var(--danger); font-size: 13px; padding: 8px; background: rgba(239,68,68,0.1); border-radius: 8px; margin-bottom: 8px; }
    .reject-form { display: flex; gap: 8px; align-items: center; margin-top: 12px; }
    .full-width { width: 100%; }
  `]
})
export class LabBookingsComponent implements OnInit {
  bookings: any[] = [];
  filteredBookings: any[] = [];
  statusFilter = '';
  searchText = '';
  rejectingId = '';
  rejectionReason = '';
  constructor(private api: ApiService, private snackBar: MatSnackBar) { }
  ngOnInit() { this.loadBookings(); }
  loadBookings() {
    const params: any = {};
    if (this.statusFilter) params.status = this.statusFilter;
    this.api.getBookings(params).subscribe(data => { this.bookings = data; this.filterBookings(); });
  }
  filterBookings() {
    this.filteredBookings = this.bookings.filter(b =>
      b.subject?.name?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      b.cr?.user?.name?.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }
  approve(id: string) { this.api.approveBooking(id).subscribe({ next: () => { this.snackBar.open('Approved', 'OK', { duration: 3000 }); this.loadBookings(); } }); }
  openReject(b: any) { this.rejectingId = b._id; this.rejectionReason = ''; }
  reject(id: string) { this.api.rejectBooking(id, this.rejectionReason).subscribe({ next: () => { this.snackBar.open('Rejected', 'OK', { duration: 3000 }); this.rejectingId = ''; this.loadBookings(); } }); }
}
