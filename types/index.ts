// Portfolio type definitions
export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  liveUrl?: string;
  githubUrl?: string;
  year: string;
  featured?: boolean;
  caseStudy: {
    challenge: string;
    solution: string;
    techStack: string[];
    lessons: string;
  };
}
