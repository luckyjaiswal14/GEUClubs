import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { api } from '../utils/api';
import { Users, Calendar, CheckSquare, BarChart, Plus, Check } from 'lucide-react';

interface Props {
    user: User;
    clubId: string;
}

export default function ClubManagement({ user, clubId }: Props) {
    const [activeTab, setActiveTab] = useState<'members' | 'events' | 'attendance' | 'performance'>('members');

    const [members, setMembers] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);

    // Attendance state
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [attendances, setAttendances] = useState<any[]>([]);

    // Performance state
    const [performanceData, setPerformanceData] = useState<any>(null);

    useEffect(() => {
        if (!clubId) return;
        loadMembers();
        loadEvents();
    }, [clubId]);

    const loadMembers = async () => {
        try {
            const data = await api.getMembers(clubId);
            setMembers(data);
        } catch (e) {
            console.error('Failed to load members', e);
        }
    };

    const loadEvents = async () => {
        try {
            const data = await api.getEvents(clubId);
            setEvents(data);
            if (data.length > 0) setSelectedEventId(data[0].id);
        } catch (e) {
            console.error('Failed to load events', e);
        }
    };

    const loadAttendance = async (eventId: string) => {
        try {
            const data = await api.getAttendance(eventId);
            setAttendances(data);
        } catch (e) {
            console.error('Failed to load attendance', e);
        }
    };

    useEffect(() => {
        if (activeTab === 'attendance' && selectedEventId) {
            loadAttendance(selectedEventId);
        }
    }, [activeTab, selectedEventId]);

    const handleAddMember = async (e: any) => {
        e.preventDefault();
        const email = e.target.email.value;
        const name = e.target.name.value;
        const role = e.target.role.value;
        const userId = email.split('@')[0]; // Mock firebase UID for demo

        try {
            await api.addMembership({ userId, email, name, clubId, role });
            loadMembers();
            e.target.reset();
        } catch (err) {
            alert('Failed to add member');
        }
    };

    const handleMarkAttendance = async (userId: string, status: string) => {
        try {
            await api.markAttendance({ userId, eventId: selectedEventId, status });
            loadAttendance(selectedEventId);
        } catch (err) {
            alert('Failed to mark attendance');
        }
    };

    const handleCalculatePerformance = async (userId: string) => {
        try {
            const res = await api.calculatePerformance(userId);
            setPerformanceData(res.performance);
            alert('Performance updated!');
        } catch (err) {
            alert('Failed to calculate performance');
        }
    };

    return (
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm mt-8">
            {/* Tabs */}
            <div className="flex border-b border-stone-100 bg-stone-50 overflow-x-auto">
                <button onClick={() => setActiveTab('members')} className={`flex items-center gap-2 px-6 py-4 text-sm font-bold ${activeTab === 'members' ? 'text-emerald-700 bg-white border-b-2 border-emerald-600' : 'text-stone-500 hover:bg-stone-100'}`}>
                    <Users className="h-4 w-4" /> Members
                </button>
                <button onClick={() => setActiveTab('events')} className={`flex items-center gap-2 px-6 py-4 text-sm font-bold ${activeTab === 'events' ? 'text-emerald-700 bg-white border-b-2 border-emerald-600' : 'text-stone-500 hover:bg-stone-100'}`}>
                    <Calendar className="h-4 w-4" /> Events Log
                </button>
                <button onClick={() => setActiveTab('attendance')} className={`flex items-center gap-2 px-6 py-4 text-sm font-bold ${activeTab === 'attendance' ? 'text-emerald-700 bg-white border-b-2 border-emerald-600' : 'text-stone-500 hover:bg-stone-100'}`}>
                    <CheckSquare className="h-4 w-4" /> Attendance Tracker
                </button>
            </div>

            <div className="p-6">
                {/* Members Tab */}
                {activeTab === 'members' && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-stone-900">Club Members</h3>

                        <form onSubmit={handleAddMember} className="flex gap-4 items-end bg-stone-50 p-4 rounded-xl border border-stone-200">
                            <div>
                                <label className="block text-xs font-bold text-stone-600 mb-1">Name</label>
                                <input required name="name" type="text" className="px-3 py-2 border rounded-lg text-sm w-full" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-600 mb-1">Email</label>
                                <input required name="email" type="email" className="px-3 py-2 border rounded-lg text-sm w-full" placeholder="john@geu.ac.in" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-600 mb-1">Role</label>
                                <select name="role" className="px-3 py-2 border rounded-lg text-sm w-full bg-white">
                                    <option value="member">Member</option>
                                    <option value="volunteer">Volunteer</option>
                                    <option value="core">Core Team</option>
                                    <option value="head">Club Head</option>
                                </select>
                            </div>
                            <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-emerald-700">
                                <Plus className="h-4 w-4" /> Add
                            </button>
                        </form>

                        <div className="overflow-x-auto border border-stone-200 rounded-xl">
                            <table className="w-full text-left">
                                <thead className="bg-stone-50 text-stone-500 text-xs uppercase font-bold">
                                    <tr>
                                        <th className="px-4 py-3">User</th>
                                        <th className="px-4 py-3">Role</th>
                                        <th className="px-4 py-3 border-l text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {members.map(m => (
                                        <tr key={m.id}>
                                            <td className="px-4 py-3">
                                                <div className="font-semibold text-stone-900">{m.user?.name || m.userId}</div>
                                                <div className="text-xs text-stone-500">{m.user?.email || 'N/A'}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="bg-stone-100 text-stone-700 text-xs font-bold px-2 py-1 rounded-full uppercase">{m.role}</span>
                                            </td>
                                            <td className="px-4 py-3 text-center border-l space-x-2">
                                                <button onClick={() => handleCalculatePerformance(m.userId)} className="text-xs text-indigo-600 hover:underline">
                                                    Eval Perf.
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {members.length === 0 && <tr><td colSpan={3} className="text-center py-8 text-stone-400">No members found</td></tr>}
                                </tbody>
                            </table>
                        </div>

                        {performanceData && (
                            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl mt-4">
                                <h4 className="font-bold text-indigo-900 mb-2">Performance Result (User: {performanceData.userId})</h4>
                                <div className="grid grid-cols-4 gap-4 text-sm">
                                    <div className="bg-white p-3 rounded-lg border border-indigo-100"><div className="text-xs text-stone-500 uppercase">Score</div><div className="font-bold text-xl">{performanceData.score.toFixed(1)}</div></div>
                                    <div className="bg-white p-3 rounded-lg border border-indigo-100"><div className="text-xs text-stone-500 uppercase">Attendance</div><div className="font-bold text-xl">{(performanceData.attendanceRate * 100).toFixed(0)}%</div></div>
                                    <div className="bg-white p-3 rounded-lg border border-indigo-100"><div className="text-xs text-stone-500 uppercase">Events</div><div className="font-bold text-xl">{performanceData.eventsParticipated}</div></div>
                                    <div className="bg-white p-3 rounded-lg border border-indigo-100"><div className="text-xs text-stone-500 uppercase">Volunteer Hrs</div><div className="font-bold text-xl">{performanceData.volunteerHours}</div></div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Attendance Tab */}
                {activeTab === 'attendance' && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-stone-900">Mark Attendance</h3>

                        <div className="flex gap-4 items-center">
                            <label className="text-sm font-bold text-stone-700">Select Event:</label>
                            <select className="px-3 py-2 border border-stone-200 rounded-lg text-sm bg-white min-w-[200px]" value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)}>
                                {events.map(e => <option key={e.id} value={e.id}>{e.name} ({new Date(e.date).toLocaleDateString()})</option>)}
                            </select>
                        </div>

                        {selectedEventId ? (
                            <div className="border border-stone-200 rounded-xl overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-stone-50 border-b border-stone-200">
                                        <tr><th className="px-4 py-3 text-xs uppercase font-bold text-stone-500">Member</th><th className="px-4 py-3 text-xs uppercase font-bold text-stone-500 text-center">Status</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100">
                                        {members.map(m => {
                                            const record = attendances.find(a => a.userId === m.userId);
                                            const isPresent = record?.status === 'present';

                                            return (
                                                <tr key={m.userId}>
                                                    <td className="px-4 py-3 font-medium text-sm text-stone-900">{m.user?.name || m.userId}</td>
                                                    <td className="px-4 py-3 text-center space-x-2">
                                                        <button onClick={() => handleMarkAttendance(m.userId, 'present')} className={`px-3 py-1 text-xs rounded-full font-bold ${isPresent ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}>Present</button>
                                                        <button onClick={() => handleMarkAttendance(m.userId, 'absent')} className={`px-3 py-1 text-xs rounded-full font-bold ${!isPresent && record ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}>Absent</button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : <p className="text-stone-500 text-sm py-4">No events available.</p>}
                    </div>
                )}

                {/* Events Log Tab */}
                {activeTab === 'events' && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-stone-900">Events Managed By Express Backend</h3>
                        <p className="text-sm text-stone-500">Create events from the legacy Events layout, and they will stream their attendance data into here once synced.</p>
                        <div className="border border-stone-200 rounded-xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-stone-50 text-xs uppercase font-bold text-stone-500">
                                    <tr><th className="px-4 py-3">Event Name</th><th className="px-4 py-3">Date</th><th className="px-4 py-3 text-center">Attendance Count</th></tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {events.map(e => <tr key={e.id}><td className="px-4 py-3 font-semibold text-sm">{e.name}</td><td className="px-4 py-3 text-sm text-stone-600">{new Date(e.date).toLocaleDateString()}</td><td className="px-4 py-3 text-center font-mono bg-stone-50">{e._count?.attendances || 0}</td></tr>)}
                                    {events.length === 0 && <tr><td colSpan={3} className="text-center py-8 text-stone-400">No events synced yet.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
