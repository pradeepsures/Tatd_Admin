import React from 'react'
import Profilelogo from "./Profilelogo"
import { HiMenuAlt3 } from "react-icons/hi";
import { useAuth } from "../auth/AuthContext";

const Navbar = ({ onMenuClick }) => {
  const { auth } = useAuth();
  const displayName = auth?.user?.userName || auth?.user?.email?.split("@")[0] || "Admin";

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between bg-white border-b border-gray-200 px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 lg:hidden"
          aria-label="Open menu"
        >
          <HiMenuAlt3 size={22} />
        </button>
        <div>
          <h1 className="text-base font-semibold text-gray-800">Tatd Admin</h1>
          <p className="hidden sm:block text-xs text-gray-500">
            {displayName}
            {auth?.user?.role?.name && (
              <span className="ml-2 text-blue-600">· {auth.user.role.name}</span>
            )}
          </p>
        </div>
      </div>

      <div className='flex shrink-0 items-center gap-4'>
        {/* You can add notification bells or search icons here in the future */}
        <div className="h-8 w-[1px] bg-gray-200 hidden sm:block"></div>
        <div className='scale-90 sm:scale-100'>
          <Profilelogo />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
