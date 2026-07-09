"use client";

import { useEffect, useState } from "react";

type Application = {
  id: string;
  full_name: string;
  email: string;
  linkedin_url: string;
  created_at: string;
};


export default function AdminMentorsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    async function loadApplications() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/mentors/applications");
        const data = await response.json();

        if (data && data.applications) {
          setApplications(data.applications);
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadApplications();
  }, []);

  const handleApprove = async (app: Application) => {
    try {
      const response = await fetch("/api/mentors/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: app.full_name,
          email: app.email,
        }),
      });

      if (response.ok) {
        setApplications((prevApps) =>
          prevApps.filter((item) => item.id !== app.id)
        );
      } else {
        console.error("Server rejected the approval:", response.statusText);
        alert("Failed to approve the application. Please try again!");
      }
    } catch (error) {
      console.error("Network error during approval:", error);
      alert("A network error occurred. Check your connection.");
    }
  };

  const handleReject = async (app: Application) => {
    try {
      const response = await fetch("/api/mentors/reject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: app.full_name,
          email: app.email,
        }),
      });

      if (response.ok) {
        setApplications((prevApps) =>
          prevApps.filter((item) => item.id !== app.id)
        );
      } else {
        console.error("Server rejected the request:", response.statusText);
        alert("Failed to reject the application. Please try again.");
      }
    } catch (error) {
      console.error("Network error during rejection:", error);
      alert("A network error occurred. Check your connection.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F1ECE0] px-10 py-12">
      <h1 className="font-archivo-black text-2xl text-[#18150F] mb-2">Mentor Applications</h1>
      <p className="font-dm-sans text-sm text-[#6F6B60] mb-10">
        {applications.length} pending application{applications.length !== 1 ? "s" : ""} waiting for review.
      </p>

      {!isLoading && applications.length === 0 && (
        <p className="font-dm-sans text-sm text-[#6F6B60]">No pending applications.</p>
      )}

      <div className="flex flex-col gap-4">
        {applications.map((app) => (
          <div key={app.id} className="bg-white rounded-2xl p-6 flex items-center justify-between shadow-sm">
            <div className="flex flex-col gap-1">
              <p className="font-dm-sans font-semibold text-[#18150F] text-sm">{app.full_name}</p>
              <p className="font-dm-sans text-[#6F6B60] text-sm">{app.email}</p>
              <a
                href={`https://${app.linkedin_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-dm-sans text-xs text-[#2596BE] hover:underline"
              >
                {app.linkedin_url}
              </a>
              <p className="font-dm-sans text-xs text-[#18150F]/40 mt-1">Applied {app.created_at}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleApprove(app)}
                disabled={acting === app.id}
                className="font-dm-sans text-sm px-5 py-2 rounded-full bg-[#4A7C59] text-white hover:bg-[#3A6347] disabled:opacity-40 transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => handleReject(app)}
                disabled={acting === app.id}
                className="font-dm-sans text-sm px-5 py-2 rounded-full border border-[#E63946] text-[#E63946] hover:bg-[#E63946]/10 disabled:opacity-40 transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
