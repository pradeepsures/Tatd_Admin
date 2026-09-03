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

    if (!profile) return <div className="p-6 flex justify-center mt-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

    return (
        <div className="p-6">
            <div className="mb-6 flex justify-between items-center">
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg text-sm font-medium shadow-sm transition-colors"
                >
                    ← Back
                </button>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
                    >
                        <MdEdit /> Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-3">
                        <button
                            onClick={handleCancel}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
                        >
                            <MdCancel /> Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
                        >
                            <MdSave /> {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </div>

            <div className="max-w-xl mx-auto bg-white shadow-sm border border-gray-100 rounded-2xl p-8">
                {/* Profile Image */}
                <div className="flex justify-center mb-8 relative w-max mx-auto">
                    <img
                        src={previewImage || '/mannFleet2.png'}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                        onError={(e) => { 
                            if (!e.target.src.includes('mannFleet2.png')) {
                                e.target.src = '/mannFleet2.png';
                            }
                        }}
                    />
                    {isEditing && (
                        <label className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 shadow-md transition-colors">
                            <MdCameraAlt size={20} />
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </label>
                    )}
                </div>

                {/* Form Details */}
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                        {isEditing ? (
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                value={formData.userName}
                                onChange={(e) => setFormData({...formData, userName: e.target.value})}
                            />
                        ) : (
                            <p className="text-gray-900 font-medium px-4 py-2 bg-gray-50 rounded-lg border border-transparent">{profile.userName || "N/A"}</p>
                        )}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                        {isEditing ? (
                            <input
                                type="email"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                        ) : (
                            <p className="text-gray-900 font-medium px-4 py-2 bg-gray-50 rounded-lg border border-transparent">{profile.email || "N/A"}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 mt-6">
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Assigned Role</label>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 capitalize">
                                {profile.role?.name || "N/A"}
                            </span>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Member Since</label>
                            <p className="text-sm font-medium text-gray-600">
                                {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "N/A"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;