export interface Template {
  id: string
  name: string
  category: 'Engineers/Diploma' | 'Creatives' | 'Business' | 'Academic'
  description: string
  thumbnail: string
  previewUrl?: string
  isPremium: boolean
  tags: string[]
  layoutType: string
}

export interface PortfolioConfig {
  id?: string
  templateId: string
  headline: string
  description: string
  profilePicture?: string
  theme: {
    primaryColor: string
    secondaryColor: string
    accentColor: string
    backgroundColor: string
    textColor: string
  }
  typography: {
    headingFont: string
    bodyFont: string
    fontSize: 'small' | 'medium' | 'large'
  }
  layout: {
    headerStyle: 'centered' | 'left' | 'right'
    spacing: 'compact' | 'comfortable' | 'spacious'
    cardStyle: 'rounded' | 'sharp' | 'minimal'
  }
  sections: {
    about: boolean
    experience: boolean
    education: boolean
    projects: boolean
    skills: boolean
    contact: boolean
  }
  socialLinks: {
    github?: string
    linkedin?: string
    twitter?: string
    website?: string
  }
}

export interface Portfolio extends PortfolioConfig {
  id: string
  userId: string
  name: string
  contactEmail?: string
  slug: string
  isPublished: boolean
  views: number
  likes: number
  createdAt: string
  updatedAt: string
}

export interface Project {
  id?: string
  portfolioId: string
  title: string
  description: string
  images: string[]
  techStack: string[]
  demoUrl?: string
  codeUrl?: string
  featured: boolean
  order: number
  createdAt?: string
  updatedAt?: string
}

export interface Skill {
  id?: string
  portfolioId: string
  name: string
  category: 'Frontend' | 'Backend' | 'Database' | 'DevOps' | 'Tools' | 'Other'
  proficiency: 1 | 2 | 3 | 4 | 5
  order: number
  createdAt?: string
  updatedAt?: string
}

export interface Testimonial {
  id?: string
  portfolioId: string
  name: string
  role: string
  company: string
  content: string
  avatar: string
  rating: number
  order: number
  createdAt?: string
  updatedAt?: string
}

export interface MediaUpload {
  file: File
  preview: string
  progress: number
  uploaded: boolean
}
