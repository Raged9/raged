export interface HanglineItem {
  id: string;
  number: string;
  title: string;
  subtitle: string; // e.g. "WEST JAKARTA · 2026"
  specs: string; // e.g. "B.SC. IN INFORMATICS · S.KOM. · GRADUATION MILESTONE"
  category: "milestone" | "certificate" | "competition" | "event";
  description: string;
  image: string;
  badgeText?: string;
  issuer?: string;
  credentialUrl?: string;
  order?: number;
  /** Optional rich visual certificate/print style when displaying credentials */
  certificateOverlay?: {
    type: "certificate" | "award" | "event";
    issuerLogoText: string;
    credentialId: string;
    date: string;
    accentColor: string;
    recipient: string;
  } | null;
}

export const HANGLINE_ITEMS: HanglineItem[] = [
  {
    id: "skom-graduation",
    number: "01",
    title: "B.Sc. in Informatics (S.Kom.)",
    subtitle: "WEST JAKARTA · GRADUATION MILESTONE",
    specs: "INFORMATICS ENGINEERING · S.KOM. · THESIS DEFENDED · HONORS",
    category: "milestone",
    description:
      "Completed undergraduate studies in Informatics (Sarjana Komputer / S.Kom.), specializing in full-stack software engineering, mobile application architecture, and applied natural language processing.",
    image: "/edgar-warm.jpg",
    badgeText: "DEGREE MILESTONE",
    issuer: "Bachelor of Science in Informatics",
  },
  {
    id: "ai-nlp-research",
    number: "02",
    title: "Applied NLP & Sentiment Intelligence",
    subtitle: "RESEARCH & CAPSTONE · 2025",
    specs: "PYTHON · TRANSFORMERS · FASTAPI · DEEP LEARNING",
    category: "certificate",
    description:
      "Engineered and evaluated an end-to-end Indonesian sentiment analysis and text classification pipeline, bridging machine learning inference with an interactive analytics dashboard.",
    image: "/edgar-warm.jpg",
    badgeText: "RESEARCH & AI",
    issuer: "Informatics Research & AI Track",
    certificateOverlay: {
      type: "certificate",
      issuerLogoText: "APPLIED AI & NATURAL LANGUAGE PROCESSING",
      credentialId: "CERT-NLP-2025-EDG",
      date: "2025",
      accentColor: "#10B981",
      recipient: "Christopher Edgar",
    },
  },
  {
    id: "fullstack-web-cert",
    number: "03",
    title: "Full-Stack Web Engineering",
    subtitle: "CERTIFICATION · 2024",
    specs: "NEXT.JS · TYPESCRIPT · NODE.JS · POSTGRESQL · MONGODB",
    category: "certificate",
    description:
      "Comprehensive certification in modern full-stack web architecture: server-side rendering, RESTful API design, relational & document databases, and cloud deployment workflows.",
    image: "/edgar-red.jpg",
    badgeText: "CERTIFIED DEVELOPER",
    issuer: "Full-Stack Engineering Track",
    certificateOverlay: {
      type: "certificate",
      issuerLogoText: "MODERN FULL-STACK WEB ARCHITECTURE",
      credentialId: "FSW-TS-2024-09",
      date: "2024",
      accentColor: "#3B82F6",
      recipient: "Christopher Edgar",
    },
  },
  {
    id: "hackathon-finalist",
    number: "04",
    title: "National Tech Hackathon & Case Sprint",
    subtitle: "COMPETITION · 2024",
    specs: "36-HOUR SPRINT · TEAM LEAD & FULL-STACK · RAPID PROTOTYPING",
    category: "competition",
    description:
      "Led system architecture and frontend engineering during an intensive 36-hour hackathon sprint, delivering a working AI-assisted productivity prototype from concept to live jury pitch.",
    image: "/edgar-warm.jpg",
    badgeText: "COMPETITION",
    issuer: "National Collegiate Hackathon",
    certificateOverlay: {
      type: "award",
      issuerLogoText: "HACKATHON FINALIST & SOFTWARE BUILDER",
      credentialId: "HACK-ID-2024",
      date: "2024",
      accentColor: "#F59E0B",
      recipient: "Christopher Edgar",
    },
  },
  {
    id: "campus-tech-committee",
    number: "05",
    title: "Informatics Student Committee & Tech Summit",
    subtitle: "CAMPUS EVENT · 2023 — 2024",
    specs: "EVENT ORGANIZER · TECHNICAL DIVISION · WORKSHOPS & SEMINARS",
    category: "event",
    description:
      "Served on the technical and organizing committee for campus-wide informatics workshops, coding bootcamps, and annual technology seminars for student participants.",
    image: "/edgar-beach.jpg",
    badgeText: "LEADERSHIP & EVENT",
    issuer: "Informatics Student Association",
  },
  {
    id: "mobile-flutter-cert",
    number: "06",
    title: "Cross-Platform Mobile Development",
    subtitle: "CERTIFICATION · 2024",
    specs: "FLUTTER · DART · CLEAN ARCHITECTURE · STATE MANAGEMENT",
    category: "certificate",
    description:
      "Built and shipped responsive iOS & Android applications using Flutter and Dart, implementing clean architecture, custom animations, and offline-first data synchronization.",
    image: "/edgar-red.jpg",
    badgeText: "MOBILE ENGINEERING",
    issuer: "Mobile Engineering Track",
    certificateOverlay: {
      type: "certificate",
      issuerLogoText: "FLUTTER MULTI-PLATFORM ARCHITECTURE",
      credentialId: "FLT-MOB-2024",
      date: "2024",
      accentColor: "#06B6D4",
      recipient: "Christopher Edgar",
    },
  },
  {
    id: "formal-id-milestone",
    number: "07",
    title: "Academic & Professional Induction",
    subtitle: "JAKARTA · ACADEMIC ARCHIVE",
    specs: "COMPUTER SCIENCE · SOFTWARE ENGINEERING · S.KOM. CANDIDATE",
    category: "milestone",
    description:
      "Official academic portrait marking the transition from computer science foundations into production software engineering and research.",
    image: "/edgar-red.jpg",
    badgeText: "ACADEMIC ARCHIVE",
    issuer: "Informatics Department",
  },
  {
    id: "photography-horizon",
    number: "08",
    title: "Beyond the Terminal — Coastal Horizon",
    subtitle: "ENOSHIMA COAST · SNAPSHOT",
    specs: "24MM · f/5.6 · 1/800 · ISO 100 · OPEN WATER",
    category: "milestone",
    description:
      "Stepping away from the code editor to capture open water, coastal winds, and quiet horizons — a reminder that thoughtful engineering starts with observing the real world.",
    image: "/edgar-beach.jpg",
    badgeText: "LIFE MOMENT",
    issuer: "Personal Archive",
  },
];
