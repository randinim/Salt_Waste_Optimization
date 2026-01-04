"use client";
import LoginForm from "@/components/common/loginForm";
import { DashboardLayout } from "@/components/crystal/dashboard-layout";
import { ProductionDashboard } from "@/components/crystal/production-dashboard";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Page() {

  return (
    <LoginForm type={'crystal'} description="Access your production analysis dashboard" />
    // <DashboardLayout>
    //   <ProductionDashboard />
    // </DashboardLayout>
  );
}
