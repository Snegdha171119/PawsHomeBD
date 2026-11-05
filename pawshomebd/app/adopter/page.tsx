"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import Pusher from "pusher-js";
import AdopterNavigation from "@/components/adopterNavigation";
import ProfilePhoto from "@/components/profilePhoto";

type Adopter = {
    id: number;
    name: string;
    email: string;
    phone: string;
    status: string;
    profileImage: string;
};

type Pet = {
    id: number;
    name: string;
    species: string;
    image: string;
};

export default function AdopterDashboard() {
    const router = useRouter();

    const [adopter, setAdopter] = useState<Adopter | null>(null);
    const [pets, setPets] = useState<Pet[]>([]);
    const [error, setError] = useState("");
    const [notification, setNotification] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("adopter_token");

        if (!token) {
            router.push("/adopter/login");
            return;
        }

        // the JWT middle part holds { id, email } of the logged in adopter
        const payload = JSON.parse(atob(token.split(".")[1]));

        getMyAccount(payload.id);
        getAvailablePets();

        // realtime notification when a new adopter joins
        const pusher = new Pusher(
            process.env.NEXT_PUBLIC_PUSHER_KEY!,
            {
                cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
            }
        );

        const channel = pusher.subscribe("adopter-channel");

        channel.bind(
            "new-adopter",
            (data: { message: string; name: string }) => {
                setNotification(data.message + ": " + data.name);
            }
        );

        return () => {
            channel.unbind("new-adopter");
            pusher.unsubscribe("adopter-channel");
            pusher.disconnect();
        };
    }, []);

    const getMyAccount = async (id: number) => {
        try {
            const response = await axios.get(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/adopter/getadopterbyid/" +
                id
            );

            setAdopter(response.data);
        } catch (error) {
            console.error(error);
            setError("Failed to load your account");
        }
    };

    // approved pets for the carousel
    const getAvailablePets = async () => {
        try {
            const response = await axios.get(
                process.env.NEXT_PUBLIC_API_ENDPOINT +
                "/adopter/availablepets"
            );

            setPets(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const logout = () => {
        localStorage.removeItem("adopter_token");
        alert("Logout successful");
        router.push("/adopter/login");
    };

    return (
        <div data-theme="valentine" className="min-h-screen bg-[#fff7f2]">
            <AdopterNavigation />

            <div className="max-w-6xl mx-auto px-6 py-10">
                {/* welcome banner */}
                <div className="hero bg-[#fbe4e8] rounded-box shadow-md mb-8">
                    <div className="hero-content w-full flex-col sm:flex-row sm:justify-between py-8">
                        <div className="flex items-center gap-4">
                            {adopter && (
                                <ProfilePhoto
                                    src={adopter.profileImage ? process.env.NEXT_PUBLIC_API_ENDPOINT + "/adopter/getimage/" + adopter.profileImage : undefined}
                                    name={adopter.name}
                                    size="lg"
                                />
                            )}
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                                    {adopter ? "Hi, " + adopter.name + " 🏠" : "Adopter Dashboard"}
                                </h1>
                                <p className="text-gray-600 mt-2">
                                    Find your new best friend
                                </p>
                            </div>
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

                {/* pets carousel, scroll sideways to see more */}
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Pets Looking for a Home
                    </h2>
                    <Link href="/adopter/pets" className="link link-primary">
                        See all
                    </Link>
                </div>

                {pets.length > 0 ? (
                    <div className="carousel carousel-center w-full bg-[#fbe4e8] rounded-box space-x-4 p-4 mb-8">
                        {pets.map((pet) => (
                            <div key={pet.id} className="carousel-item">
                                <div className="card bg-[#fffaf2] shadow-md w-56 overflow-hidden">
                                    {pet.image ? (
                                        <figure>
                                            <img
                                                src={process.env.NEXT_PUBLIC_API_ENDPOINT + "/lister/getimage/" + pet.image}
                                                alt={pet.name}
                                                className="w-full h-40 object-cover"
                                            />
                                        </figure>
                                    ) : (
                                        <figure className="h-40 text-5xl">🐾</figure>
                                    )}
                                    <div className="card-body p-4">
                                        <h3 className="card-title text-gray-800">
                                            {pet.name}
                                            <span className="badge badge-primary badge-sm">{pet.species}</span>
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card bg-[#fffaf2] shadow-md mb-8">
                        <div className="card-body text-center text-gray-500">
                            No pets are available right now, check back soon
                        </div>
                    </div>
                )}

                {/* quick links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="card bg-[#fffaf2] shadow-md">
                        <div className="card-body">
                            <h2 className="card-title text-gray-700">Available Pets</h2>
                            <p className="text-gray-500">See every pet that is ready for a home</p>
                            <div className="card-actions mt-2">
                                <Link href="/adopter/pets" className="btn btn-primary btn-sm">
                                    Browse Pets
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="card bg-[#fffaf2] shadow-md">
                        <div className="card-body">
                            <h2 className="card-title text-gray-700">Vet & Lister</h2>
                            <p className="text-gray-500">Manage your assigned vet and lister</p>
                            <div className="card-actions mt-2">
                                <Link href="/adopter/vet" className="btn btn-primary btn-sm">
                                    My Vet
                                </Link>
                                <Link href="/adopter/lister" className="btn btn-outline btn-primary btn-sm">
                                    My Lister
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="card bg-[#fffaf2] shadow-md">
                        <div className="card-body">
                            <h2 className="card-title text-gray-700">My Account</h2>
                            <p className="text-gray-500">{adopter ? adopter.email : "See and update your profile"}</p>
                            {adopter && (
                                <div className="card-actions mt-2">
                                    <Link
                                        href={"/adopter/adopters/" + adopter.id}
                                        className="btn btn-outline btn-primary btn-sm"
                                    >
                                        View My Profile
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
