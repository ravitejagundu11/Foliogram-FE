import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

class ApiClient {
  private instance: AxiosInstance

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        // Only redirect to login if 401 and user is not already on login/register pages
        if (error.response?.status === 401 && 
            !window.location.pathname.includes('/login') && 
            !window.location.pathname.includes('/register')) {
          localStorage.removeItem('token')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<any> = await this.instance.get(url, config)
    // Handle wrapped response from backend (status, data structure)
    if (response.data && response.data.data !== undefined) {
      return response.data.data as T
    }
    return response.data
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<any> = await this.instance.post(url, data, config)
    // Handle wrapped response from backend (status, data structure)
    if (response.data && response.data.data !== undefined) {
      return response.data.data as T
    }
    return response.data
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<any> = await this.instance.put(url, data, config)
    // Handle wrapped response from backend (status, data structure)
    if (response.data && response.data.data !== undefined) {
      return response.data.data as T
    }
    return response.data
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<any> = await this.instance.patch(url, data, config)
    // Handle wrapped response from backend (status, data structure)
    if (response.data && response.data.data !== undefined) {
      return response.data.data as T
    }
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<any> = await this.instance.delete(url, config)
    // Handle wrapped response from backend (status, data structure)
    if (response.data && response.data.data !== undefined) {
      return response.data.data as T
    }
    return response.data
  }
}

export const apiClient = new ApiClient()

// Portfolio API endpoints
export interface CreatePortfolioRequest {
  template_id: string
  title: string
  description?: string
}

export interface UpdatePortfolioRequest {
  title?: string
  description?: string
  config?: Record<string, any>
  is_published?: boolean
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
}

export interface Portfolio {
  id: string
  user_id: string
  template_id: string
  title: string
  slug: string
  description: string
  is_published: boolean
  config: string
  view_count: number
  template?: Template
  projects?: Project[]
  skills?: Skill[]
  testimonials?: Testimonial[]
  created_at: string
  updated_at: string
}

export const portfolioApi = {
  getAll: () => apiClient.get<Portfolio[]>('/portfolios/my'),
  getById: (id: string) => apiClient.get<Portfolio>(`/portfolios/${id}`),
  getBySlug: (slug: string) => apiClient.get<Portfolio>(`/portfolios/slug/${slug}`),
  create: (data: CreatePortfolioRequest) => apiClient.post<Portfolio>('/portfolios', data),
  update: (id: string, data: UpdatePortfolioRequest) => apiClient.put<Portfolio>(`/portfolios/${id}`, data),
  delete: (id: string) => apiClient.delete(`/portfolios/${id}`),
  // Public endpoints (no auth required)
  getPublicById: (id: string) => apiClient.get<Portfolio>(`/public/portfolios/${id}`),
  getPublicBySlug: (slug: string) => apiClient.get<Portfolio>(`/public/portfolios/slug/${slug}`),
  getPublicPortfolios: (params?: { page?: number; limit?: number; category?: string; search?: string }) => 
    apiClient.get<{ portfolios: Portfolio[]; pagination: any }>('/public/portfolios', { params }),
}

// Template API endpoints
export interface Template {
  id: string
  name: string
  description: string
  category: string
  preview_url: string
  thumbnail_url: string
  is_active: boolean
  is_premium: boolean
  features: string
  default_config: string
  created_at: string
  updated_at: string
}

export const templateApi = {
  getAll: (category?: string, premium?: boolean) => {
    const params = new URLSearchParams()
    if (category) params.append('category', category)
    if (premium) params.append('premium', 'true')
    const query = params.toString()
    return apiClient.get<Template[]>(`/templates${query ? `?${query}` : ''}`)
  },
  getById: (id: string) => apiClient.get<Template>(`/templates/${id}`),
  getCategories: () => apiClient.get<{ categories: string[] }>('/templates/categories'),
}

// Upload API endpoints
export const uploadApi = {
  uploadImage: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post<{ url: string; filename: string; size: number }>('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  uploadMultiple: (files: File[]) => {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    return apiClient.post<{ uploaded: Array<{ url: string; filename: string; size: number }>; count: number; errors?: string[] }>('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  deleteFile: (filename: string) => apiClient.delete(`/upload/${filename}`),
}

// Project, Skill, Testimonial interfaces
export interface Project {
  id: string
  portfolio_id: string
  title: string
  description: string
  image_url: string
  gallery_urls: string
  demo_url: string
  github_url: string
  tags: string
  technologies: string
  start_date?: string
  end_date?: string
  is_featured: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Skill {
  id: string
  portfolio_id: string
  name: string
  category: string
  level: string
  percentage: number
  icon_url: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Testimonial {
  id: string
  portfolio_id: string
  name: string
  position: string
  company: string
  content: string
  rating: number
  avatar_url: string
  linkedin_url: string
  is_visible: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

// Project API endpoints
export const projectApi = {
  getAll: (portfolioId: string) => 
    apiClient.get<Project[]>(`/portfolios/${portfolioId}/projects`),
  create: (portfolioId: string, data: Partial<Project>) => 
    apiClient.post<Project>(`/portfolios/${portfolioId}/projects`, data),
  update: (portfolioId: string, projectId: string, data: Partial<Project>) => 
    apiClient.put<Project>(`/portfolios/${portfolioId}/projects/${projectId}`, data),
  delete: (portfolioId: string, projectId: string) => 
    apiClient.delete(`/portfolios/${portfolioId}/projects/${projectId}`),
}

// Skill API endpoints
export const skillApi = {
  getAll: (portfolioId: string) => 
    apiClient.get<Skill[]>(`/portfolios/${portfolioId}/skills`),
  create: (portfolioId: string, data: Partial<Skill>) => 
    apiClient.post<Skill>(`/portfolios/${portfolioId}/skills`, data),
  update: (portfolioId: string, skillId: string, data: Partial<Skill>) => 
    apiClient.put<Skill>(`/portfolios/${portfolioId}/skills/${skillId}`, data),
  delete: (portfolioId: string, skillId: string) => 
    apiClient.delete(`/portfolios/${portfolioId}/skills/${skillId}`),
}

// Testimonial API endpoints
export const testimonialApi = {
  getAll: (portfolioId: string) => 
    apiClient.get<Testimonial[]>(`/portfolios/${portfolioId}/testimonials`),
  create: (portfolioId: string, data: Partial<Testimonial>) => 
    apiClient.post<Testimonial>(`/portfolios/${portfolioId}/testimonials`, data),
  update: (portfolioId: string, testimonialId: string, data: Partial<Testimonial>) => 
    apiClient.put<Testimonial>(`/portfolios/${portfolioId}/testimonials/${testimonialId}`, data),
  delete: (portfolioId: string, testimonialId: string) => 
    apiClient.delete(`/portfolios/${portfolioId}/testimonials/${testimonialId}`),
}

// Education API endpoints
export const educationApi = {
  getAll: (portfolioId: string) => 
    apiClient.get(`/portfolios/${portfolioId}/education`),
  create: (portfolioId: string, data: Record<string, unknown>) => 
    apiClient.post(`/portfolios/${portfolioId}/education`, data),
  update: (portfolioId: string, educationId: string, data: Record<string, unknown>) => 
    apiClient.put(`/portfolios/${portfolioId}/education/${educationId}`, data),
  delete: (portfolioId: string, educationId: string) => 
    apiClient.delete(`/portfolios/${portfolioId}/education/${educationId}`),
}

// Experience API endpoints
export const experienceApi = {
  getAll: (portfolioId: string) => 
    apiClient.get(`/portfolios/${portfolioId}/experience`),
  create: (portfolioId: string, data: Record<string, unknown>) => 
    apiClient.post(`/portfolios/${portfolioId}/experience`, data),
  update: (portfolioId: string, experienceId: string, data: Record<string, unknown>) => 
    apiClient.put(`/portfolios/${portfolioId}/experience/${experienceId}`, data),
  delete: (portfolioId: string, experienceId: string) => 
    apiClient.delete(`/portfolios/${portfolioId}/experience/${experienceId}`),
}

// Publication API endpoints
export const publicationApi = {
  getAll: (portfolioId: string) => 
    apiClient.get(`/portfolios/${portfolioId}/publications`),
  create: (portfolioId: string, data: Record<string, unknown>) => 
    apiClient.post(`/portfolios/${portfolioId}/publications`, data),
  update: (portfolioId: string, publicationId: string, data: Record<string, unknown>) => 
    apiClient.put(`/portfolios/${portfolioId}/publications/${publicationId}`, data),
  delete: (portfolioId: string, publicationId: string) => 
    apiClient.delete(`/portfolios/${portfolioId}/publications/${publicationId}`),
}

// Contact API endpoints
export const contactApi = {
  get: (portfolioId: string) => 
    apiClient.get(`/portfolios/${portfolioId}/contact`),
  createOrUpdate: (portfolioId: string, data: Record<string, unknown>) => 
    apiClient.post(`/portfolios/${portfolioId}/contact`, data),
  delete: (portfolioId: string) => 
    apiClient.delete(`/portfolios/${portfolioId}/contact`),
}

// Auth API endpoints
export interface RegisterRequest {
  full_name: string
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: {
    id: number
    full_name: string
    email: string
    created_at: string
  }
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
}

export interface ChangeEmailRequest {
  new_email: string
  current_password: string
}

export interface UpdateProfileRequest {
  full_name?: string
  email?: string
  mobile?: string
  location?: string
  profile_picture?: string
  current_password?: string // Required when changing email
}

export const authApi = {
  register: (data: RegisterRequest) => apiClient.post<AuthResponse>('/register', data),
  login: (data: LoginRequest) => apiClient.post<AuthResponse>('/login', data),
  logout: () => apiClient.post('/logout'),
  changePassword: (data: ChangePasswordRequest) => 
    apiClient.put<{ message: string }>('/change-password', data),
  changeEmail: (data: ChangeEmailRequest) => 
    apiClient.put<{ message: string; user: any; token: string }>('/change-email', data),
  updateProfile: (data: UpdateProfileRequest) => 
    apiClient.put<{ message: string; user: any; token?: string }>('/profile', data),
}
