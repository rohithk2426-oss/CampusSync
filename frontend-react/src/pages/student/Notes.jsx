import { useState, useEffect } from 'react';
import api from '../../services/api';
import { HiDownload } from 'react-icons/hi';

export default function StudentNotes() {
    const [notes, setNotes] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        api.get('/student/subjects').then(({ data }) => setSubjects(data));
    }, []);

    useEffect(() => {
        const params = filter ? { subjectId: filter } : {};
        api.get('/student/notes', { params }).then(({ data }) => setNotes(data));
    }, [filter]);

    return (
        <div>
            <h1 className="page-title mb-6">Study Notes</h1>
            <div className="mb-4">
                <select className="select-field w-64" value={filter} onChange={e => setFilter(e.target.value)}>
                    <option value="">All Subjects</option>
                    {subjects.map(s => <option key={s._id} value={s._id}>{s.code} - {s.name}</option>)}
                </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {notes.map(n => (
                    <div key={n._id} className="card group">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center mb-3">📄</div>
                        <h3 className="font-semibold">{n.title}</h3>
                        <p className="text-gray-400 text-sm mt-1">{n.subject?.code} - {n.subject?.name}</p>
                        <p className="text-gray-500 text-xs mt-1">By {n.faculty?.user?.name}</p>
                        {n.description && <p className="text-gray-500 text-xs mt-2">{n.description}</p>}
                        <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#2d3748]">
                            <span className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleDateString()}</span>
                            {n.file?.path && (
                                <a href={`http://localhost:5000/${n.file.path}`} target="_blank"
                                    className="flex items-center gap-1 text-indigo-400 text-sm hover:text-indigo-300 group-hover:translate-x-1 transition-transform">
                                    <HiDownload size={14} /> Download
                                </a>
                            )}
                        </div>
                    </div>
                ))}
                {notes.length === 0 && <div className="col-span-full text-center py-12 text-gray-500">No notes available</div>}
            </div>
        </div>
    );
}
