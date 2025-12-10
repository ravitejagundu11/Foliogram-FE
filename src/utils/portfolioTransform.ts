import type { Portfolio, Project, Skill, Testimonial } from '../types/portfolio'

/**
 * Transform backend project response (snake_case) to frontend format (camelCase)
 */
export const transformProject = (backendProject: Record<string, unknown>): Project => {
  // Parse JSON fields
  let images: string[] = []
  let techStack: string[] = []

  try {
    const galleryUrls = backendProject.gallery_urls as string | string[]
    images = typeof galleryUrls === 'string' 
      ? JSON.parse(galleryUrls || '[]') 
      : galleryUrls || []
  } catch { images = [] }

  try {
    const technologies = backendProject.technologies as string | string[]
    techStack = typeof technologies === 'string' 
      ? JSON.parse(technologies || '[]') 
      : technologies || []
  } catch { techStack = [] }

  // Add image_url to images if it exists
  if (backendProject.image_url && typeof backendProject.image_url === 'string') {
    images = [backendProject.image_url as string, ...images]
  }

  return {
    id: backendProject.id as string,
    portfolioId: backendProject.portfolio_id as string,
    title: (backendProject.title as string) || '',
    description: (backendProject.description as string) || '',
    images,
    techStack,
    demoUrl: (backendProject.demo_url as string) || '',
    codeUrl: (backendProject.github_url as string) || '',
    featured: (backendProject.is_featured as boolean) || false,
    order: (backendProject.sort_order as number) || 0,
    createdAt: backendProject.created_at as string,
    updatedAt: backendProject.updated_at as string
  }
}

/**
 * Transform backend skill response (snake_case) to frontend format (camelCase)
 */
export const transformSkill = (backendSkill: Record<string, unknown>): Skill => {
  // Map percentage to proficiency (1-5 scale)
  const percentage = (backendSkill.percentage as number) || 0
  const proficiency = Math.min(5, Math.max(1, Math.ceil(percentage / 20))) as 1 | 2 | 3 | 4 | 5

  return {
    id: backendSkill.id as string,
    portfolioId: backendSkill.portfolio_id as string,
    name: (backendSkill.name as string) || '',
    category: ((backendSkill.category as string) || 'Other') as Skill['category'],
    proficiency,
    order: (backendSkill.sort_order as number) || 0,
    createdAt: backendSkill.created_at as string,
    updatedAt: backendSkill.updated_at as string
  }
}

/**
 * Transform backend testimonial response (snake_case) to frontend format (camelCase)
 */
export const transformTestimonial = (backendTestimonial: Record<string, unknown>): Testimonial => {
  return {
    id: backendTestimonial.id as string,
    portfolioId: backendTestimonial.portfolio_id as string,
    name: (backendTestimonial.name as string) || '',
    role: (backendTestimonial.position as string) || '',
    company: (backendTestimonial.company as string) || '',
    content: (backendTestimonial.content as string) || '',
    avatar: (backendTestimonial.avatar_url as string) || '',
    rating: (backendTestimonial.rating as number) || 5,
    order: (backendTestimonial.sort_order as number) || 0,
    createdAt: backendTestimonial.created_at as string,
    updatedAt: backendTestimonial.updated_at as string
  }
}

/**
 * Transform backend education response to frontend format
 * Backend fields: institution, degree, field, start_date, end_date, grade, description
 * Frontend expects: schoolName, level, course, startDate, endDate
 */
export const transformEducation = (backendEducation: Record<string, unknown>) => {
  return {
    id: backendEducation.id as string,
    portfolioId: backendEducation.portfolio_id as string,
    // Map backend fields to frontend field names
    schoolName: (backendEducation.institution as string) || '',
    level: (backendEducation.degree as string) || '',
    course: (backendEducation.field as string) || '',
    startDate: (backendEducation.start_date as string) || '',
    endDate: (backendEducation.end_date as string) || '',
    grade: (backendEducation.grade as string) || '',
    description: (backendEducation.description as string) || '',
    order: (backendEducation.sort_order as number) || 0,
    createdAt: backendEducation.created_at as string,
    updatedAt: backendEducation.updated_at as string
  }
}

/**
 * Transform backend experience response to frontend format
 * Backend fields: company, position, location, start_date, end_date, is_current, description
 * Frontend expects: role, company, type, startDate, endDate, achievements
 */
export const transformExperience = (backendExperience: Record<string, unknown>) => {
  // Parse description as achievements array if possible
  let achievements: string[] = []
  const description = (backendExperience.description as string) || ''
  if (description) {
    // Split by newlines or bullet points
    achievements = description.split(/[\n•-]/).map(s => s.trim()).filter(s => s.length > 0)
    if (achievements.length === 0) achievements = [description]
  }

  return {
    id: backendExperience.id as string,
    portfolioId: backendExperience.portfolio_id as string,
    // Map backend fields to frontend field names
    role: (backendExperience.position as string) || '',
    company: (backendExperience.company as string) || '',
    type: (backendExperience.location as string) || 'Full Time', // Use location as type or default
    startDate: (backendExperience.start_date as string) || '',
    endDate: (backendExperience.end_date as string) || '',
    isCurrent: (backendExperience.is_current as boolean) || false,
    achievements,
    description: description,
    order: (backendExperience.sort_order as number) || 0,
    createdAt: backendExperience.created_at as string,
    updatedAt: backendExperience.updated_at as string
  }
}

/**
 * Transform backend publication response to frontend format
 * Backend fields: title, authors, journal, conference, year, doi, url, abstract, type
 * Frontend expects: title, organization, date, description
 */
export const transformPublication = (backendPublication: Record<string, unknown>) => {
  // Combine journal/conference as organization
  const organization = (backendPublication.journal as string) || 
                       (backendPublication.conference as string) || 
                       (backendPublication.authors as string) || ''
  
  // Convert year to date format
  const year = (backendPublication.year as string) || ''
  const date = year ? `${year}-01-01` : ''

  return {
    id: backendPublication.id as string,
    portfolioId: backendPublication.portfolio_id as string,
    // Map backend fields to frontend field names
    title: (backendPublication.title as string) || '',
    organization,
    date,
    description: (backendPublication.abstract as string) || '',
    // Keep original fields for saving back
    authors: (backendPublication.authors as string) || '',
    journal: (backendPublication.journal as string) || '',
    conference: (backendPublication.conference as string) || '',
    year,
    doi: (backendPublication.doi as string) || '',
    url: (backendPublication.url as string) || '',
    abstract: (backendPublication.abstract as string) || '',
    type: (backendPublication.type as string) || '',
    order: (backendPublication.sort_order as number) || 0,
    createdAt: backendPublication.created_at as string,
    updatedAt: backendPublication.updated_at as string
  }
}

/**
 * Transform backend contact response to frontend format
 * Backend fields: email, phone, address, city, country, map_url
 * Frontend expects: name, phone, email, address
 */
export const transformContact = (backendContact: Record<string, unknown>) => {
  // Combine address fields
  const addressParts = [
    backendContact.address,
    backendContact.city,
    backendContact.country
  ].filter(Boolean)
  const fullAddress = addressParts.join(', ')

  return {
    id: backendContact.id as string,
    portfolioId: backendContact.portfolio_id as string,
    // Map backend fields to frontend field names
    name: '', // Backend doesn't have name, keep empty
    email: (backendContact.email as string) || '',
    phone: (backendContact.phone as string) || '',
    address: fullAddress || (backendContact.address as string) || '',
    // Keep original fields for saving back
    city: (backendContact.city as string) || '',
    country: (backendContact.country as string) || '',
    mapUrl: (backendContact.map_url as string) || '',
    createdAt: backendContact.created_at as string,
    updatedAt: backendContact.updated_at as string
  }
}

/**
 * Transform backend portfolio response (snake_case) to frontend format (camelCase)
 * Backend returns: user_id, template_id, is_published, view_count, created_at, etc.
 * Frontend expects: userId, templateId, isPublished, views, createdAt, etc.
 */
export const transformPortfolio = (backendPortfolio: Record<string, unknown>): Portfolio => {
  // Parse config JSON if it's a string
  let config: Record<string, unknown> = {}
  if (backendPortfolio.config) {
    try {
      config = typeof backendPortfolio.config === 'string' 
        ? JSON.parse(backendPortfolio.config as string) 
        : backendPortfolio.config as Record<string, unknown>
    } catch (e) {
      console.warn('Failed to parse portfolio config:', e)
    }
  }

  // Transform nested arrays
  const projects = Array.isArray(backendPortfolio.projects) 
    ? (backendPortfolio.projects as Record<string, unknown>[]).map(transformProject)
    : []
  
  const skills = Array.isArray(backendPortfolio.skills)
    ? (backendPortfolio.skills as Record<string, unknown>[]).map(transformSkill)
    : []
  
  const testimonials = Array.isArray(backendPortfolio.testimonials)
    ? (backendPortfolio.testimonials as Record<string, unknown>[]).map(transformTestimonial)
    : []

  const education = Array.isArray(backendPortfolio.education)
    ? (backendPortfolio.education as Record<string, unknown>[]).map(transformEducation)
    : []

  const experience = Array.isArray(backendPortfolio.experience)
    ? (backendPortfolio.experience as Record<string, unknown>[]).map(transformExperience)
    : []

  const publications = Array.isArray(backendPortfolio.publications)
    ? (backendPortfolio.publications as Record<string, unknown>[]).map(transformPublication)
    : []

  const contact = backendPortfolio.contact 
    ? transformContact(backendPortfolio.contact as Record<string, unknown>)
    : null

  const layoutStyle = config.layoutStyle as Record<string, string> | undefined

  return {
    id: backendPortfolio.id as string,
    userId: backendPortfolio.user_id as string,
    templateId: backendPortfolio.template_id as string,
    name: (backendPortfolio.title as string) || (backendPortfolio.name as string) || 'Untitled Portfolio',
    headline: (config.headline as string) || (backendPortfolio.headline as string) || '',
    description: (backendPortfolio.description as string) || '',
    slug: (backendPortfolio.slug as string) || '',
    isPublished: (backendPortfolio.is_published as boolean) || false,
    views: (backendPortfolio.view_count as number) || 0,
    likes: 0, // Backend doesn't have this yet
    createdAt: backendPortfolio.created_at as string,
    updatedAt: backendPortfolio.updated_at as string,
    publishedAt: backendPortfolio.published_at as string,
    profilePicture: (config.profilePicture as string) || (backendPortfolio.profilePicture as string) || '',
    // Set contactEmail from contact data if available, otherwise fallback to config
    contactEmail: contact?.email || (backendPortfolio.contactEmail as string) || (config.contactEmail as string) || '',
    theme: {
      primaryColor: (config.primaryColor as string) || '#3B82F6',
      secondaryColor: (config.secondaryColor as string) || '#10B981',
      accentColor: '#F59E0B',
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937'
    },
    typography: {
      headingFont: (config.headingFont as string) || 'Inter',
      bodyFont: (config.bodyFont as string) || 'Open Sans',
      fontSize: 'medium' as const
    },
    layout: {
      headerStyle: (layoutStyle?.headerStyle || 'centered') as 'centered' | 'left' | 'right',
      spacing: (layoutStyle?.spacing || 'comfortable') as 'compact' | 'comfortable' | 'spacious',
      cardStyle: (layoutStyle?.cardStyle || 'rounded') as 'rounded' | 'sharp' | 'minimal'
    },
    sections: {
      about: true,
      education: true,
      experience: true,
      projects: true,
      publications: true,
      skills: true,
      testimonials: true,
      contact: true
    },
    socialLinks: {
      github: (config.socialLinks as Record<string, string>)?.github || (backendPortfolio.github_url as string) || '',
      linkedin: (config.socialLinks as Record<string, string>)?.linkedin || (backendPortfolio.linkedin_url as string) || '',
      twitter: (config.socialLinks as Record<string, string>)?.twitter || (backendPortfolio.twitter_url as string) || '',
      website: (config.socialLinks as Record<string, string>)?.website || (backendPortfolio.website_url as string) || ''
    },
    // Include transformed embedded data
    projects,
    skills,
    testimonials,
    // Section content for education, experience, publications, contact
    sectionContent: {
      education,
      experience,
      publications,
      contact: contact ? [contact] : []
    }
  } as Portfolio
}
