import React, { useEffect, useState } from "react";
import { Tabs, Button } from "antd";
import * as XLSX from "xlsx";
import Breaker from "../../compoents/Breaker";
import Loader from "../../compoents/Loader";
import { getPunchesTodaySummary } from "../../Services/PunchesApi";

const { TabPane } = Tabs;

export default function PunchTodaySummary() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await getPunchesTodaySummary();
      if (res?.status) setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const downloadExcel = (list, fileName) => {
    if (!list || list.length === 0) return;

    const sheet = XLSX.utils.json_to_sheet(
      list.map((d) => ({
        Name: d.name || "N/A",
        Phone: d.phone || "N/A",
        PunchedIn: d.isPunchedIn ? "Yes" : "No",
      }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "Drivers");

    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  if (loading || !data) return <Loader />;

  const renderList = (list) => (
    <div className="mt-6">
      {list.length === 0 ? (
        <p className="text-gray-500">No Data</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {list.map((d) => (
            <div
              key={d._id}
              className="p-4 bg-white rounded-xl shadow border flex justify-between"
            >
              <div>
                <p className="font-medium">{d.name || "N/A"}</p>
                <p className="text-sm text-gray-500">{d.phone}</p>
              </div>

              <span
                className={`text-xs px-3 py-1 rounded-full ${
                  d.isPunchedIn
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {d.isPunchedIn ? "IN" : "OUT"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

//   return (

//     <div className="p-6 bg-gray-50 min-h-screen">
//       <Breaker />

//       <h2 className="text-2xl font-semibold mb-4">
//         Today Punch Summary
//       </h2>

//       <p className="text-gray-500 mb-6">
//         Total Drivers: {data.totalDrivers}
//       </p>

//       <Tabs defaultActiveKey="1">

//         {/* ✅ PUNCHED IN */}
//         <TabPane
//           tab={`Punched In (${data.todayPunchIn.count})`}
//           key="1"
//         >
//           <Button
//             className="mb-4"
//             onClick={() =>
//               downloadExcel(
//                 data.todayPunchIn.drivers,
//                 "Punched_In"
//               )
//             }
//           >
//             Download Excel
//           </Button>

//           {renderList(data.todayPunchIn.drivers)}
//         </TabPane>

//         {/* ❌ NOT PUNCHED IN */}
//         <TabPane
//           tab={`Not Punched In (${data.todayNotPunchIn.count})`}
//           key="2"
//         >
//           <Button
//             className="mb-4"
//             onClick={() =>
//               downloadExcel(
//                 data.todayNotPunchIn.drivers,
//                 "Not_Punched_In"
//               )
//             }
//           >
//             Download Excel
//           </Button>

//           {renderList(data.todayNotPunchIn.drivers)}
//         </TabPane>

//         {/* ✅ PUNCHED OUT */}
//         <TabPane
//           tab={`Punched Out (${data.todayPunchOut.count})`}
//           key="3"
//         >
//           <Button
//             className="mb-4"
//             onClick={() =>
//               downloadExcel(
//                 data.todayPunchOut.drivers,
//                 "Punched_Out"
//               )
//             }
//           >
//             Download Excel
//           </Button>

//           {renderList(data.todayPunchOut.drivers)}
//         </TabPane>

//         {/* ❌ NOT PUNCHED OUT */}
//         <TabPane
//           tab={`Not Punched Out (${data.todayNotPunchOut.count})`}
//           key="4"
//         >
//           <Button
//             className="mb-4"
//             onClick={() =>
//               downloadExcel(
//                 data.todayNotPunchOut.drivers,
//                 "Not_Punched_Out"
//               )
//             }
//           >
//             Download Excel
//           </Button>

//           {renderList(data.todayNotPunchOut.drivers)}
//         </TabPane>

//       </Tabs>
//     </div>
//   );
return (
  <div className="p-6 bg-gray-50 min-h-screen">
    <Breaker />

    {/* 🔙 BACK BUTTON */}
    <button
      onClick={() => window.history.back()}
      className="mb-4 bg-gray-700 text-white px-5 py-2 rounded-lg shadow hover:bg-gray-800 transition"
    >
      ← Back
    </button>

    {/* ✅ HEADER */}
    <div className="bg-white p-5 rounded-xl shadow mb-6 flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">
          Today Punch Summary
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Total Drivers:{" "}
          <span className="font-semibold text-gray-800">
            {data.totalDrivers}
          </span>
        </p>
      </div>
    </div>

    {/* ✅ TABS */}
    <div className="bg-white p-4 rounded-xl shadow">
      <Tabs defaultActiveKey="1">

        {/* ✅ PUNCHED IN */}
        <TabPane
          tab={
            <span className="text-green-600 font-medium">
              Punched In ({data.todayPunchIn.count})
            </span>
          }
          key="1"
        >
          <Button
            className="mb-4 !bg-green-600 !text-white hover:!bg-green-700"
            onClick={() =>
              downloadExcel(
                data.todayPunchIn.drivers,
                "Punched_In"
              )
            }
          >
            ⬇ Download Excel
          </Button>

          {renderList(data.todayPunchIn.drivers)}
        </TabPane>

        {/* ❌ NOT PUNCHED IN */}
        <TabPane
          tab={
            <span className="text-red-600 font-medium">
              Not Punched In ({data.todayNotPunchIn.count})
            </span>
          }
          key="2"
        >
          <Button
            className="mb-4 !bg-red-600 !text-white hover:!bg-red-700"
            onClick={() =>
              downloadExcel(
                data.todayNotPunchIn.drivers,
                "Not_Punched_In"
              )
            }
          >
            ⬇ Download Excel
          </Button>

          {renderList(data.todayNotPunchIn.drivers)}
        </TabPane>

        {/* ✅ PUNCHED OUT */}
        <TabPane
          tab={
            <span className="text-blue-600 font-medium">
              Punched Out ({data.todayPunchOut.count})
            </span>
          }
          key="3"
        >
          <Button
            className="mb-4 !bg-blue-600 !text-white hover:!bg-blue-700"
            onClick={() =>
              downloadExcel(
                data.todayPunchOut.drivers,
                "Punched_Out"
              )
            }
          >
            ⬇ Download Excel
          </Button>

          {renderList(data.todayPunchOut.drivers)}
        </TabPane>

        {/* ❌ NOT PUNCHED OUT */}
        <TabPane
          tab={
            <span className="text-orange-600 font-medium">
              Not Punched Out ({data.todayNotPunchOut.count})
            </span>
          }
          key="4"
        >
          <Button
            className="mb-4 !bg-orange-500 !text-white hover:!bg-orange-600"
            onClick={() =>
              downloadExcel(
                data.todayNotPunchOut.drivers,
                "Not_Punched_Out"
              )
            }
          >
            ⬇ Download Excel
          </Button>

          {renderList(data.todayNotPunchOut.drivers)}
        </TabPane>

      </Tabs>
    </div>
  </div>
);
}