import { useState, useEffect } from 'react';
import api from '../../services/api';
import { HiBeaker, HiPlus, HiCheckCircle, HiXCircle, HiClock } from 'react-icons/hi';

export default function StudentLabBooking() {
    const [subjects, setSubjects] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ subjectId: '', date: '', periods: [] });
    const [msg, setMsg] = useState('');

    useEffect(() => {
        api.get('/student/subjects').then(({ data }) => {
            // Only show lab subjects
            setSubjects(data.filter(s => s.category === 'lab' || s.category === 'lab_integrated'));
        });
        loadBookings();
    }, []);

    const loadBookings = () => {
        api.get('/student/lab-bookings').then(({ data }) => setBookings(data));
    };

    const togglePeriod = (p) => {
        const periods = form.periods.includes(p) ? form.periods.filter(x => x !== p) : [...form.periods, p].sort();
        setForm({ ...form, periods });
    };

    const submitBooking = async (e) => {
        e.preventDefault();
        setMsg('');
        if (form.periods.length === 0) return setMsg('Select at least one period');
        try {
            await api.post('/student/lab-booking', form);
            setMsg('Lab booking request submitted!');
            setShowForm(false);
            setForm({ subjectId: '', date: '', periods: [] });
            loadBookings();
        } catch (err) { setMsg(err.response?.data?.message || 'Error submitting booking'); }
    };

    const statusIcon = (status) => {
        if (status === 'approved') return <HiCheckCircle className="text-emerald-400" size={20} />;
        if (status === 'rejected') return <HiXCircle className="text-red-400" size={20} />;
        return <HiClock className="text-amber-400" size={20} />;
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="page-title">Lab Booking (CR)</h1>
                <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                    <HiPlus size={18} /> {showForm ? 'Cancel' : 'New Booking'}
                </button>
            </div>

            {msg && <div className={`mb-4 p-3 rounded-lg text-sm ${msg.includes('Error') ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'}`}>{msg}</div>}

            {showForm && (
                <form onSubmit={submitBooking} className="card mb-6 space-y-4">
                    <h3 className="text-lg font-semibold text-indigo-400">Request Lab Slot</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="label">Subject (Lab / Lab Integrated only)</label>
                            <select className="select-field" value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })} required>
                                <option value="">Select subject</option>
                                {subjects.map(s => <option key={s._id} value={s._id}>{s.code} - {s.name} ({s.category})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label">Date</label>
                            <input type="date" className="input-field" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                        </div>
                    </div>
                    <div>
                        <label className="label">Select Periods (Max 8 per day)</label>
                        <div className="flex gap-2 flex-wrap">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(p => (
                                <button key={p} type="button" onClick={() => togglePeriod(p)}
                                    className={`w-12 h-12 rounded-xl font-bold text-sm transition-all ${form.periods.includes(p)
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                            : 'bg-[#0f1724] border border-[#2d3748] text-gray-400 hover:border-indigo-500'
                                        }`}>
                                    P{p}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button type="submit" className="btn-primary"><HiBeaker size={18} /> Submit Request</button>
                </form>
            )}

            <div className="space-y-4">
                <h2 className="text-lg font-semibold">My Booking Requests</h2>
                {bookings.map(b => (
                    <div key={b._id} className={`card border-l-4 ${b.status === 'approved' ? 'border-l-emerald-500' :
                            b.status === 'rejected' ? 'border-l-red-500' : 'border-l-amber-500'
                        }`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold">{b.subject?.name} ({b.subject?.code})</h3>
                                <div className="flex gap-4 mt-2 text-sm text-gray-400">
                                    <span>📅 {new Date(b.date).toLocaleDateString()}</span>
                                    <span>🕐 Periods: {b.periods?.join(', ')}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {statusIcon(b.status)}
                                <span className={`status-badge ${b.status === 'approved' ? 'bg-emerald-500/15 text-emerald-400' :
                                        b.status === 'rejected' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'
                                    }`}>{b.status}</span>
                            </div>
                        </div>
                        {b.status === 'rejected' && b.rejectionReason && (
                            <div className="mt-3 p-3 bg-red-500/10 rounded-lg text-red-400 text-sm">
                                Reason: {b.rejectionReason}
                            </div>
                        )}
                    </div>
                ))}
                {bookings.length === 0 && <p className="text-center py-8 text-gray-500">No booking requests yet</p>}
            </div>
        </div>
    );
}
