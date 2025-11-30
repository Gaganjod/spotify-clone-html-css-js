"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const SpotifyLogo = () => (
  <svg role="img" height="40" width="123" aria-label="Spotify" viewBox="0 0 1134 340" className="fill-current text-white">
    <title>Spotify</title>
    <path d="M567 0c-93.375 0-169 75.625-169 169s75.625 169 169 169 169-75.625 169-169S660.375 0 567 0zm77.485 243.716c-3.012 4.927-9.426 6.468-14.353 3.456-39.344-24.047-88.867-29.488-147.149-16.163-5.576 1.277-11.113-2.207-12.39-7.783-1.277-5.576 2.207-11.113 7.783-12.39 63.647-14.553 118.383-8.29 162.253 18.727 4.927 3.012 6.468 9.426 3.456 14.353zm20.478-45.538c-3.79 6.162-11.883 8.094-18.044 4.304-45.023-27.684-113.586-35.691-166.849-19.526-6.854 2.081-14.087-1.788-16.168-8.642-2.081-6.854 1.788-14.087 8.642-16.168 60.716-18.437 136.264-9.518 187.726 22.288 6.162 3.79 8.094 11.883 4.304 18.044zm1.757-47.412c-54.014-32.074-143.111-35.027-194.663-19.376-8.242 2.506-16.931-2.146-19.437-10.388-2.506-8.242 2.146-16.931 10.388-19.437 59.245-18.012 157.485-14.539 219.963 22.449 7.377 4.377 9.802 13.901 5.425 21.278-4.377 7.377-13.901 9.802-21.278 5.425z"/>
  </svg>
);

type ErrorTypes = Partial<Record<"USER_ALREADY_EXISTS", string>>;
const errorCodes = {
  USER_ALREADY_EXISTS: "Email already registered. Please log in instead.",
} satisfies ErrorTypes;

const getErrorMessage = (code: string) => {
  if (code in errorCodes) {
    return errorCodes[code as keyof typeof errorCodes];
  }
  return "Registration failed. Please try again.";
};

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await authClient.signUp.email({
        email: formData.email,
        name: formData.name,
        password: formData.password,
      });

      if (error?.code) {
        toast.error(getErrorMessage(error.code));
        setIsLoading(false);
        return;
      }

      toast.success("Account created successfully!");
      router.push("/login?registered=true");
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-[#121212] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-12">
          <Link href="/">
            <SpotifyLogo />
          </Link>
        </div>

        <div className="bg-black p-8 rounded-lg">
          <h1 className="text-white text-3xl font-bold text-center mb-2">
            Sign up to start listening
          </h1>
          <p className="text-[#B3B3B3] text-sm text-center mb-8">
            Create your free account
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-white text-sm font-bold mb-2">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-[#121212] text-white rounded border border-[#727272] focus:border-white focus:outline-none"
                placeholder="Enter your name"
                required
                autoComplete="off"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-white text-sm font-bold mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-[#121212] text-white rounded border border-[#727272] focus:border-white focus:outline-none"
                placeholder="name@domain.com"
                required
                autoComplete="off"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-white text-sm font-bold mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-[#121212] text-white rounded border border-[#727272] focus:border-white focus:outline-none"
                placeholder="Create a password"
                required
                autoComplete="off"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-white text-sm font-bold mb-2">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 bg-[#121212] text-white rounded border border-[#727272] focus:border-white focus:outline-none"
                placeholder="Confirm your password"
                required
                autoComplete="off"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1DB954] hover:bg-[#1ED760] text-black font-bold py-3 rounded-full transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-[#292929] text-center">
            <p className="text-[#B3B3B3] text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-white underline hover:text-[#1DB954]">
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
