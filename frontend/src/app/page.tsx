"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const handleLoginClick = () => {
    router.push("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-semibold">Recruitment Agent</h1>
      <button onClick={handleLoginClick}>Login</button>
    </div>
  );
}
