import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="login-container">
      <div class="login-bg">
        <div class="bg-circle c1"></div>
        <div class="bg-circle c2"></div>
        <div class="bg-circle c3"></div>
      </div>
      <div class="login-card">
        <div class="login-header">
          <div class="logo">
            <mat-icon class="logo-icon">school</mat-icon>
          </div>
          <h1>CampusSync</h1>
          <p>CSE Department Admin Portal</p>
        </div>
        <form (ngSubmit)="onLogin()" class="login-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email</mat-label>
            <input matInput type="email" [(ngModel)]="email" name="email" required>
            <mat-icon matSuffix>email</mat-icon>
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Password</mat-label>
            <input matInput [type]="showPassword ? 'text' : 'password'" [(ngModel)]="password" name="password" required>
            <mat-icon matSuffix (click)="showPassword = !showPassword" style="cursor:pointer">
              {{showPassword ? 'visibility_off' : 'visibility'}}
            </mat-icon>
          </mat-form-field>
          @if (error) {
            <div class="error-msg">{{error}}</div>
          }
          <button mat-raised-button color="primary" type="submit" class="login-btn" [disabled]="loading">
            @if (loading) { <mat-spinner diameter="20"></mat-spinner> }
            @if (!loading) { <span>Sign In</span> }
          </button>
        </form>
        <div class="login-footer">
          <p>HOD & Lab Incharge Portal</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      height: 100vh; display: flex; align-items: center; justify-content: center;
      position: relative; overflow: hidden;
      background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
    }
    .login-bg { position: absolute; inset: 0; z-index: 0; }
    .bg-circle { position: absolute; border-radius: 50%; opacity: 0.1; animation: float 8s infinite ease-in-out; }
    .c1 { width: 400px; height: 400px; background: #00bfa5; top: -100px; left: -100px; }
    .c2 { width: 300px; height: 300px; background: #534bae; bottom: -50px; right: -50px; animation-delay: 2s; }
    .c3 { width: 200px; height: 200px; background: #3b82f6; top: 50%; left: 50%; animation-delay: 4s; }
    @keyframes float { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-20px) scale(1.05); } }
    .login-card {
      background: rgba(26, 35, 50, 0.95); backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.1); border-radius: 24px;
      padding: 48px 40px; width: 420px; z-index: 1; box-shadow: 0 24px 48px rgba(0,0,0,0.4);
    }
    .login-header { text-align: center; margin-bottom: 32px; }
    .logo {
      width: 72px; height: 72px; border-radius: 20px;
      background: linear-gradient(135deg, #00bfa5, #5df2d6);
      display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;
    }
    .logo-icon { font-size: 36px; width: 36px; height: 36px; color: #0f1724; }
    h1 { font-size: 28px; font-weight: 700; color: #e2e8f0; margin-bottom: 4px; }
    p { color: #94a3b8; font-size: 14px; }
    .full-width { width: 100%; }
    .login-btn {
      width: 100%; height: 48px; font-size: 16px; font-weight: 600; border-radius: 12px !important;
      margin-top: 8px; background: linear-gradient(135deg, #00bfa5, #5df2d6) !important; color: #0f1724 !important;
    }
    .error-msg {
      color: #ef4444; font-size: 13px; margin-bottom: 8px; text-align: center;
      padding: 8px; background: rgba(239,68,68,0.1); border-radius: 8px;
    }
    .login-footer { text-align: center; margin-top: 24px; }
    .login-footer p { font-size: 12px; color: #64748b; }
    ::ng-deep .login-card .mat-mdc-form-field-subscript-wrapper { display: none; }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;
  showPassword = false;

  constructor(private authService: AuthService, private router: Router) {
    if (this.authService.isLoggedIn) { this.redirectByRole(); }
  }

  onLogin(): void {
    this.error = '';
    this.loading = true;
    this.authService.login(this.email, this.password).subscribe({
      next: () => { this.loading = false; this.redirectByRole(); },
      error: (err) => { this.loading = false; this.error = err.error?.message || 'Login failed.'; }
    });
  }

  private redirectByRole(): void {
    const role = this.authService.userRole;
    if (role === 'hod') this.router.navigate(['/hod/dashboard']);
    else if (role === 'labincharge') this.router.navigate(['/lab/dashboard']);
    else this.error = 'Access denied. This portal is for HOD and Lab Incharge only.';
  }
}
