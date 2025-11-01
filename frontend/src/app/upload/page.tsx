"use client";
import { useState } from "react";
import axios from "axios";
import { API_URLS } from "@/api/urls";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      setStatus("Uploading...");
      const res = await axios.post(API_URLS.UPLOAD, formData);
      setStatus("✅ Uploaded successfully!");
      console.log(res.data);
    } catch (err) {
      setStatus("❌ Upload failed");
    }
  };

  return (
    <div className="p-10 flex flex-col items-center gap-4">
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleUpload}
      >
        Upload
      </button>
      <p>{status}</p>
    </div>
  );
}
