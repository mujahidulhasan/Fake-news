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
    Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    Image: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
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
                    is_active: editingUser.is_active ?? true,
                    quota_limit: editingUser.quota_limit ?? 100,
                    quota_used: 0
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
        if(!dateStr) return '';
        const d = new Date(dateStr);
        return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear().toString().slice(-2)}`;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Link to="/admin/dashboard" className="text-gray-500 hover:text-gray-800"><Icons.Back /></Link>
                    <h1 className="text-xl font-bold text-gray-800">Users</h1>
                </div>
                <button 
                    onClick={() => { setIsCreating(true); setEditingUser({ is_active: true, quota_limit: 100 }); }}
                    className="w-10 h-10 bg-primary text-white rounded-full shadow hover:bg-red-600 flex items-center justify-center"
                    title="Add User"
                >
                    <Icons.Plus />
                </button>
            </div>

            {/* Editor Modal */}
            {(editingUser || isCreating) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <GlassCard className="w-full max-w-sm p-6">
                        <h3 className="text-lg font-bold mb-4 text-gray-800">{isCreating ? 'Create' : 'Edit'} User</h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <input className="w-full p-2 border rounded bg-gray-50 text-sm" placeholder="Username" value={editingUser?.username || ''} onChange={e => setEditingUser(prev => ({...prev, username: e.target.value}))} />
                            <input className="w-full p-2 border rounded bg-gray-50 text-sm" type="text" placeholder={isCreating ? "Password" : "New Password (Optional)"} value={editingUser?.password || ''} onChange={e => setEditingUser(prev => ({...prev, password: e.target.value}))} />
                            
                            <div className="grid grid-cols-2 gap-2">
                                <div><label className="text-[10px] uppercase font-bold text-gray-400">Start Date</label><input type="date" className="w-full p-2 border rounded text-xs" value={editingUser?.start_date ? new Date(editingUser.start_date).toISOString().split('T')[0] : ''} onChange={e => setEditingUser(prev => ({...prev, start_date: new Date(e.target.value).toISOString()}))} /></div>
                                <div><label className="text-[10px] uppercase font-bold text-gray-400">End Date</label><input type="date" className="w-full p-2 border rounded text-xs" value={editingUser?.end_date ? new Date(editingUser.end_date).toISOString().split('T')[0] : ''} onChange={e => setEditingUser(prev => ({...prev, end_date: new Date(e.target.value).toISOString()}))} /></div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-400">Quota Limit</label>
                                    <input type="number" className="w-full p-2 border rounded text-sm" value={editingUser?.quota_limit || 0} onChange={e => setEditingUser(prev => ({...prev, quota_limit: parseInt(e.target.value)}))} />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-400">Used</label>
                                    <input type="number" className="w-full p-2 border rounded text-sm bg-gray-100" value={editingUser?.quota_used || 0} disabled />
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="isActive" className="w-4 h-4" checked={editingUser?.is_active ?? true} onChange={e => setEditingUser(prev => ({...prev, is_active: e.target.checked}))} /> 
                                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active Account</label>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button type="submit" className="flex-1 bg-primary text-white py-2 rounded font-bold shadow-sm">Save</button>
                                <button type="button" onClick={() => { setEditingUser(null); setIsCreating(false); }} className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 rounded font-bold">Cancel</button>
                            </div>
                        </form>
                    </GlassCard>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map(user => (
                    <div key={user.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <div className="pl-3 flex items-start justify-between">
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg">{user.username}</h3>
                                <p className="text-xs text-gray-400 font-mono mt-1">{formatDateShort(user.start_date)} - {formatDateShort(user.end_date)}</p>
                                
                                <div className="flex items-center gap-1 mt-3 text-xs font-bold text-gray-600 bg-gray-100 py-1 px-2 rounded w-fit">
                                    <Icons.Image /> 
                                    <span>{user.quota_used} / {user.quota_limit}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setEditingUser(user); setIsCreating(false); }} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Icons.Edit /></button>
                                <button onClick={() => handleDelete(user.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Icons.Trash /></button>
                            </div>
                        </div>
                    </div>
                ))}
                {users.length === 0 && <div className="col-span-3 text-center py-10 text-gray-400">No users found. Click + to add one.</div>}
            </div>
        </div>
    );
};