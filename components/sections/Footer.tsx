"use client";

import React, { useState } from "react";
import { ArrowRight, CheckCircle2, Mail, ArrowUpRight } from "lucide-react";
import { sendContactMessage } from "@/lib/contact";
import { motion, AnimatePresence } from "framer-motion";

export default function Footer() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const inputClass =
    "w-full bg-transparent text-base text-sm placeholder:text-base/30 border-b border-base/10 py-3.5 outline-none focus:border-base/40 transition-colors duration-200";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    setStatus("loading");
    try {
      const res = await sendContactMessage(form);
      if (res.success) {
        setStatus("success");
        setStatusMessage(res.message);
        setForm({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
        setStatusMessage("Gagal mengirim pesan. Silakan coba lagi.");
      }
    } catch {
      setStatus("error");
      setStatusMessage("Terjadi kendala saat mengirim pesan.");
    }
  };

  return (
    <footer
      id="contact"
      className="flex flex-col w-full max-w-304 mx-auto px-6 sm:px-9 pt-16 sm:pt-24 pb-8 sm:pb-12"
    >
      <div className="bg-[#f5f5f5] border border-black/5 rounded-3xl p-8 sm:p-12 md:p-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">
          {/* Left Column: Direct Info & Editorial Headings */}
          <div className="flex flex-col gap-6">
            <div className="flex">
              <span className="flex items-center gap-2 text-xs border border-base/15 rounded-full px-3.5 py-1 text-base/70 font-medium">
                <span className="w-2 h-2 rounded-full bg-base/60 inline-block animate-pulse" />
                Available for internships & projects
              </span>
            </div>

            <div className="space-y-3">
              <h2 className="text-base text-2xl sm:text-3xl md:text-4xl font-bold leading-tight tracking-tight">
                always searching for new problems, fun teams and great ideas.
              </h2>
              <p className="text-base/60 text-sm sm:text-base leading-relaxed">
                have a project idea, inquiry, or just want to discuss software engineering,
                NLP, or typography? drop a note or reach out directly.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <a
                href="https://github.com/Raged9"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 text-sm text-base/70 hover:text-base transition-colors group font-medium"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
                <span>github.com/Raged9</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
              </a>

              <div className="flex items-center gap-2.5 text-sm text-base/70 font-medium">
                <Mail className="w-4 h-4 text-base/60" />
                <span>edgar@raged.dev</span>
              </div>
            </div>

            {/* Signature Joke (Sentence case, subtle, relaxed) */}
            <div className="mt-4 pt-6 border-t border-base/10">
              <p className="serif text-base/60 text-lg">
                Powered by JavaScript — dan kopi dari Pulau Jawa.
              </p>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="w-full">
            {status === "success" ? (
              <div className="py-12 text-center space-y-3 bg-white rounded-2xl p-8 border border-black/5 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-base/5 flex items-center justify-center mx-auto text-base">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-semibold text-base">Message Sent!</h4>
                <p className="text-xs text-base/60 max-w-xs mx-auto">
                  {statusMessage || "Thanks for reaching out. Edgar will get back to you soon."}
                </p>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="mt-4 text-xs font-semibold text-base hover:opacity-75 underline inline-block cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="name [or nickname, we don't judge]"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="e-mail address"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    placeholder="tell me about your project, idea, or questions..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {status === "error" && (
                  <p className="text-xs text-red-500">{statusMessage}</p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="serif py-3 px-6 rounded-[13px] text-[18px] font-bold cursor-pointer text-white bg-[#302f2d] hover:bg-black shadow-lg shadow-black/15 hover:scale-105 active:scale-95 transition-all duration-300 w-fit flex items-center gap-2 mt-3 disabled:opacity-50"
                >
                  <span>{status === "loading" ? "sending..." : "send message"}</span>
                  <span className="text-xl">→</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer Bottom Bar (Moved ABOVE Dino dot matrix) */}
      <div className="pt-10 flex flex-col sm:flex-row items-center justify-between text-xs text-base/40 gap-4">
        <p>© {new Date().getFullYear()} Edgar (&quot;Raged&quot;). All rights reserved.</p>
        <p className="font-mono text-[11px]">Designed in the spirit of Tayo & built with Next.js</p>
      </div>
    </footer>
  );
}
