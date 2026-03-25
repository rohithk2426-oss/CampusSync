import { useState, useEffect } from 'react';
import api from '../../services/api';
import { HiStar } from 'react-icons/hi';

export default function StudentFeedback() {
    const [subjects, setSubjects] = useState([]);
    const [myFeedback, setMyFeedback] = useState([]);
    const [form, setForm] = useState({ subjectId: '', facultyId: '', rating: 5, teachingQuality: 3, clarity: 3, engagement: 3, comment: '' });
    const [showForm, setShowForm] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        api.get('/student/subjects').then(({ data }) => setSubjects(data));
        api.get('/student/feedback').then(({ data }) => setMyFeedback(data));
    }, []);

    const selectSubject = (subjectId) => {
        const subject = subjects.find(s => s._id === subjectId);
        setForm({ ...form, subjectId, facultyId: subject?.faculty?._id || '' });
    };

    const submitFeedback = async (e) => {
        e.preventDefault();
        setMsg('');
        try {
            await api.post('/student/feedback', form);
            setMsg('Feedback submitted successfully!');
            setShowForm(false);
            setForm({ subjectId: '', facultyId: '', rating: 5, teachingQuality: 3, clarity: 3, engagement: 3, comment: '' });
            api.get('/student/feedback').then(({ data }) => setMyFeedback(data));
        } catch (err) { setMsg(err.response?.data?.message || 'Error submitting feedback'); }
    };

    const RatingInput = ({ label, value, onChange }) => (
        <div>
            <label className="label">{label}</label>
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} type="button" onClick={() => onChange(star)}
                        className={`text-2xl transition-colors ${star <= value ? 'text-amber-400' : 'text-gray-600'}`}>
                        ★
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="page-title">Submit Feedback</h1>
                <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                    <HiStar size={18} /> {showForm ? 'Cancel' : 'New Feedback'}
                </button>
            </div>

            {msg && <div className={`mb-4 p-3 rounded-lg text-sm ${msg.includes('Error') ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'}`}>{msg}</div>}

            {showForm && (
                <form onSubmit={submitFeedback} className="card mb-6 space-y-4">
                    <h3 className="text-lg font-semibold text-indigo-400">Rate Your Subject</h3>
                    <div>
                        <label className="label">Subject</label>
                        <select className="select-field" value={form.subjectId} onChange={e => selectSubject(e.target.value)} required>
                            <option value="">Select subject</option>
                            {subjects.map(s => <option key={s._id} value={s._id}>{s.code} - {s.name} ({s.faculty?.user?.name})</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <RatingInput label="Overall Rating" value={form.rating} onChange={v => setForm({ ...form, rating: v })} />
                        <RatingInput label="Teaching Quality" value={form.teachingQuality} onChange={v => setForm({ ...form, teachingQuality: v })} />
                        <RatingInput label="Clarity" value={form.clarity} onChange={v => setForm({ ...form, clarity: v })} />
                        <RatingInput label="Engagement" value={form.engagement} onChange={v => setForm({ ...form, engagement: v })} />
                    </div>
                    <div>
                        <label className="label">Comments (Optional)</label>
                        <textarea className="input-field h-20" value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} placeholder="Share your thoughts..." />
                    </div>
                    <button type="submit" className="btn-primary">Submit Feedback</button>
                </form>
            )}

            <div className="space-y-4">
                <h2 className="text-lg font-semibold">My Feedback History</h2>
                {myFeedback.map(f => (
                    <div key={f._id} className="card">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold">{f.subject?.name} ({f.subject?.code})</h3>
                                <p className="text-sm text-gray-400">Faculty: {f.faculty?.user?.name}</p>
                            </div>
                            <span className="text-xs text-gray-500">{new Date(f.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-6 mt-3 text-sm">
                            <span>⭐ {f.rating}/5</span>
                            <span>📚 Teaching: {f.teachingQuality}/5</span>
                            <span>💡 Clarity: {f.clarity}/5</span>
                            <span>🎯 Engagement: {f.engagement}/5</span>
                        </div>
                        {f.comment && <p className="text-gray-400 text-sm mt-2 italic">"{f.comment}"</p>}
                    </div>
                ))}
                {myFeedback.length === 0 && <p className="text-center py-8 text-gray-500">No feedback submitted yet</p>}
            </div>
        </div>
    );
}
