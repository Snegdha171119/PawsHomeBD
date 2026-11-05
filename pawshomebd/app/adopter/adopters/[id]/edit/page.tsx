"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { z } from "zod";
import AdopterNavigation from "@/components/adopterNavigation";

const adopterSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string()
        .min(1, "Email is required")
        .email("Invalid email"),
    password: z.string()
        .min(1, "Password is required")
        .min(6, "Password must be at least 6 characters"),
    phone: z.string()
        .regex(/^01[0-9]+$/, "Phone number must start with 01"),
});

export default function EditAdopterPage() {
    const params = useParams();
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");

    const [nameError, setNameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("adopter_token");

        if (!token) {
            router.push("/adopter/login");
            return;
        }

        getAdopterById();
    }, []);

    // fill the form with the current data
    const getAdopterById = async () => {
        try {
            const response = await axios.get(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/adopter/getadopterbyid/" +
                params.id
            );

            setName(response.data.name);
            setEmail(response.data.email);
            setPhone(response.data.phone);
        } catch (error) {
            console.error(error);
            setMessage("Failed to load adopter");
        }
    };

    const updateAdopter = async (e: React.FormEvent) => {
        e.preventDefault();

        setNameError("");
        setEmailError("");
        setPasswordError("");
        setPhoneError("");
        setMessage("");

        const result = adopterSchema.safeParse({
            name,
            email,
            password,
            phone
        });

        if (!result.success) {
            result.error.issues.forEach((issue) => {
                const field = issue.path[0];

                if (field === "name") setNameError(issue.message);
                if (field === "email") setEmailError(issue.message);
                if (field === "password") setPasswordError(issue.message);
                if (field === "phone") setPhoneError(issue.message);
            });

            return;
        }

        try {
            const token = localStorage.getItem("adopter_token");

            await axios.put(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/adopter/updateadopter/" +
                params.id,
                result.data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Adopter updated successfully");

            router.push("/adopter/adopters/" + params.id);
        } catch (error: any) {
            console.error(error);

            if (Array.isArray(error.response?.data?.message)) {
                setMessage(error.response.data.message[0]);
            } else {
                setMessage(error.response?.data?.message || "Failed to update adopter");
            }
        }
    };

    return (
        <div data-theme="valentine" className="min-h-screen bg-[#fff7f2]">
            <AdopterNavigation />

            <div className="max-w-3xl mx-auto px-6 py-8">
                <div className="card bg-[#fffaf2] text-black shadow-md">
                    <div className="card-body">
                        <h1 className="card-title text-3xl">
                            Update Adopter
                        </h1>

                        <p className="text-gray-500 mb-3">
                            Update adopter account information
                        </p>

                        {message && (
                            <div className="alert alert-error mb-3">
                                <span>{message}</span>
                            </div>
                        )}

                        <form onSubmit={updateAdopter} noValidate>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1 font-medium">Name</label>
                                    <input
                                        className="input input-bordered bg-white w-full"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                    {nameError && <p className="text-error text-xs mt-1">{nameError}</p>}
                                </div>

                                <div>
                                    <label className="block mb-1 font-medium">Email</label>
                                    <input
                                        className="input input-bordered bg-white w-full"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    {emailError && <p className="text-error text-xs mt-1">{emailError}</p>}
                                </div>

                                <div>
                                    <label className="block mb-1 font-medium">Phone</label>
                                    <input
                                        className="input input-bordered bg-white w-full"
                                        type="text"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                    {phoneError && <p className="text-error text-xs mt-1">{phoneError}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block mb-1 font-medium">New Password</label>
                                    <input
                                        className="input input-bordered bg-white w-full"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    {passwordError && <p className="text-error text-xs mt-1">{passwordError}</p>}
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary mt-5">
                                Update Adopter
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
