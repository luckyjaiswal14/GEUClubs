const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = {
    // Membership
    addMembership: async (data: { userId: string, email: string, name: string, clubId: string, role: string }) => {
        const res = await fetch(`${BASE_URL}/membership/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    getMembers: async (clubId: string) => {
        const res = await fetch(`${BASE_URL}/membership/${clubId}`);
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    updateRole: async (data: { userId: string, clubId: string, role: string }) => {
        const res = await fetch(`${BASE_URL}/membership/role`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    // Events
    createEvent: async (data: any) => {
        const res = await fetch(`${BASE_URL}/events/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    getEvents: async (clubId: string) => {
        const res = await fetch(`${BASE_URL}/events/${clubId}`);
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    // Attendance
    markAttendance: async (data: { userId: string, eventId: string, status: string }) => {
        const res = await fetch(`${BASE_URL}/attendance/mark`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    getAttendance: async (eventId: string) => {
        const res = await fetch(`${BASE_URL}/attendance/${eventId}`);
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    addVolunteering: async (data: { userId: string, eventId: string, role: string, hours: number }) => {
        const res = await fetch(`${BASE_URL}/attendance/volunteer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    // Performance
    getPerformance: async (userId: string) => {
        const res = await fetch(`${BASE_URL}/performance/${userId}`);
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    calculatePerformance: async (userId: string) => {
        const res = await fetch(`${BASE_URL}/performance/calculate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    }
};
