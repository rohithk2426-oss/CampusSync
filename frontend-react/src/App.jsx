// ============================================================
// React.js Advanced Concept: Route-Based Code Splitting
// ============================================================
// Uses React.lazy() and <Suspense> to implement lazy-loading.
// Instead of downloading ALL page code on first visit, React
// only loads what's needed. When navigating to a new page, the
// code for that page is fetched asynchronously — dramatically
// reducing initial bundle size.
// ============================================================

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Login and Layout loaded eagerly (always needed)
import Login from './pages/Login';
import Layout from './components/Layout';

// ---- Lazy-loaded pages (code-split chunks) ----
const FacultyDashboard = lazy(() => import('./pages/faculty/Dashboard'));
const FacultyAssignments = lazy(() => import('./pages/faculty/Assignments'));
const FacultyNotes = lazy(() => import('./pages/faculty/Notes'));
const FacultySubmissions = lazy(() => import('./pages/faculty/Submissions'));
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const StudentAssignments = lazy(() => import('./pages/student/Assignments'));
const StudentNotes = lazy(() => import('./pages/student/Notes'));
const StudentFeedback = lazy(() => import('./pages/student/Feedback'));
const StudentLabBooking = lazy(() => import('./pages/student/LabBooking'));

// Loading spinner shown during lazy chunk download
function LazyLoadSpinner() {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-400 text-sm">Loading module...</span>
        </div>
    );
}

function ProtectedRoute({ children, role }) {
    const { user, isLoggedIn } = useAuth();
    if (!isLoggedIn) return <Navigate to="/login" />;
    if (role && user.role !== role) return <Navigate to="/login" />;
    return children;
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                {/* Suspense boundary catches lazy-loaded components while they download */}
                <Suspense fallback={<LazyLoadSpinner />}>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                            {/* Faculty */}
                            <Route path="faculty/dashboard" element={<ProtectedRoute role="faculty"><FacultyDashboard /></ProtectedRoute>} />
                            <Route path="faculty/assignments" element={<ProtectedRoute role="faculty"><FacultyAssignments /></ProtectedRoute>} />
                            <Route path="faculty/notes" element={<ProtectedRoute role="faculty"><FacultyNotes /></ProtectedRoute>} />
                            <Route path="faculty/submissions/:assignmentId" element={<ProtectedRoute role="faculty"><FacultySubmissions /></ProtectedRoute>} />
                            {/* Student */}
                            <Route path="student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
                            <Route path="student/assignments" element={<ProtectedRoute role="student"><StudentAssignments /></ProtectedRoute>} />
                            <Route path="student/notes" element={<ProtectedRoute role="student"><StudentNotes /></ProtectedRoute>} />
                            <Route path="student/feedback" element={<ProtectedRoute role="student"><StudentFeedback /></ProtectedRoute>} />
                            <Route path="student/lab-booking" element={<ProtectedRoute role="student"><StudentLabBooking /></ProtectedRoute>} />
                            {/* Default */}
                            <Route index element={<DefaultRedirect />} />
                        </Route>
                        <Route path="*" element={<Navigate to="/login" />} />
                    </Routes>
                </Suspense>
            </BrowserRouter>
        </AuthProvider>
    );
}

function DefaultRedirect() {
    const { user } = useAuth();
    if (user?.role === 'faculty') return <Navigate to="/faculty/dashboard" />;
    if (user?.role === 'student') return <Navigate to="/student/dashboard" />;
    return <Navigate to="/login" />;
}
