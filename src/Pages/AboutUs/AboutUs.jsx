// import React, { useState, useEffect } from "react";
// import toast from "react-hot-toast";
// import RichTextEditor from "react-rte";
// import "react-rte/lib/RichTextEditor.css";
// import { getAllAboutUs, updateAboutUsApi } from "../../Services/AboutUsApi"; // You'll create this
// import Breaker from "../../compoents/Breaker";
// import Loader from "../../compoents/Loader";
// const AboutUs = () => {
//   const [activeType, setActiveType] = useState("user");
//   const [aboutValues, setAboutValues] = useState({
//     user: RichTextEditor.createEmptyValue(),
//     astrologer: RichTextEditor.createEmptyValue(),
//   });

//   const [aboutIds, setAboutIds] = useState({
//     user: "",
//     astrologer: "",
//   });

//   const [loading, setLoading] = useState(false);

//   const fetchAboutUs = async () => {
//     setLoading(true);
//     try {
//       const result = await getAllAboutUs({
//         page: 1,
//         rowsPerPage: 10,
//         searchQuery: "",
//       });

//       const data = result.data;

//       if (data.length < 2) {
//         toast.error("Expected at least 2 records.");
//         return;
//       }

//       setAboutValues({
//         user: RichTextEditor.createValueFromString(
//           data[0].aboutUs || "",
//           "html"
//         ),
//         astrologer: RichTextEditor.createValueFromString(
//           data[1].aboutUs || "",
//           "html"
//         ),
//       });

//       setAboutIds({
//         user: data[0]._id,
//         astrologer: data[1]._id,
//       });
//     } catch (err) {
//       toast.error(err.message || "Failed to fetch About Us!");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAboutUs();
//   }, []);

//   const handleTypeChange = (type) => setActiveType(type);

//   const handleInputChange = (value) => {
//     setAboutValues((prev) => ({
//       ...prev,
//       [activeType]: value,
//     }));
//   };

//   const handleUpdate = async () => {
//     const currentId = aboutIds[activeType];
//     const htmlContent = aboutValues[activeType].toString("html");

//     if (!currentId || htmlContent.trim() === "<p><br></p>") {
//       toast.error("Invalid content or ID!");
//       return;
//     }

//     try {
//       const result = await updateAboutUsApi({
//         id: currentId,
//         data: {
//           aboutUs: htmlContent,
//           type: activeType,
//         },
//       });

//       if (result.status) {
//         toast.success("About Us updated successfully!");
//       } else {
//         toast.error(result.message || "Update failed!");
//       }
//     } catch (err) {
//       toast.error(err.message || "Failed to update About Us!");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-5">
//       <div className="mb-6">
//         <Breaker />
//       </div>
//       <div className="max-w-9xl mx-auto bg-white rounded-lg shadow-lg p-6">
//         <h1 className="text-2xl font-bold text-red-600 mb-4">About Us</h1>

//         <div className="flex space-x-4 mb-6">
//           <button
//             onClick={() => handleTypeChange("user")}
//             className={`px-4 py-2 rounded-md font-semibold transition-colors ${
//               activeType === "user"
//                 ? "bg-gradient-to-l from-[#5F0099] to-[#9F00FF] text-white"
//                 : "bg-gray-200 text-gray-700"
//             }`}
//           >
//             User About
//           </button>
//           <button
//             onClick={() => handleTypeChange("astrologer")}
//             className={`px-4 py-2 rounded-md font-semibold transition-colors ${
//               activeType === "astrologer"
//                 ? "bg-gradient-to-l from-[#5F0099] to-[#9F00FF] text-white"
//                 : "bg-gray-200 text-gray-700"
//             }`}
//           >
//             Astrologer About
//           </button>
//         </div>

//         {loading ? (
//           <div className="text-center text-red-600">
//             <Loader></Loader>
//           </div>
//         ) : (
//           <div>
//             <RichTextEditor
//               value={aboutValues[activeType]}
//               onChange={handleInputChange}
//               className="min-h-[300px] border border-gray-300 rounded-md"
//               placeholder={`Enter ${activeType} About Us content...`}
//             />
//             <button
//               onClick={handleUpdate}
//               className="mt-4 px-6 py-2 bg-gradient-to-l from-[#5F0099] to-[#9F00FF] text-white rounded-md hover:bg-red-700 transition-colors"
//             >
//               Update About Us
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AboutUs;


import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import RichTextEditor from "react-rte";
import "react-rte/lib/RichTextEditor.css";

import { getAllAboutUs, updateAboutUsApi } from "../../Services/AboutUsApi";
import Breaker from "../../compoents/Breaker";
import Loader from "../../compoents/Loader";

const AboutUs = () => {
  const [activeType, setActiveType] = useState("user");

  const [aboutValues, setAboutValues] = useState({
    user: RichTextEditor.createEmptyValue(),
    driver: RichTextEditor.createEmptyValue(),
  });

  const [aboutIds, setAboutIds] = useState({
    user: "",
    driver: "",
  });

  const [loading, setLoading] = useState(false);

  // ✅ Fetch API
  const fetchAboutUs = async () => {
    setLoading(true);
    try {
      const result = await getAllAboutUs({
        page: 1,
        rowsPerPage: 10,
        searchQuery: "",
      });

      const list = result.data || [];

      // 🔥 Convert array → object by type
      const mappedValues = {
        user: RichTextEditor.createEmptyValue(),
        driver: RichTextEditor.createEmptyValue(),
      };

      const mappedIds = {
        user: "",
        driver: "",
      };

      list.forEach((item) => {
        const type = item.type; // "user" or "driver"

        mappedValues[type] = RichTextEditor.createValueFromString(
          item.content || "",
          "html"
        );

        mappedIds[type] = item._id;
      });

      setAboutValues(mappedValues);
      setAboutIds(mappedIds);
    } catch (err) {
      toast.error(err.message || "Failed to fetch About Us!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAboutUs();
  }, []);

  // ✅ Switch Tab
  const handleTypeChange = (type) => {
    setActiveType(type);
  };

  // ✅ Editor Change
  const handleInputChange = (value) => {
    setAboutValues((prev) => ({
      ...prev,
      [activeType]: value,
    }));
  };

  // ✅ Update API
  const handleUpdate = async () => {
    const currentId = aboutIds[activeType];
    const htmlContent = aboutValues[activeType].toString("html");

    if (!currentId || htmlContent.trim() === "<p><br></p>") {
      toast.error("Invalid content!");
      return;
    }

    try {
      const result = await updateAboutUsApi({
        id: currentId,
        data: {
          content: htmlContent, // 🔥 FIXED
          type: activeType,
        },
      });

      if (result.status) {
        toast.success("Updated successfully!");
      } else {
        toast.error(result.message || "Update failed!");
      }
    } catch (err) {
      toast.error(err.message || "Update failed!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-5">
      <Breaker />

      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">About Us</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => handleTypeChange("user")}
            className={`px-4 py-2 rounded ${
              activeType === "user"
                ? "bg-primary text-white"
                : "bg-gray-200"
            }`}
          >
            User
          </button>

          <button
            onClick={() => handleTypeChange("driver")}
            className={`px-4 py-2 rounded ${
              activeType === "driver"
                ? "bg-primary text-white"
                : "bg-gray-200"
            }`}
          >
            Driver
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center">
            <Loader />
          </div>
        ) : (
          <>
            <RichTextEditor
              value={aboutValues[activeType]}
              onChange={handleInputChange}
              className="min-h-[300px] border rounded"
            />

            <button
              onClick={handleUpdate}
              className="mt-4 px-6 py-2 bg-primary text-white rounded"
            >
              Update
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AboutUs;