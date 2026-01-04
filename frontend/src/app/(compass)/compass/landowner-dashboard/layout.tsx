import { AppProvider } from '@/context/compass/AppContext';
import React from 'react';

export default function LandownerDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <section className="min-h-screen w-full">
            <AppProvider>
                {children}
            </AppProvider>
        </section>
    );
}
