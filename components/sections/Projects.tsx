"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Project } from "@/types";
import { ArrowUpRight, X, ExternalLink, Images, ZoomIn } from "lucide-react";
import { easeOut, easeSoft, viewportOnce } from "@/lib/motion";
import ProjectLightbox, { getProjectImages } from "@/components/ProjectLightbox";
import { api } from "@/lib/api-client";

interface ProjectsProps {
  projects: Project[];
}

export default function Projects({ projects }: ProjectsProps) {
  const [liveProjects, setLiveProjects] = useState<Project[]>(projects);
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<Project | null>(null);
  const [lightboxState, setLightboxState] = useState<{
    project: Project;
    initialIndex: number;
  } | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    api
      .getProjects()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setLiveProjects(data as unknown as Project[]);
        }
      })
      .catch(() => {});
  }, []);

  const categories = ["All", "Web Apps", "Systems & NLP"];

  const filteredProjects =
    activeCategory === "All"
      ? liveProjects
      : activeCategory === "Web Apps"
      ? liveProjects.filter((p) =>
          (p.tags || (p as any).techStack || []).some(
            (t: string) =>
              t.includes("React") ||
              t.includes("Next.js") ||
              t.includes("CMS") ||
              t.includes("TypeScript") ||
              t.includes("Tailwind")
          )
        )
      : liveProjects.filter((p) =>
          (p.tags || (p as any).techStack || []).some(
            (t: string) =>
              t.includes("Python") || t.includes("NLP") || t.includes("FastAPI")
          )
        );

  return (
    <section
      id="projects"
      className="flex flex-col py-16 px-6 md:px-9 relative max-w-304 w-full mx-auto"
    >
      <motion.h2
        className="text-2xl sm:text-3xl md:text-4xl w-full max-w-4xl text-base font-bold tracking-tight leading-snug"
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewportOnce}
        transition={{ duration: 0.7, ease: easeOut }}
      >
        edgar turns difficult problems into clean solutions — and builds digital experiences you might accidentally spend hours on.
      </motion.h2>

      <div className="py-6 gap-6 w-full flex flex-col">
        {/* Category Filter Pills (Tayo-style) */}
        <motion.div
          className="bg-surface-muted w-fit max-w-full my-2 p-1.5 rounded-full flex flex-wrap gap-2 border-4 shadow-inner border-surface"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.6, delay: 0.1, ease: easeOut }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`py-2 px-5 text-xs md:text-sm rounded-full font-semibold transition-all duration-300 ${
                activeCategory === cat
                  ? "bg-base text-bg shadow-sm"
                  : "text-fg/50 hover:text-fg"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full mt-4">
          {filteredProjects.map((project, index) => {
            const projectTags = project.tags || (project as any).techStack || [];
            const projectImages = getProjectImages(project);
            const coverImage = projectImages[0];
            const liveHref = project.liveUrl || project.projectUrl;

            return (
              <motion.div
                key={project.id}
                className="h-auto w-full group flex flex-col justify-between"
                initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.6,
                  delay: reduceMotion ? 0 : Math.min(index * 0.08, 0.3),
                  ease: easeOut,
                }}
              >
                <div>
                  {/* Visual Preview Card matching Tayo */}
                  <div
                    onClick={() => {
                      if (projectImages.length > 0) {
                        setLightboxState({ project, initialIndex: 0 });
                      } else {
                        setSelectedCaseStudy(project);
                      }
                    }}
                    className="w-full p-2.5 shadow-inner rounded-3xl transition-all duration-300 bg-surface-muted overflow-hidden group-hover:bg-base/10 cursor-pointer"
                  >
                    <div className="relative w-full aspect-video bg-gradient-to-br from-base/5 to-base/10 rounded-2xl flex flex-col items-center justify-center overflow-hidden">
                      {coverImage ? (
                        <>
                          <img
                            src={coverImage}
                            alt={project.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          {/* Subtle Hover Overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md text-white text-xs font-mono font-semibold flex items-center gap-1.5 border border-white/15 shadow-lg">
                              <ZoomIn className="w-3.5 h-3.5" />
                              {projectImages.length > 1
                                ? `View ${projectImages.length} Photos`
                                : "Zoom Image"}
                            </span>
                          </div>
                          {projectImages.length > 1 && (
                            <span className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[11px] font-mono font-semibold flex items-center gap-1.5 border border-white/15 shadow-md">
                              <Images className="w-3.5 h-3.5" />
                              {projectImages.length}
                            </span>
                          )}
                        </>
                      ) : (
                        <div className="p-4 text-center flex flex-col items-center justify-center">
                          <span className="text-4xl sm:text-5xl font-bold text-base/20 select-none">
                            {project.title.charAt(0)}
                          </span>
                          <span className="text-xs font-mono text-base/40 mt-1 uppercase tracking-wider">
                            {projectTags[0] || ""}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex flex-col gap-2 mt-4 px-1">
                    <div className="flex justify-between items-start w-full gap-2">
                      <h3 className="text-base text-lg font-semibold tracking-tight">
                        {project.title}
                      </h3>
                      <span className="bg-base/5 text-base/80 text-xs font-mono font-medium rounded-full py-1 px-3 whitespace-nowrap">
                        {project.year || "2024"}
                      </span>
                    </div>

                    <p className="text-base/80 text-xs font-medium">
                      {project.subtitle || ""}
                    </p>

                    <p className="w-full text-base/65 text-sm line-clamp-3 leading-relaxed mt-1">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {projectTags.slice(0, 3).map((tag: string) => (
                        <span
                          key={tag}
                          className="text-[11px] bg-base/5 text-base/70 px-2.5 py-0.5 rounded-full font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                      {projectTags.length > 3 && (
                        <span className="text-[11px] bg-base/5 text-base/50 px-2 py-0.5 rounded-full font-medium">
                          +{projectTags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-4 mt-5 px-1 pt-3 border-t border-base/5">
                <button
                  type="button"
                  onClick={() => setSelectedCaseStudy(project)}
                  className="flex gap-1.5 items-center group/link text-base font-semibold text-xs sm:text-sm hover:opacity-75 transition-opacity cursor-pointer"
                >
                  <span>Read Case Study</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                </button>

                <div className="flex items-center gap-3">
                  {projectImages.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setLightboxState({ project, initialIndex: 0 })}
                      className="text-fg/50 hover:text-fg transition-colors cursor-pointer"
                      title="View Project Gallery"
                    >
                      <Images className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {liveHref && (
                    <a
                      href={liveHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-fg/50 hover:text-fg transition-colors"
                      title="Live Demo"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-fg/50 hover:text-fg transition-colors"
                      title="Source Code"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                        />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
        </div>
      </div>

      {/* Portal-mounted Multi-Image Lightbox Modal */}
      <ProjectLightbox
        project={lightboxState?.project || null}
        initialIndex={lightboxState?.initialIndex || 0}
        onClose={() => setLightboxState(null)}
      />

      {/* Case Study Modal (Clean, Light, Tayo Aesthetic — supports both custom caseStudy & CMS projects) */}
      <AnimatePresence>
        {selectedCaseStudy && (
          <div
            className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6 bg-black/55 backdrop-blur-sm"
            onClick={() => setSelectedCaseStudy(null)}
          >
            <motion.div
              className="bg-surface text-base rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative border border-base/10"
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.25, ease: easeSoft }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-base/10 pb-4 mb-6">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-base/50">
                    Case Study • {selectedCaseStudy.year || "2024"}
                  </span>
                  <h3 className="text-2xl font-bold text-base mt-1">
                    {selectedCaseStudy.title}
                  </h3>
                  {selectedCaseStudy.subtitle && (
                    <p className="text-sm text-base/70 font-medium">
                      {selectedCaseStudy.subtitle}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCaseStudy(null)}
                  className="w-10 h-10 rounded-full bg-base/5 hover:bg-base/10 flex items-center justify-center transition-colors text-base cursor-pointer"
                  aria-label="Close case study"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Project Image Gallery inside Case Study (click any image to zoom) */}
              {getProjectImages(selectedCaseStudy).length > 0 && (
                <div className="mb-6">
                  <h4 className="text-xs font-mono uppercase tracking-widest text-base font-bold mb-2.5">
                    Project Gallery ({getProjectImages(selectedCaseStudy).length})
                  </h4>
                  <div
                    className={`grid gap-2.5 ${
                      getProjectImages(selectedCaseStudy).length === 1
                        ? "grid-cols-1"
                        : "grid-cols-2 sm:grid-cols-3"
                    }`}
                  >
                    {getProjectImages(selectedCaseStudy).map((imgUrl, idx) => (
                      <div
                        key={idx}
                        onClick={() =>
                          setLightboxState({
                            project: selectedCaseStudy,
                            initialIndex: idx,
                          })
                        }
                        className="relative aspect-video rounded-xl overflow-hidden border border-base/10 bg-surface-muted cursor-zoom-in group/thumb"
                      >
                        <img
                          src={imgUrl}
                          alt={`${selectedCaseStudy.title} screenshot ${idx + 1}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-105"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedCaseStudy.caseStudy ? (
                <div className="space-y-6 text-sm text-base/80 leading-relaxed">
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-widest text-base font-bold mb-2">
                      01. The Challenge
                    </h4>
                    <p className="bg-surface-muted p-4 rounded-2xl border border-base/10">
                      {selectedCaseStudy.caseStudy.challenge}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-widest text-base font-bold mb-2">
                      02. The Solution
                    </h4>
                    <p className="bg-surface-muted p-4 rounded-2xl border border-base/10">
                      {selectedCaseStudy.caseStudy.solution}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-widest text-base font-bold mb-2">
                      03. Tech Stack
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCaseStudy.caseStudy.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="bg-base/5 text-base px-3 py-1 rounded-full text-xs font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-widest text-base font-bold mb-2">
                      04. Key Lessons Learned
                    </h4>
                    <p className="bg-surface-muted p-4 rounded-2xl border border-base/10">
                      {selectedCaseStudy.caseStudy.lessons}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-5 text-sm text-base/80 leading-relaxed">
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-widest text-base font-bold mb-2">
                      Overview
                    </h4>
                    <p className="bg-surface-muted p-4 rounded-2xl border border-base/10">
                      {selectedCaseStudy.description}
                    </p>
                  </div>
                  {(selectedCaseStudy.tags || (selectedCaseStudy as any).techStack || []).length > 0 && (
                    <div>
                      <h4 className="text-xs font-mono uppercase tracking-widest text-base font-bold mb-2">
                        Tech Stack
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(selectedCaseStudy.tags || (selectedCaseStudy as any).techStack || []).map(
                          (tech: string) => (
                            <span
                              key={tech}
                              className="bg-base/5 text-base px-3 py-1 rounded-full text-xs font-medium"
                            >
                              {tech}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-8 pt-4 border-t border-base/10 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedCaseStudy(null)}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold bg-base/5 hover:bg-base/10 text-base transition-colors cursor-pointer"
                >
                  Close
                </button>
                {(selectedCaseStudy.liveUrl || selectedCaseStudy.projectUrl) && (
                  <a
                    href={(selectedCaseStudy.liveUrl || selectedCaseStudy.projectUrl) as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-semibold bg-base text-bg hover:bg-base/85 transition-colors"
                  >
                    <span>Visit Live Site</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
