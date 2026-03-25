import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-hod-feedback',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTabsModule, MatChipsModule],
  template: `
    <div class="page-container">
      <div class="page-header"><h1 class="page-title">Feedback & Analytics</h1></div>
      <mat-tab-group animationDuration="200ms">
        <mat-tab label="Analytics">
          @if (analytics.length > 0) {
            <div class="analytics-grid">
              @for (a of analytics; track a.facultyName) {
                <div class="analytics-card">
                  <div class="analytics-header">
                    <h3>{{a.facultyName}}</h3>
                    <span class="subject-code">{{a.subjectCode}}</span>
                  </div>
                  <p class="subject-name">{{a.subjectName}}</p>
                  <div class="ratings-grid">
                    <div class="rating-item"><span class="rating-label">Overall</span><div class="rating-bar"><div class="rating-fill" [style.width.%]="a.avgRating * 20" [style.background]="getRatingColor(a.avgRating)"></div></div><span class="rating-value">{{a.avgRating}}/5</span></div>
                    <div class="rating-item"><span class="rating-label">Teaching</span><div class="rating-bar"><div class="rating-fill" [style.width.%]="a.avgTeaching * 20" [style.background]="getRatingColor(a.avgTeaching)"></div></div><span class="rating-value">{{a.avgTeaching}}/5</span></div>
                    <div class="rating-item"><span class="rating-label">Clarity</span><div class="rating-bar"><div class="rating-fill" [style.width.%]="a.avgClarity * 20" [style.background]="getRatingColor(a.avgClarity)"></div></div><span class="rating-value">{{a.avgClarity}}/5</span></div>
                    <div class="rating-item"><span class="rating-label">Engagement</span><div class="rating-bar"><div class="rating-fill" [style.width.%]="a.avgEngagement * 20" [style.background]="getRatingColor(a.avgEngagement)"></div></div><span class="rating-value">{{a.avgEngagement}}/5</span></div>
                  </div>
                  <div class="response-count">{{a.totalResponses}} response(s)</div>
                </div>
              }
            </div>
          }
          @if (analytics.length === 0) {
            <div class="empty-state"><mat-icon>rate_review</mat-icon><p>No feedback analytics yet</p></div>
          }
        </mat-tab>
        <mat-tab label="All Feedback">
          <div class="feedback-list">
            @for (f of feedback; track f._id) {
              <div class="feedback-item">
                <div class="feedback-header"><span class="student-name">{{f.student?.user?.name}}</span><span class="feedback-date">{{f.createdAt | date:'mediumDate'}}</span></div>
                <div class="feedback-meta"><mat-chip>{{f.subject?.name}}</mat-chip><span>→ {{f.faculty?.user?.name}}</span></div>
                <div class="feedback-ratings"><span>⭐ {{f.rating}}/5</span><span>📚 Teaching: {{f.teachingQuality}}/5</span><span>💡 Clarity: {{f.clarity}}/5</span><span>🎯 Engagement: {{f.engagement}}/5</span></div>
                @if (f.comment) { <p class="feedback-comment">{{f.comment}}</p> }
              </div>
            }
            @if (feedback.length === 0) { <div class="empty-state"><mat-icon>rate_review</mat-icon><p>No feedback submitted yet</p></div> }
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .analytics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 16px; padding: 16px 0; }
    .analytics-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; }
    .analytics-header { display: flex; justify-content: space-between; align-items: center; }
    .analytics-header h3 { font-size: 16px; color: var(--text-primary); }
    .subject-code { background: rgba(0,191,165,0.15); color: var(--accent); padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .subject-name { color: var(--text-secondary); font-size: 13px; margin: 4px 0 16px; }
    .ratings-grid { display: flex; flex-direction: column; gap: 8px; }
    .rating-item { display: flex; align-items: center; gap: 8px; }
    .rating-label { width: 80px; font-size: 12px; color: var(--text-secondary); }
    .rating-bar { flex: 1; height: 8px; background: var(--bg-dark); border-radius: 4px; overflow: hidden; }
    .rating-fill { height: 100%; border-radius: 4px; transition: width 0.5s ease; }
    .rating-value { font-size: 13px; font-weight: 600; width: 40px; text-align: right; }
    .response-count { text-align: right; color: var(--text-secondary); font-size: 12px; margin-top: 12px; }
    .feedback-list { padding: 16px 0; }
    .feedback-item { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px; margin-bottom: 12px; }
    .feedback-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .student-name { font-weight: 600; }
    .feedback-date { color: var(--text-secondary); font-size: 12px; }
    .feedback-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .feedback-ratings { display: flex; gap: 16px; font-size: 13px; color: var(--text-secondary); margin-bottom: 8px; }
    .feedback-comment { color: var(--text-secondary); font-style: italic; font-size: 14px; }
  `]
})
export class HodFeedbackComponent implements OnInit {
  analytics: any[] = [];
  feedback: any[] = [];
  constructor(private api: ApiService) { }
  ngOnInit() {
    this.api.getFeedbackAnalytics().subscribe(data => this.analytics = data);
    this.api.getFeedback().subscribe(data => this.feedback = data);
  }
  getRatingColor(rating: number): string {
    if (rating >= 4) return '#10b981';
    if (rating >= 3) return '#f59e0b';
    return '#ef4444';
  }
}
