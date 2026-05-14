import React, { useEffect, useState } from 'react';
import { getProfile } from '../Services/AuthApi';
import { useNavigate } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_BASE_URL;

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await getProfile();
            setProfile(data);
        } catch (error) {
            console.log(error);
        }
    };

    if (!profile) return <div className="p-6">Loading...</div>;

    return (
        <div className="p-6">

            {/* 🔙 Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
            >
                ← Back
            </button>

            <div className="max-w-md mx-auto bg-white shadow-lg rounded-2xl p-6">

                {/* Profile Image */}
                <div className="flex justify-center mb-4">
                    <img
                        src="/mannFleet2.png"
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border shadow"
                    />
                </div>

                {/* Basic Details */}
                <div className="space-y-3 text-center">
                    <h2 className="text-xl font-bold">{profile.userName || "N/A"}</h2>
                    <p className="text-gray-600">{profile.email || "N/A"}</p>

                    <p className="text-sm text-gray-500">
                        Status: {profile.status || "N/A"}
                    </p>

                    <p className="text-sm text-gray-500">
                        Role: {profile.role?.name || "N/A"}
                    </p>

                    <p className="text-sm text-gray-500">
                        Joined: {profile.createdAt
                            ? new Date(profile.createdAt).toLocaleDateString()
                            : "N/A"}
                    </p>
                </div>

            </div>
        </div>
    );
};

export default ProfilePage;