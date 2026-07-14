import React, { useState, useEffect } from 'react';
import Loader from '../../compoents/Loader';

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:9060";

const PublicTermsAndConditions = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/user/termsConditions`);
        if (!res.ok) throw new Error("Failed to fetch");
        
        const result = await res.json();
        const data = result.data || [];
        const userData = data.find(item => item.type === "user");

        if (userData && userData.termCondition) {
          setContent(userData.termCondition);
        } else {
          setContent("<p>Terms and Conditions not found.</p>");
        }
      } catch (err) {
        console.error("Failed to fetch terms:", err);
        setContent("<p>Error loading Terms and Conditions. Please try again later.</p>");
      } finally {
        setLoading(false);
      }
    };

    fetchTerms();
  }, []);

  return (
    <div style={{ height: '100vh', overflowY: 'auto', backgroundColor: '#fff', width: '100%' }}>
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', color: '#333' }}>
        <h1 style={{ color: '#2c3e50', textAlign: 'center', marginBottom: '20px' }}>Terms and Conditions</h1>
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <Loader />
          </div>
        ) : (
          <div 
            className="prose max-w-none" 
            dangerouslySetInnerHTML={{ __html: content }} 
          />
        )}
      </div>
    </div>
  );
};

export default PublicTermsAndConditions;
