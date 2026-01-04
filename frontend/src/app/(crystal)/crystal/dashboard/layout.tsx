"use client";

import { DashboardLayout } from "@/components/crystal/dashboard-layout";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { UserRole } from "@/dtos/auth.dto";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute
      requiredRole={[UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.SALTSOCIETY]}
      redirectTo="/"
    >
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}
