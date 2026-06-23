"use client";

import Image from "next/image";
import Link from "next/link";

export default function AboutClient() {
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
          <h1 className="text-4xl font-bold text-gray-900">About PapanClip</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            PapanClip is a collaborative Kanban board and project management
            platform built for agile teams. We help teams plan, track, and
            deliver projects faster — all in one place.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            We believe great software comes from empowered teams. PapanClip was
            created to give agile teams a simple, powerful, and collaborative
            workspace for managing tasks, sprints, and projects. We combine the
            visual clarity of Kanban boards with the structure of sprint
            planning, so teams can focus on what matters — shipping great work.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-gray-900">Our Values</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="font-semibold text-gray-900">Simplicity First</h3>
              <p className="mt-2 text-sm text-gray-600">
                Powerful tools should be easy to use. We design every feature
                with clarity and focus.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Team Collaboration
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Great products are built by teams. PapanClip brings everyone
                onto the same page.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Data Security</h3>
              <p className="mt-2 text-sm text-gray-600">
                Your data is yours. We use industry-standard encryption and
                security practices to protect it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Company Info */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900">Company</h2>
          <div className="mt-6 space-y-3 text-gray-600">
            <p>
              <span className="font-semibold text-gray-900">Product:</span>{" "}
              PapanClip — Kanban Board for Project Management
            </p>
            <p>
              <span className="font-semibold text-gray-900">Location:</span>{" "}
              Bandung, West Java, Indonesia
            </p>
            <p>
              <span className="font-semibold text-gray-900">Email:</span>{" "}
              <a
                href="mailto:papanclip.official@gmail.com"
                className="text-blue-600 hover:text-blue-700"
              >
                papanclip.official@gmail.com
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-white">Ready to get started?</h2>
        <p className="mt-2 text-gray-400">
          Join teams using PapanClip to manage their projects.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-lg bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
        >
          Start Free
        </Link>
      </section>
    </div>
  );
}
