"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import Pusher from "pusher-js";
import VetNavigation from "@/components/vetNavigation";

type Vet = {
    id: number;
    status: string;
};

export default function VetDashboard() {
    const router = useRouter();

    const [myId, setMyId] = useState(0);
    const [totalVets, setTotalVets] = useState(0);
    const [activeVets, setActiveVets] = useState(0);
    const [error, setError] = useState("");
    const [notification, setNotification] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("vet_token");

        if (!token) {
            router.push("/vet/login");
            return;
        }

        // the JWT middle part holds { id, email } of the logged in vet
        const payload = JSON.parse(atob(token.split(".")[1]));
        setMyId(payload.id);

        getVets();

        // realtime notification when a new vet registers
        const pusher = new Pusher(
            process.env.NEXT_PUBLIC_PUSHER_KEY!,
            {
                cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
            }
        );

        const channel = pusher.subscribe("vet-channel");

        channel.bind(
            "new-vet",
            (data: { message: string; name: string }) => {
                setNotification(data.message + ": " + data.name);
                getVets();
            }
        );

        return () => {
            channel.unbind("new-vet");
            pusher.unsubscribe("vet-channel");
            pusher.disconnect();
        };
    }, []);

    const getVets = async () => {
        try {
            const response = await axios.get(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/vet/getallvets"
            );

            const vets: Vet[] = response.data;

            setTotalVets(vets.length);
            setActiveVets(vets.filter((vet) => vet.status === "active").length);
        } catch (error) {
            console.error(error);
            setError("Failed to load dashboard");
        }
    };

    const logout = () => {
        localStorage.removeItem("vet_token");
        alert("Logout successful");
        router.push("/vet/login");
    };

    return (
        <div data-theme="valentine" className="min-h-screen bg-[#fff7f2]">
            <VetNavigation />

            <div className="max-w-6xl mx-auto px-6 py-10">
                {/* welcome banner */}
                <div className="hero bg-[#fbe4e8] rounded-box shadow-md mb-8">
                    <div className="hero-content w-full flex-col sm:flex-row sm:justify-between py-8">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                                Vet Dashboard 🩺
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Look after adopters and their pets
                            </p>
                        </div>

                        <button onClick={logout} className="btn btn-primary btn-sm">
                            Logout
                        </button>
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
                        <div className="stat-figure text-3xl">🩺</div>
                        <div className="stat-title">Total Vets</div>
                        <div className="stat-value text-primary">{totalVets}</div>
                        <div className="stat-desc">registered on PawsHome BD</div>
                    </div>

                    <div className="stat">
                        <div className="stat-figure text-3xl">✅</div>
                        <div className="stat-title">Active Vets</div>
                        <div className="stat-value text-primary">{activeVets}</div>
                        <div className="stat-desc">ready to help</div>
                    </div>
                </div>

                {/* quick links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="card bg-[#fffaf2] shadow-md">
                        <div className="card-body">
                            <h2 className="card-title text-gray-700">My Account</h2>
                            <p className="text-gray-500">See and update your profile and photo</p>
                            <div className="card-actions mt-2">
                                <Link href={"/vet/vets/" + myId} className="btn btn-primary btn-sm">
                                    View My Profile
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="card bg-[#fffaf2] shadow-md">
                        <div className="card-body">
                            <h2 className="card-title text-gray-700">Adopters</h2>
                            <p className="text-gray-500">Assign adopters you look after</p>
                            <div className="card-actions mt-2">
                                <Link href="/vet/adopters" className="btn btn-primary btn-sm">
                                    Manage Adopters
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="card bg-[#fffaf2] shadow-md">
                        <div className="card-body">
                            <h2 className="card-title text-gray-700">Find a Vet</h2>
                            <p className="text-gray-500">Search other vets by name</p>
                            <div className="card-actions mt-2">
                                <Link href="/vet/search" className="btn btn-outline btn-primary btn-sm">
                                    Search
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
