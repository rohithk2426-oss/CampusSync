import { useState, useEffect } from 'react';
import api from '../../services/api';
import { HiUpload, HiTrash, HiDownload, HiDocumentText } from 'react-icons/hi';

export default function FacultyNotes() {
    const [notes, setNotes] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', subjectId: '', description: '' });
    const [file, setFile] = useState(null);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        api.get('/faculty/subjects').then(({ data }) => setSubjects(data));
        loadNotes();
    }, []);

    const loadNotes = () => {
        const params = filter ? { subjectId: filter } : {};
        api.get('/faculty/notes', { params }).then(({ data }) => setNotes(data));
    };

    useEffect(() => { loadNotes(); }, [filter]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData();
        fd.append('title', form.title);
        fd.append('subjectId', form.subjectId);
        fd.append('description', form.description);
        if (file) fd.append('file', file);
        try {
            await api.post('/faculty/notes', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setShowForm(false);
            setForm({ title: '', subjectId: '', description: '' });
            setFile(null);
            loadNotes();
        } catch (err) { alert(err.response?.data?.message || 'Error'); }
    };

    const deleteNote = async (id) => {
        if (!confirm('Delete this note?')) return;
        await api.delete(`/faculty/notes/${id}`);
        loadNotes();
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="page-title">Notes</h1>
                <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                    <HiUpload size={18} /> {showForm ? 'Cancel' : 'Upload Note'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="card mb-6 space-y-4">
                    <h3 className="text-lg font-semibold text-indigo-400">Upload Note</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="label">Title</label><input className="input-field" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
                        <div><label className="label">Subject</label>
                            <select className="select-field" value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })} required>
                                <option value="">Select subject</option>
                                {subjects.map(s => <option key={s._id} value={s._id}>{s.code} - {s.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div><label className="label">Description</label><textarea className="input-field h-20" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                    <div>
                        <label className="label">File (PDF, DOC)</label>
                        <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={e => setFile(e.target.files[0])} className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-500/15 file:text-indigo-400 hover:file:bg-indigo-500/25" />
                    </div>
                    <button type="submit" className="btn-primary">Upload</button>
                </form>
            )}

            <div className="mb-4">
                <select className="select-field w-64" value={filter} onChange={e => setFilter(e.target.value)}>
                    <option value="">All Subjects</option>
                    {subjects.map(s => <option key={s._id} value={s._id}>{s.code} - {s.name}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {notes.map(n => (
                    <div key={n._id} className="card">
                        <div className="flex justify-between items-start">
                            <div className="w-10 h-10 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center"><HiDocumentText size={20} /></div>
                            <button className="text-red-400 hover:text-red-300" onClick={() => deleteNote(n._id)}><HiTrash size={16} /></button>
                        </div>
                        <h3 className="font-semibold mt-3">{n.title}</h3>
                        <p className="text-gray-400 text-sm mt-1">{n.subject?.code} - {n.subject?.name}</p>
                        {n.description && <p className="text-gray-500 text-xs mt-2">{n.description}</p>}
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#2d3748]">
                            <span className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleDateString()}</span>
                            {n.file?.path && (
                                <a href={`http://localhost:5000/${n.file.path}`} target="_blank" className="flex items-center gap-1 text-indigo-400 text-sm hover:text-indigo-300">
                                    <HiDownload size={14} /> Download
                                </a>
                            )}
                        </div>
                    </div>
                ))}
                {notes.length === 0 && <div className="col-span-full text-center py-12 text-gray-500">No notes uploaded yet</div>}
            </div>
        </div>
    );
}

