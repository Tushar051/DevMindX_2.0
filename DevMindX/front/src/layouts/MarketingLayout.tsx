import { Outlet } from "react-router-dom";
import { Navbar } from "@/sections/Navbar";
import { Footer } from "@/sections/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";

export function MarketingLayout() {
  return (
    <SmoothScroll>
      <div className="text-zinc-800 text-sm not-italic normal-nums font-normal accent-auto bg-white box-border caret-transparent block tracking-[normal] leading-5 list-outside list-disc min-h-full pointer-events-auto text-start indent-[0px] normal-case visible border-separate font-inter_tight">
        <Navbar />
        <main className="min-h-screen">
          <Outlet />
        </main>
        <Footer />
      </div>
    </SmoothScroll>
  );
}
