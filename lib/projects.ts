import { projects } from "@/data/projects";
import { Project } from "@/types";

/**
 * Fetches all portfolio projects.
 * Currently returns local data from data/projects.ts as fallback.
 * Can be swapped to fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects`)
 * once the backend is ready.
 */
export async function getProjects(): Promise<Project[]> {
  const rawUrl = process.env.NEXT_PUBLIC_API_URL;

  if (rawUrl) {
    const apiUrl = rawUrl.replace(/\/+$/, "");
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`${apiUrl}/api/projects`, {
        next: { revalidate: 60 },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data: Project[] = await res.json();
        // Strip multi-hundred-KB inline base64 data URLs from SSR HTML serialization
        // so the initial HTML stays ~20KB instead of 1.17MB (client deduplicated fetch hydrates base64 images).
        return data.map((p) => ({
          ...p,
          imageUrl:
            p.imageUrl && p.imageUrl.startsWith("data:") && p.imageUrl.length > 4096
              ? ""
              : p.imageUrl,
          images: Array.isArray((p as any).images)
            ? (p as any).images.filter(
                (img: string) => !(typeof img === "string" && img.startsWith("data:") && img.length > 4096)
              )
            : undefined,
        }));
      }
    } catch {
      // Fallback immediately to static data if backend is cold-starting or offline;
      // Client-side useEffect in Hero.tsx & Projects.tsx will seamlessly hydrate once Render wakes up!
    }
  }

  return projects;
}
