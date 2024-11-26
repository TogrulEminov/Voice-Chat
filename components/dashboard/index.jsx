"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Loading from "@/components/loading";
import LanguageDevelopment from "@/components/dashboard/languageDevelopment";

const ConversationHistory = dynamic(
  () => import("@/globalElements/ConversationHistory"),
  { ssr: false }
);

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
      <div className="m-2 flex flex-wrap lg:items-stretch gap-4 rounded-lg border-2 border-[#f4f4f4b9] md:flex-row md:items-start  bg-gray-50 dark:bg-gray-900">
        <LanguageDevelopment />
        <ConversationHistory />
      </div>
    </div>
  );
};

// Bileşeni dinamik olarak yükleyip yalnızca istemci tarafında render edilmesini sağlıyoruz
export default dynamic(() => Promise.resolve(Dashboard), {
  ssr: false,
});
