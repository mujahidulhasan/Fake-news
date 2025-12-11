import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../components/GlassCard';
import { PremiumUser } from '../../types';
import { UserService } from '../../services/userService';
import { Link } from 'react-router-dom';

const Icons = {
    Back: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
    Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
    Edit: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="20 6 9 17 4 12"/></svg>,
    X: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
};

export const UserControl: React.FC = () => {
    const [users, setUsers] = useState<PremiumUser[]>([]);
    const [editingUser, setEditingUser] = useState<Partial<PremiumUser> | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        const data = await UserService.getAll();
        setUsers(data);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        
        try {
            if (isCreating) {
                if (!editingUser.username || !editingUser.password || !editingUser.start_date || !editingUser.end_date) {
                    alert("Please fill all fields");
                    return;
                }
                await UserService.create({
                    username: editingUser.username,
                    password: editingUser.password,
                    start_date: editingUser.start_date,
                    end_date: editingUser.end_date,
                    is_active: editingUser.is_active ?? true
                });
            } else if (editingUser.id) {
                const updates: any = { ...editingUser };
                delete updates.id; 
                if (!updates.password) delete updates.password; 
                await UserService.update(editingUser.id, updates);
            }
            setEditingUser(null);
            setIsCreating(false);
            loadUsers();
        } catch (err) {
            alert("Error saving user.");
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Delete user?")) {
            await UserService.delete(id);
            loadUsers();
        }
    };

    const formatDateShort = (dateStr: string) => {
        const d = new Date(dateStr);
        return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear().toString().slice(-2)}`;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-6">
                <Link to="/admin/dashboard" className="text-gray-500 hover:text-gray-800"><Icons.Back /></Link>
                <h1 className="text-xl font-bold text-gray-800">Premium Users</h1>
                <button 
                    onClick={() => { setIsCreating(true); setEditingUser({ is_active: true }); }}
                    className="ml-auto bg-primary text-white p-2 rounded-full shadow hover:bg-red-600"
                    title="Add User"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
            </div>

            {/* Editor Modal */}
            {(editingUser || isCreating) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <GlassCard className="w-full max-w-sm p-6">
                        <h3 className="text-lg font-bold mb-4">{isCreating ? 'Create' : 'Edit'} User</h3>
                        <form onSubmit={handleSave} className="space-y-3">
                            <input className="w-full p-2 border rounded text-sm" placeholder="Username" value={editingUser?.username || ''} onChange={e => setEditingUser(prev => ({...prev, username: e.target.value}))} />
                            <input className="w-full p-2 border rounded text-sm" type="text" placeholder={isCreating ? "Password" : "New Password (Optional)"} value={editingUser?.password || ''} onChange={e => setEditingUser(prev => ({...prev, password: e.target.value}))} />
                            <div className="grid grid-cols-2 gap-2">
                                <div><label className="text-xs text-gray-500">Start</label><input type="date" className="w-full p-1 border rounded text-xs" value={editingUser?.start_date ? new Date(editingUser.start_date).toISOString().split('T')[0] : ''} onChange={e => setEditingUser(prev => ({...prev, start_date: new Date(e.target.value).toISOString()}))} /></div>
                                <div><label className="text-xs text-gray-500">End</label><input type="date" className="w-full p-1 border rounded text-xs" value={editingUser?.end_date ? new Date(editingUser.end_date).toISOString().split('T')[0] : ''} onChange={e => setEditingUser(prev => ({...prev, end_date: new Date(e.target.value).toISOString()}))} /></div>
                            </div>
                            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editingUser?.is_active ?? true} onChange={e => setEditingUser(prev => ({...prev, is_active: e.target.checked}))} /> Active</label>
                            <div className="flex gap-2 mt-2">
                                <button type="submit" className="flex-1 bg-primary text-white py-1.5 rounded">Save</button>
                                <button type="button" onClick={() => { setEditingUser(null); setIsCreating(false); }} className="flex-1 bg-gray-200 text-gray-700 py-1.5 rounded">Cancel</button>
                            </div>
                        </form>
                    </GlassCard>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map(user => (
                    <div key={user.id} className="bg-white p-4 rounded-lg shadow border border-gray-100 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-800">{user.username}</span>
                                {user.is_active ? <Icons.Check /> : <Icons.X />}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {formatDateShort(user.start_date)} - {formatDateShort(user.end_date)}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => { setEditingUser(user); setIsCreating(false); }} className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"><Icons.Edit /></button>
                            <button onClick={() => handleDelete(user.id)} className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100"><Icons.Trash /></button>
                        </div>
                    </div>
                ))}
                {users.length === 0 && <p className="text-gray-400 text-center col-span-3">No users.</p>}
            </div>
        </div>
    );
};