import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-hod-subjects',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatTableModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatSnackBarModule],
  template: `
    <div class="page-container">
      <div class="page-header"><h1 class="page-title">Subjects & Assignments</h1></div>
      @if (faculty.length > 0) {
        <div class="assign-card">
          <h3>Assign Subject to Faculty</h3>
          <div class="assign-form">
            <mat-form-field appearance="outline"><mat-label>Subject</mat-label>
              <mat-select [(ngModel)]="assignForm.subjectId">
                @for (s of subjects; track s._id) { <mat-option [value]="s._id">{{s.code}} - {{s.name}}</mat-option> }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Faculty</mat-label>
              <mat-select [(ngModel)]="assignForm.facultyId">
                @for (f of faculty; track f._id) { <mat-option [value]="f._id">{{f.user?.name}} ({{f.employeeId}})</mat-option> }
              </mat-select>
            </mat-form-field>
            <button mat-raised-button color="primary" (click)="assignSubject()"><mat-icon>link</mat-icon> Assign</button>
          </div>
        </div>
      }
      <div class="data-table-container">
        <div class="data-table-header"><span class="data-table-title">All Subjects ({{subjects.length}})</span></div>
        @if (subjects.length > 0) {
          <table mat-table [dataSource]="subjects" class="full-width">
            <ng-container matColumnDef="code"><th mat-header-cell *matHeaderCellDef>Code</th><td mat-cell *matCellDef="let s">{{s.code}}</td></ng-container>
            <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef>Name</th><td mat-cell *matCellDef="let s">{{s.name}}</td></ng-container>
            <ng-container matColumnDef="category"><th mat-header-cell *matHeaderCellDef>Type</th><td mat-cell *matCellDef="let s"><span class="status-badge" [ngClass]="s.category">{{s.category}}</span></td></ng-container>
            <ng-container matColumnDef="semester"><th mat-header-cell *matHeaderCellDef>Sem</th><td mat-cell *matCellDef="let s">{{s.semester}}</td></ng-container>
            <ng-container matColumnDef="class"><th mat-header-cell *matHeaderCellDef>Class</th><td mat-cell *matCellDef="let s">{{s.classId?.name}}</td></ng-container>
            <ng-container matColumnDef="faculty"><th mat-header-cell *matHeaderCellDef>Faculty</th><td mat-cell *matCellDef="let s">{{s.faculty?.user?.name || 'Unassigned'}}</td></ng-container>
            <ng-container matColumnDef="hours"><th mat-header-cell *matHeaderCellDef>Hours</th><td mat-cell *matCellDef="let s">{{s.hoursPerSession}}</td></ng-container>
            <tr mat-header-row *matHeaderRowDef="['code','name','category','semester','class','faculty','hours']"></tr>
            <tr mat-row *matRowDef="let row; columns: ['code','name','category','semester','class','faculty','hours'];"></tr>
          </table>
        }
      </div>
    </div>
  `,
  styles: [`
    .assign-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 24px; margin-bottom: 24px; }
    .assign-card h3 { margin-bottom: 16px; color: var(--accent); }
    .assign-form { display: flex; gap: 12px; align-items: flex-start; }
    .assign-form mat-form-field { flex: 1; }
    .full-width { width: 100%; }
  `]
})
export class HodSubjectsComponent implements OnInit {
  subjects: any[] = [];
  faculty: any[] = [];
  assignForm = { subjectId: '', facultyId: '' };
  constructor(private api: ApiService, private snackBar: MatSnackBar) { }
  ngOnInit() {
    this.api.getSubjects().subscribe(data => this.subjects = data);
    this.api.getFaculty().subscribe(data => this.faculty = data);
  }
  assignSubject() {
    if (!this.assignForm.subjectId || !this.assignForm.facultyId) return;
    this.api.assignSubject(this.assignForm).subscribe({
      next: () => { this.snackBar.open('Subject assigned', 'OK', { duration: 3000 }); this.api.getSubjects().subscribe(data => this.subjects = data); },
      error: (err) => this.snackBar.open(err.error?.message || 'Error', 'OK', { duration: 3000 })
    });
  }
}
