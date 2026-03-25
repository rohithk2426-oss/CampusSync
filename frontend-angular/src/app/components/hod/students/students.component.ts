import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-hod-students',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatTableModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCheckboxModule, MatSnackBarModule, MatTooltipModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Manage Students</h1>
        <button mat-raised-button color="primary" (click)="showForm = !showForm">
          <mat-icon>{{showForm ? 'close' : 'add'}}</mat-icon> {{showForm ? 'Cancel' : 'Add Student'}}
        </button>
      </div>
      @if (showForm) {
        <div class="form-card">
          <h3>{{editId ? 'Edit' : 'Add New'}} Student</h3>
          <div class="form-grid">
            <mat-form-field appearance="outline"><mat-label>Name</mat-label><input matInput [(ngModel)]="form.name"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Email</mat-label><input matInput [(ngModel)]="form.email" type="email"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Roll Number</mat-label><input matInput [(ngModel)]="form.rollNumber"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Class</mat-label>
              <mat-select [(ngModel)]="form.classId">
                @for (c of classes; track c._id) { <mat-option [value]="c._id">{{c.name}} (Year {{c.year}})</mat-option> }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Semester</mat-label>
              <mat-select [(ngModel)]="form.semester">
                @for (s of [1,2,3,4,5,6,7,8]; track s) { <mat-option [value]="s">Semester {{s}}</mat-option> }
              </mat-select>
            </mat-form-field>
            <div class="form-check"><mat-checkbox [(ngModel)]="form.isCR">Class Representative (CR)</mat-checkbox></div>
          </div>
          <button mat-raised-button color="primary" (click)="saveStudent()"><mat-icon>save</mat-icon> {{editId ? 'Update' : 'Create'}}</button>
        </div>
      }
      <div class="data-table-container">
        <div class="data-table-header">
          <span class="data-table-title">Students ({{students.length}})</span>
          <input class="search-field" placeholder="Search students..." [(ngModel)]="searchText" (input)="filterStudents()">
        </div>
        @if (filteredStudents.length > 0) {
          <table mat-table [dataSource]="filteredStudents" class="full-width">
            <ng-container matColumnDef="rollNumber"><th mat-header-cell *matHeaderCellDef>Roll No</th><td mat-cell *matCellDef="let s">{{s.rollNumber}}</td></ng-container>
            <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef>Name</th><td mat-cell *matCellDef="let s">{{s.user?.name}}</td></ng-container>
            <ng-container matColumnDef="email"><th mat-header-cell *matHeaderCellDef>Email</th><td mat-cell *matCellDef="let s">{{s.user?.email}}</td></ng-container>
            <ng-container matColumnDef="class"><th mat-header-cell *matHeaderCellDef>Class</th><td mat-cell *matCellDef="let s">{{s.classId?.name}}</td></ng-container>
            <ng-container matColumnDef="semester"><th mat-header-cell *matHeaderCellDef>Sem</th><td mat-cell *matCellDef="let s">{{s.semester}}</td></ng-container>
            <ng-container matColumnDef="cr"><th mat-header-cell *matHeaderCellDef>CR</th><td mat-cell *matCellDef="let s">@if (s.isCR) {<mat-icon style="color:#00bfa5">verified</mat-icon>}</td></ng-container>
            <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef>Actions</th><td mat-cell *matCellDef="let s">
              <button mat-icon-button matTooltip="Edit" (click)="editStudent(s)"><mat-icon>edit</mat-icon></button>
              <button mat-icon-button matTooltip="Delete" (click)="deleteStudent(s._id)" color="warn"><mat-icon>delete</mat-icon></button>
            </td></ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        }
        @if (filteredStudents.length === 0) {
          <div class="empty-state"><mat-icon>people</mat-icon><p>No students found</p></div>
        }
      </div>
    </div>
  `,
  styles: [`
    .form-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 24px; margin-bottom: 24px; }
    .form-card h3 { margin-bottom: 16px; color: var(--accent); }
    .form-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
    .form-check { display: flex; align-items: center; }
    .full-width { width: 100%; }
    @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } }
  `]
})
export class HodStudentsComponent implements OnInit {
  students: any[] = [];
  filteredStudents: any[] = [];
  classes: any[] = [];
  searchText = '';
  showForm = false;
  editId = '';
  form: any = { name: '', email: '', rollNumber: '', classId: '', semester: 1, isCR: false };
  displayedColumns = ['rollNumber', 'name', 'email', 'class', 'semester', 'cr', 'actions'];
  constructor(private api: ApiService, private snackBar: MatSnackBar) { }
  ngOnInit() { this.loadStudents(); this.api.getClasses().subscribe(data => this.classes = data); }
  loadStudents() { this.api.getStudents().subscribe(data => { this.students = data; this.filterStudents(); }); }
  filterStudents() {
    this.filteredStudents = this.students.filter(s =>
      s.user?.name?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      s.rollNumber?.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }
  saveStudent() {
    const obs = this.editId ? this.api.updateStudent(this.editId, this.form) : this.api.createStudent(this.form);
    obs.subscribe({
      next: () => { this.snackBar.open(this.editId ? 'Updated' : 'Created', 'OK', { duration: 3000 }); this.resetForm(); this.loadStudents(); },
      error: (err) => this.snackBar.open(err.error?.message || 'Error', 'OK', { duration: 3000 })
    });
  }
  editStudent(s: any) {
    this.editId = s._id;
    this.form = { name: s.user?.name, email: s.user?.email, rollNumber: s.rollNumber, classId: s.classId?._id, semester: s.semester, isCR: s.isCR };
    this.showForm = true;
  }
  deleteStudent(id: string) {
    if (confirm('Delete this student?')) { this.api.deleteStudent(id).subscribe({ next: () => { this.snackBar.open('Deleted', 'OK', { duration: 3000 }); this.loadStudents(); } }); }
  }
  resetForm() { this.editId = ''; this.form = { name: '', email: '', rollNumber: '', classId: '', semester: 1, isCR: false }; this.showForm = false; }
}
