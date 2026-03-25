import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { HiAcademicCap, HiMenu, HiX, HiLogout, HiBell, HiHome, HiClipboardList, HiDocumentText, HiChat, HiBeaker } from 'react-icons/hi';

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unread, setUnread] = useState(0);
    const [showNotifs, setShowNotifs] = useState(false);

    useEffect(() => {
        api.get('/notifications').then(({ data }) => {
            setNotifications(data.notifications || []);
            setUnread(data.unreadCount || 0);
        }).catch(() => { });
    }, []);

    const handleLogout = () => { logout(); navigate('/login'); };

    const facultyLinks = [
        { to: '/faculty/dashboard', icon: <HiHome size={20} />, label: 'Dashboard' },
        { to: '/faculty/assignments', icon: <HiClipboardList size={20} />, label: 'Assignments' },
        { to: '/faculty/notes', icon: <HiDocumentText size={20} />, label: 'Notes' },
    ];

    const studentLinks = [
        { to: '/student/dashboard', icon: <HiHome size={20} />, label: 'Dashboard' },
        { to: '/student/assignments', icon: <HiClipboardList size={20} />, label: 'Assignments' },
        { to: '/student/notes', icon: <HiDocumentText size={20} />, label: 'Notes' },
        { to: '/student/feedback', icon: <HiChat size={20} />, label: 'Feedback' },
    ];

    // Add lab booking for CR students
    const isCR = user?.profile?.isCR;
    if (user?.role === 'student' && isCR) {
        studentLinks.push({ to: '/student/lab-booking', icon: <HiBeaker size={20} />, label: 'Lab Booking' });
    }

    const links = user?.role === 'faculty' ? facultyLinks : studentLinks;

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <div className={`fixed top-0 left-0 h-full bg-[#111827] border-r border-[#2d3748] z-50 transition-all duration-300 flex flex-col ${collapsed ? 'w-16' : 'w-60'}`}>
                <div className="flex items-center justify-between p-4 border-b border-[#2d3748]">
                    {!collapsed && (
                        <div className="flex items-center gap-2">
                            <HiAcademicCap className="text-2xl text-indigo-400" />
                            <span className="font-bold text-lg text-gray-100">CampusSync</span>
                        </div>
                    )}
                    {collapsed && <HiAcademicCap className="text-2xl text-indigo-400 mx-auto" />}
                    <button onClick={() => setCollapsed(!collapsed)} className="text-gray-400 hover:text-white">
                        {collapsed ? <HiMenu size={20} /> : <HiX size={20} />}
                    </button>
                </div>
                {!collapsed && (
                    <div className="px-4 py-3">
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                            {user?.role === 'faculty' ? 'Faculty' : 'Student'}
                        </span>
                    </div>
                )}
                <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
                    {links.map(link => (
                        <NavLink key={link.to} to={link.to}
                            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${isActive ? 'bg-indigo-500/15 text-indigo-400' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                                }`}>
                            {link.icon}
                            {!collapsed && <span>{link.label}</span>}
                        </NavLink>
                    ))}
                </nav>
                {!collapsed && (
                    <div className="p-3 border-t border-[#2d3748]">
                        <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300 w-full px-3 py-2 rounded-lg hover:bg-red-500/10">
                            <HiLogout size={18} /> Logout
                        </button>
                    </div>
                )}
            </div>

            {/* Main */}
            <div className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-60'}`}>
                <div className="sticky top-0 z-40 bg-[#111827] border-b border-[#2d3748] px-6 py-3 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-200">Welcome, {user?.name}</h2>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <button onClick={() => setShowNotifs(!showNotifs)} className="relative text-gray-400 hover:text-white p-2">
                                <HiBell size={22} />
                                {unread > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">{unread}</span>}
                            </button>
                            {showNotifs && (
                                <div className="absolute right-0 mt-2 w-80 bg-[#1a2332] border border-[#2d3748] rounded-xl shadow-2xl max-h-96 overflow-y-auto">
                                    <div className="p-3 border-b border-[#2d3748] flex justify-between">
                                        <span className="font-semibold text-sm">Notifications</span>
                                        {unread > 0 && <button className="text-xs text-indigo-400" onClick={() => { api.put('/notifications/read-all'); setUnread(0); }}>Mark all read</button>}
                                    </div>
                                    {notifications.length === 0 && <p className="p-4 text-center text-gray-500 text-sm">No notifications</p>}
                                    {notifications.map(n => (
                                        <div key={n._id} className={`p-3 border-b border-[#2d3748] text-sm ${!n.isRead ? 'bg-indigo-500/5' : ''}`}>
                                            <p className="font-medium text-gray-200">{n.title}</p>
                                            <p className="text-gray-400 text-xs mt-1">{n.message}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
