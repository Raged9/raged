import { Project } from "@/types";

export const projects: Project[] = [
  {
    id: "ten-thirty-solutions-cms",
    title: "Ten Thirty Solutions CMS",
    subtitle: "Modular full-stack content management system",
    description:
      "A tailored full-stack CMS engineered for scalable digital content workflows with dynamic schema, fast API responses, and role-based permissions.",
    tags: ["Next.js", "TypeScript", "Node.js", "PostgreSQL", "Tailwind CSS"],
    liveUrl: "https://tenthirty.example.com",
    githubUrl: "https://github.com/Raged9/ten-thirty-solutions",
    year: "2024",
    featured: true,
    caseStudy: {
      challenge:
        "Traditional CMS platforms were either too rigid for custom editorial workflows or overly bloated, causing unnecessary latency on content-heavy storefronts.",
      solution:
        "Architected a decoupled headless architecture with responsive REST endpoints, optimistic client-side updates, and granular RBAC controls.",
      techStack: [
        "Next.js App Router",
        "TypeScript",
        "Tailwind CSS",
        "Express / Node.js",
        "PostgreSQL",
        "Prisma",
      ],
      lessons:
        "Deepened expertise in database indexing strategies, schema migrations, and designing intuitive dashboard UX for non-technical editors.",
    },
  },
  {
    id: "type-o-matic",
    title: "Type-O-Matic",
    subtitle: "Vintage typewriter typing practice & speed test",
    description:
      "An interactive tactile typing application inspired by mechanical typewriters, featuring real-time WPM analytics and audio-haptic feedback.",
    tags: ["React", "TypeScript", "Motion", "Web Audio API", "Tailwind CSS"],
    liveUrl: "https://type-o-matic.example.com",
    githubUrl: "https://github.com/Raged9/type-o-matic",
    year: "2024",
    featured: true,
    caseStudy: {
      challenge:
        "Replicating the authentic tactile feel, key-press physics, and low-latency audio response of a vintage typewriter in the browser across diverse devices.",
      solution:
        "Implemented custom keyboard event listeners with sub-millisecond audio buffers using Web Audio API and spring physics via Motion for key depression simulation.",
      techStack: [
        "React",
        "TypeScript",
        "Web Audio API",
        "Motion",
        "Tailwind CSS",
      ],
      lessons:
        "Mastered low-latency web audio synthesis, keyboard event capture nuances, and state batching during ultra-high-speed typing inputs.",
    },
  },
  {
    id: "nlp-cafe-recommendation",
    title: "Cafe Recommendation NLP",
    subtitle: "Semantic text analysis & review-based recommendation engine",
    description:
      "A natural language processing system that analyzes Google Maps review sentiments and extracts cafe ambience profiles to recommend ideal study spots.",
    tags: ["Python", "NLP", "FastAPI", "Cosine Similarity", "TF-IDF", "React"],
    liveUrl: "https://cafe-rec.example.com",
    githubUrl: "https://github.com/Raged9/nlp-cafe-recommendation",
    year: "2024",
    featured: false,
    caseStudy: {
      challenge:
        "User reviews are noisy, informal, and mixed with irrelevant commentary, making standard keyword search ineffective for nuanced preferences like 'quiet ambience with strong espresso'.",
      solution:
        "Applied advanced text preprocessing (lemmatization, slang normalization) combined with TF-IDF vectorization and cosine similarity scoring against user query intents.",
      techStack: [
        "Python",
        "Scikit-Learn",
        "FastAPI",
        "Pandas",
        "Next.js",
        "Tailwind CSS",
      ],
      lessons:
        "Learned the subtleties of Indonesian slang text processing, feature weighting in NLP pipelines, and optimizing recommendation inference latency.",
    },
  },
];
