import React from 'react'
import Profilelogo from "./Profilelogo"
import { IoMdNotificationsOutline } from "react-icons/io";

// bg-gradient-to-l  from-[#EA2829] to-[#800303]

const Navbar = () => {
  return (
    <div className="h-18  w-full bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] *left-right  shadow-md flex items-center px-6 ">

      <div className='flex'>
        <div className='  '>
          <h1 className='text-2xl font-bold italic flex text-white text-center mt-4 pb-3  shadow-lg tracking-wide'>WELCOME<span className='pl-1'></span></h1>

        </div>
        <div className=' right-3 top-0.5  flex absolute'>
          <div className='text-4xl mt-4 m-3 bg-[#FB8500] text-red-400 rounded-full'>
            {/* <IoMdNotificationsOutline /> */}
          </div>
          <div className=''>
            <Profilelogo></Profilelogo>
          </div>



        </div>
      </div>
    </div>
  );
};

export default Navbar;
