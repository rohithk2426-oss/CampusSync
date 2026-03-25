import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { HiClipboardList, HiDocumentText, HiClock, HiStar } from 'react-icons/hi';

export default function StudentDashboard() {
    const [data, setData] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        api.get('/student/dashboard').then(({ data }) => setData(data));
    }, []);

    if (!data) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="page-title">Student Dashboard</h1>
                {data.isCR && <span className="px-3 py-1 bg-emerald-500/15 text-emerald-400 rounded-full text-sm font-bold">✨ Class Representative</span>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="stat-card">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-500/15 text-indigo-400"><HiClipboardList size={24} /></div>
                    <div><div className="text-2xl font-bold">{data.upcomingAssignments?.length || 0}</div><div className="text-sm text-gray-400">Upcoming</div></div>
                </div>
                <div className="stat-card">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-500/15 text-emerald-400"><HiStar size={24} /></div>
                    <div><div className="text-2xl font-bold">{data.mySubmissions}</div><div className="text-sm text-gray-400">Submissions</div></div>
                </div>
                <div className="stat-card">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-500/15 text-amber-400"><HiDocumentText size={24} /></div>
                    <div><div className="text-2xl font-bold">{data.recentNotes?.length || 0}</div><div className="text-sm text-gray-400">Recent Notes</div></div>
                </div>
                <div className="stat-card">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-500/15 text-purple-400"><HiClock size={24} /></div>
                    <div><div className="text-2xl font-bold">{data.student?.subjects?.length || 0}</div><div className="text-sm text-gray-400">Subjects</div></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                    <h2 className="text-lg font-semibold mb-4">⏰ Upcoming Assignments</h2>
                    {data.upcomingAssignments?.length === 0 && <p className="text-gray-500 text-center py-6">No upcoming assignments!</p>}
                    {data.upcomingAssignments?.map(a => (
                        <div key={a._id} className="flex justify-between items-center py-3 border-b border-[#2d3748] last:border-0">
                            <div>
                                <h4 className="font-medium">{a.title}</h4>
                                <p className="text-sm text-gray-400">{a.subject?.name}</p>
                            </div>
                            <span className="text-xs text-amber-400">{new Date(a.deadline).toLocaleDateString()}</span>
                        </div>
                    ))}
                </div>
                <div className="card">
                    <h2 className="text-lg font-semibold mb-4">📄 Recent Notes</h2>
                    {data.recentNotes?.length === 0 && <p className="text-gray-500 text-center py-6">No notes available</p>}
                    {data.recentNotes?.map(n => (
                        <div key={n._id} className="flex justify-between items-center py-3 border-b border-[#2d3748] last:border-0">
                            <div>
                                <h4 className="font-medium">{n.title}</h4>
                                <p className="text-sm text-gray-400">{n.subject?.name}</p>
                            </div>
                            <span className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleDateString()}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
