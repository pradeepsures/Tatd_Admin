// import { useEffect, useState } from "react";
// import { Card } from "@mui/material";

// import Loader from "../../compoents/Loader";
// import { getUserPrivacyPolicy } from "../../Services/PrivacyPolicyApi";

// export default function UserPrivacyPolicy() {
//   const [policy, setPolicy] = useState("");
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const fetchPolicy = async () => {
//       try {
//         setLoading(true);

//         const res = await getUserPrivacyPolicy();

//         if (res?.status && res?.data?.privacyPolicy) {
//           setPolicy(res.data.privacyPolicy);
//         } else {
//           console.warn("No user policy found");
//         }
//       } catch (err) {
//         console.error("FETCH ERROR:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPolicy();
//   }, []);

//   if (loading) return <Loader />;

//   return (
//     <div className="min-h-screen bg-gray-50 px-4 py-8 md:px-10">
      
//       {/* ✅ HEADER */}
//       <div className="max-w-4xl mx-auto mb-6">
//         <h1 className="text-3xl font-semibold text-gray-800">
//           User Privacy Policy
//         </h1>
//         <p className="text-gray-500 text-sm mt-2">
//           Please read our privacy practices carefully.
//         </p>
//       </div>

//       {/* ✅ CONTENT */}
//       <div className="max-w-4xl mx-auto">
//         <Card className="p-6 md:p-8 rounded-2xl shadow-sm">
//           {policy ? (
//             <div
//               className="
//                 prose 
//                 max-w-none 
//                 prose-sm md:prose-base 
//                 prose-headings:text-gray-800
//                 prose-p:text-gray-600
//                 prose-li:text-gray-600
//               "
//               dangerouslySetInnerHTML={{ __html: policy }}
//             />
//           ) : (
//             <div className="text-center py-10 text-gray-500">
//               No User Privacy Policy Found
//             </div>
//           )}
//         </Card>
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { Card } from "@mui/material";

import Loader from "../../compoents/Loader";
import { getPrivacyPolicy } from "../../Services/PrivacyPolicyApi";

export default function UserPrivacyPolicy() {
  const [policy, setPolicy] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        setLoading(true);

        const res = await getPrivacyPolicy("user");
if (res?.status && res?.data?.length > 0) {
  setPolicy(res.data[0].privacyPolicy);
} else {
  console.warn("No user policy found");
}
        // if (res?.status && res?.data?.privacyPolicy) {
        //   setPolicy(res.data.privacyPolicy);cls
      

        // } else {
        //   console.warn("No user policy found");
        // }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicy();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="page-shell">

      {/* HEADER */}
      <div className="mx-auto w-full max-w-4xl">
        <p className="section-label">Legal</p>
        <h1 className="page-title">
          User Privacy Policy
        </h1>
        <p className="page-subtitle">
          Please read our privacy practices carefully.
        </p>
      </div>

      {/* CONTENT */}
      <div className="mx-auto w-full max-w-4xl">
        <Card className="card p-5 sm:p-8" elevation={0} sx={{ borderRadius: "18px", backgroundColor: "rgba(255,255,255,0.7)" }}>
          {policy ? (
            <div
              className="break-words text-[15px] leading-relaxed text-slate-700 [&_h1]:mb-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-slate-900 [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-slate-900 [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_a]:text-blue-700 [&_a]:underline [&_strong]:font-semibold [&_strong]:text-slate-900"
              dangerouslySetInnerHTML={{ __html: policy }}
            />
          ) : (
            <div className="py-14 text-center text-slate-400">
              No User Privacy Policy Found
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}