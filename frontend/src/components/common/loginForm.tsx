"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, AlertCircle } from "lucide-react";
import Image from "next/image";

export default function LoginForm({
    type,
    description,
}: {
    type: "crystal" | "compass" | "vision" | "valor";
    description: string;
}) {
    const { login, error: authError, isLoading } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [localError, setLocalError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        try {
            await login({ email, password });
            // Redirect is handled by auth context based on user role
        } catch (err) {
            // Error is already set in auth context
            console.error("Login failed:", err);
        }
    };

    const displayError = authError || localError;

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="relative z-10 w-full max-w-md px-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
                    <div className="mb-6">
                        <Image
                            src={
                                type === 'vision'
                                    ? '/assets/images/vision-logo.svg'
                                    : type === 'crystal'
                                        ? '/assets/images/crystal-logo.svg'
                                        : type === 'compass'
                                            ? '/assets/images/compass-logo.svg'
                                            : '/assets/images/valor-logo.svg'
                            }
                            alt={"logo"}
                            width={150}
                            height={150}
                        />
                        <h2 className="text-2xl font-semibold text-slate-900 mt-4 tracking-tighter">
                            Sign In
                        </h2>
                        <p className="mt-1 text-sm text-slate-600">
                            {description}
                        </p>
                    </div>

                    {displayError && (
                        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-800">{displayError}</p>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                                Email Address
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@saltqc.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                                Password
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className={`h-12 w-full ${type === 'vision'
                                    ? 'bg-vision-500 hover:bg-vision-400'
                                    : type === 'crystal'
                                        ? 'bg-crystal-500 hover:bg-crystal-400'
                                        : type === 'compass'
                                            ? 'bg-compass-500 hover:bg-compass-400'
                                            : 'bg-valor-500 hover:bg-valor-400'
                                } font-semibold text-white shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isLoading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
