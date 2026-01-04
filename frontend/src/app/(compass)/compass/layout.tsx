import "./compass-globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Compass | BRINEX",
    description: "Compass application section",
};

export default function CompassLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen">
            {children}
        </div>
    );
}

