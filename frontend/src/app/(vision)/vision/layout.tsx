import type { Metadata } from "next";
import "./vision-globals.css";
// import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/vision/ErrorReporter";
import Script from "next/script";

export const metadata: Metadata = {
  title: "BRINEX - Vision",
  description: "AI-powered Salt Quality Inspection System for Industrial Salterns",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ErrorReporter />
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
        />
        {children}
        {/* <VisualEditsMessenger /> */}
      </body>
    </html>
  );
}