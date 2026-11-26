import { useState } from "react";
import { Outlet } from "react-router-dom";
import Siderbar from "../compoents/Siderbar";
import Navbar from "../compoents/Navbar";

const Layout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="relative flex h-screen overflow-hidden bg-[#0b0d12]">
      <div className="app-wallpaper" aria-hidden="true" />

      <Siderbar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="relative z-10 flex min-w-0 flex-1 flex-col gap-2.5 p-2 sm:gap-3 sm:p-3 lg:pl-0">
        <Navbar onMenuClick={() => setMobileSidebarOpen(true)} />

        {/* Light glass sheet. The blur lives on its own layer (not an ancestor of
            the page) so `fixed` modals inside pages still cover the viewport. */}
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl sm:rounded-[22px]">
          <div className="glass-sheet pointer-events-none absolute inset-0 rounded-[inherit]" />
          <main className="app-main relative h-full overflow-auto">
            <div className="mx-auto w-full max-w-[1600px] min-w-0 px-3.5 py-5 sm:px-6 lg:px-8 lg:py-7">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
