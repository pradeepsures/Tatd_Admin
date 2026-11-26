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
    <div className="h-screen w-full overflow-y-auto bg-slate-100">
      <header className="relative overflow-hidden bg-[#111827]">
        <div className="relative mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-black ring-1 ring-white/10">
              <img src="/images/dvagoo.png" alt="Dvagoo" className="h-full w-full scale-[1.3] object-cover" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">Dvagoo</span>
          </div>
          <p className="mt-10 text-[11px] font-bold uppercase tracking-wide text-gray-300">Legal</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Terms and Conditions</h1>
        </div>
      </header>
      <main className="mx-auto -mt-10 max-w-3xl px-4 pb-12 sm:px-6">
        <div className="rounded-2xl bg-white p-6 shadow-xl shadow-slate-900/5 ring-1 ring-slate-200/70 sm:p-10">
        {loading ? (
          <div className="flex justify-center py-14">
            <Loader />
          </div>
        ) : (
          <div 
            className="break-words text-[15px] leading-relaxed text-slate-700 [&_h1]:mb-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-slate-900 [&_h2]:mb-3 [&_h2]:mt-7 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-slate-900 [&_p]:mb-3 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1.5 [&_a]:font-medium [&_a]:text-blue-700 [&_a]:underline [&_strong]:font-semibold [&_strong]:text-slate-900"
            dangerouslySetInnerHTML={{ __html: content }} 
          />
        )}
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">© Dvagoo. All rights reserved.</p>
      </main>
    </div>
  );
};

export default PublicTermsAndConditions;
