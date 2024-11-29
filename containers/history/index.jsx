"use client";
import Loading from "@/components/loading";
import ConversationHistory from "@/globalElements/ConversationHistory";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const HistoryPageContainer = () => {
  const { status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <Loading />;
  }
  return <ConversationHistory />;
};

export default HistoryPageContainer;
