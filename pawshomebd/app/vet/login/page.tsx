"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { z } from "zod";

const loginSchema = z.object({
    email: z.string()
        .min(1, "Email is required")
        .email("Invalid email"),
    password: z.string()
        .min(1, "Password is required")
        .min(6, "Password must be at least 6 characters"),
});

export default function VetLoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [serverError, setServerError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setEmailError("");
        setPasswordError("");
        setServerError("");

        const result = loginSchema.safeParse({
            email,
            password
        });

        if (!result.success) {
            result.error.issues.forEach((issue) => {
                if (issue.path[0] === "email") setEmailError(issue.message);
                if (issue.path[0] === "password") setPasswordError(issue.message);
            });

            return;
        }

        try {
            const response = await axios.post(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/vet/auth/login",
                result.data
            );

            // each role keeps its own token so logins don't mix up
            localStorage.setItem("vet_token", response.data.access_token);

            router.push("/vet");
        } catch (error: any) {
            console.error(error);

            if (error.response?.data?.message) {
                setServerError(error.response.data.message);
            } else {
                setServerError("Login failed");
            }
        }
    };

    return (
        <div
            data-theme="valentine"
            className="min-h-screen bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/p.png')" }}
        >
            <Link
                href="/"
                className="absolute top-6 left-6 text-2xl font-bold text-white z-10"
            >
                PawsHome BD
            </Link>

            <div className="min-h-screen flex items-center justify-center px-4">

                <div className="card bg-[#fffaf2] text-gray-800 shadow-xl w-full max-w-md">

                    <div className="card-body p-6">

                        <h1 className="card-title justify-center text-2xl">
                            Vet Login
                        </h1>

                        <p className="text-center text-gray-500 mb-2">
                            Login to your PawsHome BD vet account
                        </p>

                        {serverError && (
                            <p className="text-error text-center text-sm">
                                {serverError}
                            </p>
                        )}

                        <form onSubmit={handleSubmit} noValidate>

                            <div className="mb-3">
                                <label className="block mb-1 font-medium">Email</label>
                                <input
                                    className="input input-bordered bg-white w-full"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                {emailError && <p className="text-error text-xs mt-1">{emailError}</p>}
                            </div>

                            <div className="mb-4">
                                <label className="block mb-1 font-medium">Password</label>
                                <input
                                    className="input input-bordered bg-white w-full"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                {passwordError && <p className="text-error text-xs mt-1">{passwordError}</p>}
                            </div>

                            <button className="btn btn-primary w-full" type="submit">
                                Login
                            </button>

                        </form>

                        <p className="text-center text-sm mt-2">
                            Don't have an account?{" "}
                            <Link href="/vet/register" className="link link-primary">
                                Register
                            </Link>
                        </p>

                    </div>
                </div>
            </div>
        </div>
    );
}
