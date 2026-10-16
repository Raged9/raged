// Portfolio type definitions
export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  techStack?: string[];
  imageUrl?: string;
  liveUrl?: string;
  projectUrl?: string;
  githubUrl?: string;
  year: string;
  featured?: boolean;
  order?: number;
  aspectRatio?: "wide" | "portrait" | "grid";
  caseStudy?: {
    challenge: string;
    solution: string;
    techStack: string[];
    lessons: string;
  };
}

export interface OffScreenPhoto {
  id: string;
  caption: string;
  imageUrl?: string;
  order: number;
  rotation?: number;
  createdAt?: string;
  updatedAt?: string;
}

