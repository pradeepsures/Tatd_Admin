// import { useEffect, useState } from "react";
// import { Card } from "@mui/material";

// import Loader from "../../compoents/Loader";
// import { getDriverPrivacyPolicy } from "../../Services/PrivacyPolicyApi";

// export default function DriverPrivacyPolicy() {
//   const [policy, setPolicy] = useState("");
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const fetchPolicy = async () => {
//       try {
//         setLoading(true);

//         const res = await getDriverPrivacyPolicy();

//         if (res?.status && res?.data?.privacyPolicy) {
//           setPolicy(res.data.privacyPolicy);
//         } else {
//           console.warn("No policy found");
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
//           Driver Privacy Policy
//         </h1>
//         <p className="text-gray-500 text-sm mt-2">
//           Please read our privacy practices for drivers carefully.
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
//               No Driver Privacy Policy Found
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
import { getPrivacyPolicy } from "../../Services/PrivacyPolicyApi"; // ✅ use common function

export default function DriverPrivacyPolicy() {
  const [policy, setPolicy] = useState("");
  const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const fetchPolicy = async () => {
//       try {
//         setLoading(true);

//         // ✅ FIX HERE (send type = driver)
//         const res = await getPrivacyPolicy("driver");

//         if (res?.status && res?.data?.privacyPolicy) {
//           setPolicy(res.data.privacyPolicy);
//         } else {
//           console.warn("No driver policy found");
//         }
//       } catch (err) {
//         console.error("FETCH ERROR:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPolicy();
//   }, []);

useEffect(() => {
  const fetchPolicy = async () => {
    try {
      setLoading(true);

      const res = await getPrivacyPolicy("driver");

      if (res?.status && res?.data?.length > 0) {
        setPolicy(res.data[0].privacyPolicy); // 🔥 MAIN FIX
      } else {
        console.warn("No driver policy found");
      }
    } catch (err) {
      console.error("FETCH ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchPolicy();
}, []);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 md:px-10">

      {/* HEADER */}
      <div className="max-w-4xl mx-auto mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">
          Driver Privacy Policy
        </h1>
        <p className="text-gray-500 text-sm mt-2">
          Please read our privacy practices for drivers carefully.
        </p>
      </div>

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto">
        <Card className="p-6 md:p-8 rounded-2xl shadow-sm">
          {policy ? (
            <div
              className="
                prose max-w-none 
                prose-sm md:prose-base 
                prose-headings:text-gray-800
                prose-p:text-gray-600
                prose-li:text-gray-600
              "
              dangerouslySetInnerHTML={{ __html: policy }}
            />
          ) : (
            <div className="text-center py-10 text-gray-500">
              No Driver Privacy Policy Found
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}