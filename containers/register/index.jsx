"use client";
import React from "react";
import NextButton from "@/globalElements/Button";
import { postAPI } from "@/services/fetchApi";
import registerImage from "@/public/images/auth.webp";
import Image from "next/image";
import Input from "@/globalElements/Input";
import Label from "@/globalElements/Label";
import Link from "next/link";
import { useRouter } from "next/navigation";
export default function Register() {
  const router = useRouter();
  const [fields, setFields] = React.useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields({
      ...fields,
      [name]: value, // Update the corresponding field
    });
  };
  const handleRegister = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const { name, email, password } = fields;
      const res = await postAPI("/auth/register", {
        body: JSON.stringify(fields),
      });

      if (!res.ok) {
        const errorText = await res?.message;
        try {
          const errorData = JSON.parse(errorText);
          setMessage(`Error: ${errorData.message}`);
        } catch {
          setMessage(`Error: ${errorText}`);
        }
      } else {
        router.push("/login");
        setFields({
          name: "",
          email: "",
          password: "",
        });
      }
    } catch (error) {
      console.error("Kayıt sırasında hata oluştu:", error);
      setMessage("Beklenmeyen bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex h-screen">
      <div className="hidden lg:flex items-center justify-center flex-1 bg-white text-black">
        <div className="max-w-md text-center">
          <Image
            src={registerImage}
            alt="Register"
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
            Sign Up
          </h1>
          <h1 className="text-sm font-semibold mb-6 text-gray-500 text-center">
            Join to our AI Consultation with all time access and free
          </h1>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="Email"
                value={fields.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </Label>
              <Input
                type="text"
                id="name"
                name="name"
                required
                placeholder="Name"
                value={fields.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                type="password"
                id="password"
                name="password"
                placeholder="Password"
                value={fields.password}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <NextButton
                type="submit"
                disabled={loading}
                className={`w-full bg-black text-white p-2 rounded-md hover:bg-gray-800 focus:outline-none focus:bg-black focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-300 ${
                  loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                {loading ? "Saving..." : " Sign Up"}
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
              Already have an account?{" "}
              <Link href="/login" className="text-black hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
