import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-hod-faculty',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatTableModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatChipsModule, MatSnackBarModule, MatTooltipModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Manage Faculty</h1>
        <button mat-raised-button color="primary" (click)="showForm = !showForm">
          <mat-icon>{{showForm ? 'close' : 'add'}}</mat-icon> {{showForm ? 'Cancel' : 'Add Faculty'}}
        </button>
      </div>
      @if (showForm) {
        <div class="form-card">
          <h3>{{editId ? 'Edit' : 'Add New'}} Faculty</h3>
          <div class="form-grid">
            <mat-form-field appearance="outline"><mat-label>Name</mat-label><input matInput [(ngModel)]="form.name"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Email</mat-label><input matInput [(ngModel)]="form.email" type="email"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Employee ID</mat-label><input matInput [(ngModel)]="form.employeeId"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Designation</mat-label>
              <mat-select [(ngModel)]="form.designation">
                <mat-option value="Professor">Professor</mat-option>
                <mat-option value="Associate Professor">Associate Professor</mat-option>
                <mat-option value="Assistant Professor">Assistant Professor</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <button mat-raised-button color="primary" (click)="saveFaculty()"><mat-icon>save</mat-icon> {{editId ? 'Update' : 'Create'}}</button>
        </div>
      }
      <div class="data-table-container">
        <div class="data-table-header"><span class="data-table-title">Faculty ({{faculty.length}})</span></div>
        @if (faculty.length > 0) {
          <table mat-table [dataSource]="faculty" class="full-width">
            <ng-container matColumnDef="employeeId"><th mat-header-cell *matHeaderCellDef>ID</th><td mat-cell *matCellDef="let f">{{f.employeeId}}</td></ng-container>
            <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef>Name</th><td mat-cell *matCellDef="let f">{{f.user?.name}}</td></ng-container>
            <ng-container matColumnDef="email"><th mat-header-cell *matHeaderCellDef>Email</th><td mat-cell *matCellDef="let f">{{f.user?.email}}</td></ng-container>
            <ng-container matColumnDef="designation"><th mat-header-cell *matHeaderCellDef>Designation</th><td mat-cell *matCellDef="let f">{{f.designation}}</td></ng-container>
            <ng-container matColumnDef="subjects"><th mat-header-cell *matHeaderCellDef>Subjects</th><td mat-cell *matCellDef="let f">
              <mat-chip-set>@for (s of f.subjects; track s._id) {<mat-chip>{{s.code}}</mat-chip>}</mat-chip-set>
            </td></ng-container>
            <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef>Actions</th><td mat-cell *matCellDef="let f">
              <button mat-icon-button matTooltip="Edit" (click)="editFaculty(f)"><mat-icon>edit</mat-icon></button>
              <button mat-icon-button matTooltip="Delete" (click)="deleteFaculty(f._id)" color="warn"><mat-icon>delete</mat-icon></button>
            </td></ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        }
        @if (faculty.length === 0) {
          <div class="empty-state"><mat-icon>person</mat-icon><p>No faculty found</p></div>
        }
      </div>
    </div>
  `,
  styles: [`
    .form-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 24px; margin-bottom: 24px; }
    .form-card h3 { margin-bottom: 16px; color: var(--accent); }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px; }
    .full-width { width: 100%; }
  `]
})
export class HodFacultyComponent implements OnInit {
  faculty: any[] = [];
  showForm = false;
  editId = '';
  form: any = { name: '', email: '', employeeId: '', designation: 'Assistant Professor' };
  displayedColumns = ['employeeId', 'name', 'email', 'designation', 'subjects', 'actions'];
  constructor(private api: ApiService, private snackBar: MatSnackBar) { }
  ngOnInit() { this.loadFaculty(); }
  loadFaculty() { this.api.getFaculty().subscribe(data => this.faculty = data); }
  saveFaculty() {
    const obs = this.editId ? this.api.updateFaculty(this.editId, this.form) : this.api.createFaculty(this.form);
    obs.subscribe({
      next: () => { this.snackBar.open(this.editId ? 'Updated' : 'Created', 'OK', { duration: 3000 }); this.resetForm(); this.loadFaculty(); },
      error: (err) => this.snackBar.open(err.error?.message || 'Error', 'OK', { duration: 3000 })
    });
  }
  editFaculty(f: any) { this.editId = f._id; this.form = { name: f.user?.name, email: f.user?.email, employeeId: f.employeeId, designation: f.designation }; this.showForm = true; }
  deleteFaculty(id: string) { if (confirm('Delete?')) { this.api.deleteFaculty(id).subscribe({ next: () => { this.snackBar.open('Deleted', 'OK', { duration: 3000 }); this.loadFaculty(); } }); } }
  resetForm() { this.editId = ''; this.form = { name: '', email: '', employeeId: '', designation: 'Assistant Professor' }; this.showForm = false; }
}
