import React, { useEffect, useState } from 'react';
import { getProfile, updateProfile } from '../Services/AuthApi';
import { useNavigate } from 'react-router-dom';
import { MdEdit, MdSave, MdCancel, MdCameraAlt } from 'react-icons/md';

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:9060";

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ userName: '', email: '' });
    const [profileImage, setProfileImage] = useState(null);
    const [previewImage, setPreviewImage] = useState('');
    const [saving, setSaving] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await getProfile();
            setProfile(data);
            setFormData({
                userName: data.userName || '',
                email: data.email || ''
            });
            // Handle image logic properly
            const formatImageUrl = (path) => {
                if (!path) return '/mannFleet2.png';
                if (path.startsWith('http')) return path;
                const host = BASE_URL.replace('/api', '');
                return `${host}${path.startsWith('/') ? '' : '/'}${path}`;
            };
            setPreviewImage(formatImageUrl(data.profileImage));
        } catch (error) {
            console.log(error);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const payload = new FormData();
            payload.append('userName', formData.userName);
            payload.append('email', formData.email);
            if (profileImage) {
                payload.append('profileImage', profileImage);
            }
            
            await updateProfile(payload);
            setIsEditing(false);
            fetchProfile(); 
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setProfileImage(null);
        setFormData({
            userName: profile?.userName || '',
            email: profile?.email || ''
        });
        
        const formatImageUrl = (path) => {
            if (!path) return '/mannFleet2.png';
            if (path.startsWith('http')) return path;
            const host = BASE_URL.replace('/api', '');
            return `${host}${path.startsWith('/') ? '' : '/'}${path}`;
        };
        setPreviewImage(formatImageUrl(profile?.profileImage));
    };

    if (!profile) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-[#d0d5dd]"></div></div>;

    return (
        <div className="page-shell">
            <div className="mx-auto flex w-full max-w-2xl flex-wrap items-center justify-between gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="btn-secondary"
                >
                    ← Back
                </button>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="btn-primary"
                    >
                        <MdEdit /> Edit Profile
                    </button>
                ) : (
                    <div className="flex flex-wrap gap-2.5">
                        <button
                            onClick={handleCancel}
                            disabled={saving}
                            className="btn-secondary"
                        >
                            <MdCancel /> Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn-success"
                        >
                            <MdSave /> {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </div>

            <div className="card mx-auto w-full max-w-2xl overflow-hidden">
                <div className="h-24 bg-[#111827] border-b border-gray-200"></div>
                <div className="px-5 pb-8 sm:px-8">
                {/* Profile Image */}
                <div className="relative mx-auto -mt-16 mb-8 flex w-max justify-center">
                    <img
                        src={previewImage || '/mannFleet2.png'}
                        alt="Profile"
                        className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-xl ring-1 ring-black/5"
                        onError={(e) => { 
                            if (!e.target.src.includes('mannFleet2.png')) {
                                e.target.src = '/mannFleet2.png';
                            }
                        }}
                    />
                    {isEditing && (
                        <label className="absolute bottom-1 right-1 cursor-pointer rounded-full bg-[#0b0f19] p-2 text-gray-300 shadow-md ring-2 ring-white transition hover:brightness-125">
                            <MdCameraAlt size={20} />
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </label>
                    )}
                </div>

                {/* Form Details */}
                <div className="space-y-5">
                    <div>
                        <label className="field-label">Full Name</label>
                        {isEditing ? (
                            <input
                                type="text"
                                className="field"
                                value={formData.userName}
                                onChange={(e) => setFormData({...formData, userName: e.target.value})}
                            />
                        ) : (
                            <p className="flex min-h-11 items-center rounded-xl border border-slate-200/70 bg-white/60 px-3.5 text-sm font-semibold text-slate-800 break-all">{profile.userName || "N/A"}</p>
                        )}
                    </div>
                    
                    <div>
                        <label className="field-label">Email Address</label>
                        {isEditing ? (
                            <input
                                type="email"
                                className="field"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                        ) : (
                            <p className="flex min-h-11 items-center rounded-xl border border-slate-200/70 bg-white/60 px-3.5 text-sm font-semibold text-slate-800 break-all">{profile.email || "N/A"}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 pt-5 border-t border-slate-200/70 mt-6 sm:grid-cols-2">
                        <div>
                            <label className="detail-label mb-1.5 block">Assigned Role</label>
                            <span className="badge-warning capitalize">
                                {profile.role?.name || "N/A"}
                            </span>
                        </div>
                        <div>
                            <label className="detail-label mb-1.5 block">Member Since</label>
                            <p className="text-sm font-semibold text-slate-800">
                                {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "N/A"}
                            </p>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;