import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';

export default function FacultySubmissions() {
    const { assignmentId } = useParams();
    const [submissions, setSubmissions] = useState([]);
    const [grading, setGrading] = useState({});

    useEffect(() => {
        api.get(`/faculty/submissions/${assignmentId}`).then(({ data }) => setSubmissions(data));
    }, [assignmentId]);

    const grade = async (id) => {
        const { marks, feedback } = grading[id] || {};
        try {
            await api.put(`/faculty/submissions/${id}/grade`, { marks: Number(marks), feedback });
            api.get(`/faculty/submissions/${assignmentId}`).then(({ data }) => setSubmissions(data));
        } catch (err) { alert(err.response?.data?.message || 'Error'); }
    };

    return (
        <div>
            <h1 className="page-title mb-6">Submissions</h1>
            <div className="space-y-4">
                {submissions.map(s => (
                    <div key={s._id} className="card">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold">{s.student?.user?.name}</h3>
                                <p className="text-sm text-gray-400">{s.student?.user?.email}</p>
                                <div className="flex gap-3 mt-2 text-xs text-gray-500">
                                    <span>📅 {new Date(s.submittedAt).toLocaleString()}</span>
                                    {s.isLate && <span className="text-red-400 font-bold">LATE</span>}
                                    {s.marks !== null && <span className="text-emerald-400 font-bold">Graded: {s.marks}/10</span>}
                                </div>
                            </div>
                            {s.file?.path && (
                                <a href={`https://campussync-1-bcpw.onrender.com/${s.file.path}`} target="_blank" className="btn-primary text-sm">Download</a>
                            )}
                        </div>
                        {s.marks === null && (
                            <div className="mt-4 pt-4 border-t border-[#2d3748] flex gap-3 items-end">
                                <div className="flex-1">
                                    <label className="label">Marks (0-10)</label>
                                    <input type="number" min="0" max="10" className="input-field"
                                        value={grading[s._id]?.marks || ''}
                                        onChange={e => setGrading({ ...grading, [s._id]: { ...grading[s._id], marks: e.target.value } })} />
                                </div>
                                <div className="flex-1">
                                    <label className="label">Feedback</label>
                                    <input className="input-field"
                                        value={grading[s._id]?.feedback || ''}
                                        onChange={e => setGrading({ ...grading, [s._id]: { ...grading[s._id], feedback: e.target.value } })} />
                                </div>
                                <button className="btn-success" onClick={() => grade(s._id)}>Grade</button>
                            </div>
                        )}
                    </div>
                ))}
                {submissions.length === 0 && <div className="text-center py-12 text-gray-500">No submissions yet</div>}
            </div>
        </div>
    );
}
