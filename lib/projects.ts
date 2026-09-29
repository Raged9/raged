import { projects } from "@/data/projects";
import { Project } from "@/types";

/**
 * Fetches all portfolio projects.
 * Currently returns local data from data/projects.ts as fallback.
 * Can be swapped to fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects`)
 * once the backend is ready.
 */
export async function getProjects(): Promise<Project[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (apiUrl) {
    try {
      const res = await fetch(`${apiUrl}/api/projects`, {
        next: { revalidate: 60 },
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback silently to static data if backend is offline
    }
  }

  return projects;
}
