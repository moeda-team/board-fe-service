"use client";

import type { TermsDocument } from "./parse";

export default function TermsClient({ document }: { document: TermsDocument }) {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900">{document.title}</h1>
        <p className="mt-2 text-sm text-gray-500">{document.subtitle}</p>
        <p className="mt-1 text-xs text-gray-400">
          Last Updated: {document.lastUpdated}
        </p>
      </header>

      <div className="space-y-8">
        {document.sections.map((section, idx) => (
          <section key={idx}>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              {section.heading}
            </h2>
            <div className="space-y-2">
              {section.body.map((para, i) => (
                <p key={i} className="text-sm leading-relaxed text-gray-600">
                  {para}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <footer className="mt-16 border-t pt-8 text-center">
        <a
          href="/privacy"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Privacy Policy
        </a>
        <span className="mx-3 text-gray-300">·</span>
        <a
          href="/contact"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Contact Us
        </a>
      </footer>
    </article>
  );
}
