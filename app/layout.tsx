import type { Metadata } from "next";
import { Poppins, Caveat, IBM_Plex_Mono } from "next/font/google";
import Cursor from "@/components/Cursor";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-caveat",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "edgar.",
  description:
    "portfolio of edgar (raged), an informatics student building things with code.",
  icons: {
    icon: "/porto-icon.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${caveat.variable} ${ibmPlexMono.variable} scroll-smooth`}
    >
      <body className="bg-[#FBFAF9] text-[#302f2d] antialiased min-h-screen selection:bg-base/10 selection:text-base flex flex-col">
        <Cursor />
        {children}
      </body>
    </html>
  );
}
