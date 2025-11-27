"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to admin login page
    router.push("/features/admin/login");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">JIG Admin Panel</h1>
        <p className="text-gray-600">Redirecting to login...</p>
      </div>
    </div>
  );
}
