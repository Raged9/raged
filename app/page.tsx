import Navbar from "@/components/Navbar";
import Hero from "@/components/sections/Hero";
import Spacer from "@/components/Spacer";
import OffScreen from "@/components/sections/OffScreen";
import Projects from "@/components/sections/Projects";
import BoardingPassSection from "@/components/sections/BoardingPassSection";
import Footer from "@/components/sections/Footer";
import DinoDotMatrix from "@/components/sections/DinoDotMatrix";
import { getProjects } from "@/lib/projects";
import { getOffScreenPhotos } from "@/lib/photos";

export default async function Home() {
  const [projects, photos] = await Promise.all([
    getProjects(),
    getOffScreenPhotos(),
  ]);

  return (
    <div className="flex scroll-smooth relative flex-col min-h-screen items-center bg-[#FBFAF9] text-[#302f2d] overflow-x-hidden">
      {/* Tayo's distinctive dashed vertical margin lines (background layer) */}
      <div className="hidden lg:block h-full min-h-screen z-0 absolute left-8 xl:left-24 border text-black/10 border-long-dashed pointer-events-none" />
      <div className="hidden lg:block h-full min-h-screen z-0 absolute right-8 xl:right-24 border text-black/10 border-long-dashed pointer-events-none" />

      <Navbar />
      <Hero projects={projects} />
      <Spacer />
      <OffScreen initialPhotos={photos} />
      <Spacer />
      <Projects projects={projects} />
      <Spacer />
      <BoardingPassSection />
      <Spacer />
      <Footer />
      <DinoDotMatrix />
    </div>
  );
}
