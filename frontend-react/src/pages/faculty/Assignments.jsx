import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { HiPlus, HiTrash, HiEye, HiPencil } from 'react-icons/hi';

export default function FacultyAssignments() {
    const [assignments, setAssignments] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', subjectId: '', deadline: '', maxMarks: 10 });
    const [filter, setFilter] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadAssignments();
        api.get('/faculty/subjects').then(({ data }) => setSubjects(data));
    }, []);

    const loadAssignments = () => {
        const params = filter ? { subjectId: filter } : {};
        api.get('/faculty/assignments', { params }).then(({ data }) => setAssignments(data));
    };

    useEffect(() => { loadAssignments(); }, [filter]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/faculty/assignments', form);
            setShowForm(false);
            setForm({ title: '', description: '', subjectId: '', deadline: '', maxMarks: 10 });
            loadAssignments();
        } catch (err) { alert(err.response?.data?.message || 'Error'); }
    };

    const deleteAssignment = async (id) => {
        if (!confirm('Delete this assignment?')) return;
        await api.delete(`/faculty/assignments/${id}`);
        loadAssignments();
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="page-title">Assignments</h1>
                <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? <HiPencil size={18} /> : <HiPlus size={18} />}
                    {showForm ? 'Cancel' : 'Create Assignment'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="card mb-6 space-y-4">
                    <h3 className="text-lg font-semibold text-indigo-400">New Assignment</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="label">Title</label><input className="input-field" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
                        <div><label className="label">Subject</label>
                            <select className="select-field" value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })} required>
                                <option value="">Select subject</option>
                                {subjects.map(s => <option key={s._id} value={s._id}>{s.code} - {s.name}</option>)}
                            </select>
                        </div>
                        <div><label className="label">Deadline</label><input type="datetime-local" className="input-field" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} required /></div>
                        <div><label className="label">Max Marks</label><input type="number" className="input-field" value={form.maxMarks} onChange={e => setForm({ ...form, maxMarks: e.target.value })} /></div>
                    </div>
                    <div><label className="label">Description</label><textarea className="input-field h-24" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required /></div>
                    <button type="submit" className="btn-primary">Create Assignment</button>
                </form>
            )}

            <div className="mb-4">
                <select className="select-field w-64" value={filter} onChange={e => setFilter(e.target.value)}>
                    <option value="">All Subjects</option>
                    {subjects.map(s => <option key={s._id} value={s._id}>{s.code} - {s.name}</option>)}
                </select>
            </div>

            <div className="space-y-3">
                {assignments.map(a => (
                    <div key={a._id} className="card flex justify-between items-start">
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg">{a.title}</h3>
                            <p className="text-gray-400 text-sm mt-1">{a.description?.substring(0, 100)}...</p>
                            <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                <span className="bg-indigo-500/15 text-indigo-400 px-2 py-0.5 rounded">{a.subject?.code}</span>
                                <span>⏰ {new Date(a.deadline).toLocaleDateString()}</span>
                                <span>📊 Max: {a.maxMarks}</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 rounded-lg hover:bg-indigo-500/15 text-indigo-400" onClick={() => navigate(`/faculty/submissions/${a._id}`)} title="View Submissions"><HiEye size={18} /></button>
                            <button className="p-2 rounded-lg hover:bg-red-500/15 text-red-400" onClick={() => deleteAssignment(a._id)} title="Delete"><HiTrash size={18} /></button>
                        </div>
                    </div>
                ))}
                {assignments.length === 0 && <div className="text-center py-12 text-gray-500">No assignments found</div>}
            </div>
        </div>
    );
}
