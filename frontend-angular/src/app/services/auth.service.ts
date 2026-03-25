import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface LoginResponse {
    _id: string;
    name: string;
    email: string;
    role: string;
    token: string;
    profile?: any;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private apiUrl = 'http://localhost:5000/api/auth';
    private currentUserSubject = new BehaviorSubject<LoginResponse | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient, private router: Router) {
        const stored = localStorage.getItem('campussync_user');
        if (stored) {
            this.currentUserSubject.next(JSON.parse(stored));
        }
    }

    login(email: string, password: string): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
            tap(user => {
                localStorage.setItem('campussync_user', JSON.stringify(user));
                localStorage.setItem('campussync_token', user.token);
                this.currentUserSubject.next(user);
            })
        );
    }

    logout(): void {
        localStorage.removeItem('campussync_user');
        localStorage.removeItem('campussync_token');
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
    }

    get currentUser(): LoginResponse | null {
        return this.currentUserSubject.value;
    }

    get token(): string | null {
        return localStorage.getItem('campussync_token');
    }

    get isLoggedIn(): boolean {
        return !!this.token;
    }

    get userRole(): string {
        return this.currentUser?.role || '';
    }
}
