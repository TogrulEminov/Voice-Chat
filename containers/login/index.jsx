"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import NextButton from "@/globalElements/Button";
import Loading from "@/components/loading";
import Link from "next/link";
import Label from "@/globalElements/Label";
import Input from "@/globalElements/Input";
import Image from "next/image";
import loginImage from "@/public/images/auth.webp";

export default function Login() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const { status } = useSession();
  const [fields, setFields] = useState({
    email: "",
    password: "",
  });
  // Redirect user if authenticated

  if (status === "loading") {
    return <Loading />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields({ ...fields, [name]: value });
  };
  const handleLogin = async (event) => {
    event.preventDefault();
    const { email, password } = fields;
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result.ok) {
      setMessage("Login successful!");
      setFields({
        email: "",
        password: "",
      });
      router.push("/");
    } else {
      setMessage("Login failed. Please check your credentials.");
    }
  };

  return (
    <section className="flex h-screen">
      <div className="hidden lg:flex items-center justify-center flex-1 bg-white text-black">
        <div className="max-w-md text-center">
          <Image
            src={loginImage}
            alt="Login"
            loading="lazy"
            width={500}
            height={1080}
            placeholder="empty"
            onLoadingComplete={(img) => console.log(img.naturalWidth)}
          />
        </div>
      </div>
      <div className="w-full bg-gray-100 lg:w-1/2 flex items-center justify-center">
        <div className="max-w-md w-full p-6">
          <h1 className="text-3xl font-semibold mb-6 text-black text-center">
            Sign In
          </h1>
          <h1 className="text-sm font-semibold mb-6 text-gray-500 text-center">
            Sign Our AI Consultation and Use It
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                name="email"
                id="email"
                value={fields.email}
                onChange={handleChange}
                placeholder="Email"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                type="password"
                name="password"
                id="password"
                placeholder="Password"
                value={fields.password}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <NextButton
                type="submit"
                className={`w-full bg-black text-white p-2 rounded-md hover:bg-gray-800 focus:outline-none focus:bg-black focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-300`}
              >
                Sign in
              </NextButton>
            </div>
            <div>
              {message && (
                <p className="mt-6 text-red-500 dark:text-red-400 text-center font-medium">
                  {message}
                </p>
              )}
            </div>
          </form>
          <div className="mt-4 text-sm text-gray-600 text-center">
            <p>
              Do not have an account?{" "}
              <Link href="/register" className="text-black hover:underline">
                Register now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
