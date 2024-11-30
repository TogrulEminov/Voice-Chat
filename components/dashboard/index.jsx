"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Loading from "@/components/loading";
import LanguageDevelopment from "@/components/dashboard/languageDevelopment";

const Dashboard = ({ status }) => {
  const router = useRouter();
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);
  if (status === "loading") {
    return <Loading />;
  }
  return (
    <div className="container mx-auto py-10">
      <div className="m-2 flex space-y-10 lg:items-stretch gap-4 rounded-lg border-2 border-[#f4f4f4b9] md:flex-col md:items-start  ">
        <LanguageDevelopment />
      </div>
    </div>
  );
};

// Bileşeni dinamik olarak yükleyip yalnızca istemci tarafında render edilmesini sağlıyoruz
export default dynamic(() => Promise.resolve(Dashboard), {
  ssr: false,
});
