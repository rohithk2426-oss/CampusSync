import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { authInterceptor } from './interceptors/auth.interceptor';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './components/layout/layout.component';
import { HodDashboardComponent } from './components/hod/dashboard/dashboard.component';
import { HodStudentsComponent } from './components/hod/students/students.component';
import { HodFacultyComponent } from './components/hod/faculty/faculty.component';
import { HodSubjectsComponent } from './components/hod/subjects/subjects.component';
import { HodFeedbackComponent } from './components/hod/feedback/feedback.component';
import { HodActivityComponent } from './components/hod/activity/activity.component';
import { LabDashboardComponent } from './components/lab-incharge/dashboard/dashboard.component';
import { LabBookingsComponent } from './components/lab-incharge/bookings/bookings.component';
import { LabScheduleComponent } from './components/lab-incharge/schedule/schedule.component';

const routes: Routes = [
    { path: 'login', component: LoginComponent },
    {
        path: '',
        component: LayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: 'hod/dashboard', component: HodDashboardComponent, canActivate: [roleGuard], data: { role: 'hod' } },
            { path: 'hod/students', component: HodStudentsComponent, canActivate: [roleGuard], data: { role: 'hod' } },
            { path: 'hod/faculty', component: HodFacultyComponent, canActivate: [roleGuard], data: { role: 'hod' } },
            { path: 'hod/subjects', component: HodSubjectsComponent, canActivate: [roleGuard], data: { role: 'hod' } },
            { path: 'hod/feedback', component: HodFeedbackComponent, canActivate: [roleGuard], data: { role: 'hod' } },
            { path: 'hod/activity', component: HodActivityComponent, canActivate: [roleGuard], data: { role: 'hod' } },
            { path: 'lab/dashboard', component: LabDashboardComponent, canActivate: [roleGuard], data: { role: 'labincharge' } },
            { path: 'lab/bookings', component: LabBookingsComponent, canActivate: [roleGuard], data: { role: 'labincharge' } },
            { path: 'lab/schedule', component: LabScheduleComponent, canActivate: [roleGuard], data: { role: 'labincharge' } },
            { path: '', redirectTo: 'hod/dashboard', pathMatch: 'full' }
        ]
    },
    { path: '**', redirectTo: 'login' }
];

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideAnimationsAsync()
    ]
};
