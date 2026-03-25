import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
    private baseUrl = 'http://localhost:5000/api';

    constructor(private http: HttpClient) { }

    // HOD endpoints
    getHodDashboard(): Observable<any> { return this.http.get(`${this.baseUrl}/hod/dashboard`); }
    getStudents(params?: any): Observable<any> { return this.http.get(`${this.baseUrl}/hod/students`, { params }); }
    createStudent(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/hod/students`, data); }
    updateStudent(id: string, data: any): Observable<any> { return this.http.put(`${this.baseUrl}/hod/students/${id}`, data); }
    deleteStudent(id: string): Observable<any> { return this.http.delete(`${this.baseUrl}/hod/students/${id}`); }

    getFaculty(): Observable<any> { return this.http.get(`${this.baseUrl}/hod/faculty`); }
    createFaculty(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/hod/faculty`, data); }
    updateFaculty(id: string, data: any): Observable<any> { return this.http.put(`${this.baseUrl}/hod/faculty/${id}`, data); }
    deleteFaculty(id: string): Observable<any> { return this.http.delete(`${this.baseUrl}/hod/faculty/${id}`); }

    getSubjects(): Observable<any> { return this.http.get(`${this.baseUrl}/hod/subjects`); }
    assignSubject(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/hod/assign-subject`, data); }

    getFeedback(params?: any): Observable<any> { return this.http.get(`${this.baseUrl}/hod/feedback`, { params }); }
    getFeedbackAnalytics(): Observable<any> { return this.http.get(`${this.baseUrl}/hod/feedback/analytics`); }

    getLabIncharges(): Observable<any> { return this.http.get(`${this.baseUrl}/hod/labincharges`); }
    createLabIncharge(data: any): Observable<any> { return this.http.post(`${this.baseUrl}/hod/labincharges`, data); }

    getClasses(): Observable<any> { return this.http.get(`${this.baseUrl}/hod/classes`); }
    getActivity(): Observable<any> { return this.http.get(`${this.baseUrl}/hod/activity`); }

    // Lab Incharge endpoints
    getLabDashboard(): Observable<any> { return this.http.get(`${this.baseUrl}/labincharge/dashboard`); }
    getBookings(params?: any): Observable<any> { return this.http.get(`${this.baseUrl}/labincharge/bookings`, { params }); }
    approveBooking(id: string): Observable<any> { return this.http.put(`${this.baseUrl}/labincharge/bookings/${id}/approve`, {}); }
    rejectBooking(id: string, reason: string): Observable<any> { return this.http.put(`${this.baseUrl}/labincharge/bookings/${id}/reject`, { rejectionReason: reason }); }
    getSchedule(params?: any): Observable<any> { return this.http.get(`${this.baseUrl}/labincharge/schedule`, { params }); }

    // Notifications
    getNotifications(): Observable<any> { return this.http.get(`${this.baseUrl}/notifications`); }
    markNotificationRead(id: string): Observable<any> { return this.http.put(`${this.baseUrl}/notifications/${id}/read`, {}); }
    markAllRead(): Observable<any> { return this.http.put(`${this.baseUrl}/notifications/read-all`, {}); }
}
