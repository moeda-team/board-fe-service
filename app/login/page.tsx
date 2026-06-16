"use client";

import { Suspense, useEffect } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ShieldCheck, Zap, Globe } from "lucide-react";
import { authService } from "@/lib/auth";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Aman & Terpercaya",
    description: "Data Anda terlindungi dengan aman."
  },
  {
    icon: Zap,
    title: "Akses Cepat",
    description: "Temukan dan kelola clip lebih efisien."
  },
  {
    icon: Globe,
    title: "Di Mana Saja",
    description: "Akses kapan pun dan di perangkat apa pun."
  }
];

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { status } = useSession();
  const error = searchParams.get("error");

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/spaces");
    }
  }, [status, router]);

  return (
    <div className="fixed inset-0 z-50 grid grid-cols-1 overflow-y-auto bg-white lg:grid-cols-2">
      {/* Left marketing panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden p-10 text-white lg:flex xl:p-14">
        <Image
          src="/assets/login_assets/bglogin_blue.webp"
          alt=""
          fill
          priority
          className="object-cover"
        />
        <div className="relative z-10 flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <Image
              src="/assets/login_assets/logowidth_white.webp"
              alt="PapanClip"
              width={273}
              height={122}
              className="h-20 w-auto"
            />
            <Image
              src="/assets/login_assets/dots_white.webp"
              alt=""
              width={80}
              height={64}
              className="h-12 w-auto opacity-70"
            />
          </div>
          <div className="max-w-md">
            <h1 className="text-3xl font-bold leading-tight xl:text-4xl">
              Kelola clip Anda
              <br />
              dalam satu <span className="text-blue-300">papan.</span>
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-blue-100">
              Simpan, kelola, dan akses semua clip penting Anda dengan lebih
              cepat, aman, dan terorganisir.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex flex-1 items-center justify-center py-6">
          <Image
            src="/assets/login_assets/board.webp"
            alt="PapanClip board illustration"
            width={420}
            height={360}
            className="h-auto w-full max-w-105"
          />
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <feature.icon className="h-4 w-4 text-white" />
                <span className="text-xs font-semibold">{feature.title}</span>
              </div>
              <p className="text-[11px] leading-snug text-blue-100">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Right auth panel */}
      <div className="relative flex flex-col items-center justify-center bg-white px-6 py-12">
        <Image
          src="/assets/login_assets/dots_blue.webp"
          alt=""
          width={80}
          height={64}
          className="absolute right-10 top-10 hidden h-12 w-auto opacity-60 lg:block"
        />

        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-[0_20px_60px_-15px_rgba(37,99,235,0.25)] ring-1 ring-blue-50 xl:p-10">
          <div className="mb-6 flex justify-center">
            <Image
              src="/assets/login_assets/logo_blue.webp"
              alt="PapanClip"
              width={100}
              height={122}
              className="h-16 w-fit"
            />
          </div>

          <h2 className="text-xl font-bold text-gray-900">
            Selamat datang di PapanClip!
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Masuk untuk melanjutkan ke akun Anda
          </p>

          {error === "oauth_failed" && (
            <div className="mt-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">
              Google sign-in gagal. Silakan coba lagi.
            </div>
          )}

          <button
            onClick={authService.loginWithGoogle}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-blue-100 bg-white px-4 py-3.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/50 active:scale-[0.99]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Masuk dengan Google
          </button>

          {/* <div className="my-6 flex items-center gap-4">
            <span className="h-px flex-1 bg-gray-100" />
            <span className="text-xs text-gray-400">atau</span>
            <span className="h-px flex-1 bg-gray-100" />
          </div> */}

          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <ShieldCheck className="h-4 w-4 text-blue-500" />
              Aman dan terpercaya.
            </div>
            <p className="max-w-xs text-xs leading-relaxed text-gray-400">
              Kami tidak akan mengakses data Google Anda selain informasi
              profil.
            </p>
          </div>
        </div>

        <p className="mt-8 text-xs text-gray-400">
          © 2026 PapanClip. All rights reserved.
        </p>
      </div>
    </div>
  );
}

// Suspense boundary required by Next.js when using useSearchParams in a Client Component
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
