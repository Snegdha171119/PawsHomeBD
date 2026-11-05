"use client";

import { useState } from "react";
import axios from "axios";
import { z } from "zod";

// same rules as the upload filter in the backend
const photoSchema = z.custom<File>((value) => value instanceof File, "Please choose a photo first")
    .refine((file) => /\.(jpg|jpeg|png|webp)$/i.test(file.name), "Only jpg, jpeg, png or webp images are allowed")
    .refine((file) => file.size <= 2000000, "Image must be 2 MB or smaller");

// Small form for changing a profile photo
// uploadPath: backend route, e.g. "/vet/uploadphoto/4"
// tokenKey: which localStorage token to send, e.g. "vet_token"
export default function PhotoUpload(props: {
    uploadPath: string;
    tokenKey: string;
    onUploaded: () => void;
}) {
    const [photo, setPhoto] = useState<File | null>(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const uploadPhoto = async (e: React.FormEvent) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        const result = photoSchema.safeParse(photo);

        if (!result.success) {
            setError(result.error.issues[0].message);
            return;
        }

        // files are sent as form-data, the field name must be "image"
        const formData = new FormData();
        formData.append("image", result.data);

        try {
            const token = localStorage.getItem(props.tokenKey);

            const response = await axios.post(
                process.env.NEXT_PUBLIC_API_ENDPOINT + props.uploadPath,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setSuccess(response.data.message);
            setPhoto(null);
            (e.target as HTMLFormElement).reset();

            props.onUploaded();
        } catch (error: any) {
            console.error(error);
            setError(error.response?.data?.message || "Failed to upload photo");
        }
    };

    return (
        <form onSubmit={uploadPhoto} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <input
                className="file-input file-input-bordered file-input-primary file-input-sm bg-white w-full max-w-xs"
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={(e) => setPhoto(e.target.files ? e.target.files[0] : null)}
            />

            <button type="submit" className="btn btn-primary btn-sm">
                Upload Photo
            </button>

            {error && <p className="text-error text-xs">{error}</p>}
            {success && <p className="text-success text-xs">{success}</p>}
        </form>
    );
}
