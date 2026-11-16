import type { Metadata } from "next";
import { Poppins, Caveat, IBM_Plex_Mono, Anton, Press_Start_2P, Borel } from "next/font/google";
import Cursor from "@/components/Cursor";
import CloudTransition from "@/components/boarding-pass/CloudTransition";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-caveat",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
});

const borel = Borel({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-borel",
  display: "swap",
});

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
  preload: false,
});

const pressStart2P = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-press-start",
  display: "swap",
  preload: false,
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
      suppressHydrationWarning
      className={`${poppins.variable} ${caveat.variable} ${ibmPlexMono.variable} ${borel.variable} ${anton.variable} ${pressStart2P.variable} scroll-smooth`}
    >
      <head>
        <link
          rel="preconnect"
          href="https://raged-backend-aupn.onrender.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://raged-backend-aupn.onrender.com"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("edgar-theme");if(t==="dark"){document.documentElement.classList.add("dark");document.documentElement.setAttribute("data-theme","dark");}else{document.documentElement.classList.remove("dark");document.documentElement.setAttribute("data-theme","light");}}catch(e){}`,
          }}
        />
      </head>
      <body className="bg-bg text-base antialiased min-h-screen selection:bg-base/10 selection:text-base flex flex-col">
        <Cursor />
        <CloudTransition />
        {children}
      </body>
    </html>
  );
}
