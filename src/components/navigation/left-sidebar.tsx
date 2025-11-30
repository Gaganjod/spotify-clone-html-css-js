"use client";

import { Plus, Globe } from "lucide-react";

const LeftSidebar = () => {
  return (
    <nav className="hidden md:flex flex-col w-[320px] bg-black p-2 gap-y-2 h-full">
      {/* Your Library & CTA Section */}
      <div className="bg-[#121212] rounded-lg flex-1 flex flex-col">
        <header className="px-4 py-3 flex items-center justify-between">
          <button className="flex items-center gap-3 group text-stone-400 hover:text-white transition-colors">
            <svg
              data-encore-id="icon"
              role="img"
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-6 w-6 fill-current"
            >
              <path d="M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1zM15.5 2.134A1 1 0 0 0 14 3v18a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6.464a1 1 0 0 0-.5-.866l-6-3.464zM9 2a1 1 0 0 0-1 1v18a1 1 0 1 0 2 0V3a1 1 0 0 0-1-1z"></path>
            </svg>
            <span className="text-base font-bold">Your Library</span>
          </button>
          <button className="text-stone-400 hover:text-white hover:bg-neutral-800 rounded-full p-1.5 transition-colors">
            <Plus size={16} strokeWidth={2.5} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-2">
          <div className="flex flex-col gap-6 pt-2 pb-4">
            <section className="bg-[#242424] p-4 rounded-md flex flex-col gap-y-3 text-white">
              <p className="font-bold text-base leading-tight">
                Create your first playlist
              </p>
              <p className="font-normal text-sm">
                It's easy, we'll help you
              </p>
              <button className="mt-2 bg-white text-black text-xs font-bold rounded-full py-1.5 px-4 self-start hover:scale-[1.04] transition-transform">
                Create playlist
              </button>
            </section>

            <section className="bg-[#242424] p-4 rounded-md flex flex-col gap-y-3 text-white">
              <p className="font-bold text-base leading-tight">
                Let's find some podcasts to follow
              </p>
              <p className="font-normal text-sm">
                We'll keep you updated on new episodes
              </p>
              <a
                href="/genre/podcasts-web"
                className="mt-2 bg-white text-black text-xs font-bold rounded-full py-1.5 px-4 self-start hover:scale-[1.04] transition-transform inline-block"
              >
                Browse podcasts
              </a>
            </section>
          </div>
        </div>
        
        <div className="mt-auto px-4 pb-4">
          <button className="flex items-center gap-2 border border-neutral-700 hover:border-white text-white text-sm font-bold rounded-full py-1 px-3 hover:scale-[1.04] transition-transform duration-200">
            <Globe size={16} />
            <span>English</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default LeftSidebar;
