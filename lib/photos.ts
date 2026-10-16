import { OffScreenPhoto } from "@/types";

export const DEFAULT_OFF_SCREEN_PHOTOS: OffScreenPhoto[] = [
  { id: "photo-1", caption: "coffee & toast", imageUrl: "", order: 1, rotation: -6 },
  { id: "photo-2", caption: "night lights", imageUrl: "", order: 2, rotation: -3 },
  { id: "photo-3", caption: "workspace desk", imageUrl: "", order: 3, rotation: -1 },
  { id: "photo-4", caption: "cat doodle", imageUrl: "", order: 4, rotation: 1 },
  { id: "photo-5", caption: "crescent moon", imageUrl: "", order: 5, rotation: -2 },
  { id: "photo-6", caption: "portrait", imageUrl: "", order: 6, rotation: 3 },
  { id: "photo-7", caption: "rocky cove", imageUrl: "", order: 7, rotation: -1 },
  { id: "photo-8", caption: "dog in the sun", imageUrl: "", order: 8, rotation: 5 },
];

/**
 * Fetches off-screen polaroid photos.
 * Connects to the backend REST API if available, or returns default placeholders.
 */
export async function getOffScreenPhotos(): Promise<OffScreenPhoto[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  try {
    const res = await fetch(`${apiUrl}/api/photos`, {
      next: { revalidate: 60 },
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch {
    // Fallback silently to static data if backend is offline
  }

  return DEFAULT_OFF_SCREEN_PHOTOS;
}
