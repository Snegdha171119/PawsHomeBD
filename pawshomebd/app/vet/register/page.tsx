"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { z } from "zod";

// same rules as VetForm in the backend
const registerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    fullName: z.string().min(1, "Full name is required"),
    email: z.string()
        .min(1, "Email is required")
        .email("Invalid email"),
    password: z.string()
        .min(1, "Password is required")
        .min(6, "Password must be at least 6 characters"),
    phone: z.string()
        .regex(/^01[0-9]{9}$/, "Phone must be 11 digits and start with 01"),
});

export default function VetRegisterPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");

    const [nameError, setNameError] = useState("");
    const [fullNameError, setFullNameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [serverError, setServerError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setNameError("");
        setFullNameError("");
        setEmailError("");
        setPasswordError("");
        setPhoneError("");
        setServerError("");

        const result = registerSchema.safeParse({
            name,
            fullName,
            email,
            password,
            phone
        });

        // show each zod error under its own input
        if (!result.success) {
            result.error.issues.forEach((issue) => {
                const field = issue.path[0];

                if (field === "name") setNameError(issue.message);
                if (field === "fullName") setFullNameError(issue.message);
                if (field === "email") setEmailError(issue.message);
                if (field === "password") setPasswordError(issue.message);
                if (field === "phone") setPhoneError(issue.message);
            });

            return;
        }

        try {
            await axios.post(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/vet/createvet",
                result.data
            );

            alert("Vet registration successful");

            router.push("/vet/login");
        } catch (error: any) {
            console.error(error);

            if (error.response?.data?.message) {
                if (Array.isArray(error.response.data.message)) {
                    setServerError(error.response.data.message[0]);
                } else {
                    setServerError(error.response.data.message);
                }
            } else {
                setServerError("Registration failed");
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

            <div className="min-h-screen flex items-center justify-center px-4 py-10">

                <div className="card bg-[#fffaf2] text-gray-800 shadow-xl w-full max-w-md">

                    <div className="card-body p-6">

                        <h1 className="card-title justify-center text-2xl">
                            Vet Registration
                        </h1>

                        <p className="text-center text-gray-500">
                            Create your PawsHome BD veterinarian account
                        </p>

                        {serverError && (
                            <p className="text-error text-center text-sm">
                                {serverError}
                            </p>
                        )}

                        <form onSubmit={handleSubmit} noValidate>

                            <div className="mb-2">
                                <label className="block mb-1 font-medium">Name</label>
                                <input
                                    className="input input-bordered input-sm bg-white w-full"
                                    type="text"
                                    placeholder="Short name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                                {nameError && <p className="text-error text-xs mt-1">{nameError}</p>}
                            </div>

                            <div className="mb-2">
                                <label className="block mb-1 font-medium">Full Name</label>
                                <input
                                    className="input input-bordered input-sm bg-white w-full"
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                                {fullNameError && <p className="text-error text-xs mt-1">{fullNameError}</p>}
                            </div>

                            <div className="mb-2">
                                <label className="block mb-1 font-medium">Email</label>
                                <input
                                    className="input input-bordered input-sm bg-white w-full"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                {emailError && <p className="text-error text-xs mt-1">{emailError}</p>}
                            </div>

                            <div className="mb-2">
                                <label className="block mb-1 font-medium">Password</label>
                                <input
                                    className="input input-bordered input-sm bg-white w-full"
                                    type="password"
                                    placeholder="At least 6 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                {passwordError && <p className="text-error text-xs mt-1">{passwordError}</p>}
                            </div>

                            <div className="mb-4">
                                <label className="block mb-1 font-medium">Phone</label>
                                <input
                                    className="input input-bordered input-sm bg-white w-full"
                                    type="text"
                                    placeholder="01XXXXXXXXX"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                                {phoneError && <p className="text-error text-xs mt-1">{phoneError}</p>}
                            </div>

                            <button className="btn btn-primary w-full" type="submit">
                                Register
                            </button>

                        </form>

                        <p className="text-center text-sm mt-2">
                            Already have an account?{" "}
                            <Link href="/vet/login" className="link link-primary">
                                Login
                            </Link>
                        </p>

                    </div>
                </div>
            </div>
        </div>
    );
}
