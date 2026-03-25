// ============================================================
// Angular Advanced Concept: Intelligent HttpInterceptor
// ============================================================
// Instead of manually injecting Authorization headers in every
// component, this interceptor automatically:
// 1. Clones every outgoing request and injects the JWT token
// 2. Measures request timing for performance monitoring
// 3. Catches 401 errors and auto-redirects to login
// 4. Logs request/response details in development mode
// ============================================================

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const token = localStorage.getItem('campussync_token');
    const startTime = Date.now();

    // Step 1: Clone the request and inject JWT token
    if (token) {
        req = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
        });
    }

    // Step 2: Log outgoing request (dev mode)
    console.log(`[HTTP] → ${req.method} ${req.url}`);

    return next(req).pipe(
        // Step 3: Measure timing and log response
        tap(() => {
            const elapsed = Date.now() - startTime;
            console.log(`[HTTP] ← ${req.method} ${req.url} (${elapsed}ms)`);
        }),

        // Step 4: Catch errors — auto-logout on 401 Unauthorized
        catchError((error: HttpErrorResponse) => {
            const elapsed = Date.now() - startTime;
            console.error(`[HTTP] ✖ ${req.method} ${req.url} → ${error.status} (${elapsed}ms)`);

            if (error.status === 401) {
                // Token expired or invalid — clear session and redirect
                localStorage.removeItem('campussync_user');
                localStorage.removeItem('campussync_token');
                router.navigate(['/login']);
            }

            return throwError(() => error);
        })
    );
};
