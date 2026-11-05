"use client";

import { useState } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

const registerSchema = z.object({
    fullName: z
        .string()
        .min(1, "Full name is required"),

    email: z
        .string()
        .min(1, "Email is required")
        .email("Invalid email")
        .regex(
            /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/,
            "Email cannot contain uppercase letters"
        ),

    password: z
        .string()
        .min(1, "Password is required")
        .min(6, "Password must be at least 6 characters")
        .regex(
            /^(?=.*[A-Z])/,
            "Password must contain at least one uppercase character"
        ),

    gender: z
        .string()
        .min(1, "Gender is required")
        .regex(
            /^(male|female)$/i,
            "Gender must be male or female"
        ),

    phone: z
        .string()
        .min(1, "Phone number is required")
        .regex(
            /^[0-9]+$/,
            "Phone number must contain only numbers"
        ),
});

export default function RegisterPage() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [gender, setGender] = useState("");
    const [phone, setPhone] = useState("");

    const [fullNameError, setFullNameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [genderError, setGenderError] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [serverError, setServerError] = useState("");

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setFullNameError("");
        setEmailError("");
        setPasswordError("");
        setGenderError("");
        setPhoneError("");
        setServerError("");

        const result = registerSchema.safeParse({
            fullName,
            email,
            password,
            gender,
            phone,
        });

        if (!result.success) {
            result.error.issues.forEach((issue) => {
                if (issue.path[0] === "fullName") {
                    setFullNameError(issue.message);
                }

                if (issue.path[0] === "email") {
                    setEmailError(issue.message);
                }

                if (issue.path[0] === "password") {
                    setPasswordError(issue.message);
                }

                if (issue.path[0] === "gender") {
                    setGenderError(issue.message);
                }

                if (issue.path[0] === "phone") {
                    setPhoneError(issue.message);
                }
            });

            return;
        }

        try {
            const response = await axios.post(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/admin/insertadmin",
                result.data
            );

            console.log(response.data);

            router.push("/login");
        } catch (error: any) {
            console.error(error);

            if (error.response?.data?.message) {
                if (Array.isArray(error.response.data.message)) {
                    setServerError(
                        error.response.data.message[0]
                    );
                } else {
                    setServerError(
                        error.response.data.message
                    );
                }
            } else {
                setServerError("Registration failed");
            }
        }
    };

    return(
        <div
            data-theme="valentine"
            className="h-screen overflow-hidden bg-cover bg-center bg-no-repeat"
            style={{backgroundImage:"url('/p.png')"}}
        >
            <Link
                href="/"
                className="absolute top-6 left-6 text-2xl font-bold text-white z-10"
            >
                PawsHome BD
            </Link>

            <div className="h-screen flex items-center justify-end pr-100">

                <div className="card bg-[#fffaf2] text-gray-800 shadow-xl w-full max-w-md">

                    <div className="card-body p-6">

                        <h1 className="card-title justify-center text-2xl">
                            Admin Registration
                        </h1>

                        <p className="text-center text-gray-500">
                            Create your PawsHome BD admin account
                        </p>

                        {serverError && (
                            <p className="text-error text-center text-sm">
                                {serverError}
                            </p>
                        )}

                        <form onSubmit={handleSubmit} noValidate>

                            <div className="mb-2">
                                <label className="block mb-1 font-medium">
                                    Full Name
                                </label>

                                <input
                                    className="input input-bordered input-sm bg-white w-full"
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />

                                {fullNameError && (
                                    <p className="text-error text-xs mt-1">
                                        {fullNameError}
                                    </p>
                                )}
                            </div>

                            <div className="mb-2">
                                <label className="block mb-1 font-medium">
                                    Email
                                </label>

                                <input
                                    className="input input-bordered input-sm bg-white w-full"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />

                                {emailError && (
                                    <p className="text-error text-xs mt-1">
                                        {emailError}
                                    </p>
                                )}
                            </div>

                            <div className="mb-2">
                                <label className="block mb-1 font-medium">
                                    Password
                                </label>

                                <input
                                    className="input input-bordered input-sm bg-white w-full"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />

                                {passwordError && (
                                    <p className="text-error text-xs mt-1">
                                        {passwordError}
                                    </p>
                                )}
                            </div>

                            <div className="mb-2">
                                <label className="block mb-1 font-medium">
                                    Gender
                                </label>

                                <select
                                    className="select select-bordered select-sm bg-white w-full"
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>

                                {genderError && (
                                    <p className="text-error text-xs mt-1">
                                        {genderError}
                                    </p>
                                )}
                            </div>

                            <div className="mb-3">
                                <label className="block mb-1 font-medium">
                                    Phone
                                </label>

                                <input
                                    className="input input-bordered input-sm bg-white w-full"
                                    type="text"
                                    placeholder="Enter phone number"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />

                                {phoneError && (
                                    <p className="text-error text-xs mt-1">
                                        {phoneError}
                                    </p>
                                )}
                            </div>

                            <button
                                className="btn btn-primary btn-sm w-full"
                                type="submit"
                            >
                                Register
                            </button>

                        </form>

                        <p className="text-center text-sm">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="link link-primary"
                            >
                                Login
                            </Link>
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
}