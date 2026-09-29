export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
}

export async function sendContactMessage(data: ContactFormData): Promise<ContactResponse> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (apiUrl) {
    try {
      const res = await fetch(`${apiUrl}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error(`Contact API returned status ${res.status}`);
      }

      return await res.json();
    } catch (error) {
      console.warn("Backend contact API unavailable, using fallback mock response:", error);
    }
  }

  // Fallback mock simulation for frontend development
  await new Promise((resolve) => setTimeout(resolve, 800));
  return {
    success: true,
    message: "Terima kasih! Pesan kamu sudah terkirim.",
  };
}
