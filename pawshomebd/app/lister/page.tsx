"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import Pusher from "pusher-js";
import ListerNavigation from "@/components/listerNavigation";

type Pet = {
    id: number;
    status: string;
};

export default function ListerDashboard() {
    const router = useRouter();

    const [myId, setMyId] = useState(0);
    const [totalPets, setTotalPets] = useState(0);
    const [pendingPets, setPendingPets] = useState(0);
    const [approvedPets, setApprovedPets] = useState(0);
    const [error, setError] = useState("");
    const [notification, setNotification] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("lister_token");

        if (!token) {
            router.push("/lister/login");
            return;
        }

        // the JWT middle part holds { id, email } of the logged in lister
        const payload = JSON.parse(atob(token.split(".")[1]));
        setMyId(payload.id);

        getMyPets();

        // realtime notification when a new lister registers
        const pusher = new Pusher(
            process.env.NEXT_PUBLIC_PUSHER_KEY!,
            {
                cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
            }
        );

        const channel = pusher.subscribe("lister-channel");

        channel.bind(
            "new-lister",
            (data: { message: string; name: string }) => {
                setNotification(data.message + ": " + data.name);
            }
        );

        return () => {
            channel.unbind("new-lister");
            pusher.unsubscribe("lister-channel");
            pusher.disconnect();
        };
    }, []);

    // counts for the cards come from my own pets
    const getMyPets = async () => {
        try {
            const token = localStorage.getItem("lister_token");

            const response = await axios.get(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/lister/getmypets",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const pets: Pet[] = response.data;

            setTotalPets(pets.length);
            setPendingPets(pets.filter((pet) => pet.status === "pending").length);
            setApprovedPets(pets.filter((pet) => pet.status === "approved").length);
        } catch (error) {
            console.error(error);
            setError("Failed to load dashboard");
        }
    };

    const logout = () => {
        localStorage.removeItem("lister_token");
        alert("Logout successful");
        router.push("/lister/login");
    };

    return (
        <div data-theme="valentine" className="min-h-screen bg-[#fff7f2]">
            <ListerNavigation />

            <div className="max-w-6xl mx-auto px-6 py-10">
                {/* welcome banner */}
                <div className="hero bg-[#fbe4e8] rounded-box shadow-md mb-8">
                    <div className="hero-content w-full flex-col sm:flex-row sm:justify-between py-8">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                                Pet Lister Dashboard 🐶
                            </h1>
                            <p className="text-gray-600 mt-2">
                                List pets and find them a loving home
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Link href="/lister/pets" className="btn btn-primary btn-sm">
                                + Add a Pet
                            </Link>
                            <button onClick={logout} className="btn btn-outline btn-primary btn-sm">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>

                {notification && (
                    <div className="alert alert-success mb-6">
                        <span>{notification}</span>
                    </div>
                )}

                {error && (
                    <div className="alert alert-error mb-6">
                        <span>{error}</span>
                    </div>
                )}

                {/* numbers */}
                <div className="stats stats-vertical md:stats-horizontal bg-[#fffaf2] shadow-md w-full mb-8">
                    <div className="stat">
                        <div className="stat-figure text-3xl">🐾</div>
                        <div className="stat-title">My Pets</div>
                        <div className="stat-value text-primary">{totalPets}</div>
                        <div className="stat-desc">listed by you</div>
                    </div>

                    <div className="stat">
                        <div className="stat-figure text-3xl">⏳</div>
                        <div className="stat-title">Waiting Approval</div>
                        <div className="stat-value text-warning">{pendingPets}</div>
                        <div className="stat-desc">admin will check them</div>
                    </div>

                    <div className="stat">
                        <div className="stat-figure text-3xl">✅</div>
                        <div className="stat-title">Approved</div>
                        <div className="stat-value text-success">{approvedPets}</div>
                        <div className="stat-desc">visible to adopters</div>
                    </div>
                </div>

                {/* quick links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="card bg-[#fffaf2] shadow-md">
                        <div className="card-body">
                            <h2 className="card-title text-gray-700">My Pets</h2>
                            <p className="text-gray-500">Add new pets with photos or remove old ones</p>
                            <div className="card-actions mt-2">
                                <Link href="/lister/pets" className="btn btn-primary btn-sm">
                                    Manage Pets
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="card bg-[#fffaf2] shadow-md">
                        <div className="card-body">
                            <h2 className="card-title text-gray-700">Adopters</h2>
                            <p className="text-gray-500">Connect with adopters interested in your pets</p>
                            <div className="card-actions mt-2">
                                <Link href="/lister/adopters" className="btn btn-primary btn-sm">
                                    Manage Adopters
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="card bg-[#fffaf2] shadow-md">
                        <div className="card-body">
                            <h2 className="card-title text-gray-700">My Account</h2>
                            <p className="text-gray-500">See and update your profile and photo</p>
                            <div className="card-actions mt-2">
                                <Link href={"/lister/listers/" + myId} className="btn btn-outline btn-primary btn-sm">
                                    View My Profile
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
