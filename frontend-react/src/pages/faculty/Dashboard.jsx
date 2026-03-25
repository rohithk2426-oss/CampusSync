import { useState, useEffect } from 'react';
import api from '../../services/api';
import { HiClipboardList, HiDocumentText, HiUserGroup, HiBookOpen } from 'react-icons/hi';

export default function FacultyDashboard() {
    const [data, setData] = useState(null);

    useEffect(() => {
        api.get('/faculty/dashboard').then(({ data }) => setData(data));
    }, []);

    if (!data) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;

    const stats = [
        { icon: <HiBookOpen size={24} />, label: 'My Subjects', value: data.subjects?.length || 0, color: 'bg-indigo-500/15 text-indigo-400' },
        { icon: <HiClipboardList size={24} />, label: 'Assignments', value: data.totalAssignments, color: 'bg-emerald-500/15 text-emerald-400' },
        { icon: <HiDocumentText size={24} />, label: 'Notes', value: data.totalNotes, color: 'bg-amber-500/15 text-amber-400' },
        { icon: <HiUserGroup size={24} />, label: 'Submissions', value: data.totalSubmissions, color: 'bg-purple-500/15 text-purple-400' },
    ];

    return (
        <div>
            <h1 className="page-title mb-6">Faculty Dashboard</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {stats.map((s, i) => (
                    <div key={i} className="stat-card">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>{s.icon}</div>
                        <div>
                            <div className="text-2xl font-bold">{s.value}</div>
                            <div className="text-sm text-gray-400">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="card">
                <h2 className="text-lg font-semibold mb-4">My Subjects</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.subjects?.map(s => (
                        <div key={s._id} className="bg-[#0f1724] rounded-lg p-4 border border-[#2d3748]">
                            <h3 className="font-semibold">{s.name}</h3>
                            <p className="text-sm text-gray-400">{s.code} · {s.classId?.name}</p>
                            <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${s.category === 'theory' ? 'bg-blue-500/15 text-blue-400' :
                                    s.category === 'lab' ? 'bg-green-500/15 text-green-400' :
                                        'bg-purple-500/15 text-purple-400'
                                }`}>{s.category}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
