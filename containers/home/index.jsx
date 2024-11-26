"use client";
import Dashboard from "@/components/dashboard";
import HomeDashboard from "@/components/home";
import Loading from "@/components/loading";
import { useSession } from "next-auth/react";

export default function HomePageContainer() {
  const { status } = useSession();
  if (status === "loading") {
    return <Loading />;
  }
  return (
    <>
      {status === "unauthenticated" ? (
        <HomeDashboard />
      ) : (
        <Dashboard status={status} />
      )}
    </>
  );
}
