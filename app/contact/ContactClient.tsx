"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Globe } from "lucide-react";

export default function ContactClient() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-b from-blue-50 to-white px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <Image
            src="/assets/papanclip_logo.png"
            alt="PapanClip"
            width={200}
            height={60}
            className="mx-auto mb-6 h-16 w-auto object-contain"
            priority
          />
          <h1 className="text-4xl font-bold text-gray-900">Contact Us</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Have a question, need support, or want to give feedback? We&apos;re
            here to help.
          </p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">Email</h3>
              <a
                href="mailto:papanclip.official@gmail.com"
                className="mt-1 text-sm text-blue-600 hover:text-blue-700"
              >
                papanclip.official@gmail.com
              </a>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">Location</h3>
              <p className="mt-1 text-sm text-gray-600">
                Bandung, West Java, Indonesia
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">Website</h3>
              <Link
                href="/"
                className="mt-1 text-sm text-blue-600 hover:text-blue-700"
              >
                www.papanclip.hompimpa.biz.id
              </Link>
            </div>
          </div>

          <div className="mt-12 rounded-2xl bg-gray-50 p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900">
              Support & Inquiries
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-gray-600">
              For technical support, billing questions, or general inquiries,
              please email us at{" "}
              <a
                href="mailto:papanclip.official@gmail.com"
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                papanclip.official@gmail.com
              </a>
              . We aim to respond within 1-2 business days.
            </p>
          </div>
        </div>
      </section>

      {/* Footer Links */}
      <section className="bg-gray-50 px-6 py-12 text-center">
        <div className="mx-auto flex max-w-md items-center justify-center gap-6 text-sm">
          <Link
            href="/about"
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            About
          </Link>
          <Link
            href="/privacy"
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms-of-service"
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            Terms of Service
          </Link>
        </div>
      </section>
    </div>
  );
}
