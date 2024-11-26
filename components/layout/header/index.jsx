"use client";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import NextButton from "@/globalElements/Button";
import dynamic from "next/dynamic"; // Dinamik yükleme için import
import Loading from "@/components/loading";
import { useRouter } from "next/navigation";

const ThemeToggle = dynamic(() => import("@/globalElements/ThemeToggle"), {
  ssr: false,
});

export default function Header() {
  const { status, data } = useSession();

  return (
    <header className="border-b min-h-[80px] flex items-center  p-4 bg-gray-800 text-white dark:bg-gray-900 dark:text-gray-100">
      <div className="container mx-auto flex justify-between items-center ">
        <h1 className="text-xl font-bold hover:text-indigo-400 transition-colors duration-200">
          <Link href="/">SpeakBuddy</Link>
        </h1>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          {status === "authenticated" ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm sm:text-base">
                Hoş geldiniz,{" "}
                <span className="font-semibold">{data.user.name}</span>
              </span>
              <NextButton
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-sm sm:text-base bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition duration-150 ease-in-out"
              >
                Çıkış Yap
              </NextButton>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <NextButton className="text-sm sm:text-base bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg transition duration-150 ease-in-out">
                  Giriş Yap
                </NextButton>
              </Link>
              <Link href="/register">
                <NextButton className="text-sm sm:text-base bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition duration-150 ease-in-out">
                  Kayıt Ol
                </NextButton>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
