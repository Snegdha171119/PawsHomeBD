import axios from "axios";
import AdopterNavigation from "@/components/adopterNavigation";

// SSR: render on every request so newly approved pets show up
export const dynamic = "force-dynamic";

type Pet = {
    id: number;
    name: string;
    species: string;
    breed: string;
    age: number;
    gender: string;
    description: string;
    image: string;
};

export default async function AvailablePetsPage() {
    let pets: Pet[] = [];
    let error = "";

    try {
        const response = await axios.get(
            process.env.NEXT_PUBLIC_API_ENDPOINT +
            "/adopter/availablepets"
        );

        pets = response.data;
    } catch (err) {
        console.error(err);
        error = "Failed to load pets";
    }

    return (
        <div data-theme="valentine" className="min-h-screen bg-[#fff7f2]">
            <AdopterNavigation />

            <div className="max-w-6xl mx-auto px-6 py-10">
                <h1 className="text-3xl font-bold text-gray-800">
                    Available Pets
                </h1>
                <p className="text-gray-500 mt-1 mb-6">
                    These pets are approved and looking for a loving home
                </p>

                {error && (
                    <div className="alert alert-error mb-6">
                        <span>{error}</span>
                    </div>
                )}

                {pets.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {pets.map((pet) => (
                            <div key={pet.id} className="card bg-[#fffaf2] text-black shadow-md overflow-hidden">
                                {pet.image ? (
                                    <figure>
                                        <img
                                            src={process.env.NEXT_PUBLIC_API_ENDPOINT + "/lister/getimage/" + pet.image}
                                            alt={pet.name}
                                            className="w-full h-52 object-cover"
                                        />
                                    </figure>
                                ) : (
                                    <figure className="h-52 bg-[#fbe4e8] text-6xl">🐾</figure>
                                )}
                                <div className="card-body">
                                    <h2 className="card-title">
                                        {pet.name}
                                        <span className="badge badge-primary">{pet.species}</span>
                                    </h2>
                                    <p><span className="font-semibold">Breed:</span> {pet.breed || "Unknown"}</p>
                                    <p><span className="font-semibold">Age:</span> {pet.age ?? "Unknown"}</p>
                                    <p><span className="font-semibold">Gender:</span> {pet.gender}</p>
                                    {pet.description && (
                                        <p className="text-gray-500">{pet.description}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    !error && (
                        <div className="card bg-[#fffaf2] text-black shadow-md">
                            <div className="card-body text-center">
                                <p className="text-gray-500">No pets are available right now</p>
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
