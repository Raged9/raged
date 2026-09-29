import Navbar from "@/components/Navbar";
import Hero from "@/components/sections/Hero";
import Spacer from "@/components/Spacer";
import Projects from "@/components/sections/Projects";
import BoardingPassSection from "@/components/sections/BoardingPassSection";
import Footer from "@/components/sections/Footer";
import { getProjects } from "@/lib/projects";

export default async function Home() {
  const projects = await getProjects();

  return (
    <div className="flex scroll-smooth relative flex-col min-h-screen items-center bg-[#FBFAF9] text-[#302f2d] overflow-x-hidden">
      {/* Tayo's distinctive dashed vertical margin lines */}
      <div className="hidden lg:block h-full min-h-screen z-20 absolute left-8 xl:left-24 border text-black/10 border-long-dashed pointer-events-none" />
      <div className="hidden lg:block h-full min-h-screen z-20 absolute right-8 xl:right-24 border text-black/10 border-long-dashed pointer-events-none" />

      <Navbar />
      <Hero />
      <Spacer />
      <Projects projects={projects} />
      <Spacer />
      <BoardingPassSection />
      <Spacer />
      <Footer />
    </div>
  );
}
