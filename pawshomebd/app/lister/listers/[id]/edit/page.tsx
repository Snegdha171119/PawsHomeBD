"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { z } from "zod";
import ListerNavigation from "@/components/listerNavigation";

const listerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    fullName: z.string().min(1, "Full name is required"),
    username: z.string()
        .min(1, "Username is required")
        .min(3, "Username must be at least 3 characters"),
    email: z.string()
        .min(1, "Email is required")
        .email("Invalid email"),
    nid: z.string()
        .regex(/^[0-9]{10,13}$/, "NID must contain 10 to 13 digits"),
    password: z.string()
        .min(1, "Password is required")
        .min(6, "Password must be at least 6 characters"),
});

export default function EditListerPage() {
    const params = useParams();
    const router = useRouter();

    const [name, setName] = useState("");
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [nid, setNid] = useState("");
    const [password, setPassword] = useState("");

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [message, setMessage] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("lister_token");

        if (!token) {
            router.push("/lister/login");
            return;
        }

        getListerById();
    }, []);

    // fill the form with the current data
    const getListerById = async () => {
        try {
            const response = await axios.get(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/lister/getlisterbyid/" +
                params.id
            );

            setName(response.data.name);
            setFullName(response.data.fullName);
            setUsername(response.data.username);
            setEmail(response.data.email);
            setNid(response.data.nid);
        } catch (error) {
            console.error(error);
            setMessage("Failed to load lister");
        }
    };

    const updateLister = async (e: React.FormEvent) => {
        e.preventDefault();

        setErrors({});
        setMessage("");

        const result = listerSchema.safeParse({
            name,
            fullName,
            username,
            email,
            nid,
            password
        });

        // keep one message per field, keyed by the field name
        if (!result.success) {
            const fieldErrors: { [key: string]: string } = {};

            result.error.issues.forEach((issue) => {
                fieldErrors[String(issue.path[0])] = issue.message;
            });

            setErrors(fieldErrors);
            return;
        }

        try {
            const token = localStorage.getItem("lister_token");

            await axios.put(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/lister/updatelister/" +
                params.id,
                result.data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Lister updated successfully");

            router.push("/lister/listers/" + params.id);
        } catch (error: any) {
            console.error(error);

            if (Array.isArray(error.response?.data?.message)) {
                setMessage(error.response.data.message[0]);
            } else {
                setMessage(error.response?.data?.message || "Failed to update lister");
            }
        }
    };

    return (
        <div data-theme="valentine" className="min-h-screen bg-[#fff7f2]">
            <ListerNavigation />

            <div className="max-w-3xl mx-auto px-6 py-8">
                <div className="card bg-[#fffaf2] text-black shadow-md">
                    <div className="card-body">
                        <h1 className="card-title text-3xl">
                            Update Lister
                        </h1>

                        <p className="text-gray-500 mb-3">
                            Update pet lister account information
                        </p>

                        {message && (
                            <div className="alert alert-error mb-3">
                                <span>{message}</span>
                            </div>
                        )}

                        <form onSubmit={updateLister} noValidate>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1 font-medium">Name</label>
                                    <input
                                        className="input input-bordered bg-white w-full"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                    {errors.name && <p className="text-error text-xs mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block mb-1 font-medium">Full Name</label>
                                    <input
                                        className="input input-bordered bg-white w-full"
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                    />
                                    {errors.fullName && <p className="text-error text-xs mt-1">{errors.fullName}</p>}
                                </div>

                                <div>
                                    <label className="block mb-1 font-medium">Username</label>
                                    <input
                                        className="input input-bordered bg-white w-full"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                    {errors.username && <p className="text-error text-xs mt-1">{errors.username}</p>}
                                </div>

                                <div>
                                    <label className="block mb-1 font-medium">Email</label>
                                    <input
                                        className="input input-bordered bg-white w-full"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    {errors.email && <p className="text-error text-xs mt-1">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="block mb-1 font-medium">NID</label>
                                    <input
                                        className="input input-bordered bg-white w-full"
                                        type="text"
                                        value={nid}
                                        onChange={(e) => setNid(e.target.value)}
                                    />
                                    {errors.nid && <p className="text-error text-xs mt-1">{errors.nid}</p>}
                                </div>

                                <div>
                                    <label className="block mb-1 font-medium">New Password</label>
                                    <input
                                        className="input input-bordered bg-white w-full"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    {errors.password && <p className="text-error text-xs mt-1">{errors.password}</p>}
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary mt-5">
                                Update Lister
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
