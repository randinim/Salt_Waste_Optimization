"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Home, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
    const router = useRouter();

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
            <div className="text-center px-6 max-w-md">
                <div className="mb-6 flex justify-center">
                    <div className="rounded-full bg-red-100 p-6">
                        <ShieldAlert className="h-16 w-16 text-red-600" />
                    </div>
                </div>

                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Access Denied
                </h1>

                <p className="text-lg text-gray-600 mb-2">
                    You don't have permission to access this page.
                </p>

                <p className="text-sm text-gray-500 mb-8">
                    This area is restricted to authorized users only. If you believe this is an error, please contact your administrator.
                </p>

                <div className="flex gap-4 justify-center">
                    <Button
                        onClick={() => router.back()}
                        variant="outline"
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Go Back
                    </Button>

                    <Button
                        onClick={() => router.push("/")}
                        className="gap-2 bg-red-600 hover:bg-red-700"
                    >
                        <Home className="h-4 w-4" />
                        Go Home
                    </Button>
                </div>

                <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs text-red-800">
                        <strong>Error Code:</strong> 403 - Forbidden
                    </p>
                </div>
            </div>
        </div>
    );
}
