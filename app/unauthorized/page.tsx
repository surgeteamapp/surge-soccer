"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-red-600">Access Denied</h1>
        <p className="mt-4 text-xl text-gray-700 dark:text-gray-300">
          You do not have permission to access this page.
        </p>
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
          >
            Go Back
          </button>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
