"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { z } from "zod";
import Link from "next/link";
import AdminNavigation from "@/components/adminNavigation";

const adminSchema = z.object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string()
        .email("Enter a valid email")
        .regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, "Email cannot contain uppercase letters"),
    password: z.string()
        .min(6, "Password must be at least 6 characters")
        .regex(/^(?=.*[A-Z])/, "Password must contain at least one uppercase character"),
    gender: z.string().regex(/^(male|female)$/i, "Gender must be male or female"),
    phone: z.string().regex(/^[0-9]+$/, "Phone must contain only numbers"),
});

export default function EditAdminPage() {
    const params = useParams();
    const router = useRouter();

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
    const [message, setMessage] = useState("");

    useEffect(() => {
        getAdminById();
    }, []);

    const getAdminById = async () => {
        try {
            const response = await axios.get(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/admin/getuserbyid/" +
                params.id
            );

            setFullName(response.data.fullName);
            setEmail(response.data.email);
            setGender(response.data.gender);
            setPhone(response.data.phone);
        } catch (error) {
            console.error(error);
            setMessage("Failed to load admin");
        }
    };

    const updateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();

        setFullNameError("");
        setEmailError("");
        setPasswordError("");
        setGenderError("");
        setPhoneError("");
        setMessage("");

        const result = adminSchema.safeParse({
            fullName,
            email,
            password,
            gender,
            phone
        });

        if (!result.success) {
            result.error.issues.forEach((issue) => {
                const field = issue.path[0];

                if (field === "fullName") setFullNameError(issue.message);
                if (field === "email") setEmailError(issue.message);
                if (field === "password") setPasswordError(issue.message);
                if (field === "gender") setGenderError(issue.message);
                if (field === "phone") setPhoneError(issue.message);
            });

            return;
        }

        try {
            const token = localStorage.getItem("access_token");

            const adminData = {
                fullName,
                email,
                password,
                gender,
                phone
            };

            await axios.put(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/admin/updateadmin/" +
                params.id,
                adminData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Admin updated successfully");

            router.push("/admin/users/" + params.id);
        } catch (error) {
            console.error(error);
            setMessage("Failed to update admin");
        }
    };

    return (
        <div data-theme="valentine" className="min-h-screen bg-[#fff7f2]">
            <AdminNavigation />

            <div className="max-w-3xl mx-auto px-6 py-8">
                <div className="card bg-[#fffaf2] text-black shadow-md">
                    <div className="card-body">
                        <h1 className="card-title text-3xl">
                            Update Admin
                        </h1>

                        <p className="text-gray-500 mb-3">
                            Update admin account information
                        </p>

                        {message && (
                            <div className="alert alert-error mb-3">
                                <span>{message}</span>
                            </div>
                        )}

                        <form onSubmit={updateAdmin} noValidate>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1 font-medium">
                                        Full Name
                                    </label>
                                    <input
                                        className="input input-bordered bg-white w-full"
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                    />
                                    {fullNameError && (
                                        <p className="text-error text-xs mt-1">
                                            {fullNameError}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block mb-1 font-medium">
                                        Email
                                    </label>
                                    <input
                                        className="input input-bordered bg-white w-full"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    {emailError && (
                                        <p className="text-error text-xs mt-1">
                                            {emailError}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block mb-1 font-medium">
                                        New Password
                                    </label>
                                    <input
                                        className="input input-bordered bg-white w-full"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    {passwordError && (
                                        <p className="text-error text-xs mt-1">
                                            {passwordError}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block mb-1 font-medium">
                                        Gender
                                    </label>
                                    <select
                                        className="select select-bordered bg-white w-full"
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

                                <div>
                                    <label className="block mb-1 font-medium">
                                        Phone
                                    </label>
                                    <input
                                        className="input input-bordered bg-white w-full"
                                        type="text"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                    {phoneError && (
                                        <p className="text-error text-xs mt-1">
                                            {phoneError}
                                        </p>
                                    )}
                                </div>

                                {/* <div>
                                    <label className="block mb-1 font-medium">
                                        Age
                                    </label>
                                    <input
                                        className="input input-bordered bg-white w-full"
                                        type="number"
                                        value={age}
                                        onChange={(e) => setAge(e.target.value)}
                                    />
                                    {ageError && (
                                        <p className="text-error text-xs mt-1">
                                            {ageError}
                                        </p>
                                    )}
                                </div> */}
                            </div>

                            <div className="flex gap-3 mt-5">
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >
                                    Update Admin
                                </button>

                                <Link
                                    href={"/admin/users/" + params.id}
                                    className="btn btn-outline btn-primary"
                                >
                                    Back
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}