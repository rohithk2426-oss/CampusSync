import { useState, useEffect } from 'react';
import api from '../../services/api';
import { HiUpload, HiCheckCircle, HiExclamation } from 'react-icons/hi';

export default function StudentAssignments() {
    const [assignments, setAssignments] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [filter, setFilter] = useState('');
    const [search, setSearch] = useState('');
    const [uploading, setUploading] = useState('');
    const [file, setFile] = useState(null);

    useEffect(() => {
        api.get('/student/subjects').then(({ data }) => setSubjects(data));
    }, []);

    useEffect(() => {
        const params = {};
        if (filter) params.subjectId = filter;
        if (search) params.search = search;
        api.get('/student/assignments', { params }).then(({ data }) => setAssignments(data));
    }, [filter, search]);

    const submitAssignment = async (assignmentId) => {
        if (!file) return alert('Please select a file');
        const fd = new FormData();
        fd.append('assignmentId', assignmentId);
        fd.append('file', file);
        try {
            await api.post('/student/submissions', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setUploading('');
            setFile(null);
            // Reload
            const params = {};
            if (filter) params.subjectId = filter;
            api.get('/student/assignments', { params }).then(({ data }) => setAssignments(data));
        } catch (err) { alert(err.response?.data?.message || 'Error submitting'); }
    };

    return (
        <div>
            <h1 className="page-title mb-6">My Assignments</h1>
            <div className="flex gap-4 mb-6">
                <select className="select-field w-64" value={filter} onChange={e => setFilter(e.target.value)}>
                    <option value="">All Subjects</option>
                    {subjects.map(s => <option key={s._id} value={s._id}>{s.code} - {s.name}</option>)}
                </select>
                <input className="input-field w-64" placeholder="Search assignments..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="space-y-4">
                {assignments.map(a => {
                    const submitted = !!a.submission;
                    const isPast = new Date(a.deadline) < new Date();
                    return (
                        <div key={a._id} className={`card border-l-4 ${submitted ? 'border-l-emerald-500' : isPast ? 'border-l-red-500' : 'border-l-amber-500'}`}>
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-lg">{a.title}</h3>
                                        {submitted && <HiCheckCircle className="text-emerald-400" size={18} />}
                                        {!submitted && isPast && <HiExclamation className="text-red-400" size={18} />}
                                    </div>
                                    <p className="text-gray-400 text-sm mt-1">{a.description?.substring(0, 150)}</p>
                                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                        <span className="bg-indigo-500/15 text-indigo-400 px-2 py-0.5 rounded">{a.subject?.code}</span>
                                        <span>👨‍🏫 {a.faculty?.user?.name}</span>
                                        <span>⏰ {new Date(a.deadline).toLocaleDateString()}</span>
                                        <span>📊 Max: {a.maxMarks}</span>
                                    </div>
                                </div>
                                <div>
                                    {submitted ? (
                                        <div className="text-right">
                                            <span className="status-badge bg-emerald-500/15 text-emerald-400">Submitted</span>
                                            {a.submission.marks !== null && (
                                                <p className="text-sm mt-2 text-emerald-400 font-bold">Marks: {a.submission.marks}/{a.maxMarks}</p>
                                            )}
                                        </div>
                                    ) : (
                                        <button className="btn-primary text-sm" onClick={() => setUploading(uploading === a._id ? '' : a._id)}>
                                            <HiUpload size={16} /> Submit
                                        </button>
                                    )}
                                </div>
                            </div>
                            {uploading === a._id && !submitted && (
                                <div className="mt-4 pt-4 border-t border-[#2d3748] flex gap-3 items-center">
                                    <input type="file" onChange={e => setFile(e.target.files[0])}
                                        className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-500/15 file:text-indigo-400" />
                                    <button className="btn-success text-sm" onClick={() => submitAssignment(a._id)}>Upload & Submit</button>
                                </div>
                            )}
                        </div>
                    );
                })}
                {assignments.length === 0 && <div className="text-center py-12 text-gray-500">No assignments found</div>}
            </div>
        </div>
    );
}
