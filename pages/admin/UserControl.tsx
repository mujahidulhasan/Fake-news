import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../components/GlassCard';
import { PremiumUser } from '../../types';
import { UserService } from '../../services/userService';
import { Link } from 'react-router-dom';

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
                    password: editingUser.password, // Storing plain text as requested by user for manual editing visibility
                    start_date: editingUser.start_date,
                    end_date: editingUser.end_date,
                    is_active: editingUser.is_active ?? true
                });
            } else if (editingUser.id) {
                // Update
                const updates: any = { ...editingUser };
                delete updates.id; 
                if (!updates.password) delete updates.password; // Don't overwrite if empty
                await UserService.update(editingUser.id, updates);
            }
            setEditingUser(null);
            setIsCreating(false);
            loadUsers();
        } catch (err) {
            alert("Error saving user. Username might be duplicate.");
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Delete this user?")) {
            await UserService.delete(id);
            loadUsers();
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-6">
                <Link to="/admin/dashboard" className="text-gray-500 hover:text-gray-800">&larr; Back</Link>
                <h1 className="text-2xl font-bold text-gray-800">User Control (Premium)</h1>
                <button 
                    onClick={() => { setIsCreating(true); setEditingUser({ is_active: true }); }}
                    className="ml-auto bg-primary text-white px-4 py-2 rounded font-bold hover:bg-red-600"
                >
                    + Add User
                </button>
            </div>

            {/* Editor Modal/Form */}
            {(editingUser || isCreating) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <GlassCard className="w-full max-w-md p-6">
                        <h3 className="text-lg font-bold mb-4">{isCreating ? 'Create User' : 'Edit User'}</h3>
                        <form onSubmit={handleSave} className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-500">Username</label>
                                <input className="w-full p-2 border rounded" value={editingUser?.username || ''} onChange={e => setEditingUser(prev => ({...prev, username: e.target.value}))} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500">Password</label>
                                <input className="w-full p-2 border rounded" type="text" value={editingUser?.password || ''} onChange={e => setEditingUser(prev => ({...prev, password: e.target.value}))} placeholder={isCreating ? "Required" : "Leave blank to keep current"} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500">Start Date</label>
                                    <input type="date" className="w-full p-2 border rounded" value={editingUser?.start_date ? new Date(editingUser.start_date).toISOString().split('T')[0] : ''} onChange={e => setEditingUser(prev => ({...prev, start_date: new Date(e.target.value).toISOString()}))} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500">End Date</label>
                                    <input type="date" className="w-full p-2 border rounded" value={editingUser?.end_date ? new Date(editingUser.end_date).toISOString().split('T')[0] : ''} onChange={e => setEditingUser(prev => ({...prev, end_date: new Date(e.target.value).toISOString()}))} />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-bold">Active Status:</label>
                                <input type="checkbox" checked={editingUser?.is_active ?? true} onChange={e => setEditingUser(prev => ({...prev, is_active: e.target.checked}))} className="w-5 h-5 accent-primary" />
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button type="submit" className="flex-1 bg-primary text-white py-2 rounded">Save</button>
                                <button type="button" onClick={() => { setEditingUser(null); setIsCreating(false); }} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded">Cancel</button>
                            </div>
                        </form>
                    </GlassCard>
                </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 text-sm font-bold text-gray-600">Username</th>
                            <th className="p-4 text-sm font-bold text-gray-600">Access Period</th>
                            <th className="p-4 text-sm font-bold text-gray-600">Status</th>
                            <th className="p-4 text-sm font-bold text-gray-600 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="p-4 font-medium">{user.username}</td>
                                <td className="p-4 text-sm text-gray-500">
                                    {new Date(user.start_date).toLocaleDateString()} - {new Date(user.end_date).toLocaleDateString()}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {user.is_active ? 'ACTIVE' : 'INACTIVE'}
                                    </span>
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    <button onClick={() => { setEditingUser(user); setIsCreating(false); }} className="text-blue-500 hover:underline text-sm font-bold">Edit</button>
                                    <button onClick={() => handleDelete(user.id)} className="text-red-500 hover:underline text-sm font-bold">Delete</button>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-400">No premium users found.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};