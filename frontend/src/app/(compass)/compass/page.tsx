"use client"
import React, { useState } from 'react';
import { UserRole } from '@/dtos/compass/types';

import { AppProvider } from '@/context/compass/AppContext';
import { Button } from '@/components/compass/Button';
import { Card } from '@/components/compass/Card';
import { Users, Truck, Compass } from 'lucide-react';
import { LandownerDashboard } from '@/app/(compass)/compass/landowner-dashboard/page';
import { SellerDashboard } from '@/app/(compass)/compass/seller-dashboard/page';
import LoginForm from '@/components/common/loginForm';

export default function Page() {
  // const [role, setRole] = useState<UserRole>(UserRole.NONE);

  // if (role === UserRole.LANDOWNER) {
  //   return (
  //     <AppProvider>
  //       <LandownerDashboard />
  //     </AppProvider>
  //   );
  // }

  // if (role === UserRole.SELLER) {
  //   return (
  //     <AppProvider>
  //       <SellerDashboard />
  //     </AppProvider>
  //   );
  // }

  return (
    // <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">

    //   {/* Decorative Background Elements */}
    //   <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[30%] bg-blue-200 rounded-full blur-[80px] opacity-40"></div>
    //   <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[40%] bg-emerald-200 rounded-full blur-[80px] opacity-40"></div>

    //   <div className="w-full max-w-sm z-10 text-center space-y-8">

    //     <div className="space-y-2">
    //       <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-md mb-4 text-blue-600">
    //         <Compass size={32} strokeWidth={2.5} />
    //       </div>
    //       <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">BrineX<span className="text-blue-600">.</span></h1>
    //       <p className="text-slate-500 text-lg">Intelligent Salt Production</p>
    //     </div>

    //     <div className="space-y-4 w-full">
    //       <Card
    //         onClick={() => setRole(UserRole.LANDOWNER)}
    //         className="group cursor-pointer border-2 border-transparent hover:border-emerald-500 transition-all active:scale-95 bg-white/80 backdrop-blur-sm"
    //       >
    //         <div className="flex items-center gap-4">
    //           <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
    //             <Users size={24} />
    //           </div>
    //           <div className="text-left">
    //             <h3 className="text-xl font-bold text-slate-800">Landowner</h3>
    //             <p className="text-sm text-slate-500">Manage Harvest & Profits</p>
    //           </div>
    //         </div>
    //       </Card>

    //       <Card
    //         onClick={() => setRole(UserRole.SELLER)}
    //         className="group cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all active:scale-95 bg-white/80 backdrop-blur-sm"
    //       >
    //         <div className="flex items-center gap-4">
    //           <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
    //             <Truck size={24} />
    //           </div>
    //           <div className="text-left">
    //             <h3 className="text-xl font-bold text-slate-800">Seller</h3>
    //             <p className="text-sm text-slate-500">Market Demand & Offers</p>
    //           </div>
    //         </div>
    //       </Card>
    //     </div>

    //     <p className="text-slate-400 text-xs mt-8">Version 2.0.1 • Mobile First</p>
    //   </div>
    // </div>
    <LoginForm type="compass" description="Access your brinex compass dashboard" />
  );
}