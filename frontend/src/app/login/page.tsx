"use client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const handleLogin = () => {
    // fake auth for now
    localStorage.setItem("user", "demo");
    router.push("/chat");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-semibold">Recruitment Agent Login</h1>
      <button onClick={handleLogin}>Login as Demo User</button>
    </div>
  );
}
