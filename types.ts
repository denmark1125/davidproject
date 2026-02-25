
export interface Experience {
  id: string;
  period: string;
  company: string;
  role: string;
  description: string[];
}

export interface Skill {
  id: string;
  category: string;
  items: string[];
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  description: string;
  longDescription?: string;
  imageUrl: string;
  externalLink?: string;
}

export interface PerformanceMetric {
  id: string;
  label: string;
  value: string;
}

export interface ResumeData {
  experiences: Experience[];
  skills: Skill[];
  performance: PerformanceMetric[];
  portfolio: PortfolioItem[];
  personalInfo: {
    name: string;
    englishName: string;
    title: string;
    bio: string;
    email: string;
    location: string;
    profileImageUrl: string;
    instagramUrl?: string;
    pdfUrl?: string;
  };
}
