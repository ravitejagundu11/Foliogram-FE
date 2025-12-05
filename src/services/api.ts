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
        if (error.response?.status === 401) {
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
  getAll: () => apiClient.get<Portfolio[]>('/foliogram/portfolios/my'),
  getById: (id: string) => apiClient.get<Portfolio>(`/foliogram/portfolios/${id}`),
  getBySlug: (slug: string) => apiClient.get<Portfolio>(`/foliogram/portfolios/slug/${slug}`),
  create: (data: CreatePortfolioRequest) => apiClient.post<Portfolio>('/foliogram/portfolios', data),
  update: (id: string, data: UpdatePortfolioRequest) => apiClient.put<Portfolio>(`/foliogram/portfolios/${id}`, data),
  delete: (id: string) => apiClient.delete(`/foliogram/portfolios/${id}`),
  // Public endpoints (no auth required)
  getPublicById: (id: string) => apiClient.get<Portfolio>(`/foliogram/public/portfolios/${id}`),
  getPublicBySlug: (slug: string) => apiClient.get<Portfolio>(`/foliogram/public/portfolios/slug/${slug}`),
  getPublicPortfolios: (params?: { page?: number; limit?: number; category?: string; search?: string }) => 
    apiClient.get<{ portfolios: Portfolio[]; pagination: any }>('/foliogram/public/portfolios', { params }),
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
    return apiClient.get<Template[]>(`/foliogram/templates${query ? `?${query}` : ''}`)
  },
  getById: (id: string) => apiClient.get<Template>(`/foliogram/templates/${id}`),
  getCategories: () => apiClient.get<{ categories: string[] }>('/foliogram/templates/categories'),
}

// Upload API endpoints
export const uploadApi = {
  uploadImage: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post<{ url: string; filename: string; size: number }>('/foliogram/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  uploadMultiple: (files: File[]) => {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    return apiClient.post<{ uploaded: Array<{ url: string; filename: string; size: number }>; count: number; errors?: string[] }>('/foliogram/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  deleteFile: (filename: string) => apiClient.delete(`/foliogram/upload/${filename}`),
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
  create: (portfolioId: string, data: Partial<Project>) => 
    apiClient.post<Project>(`/foliogram/portfolios/${portfolioId}/projects`, data),
  update: (portfolioId: string, projectId: string, data: Partial<Project>) => 
    apiClient.put<Project>(`/foliogram/portfolios/${portfolioId}/projects/${projectId}`, data),
  delete: (portfolioId: string, projectId: string) => 
    apiClient.delete(`/foliogram/portfolios/${portfolioId}/projects/${projectId}`),
}

// Skill API endpoints
export const skillApi = {
  create: (portfolioId: string, data: Partial<Skill>) => 
    apiClient.post<Skill>(`/foliogram/portfolios/${portfolioId}/skills`, data),
  update: (portfolioId: string, skillId: string, data: Partial<Skill>) => 
    apiClient.put<Skill>(`/foliogram/portfolios/${portfolioId}/skills/${skillId}`, data),
  delete: (portfolioId: string, skillId: string) => 
    apiClient.delete(`/foliogram/portfolios/${portfolioId}/skills/${skillId}`),
}

// Testimonial API endpoints
export const testimonialApi = {
  create: (portfolioId: string, data: Partial<Testimonial>) => 
    apiClient.post<Testimonial>(`/foliogram/portfolios/${portfolioId}/testimonials`, data),
  update: (portfolioId: string, testimonialId: string, data: Partial<Testimonial>) => 
    apiClient.put<Testimonial>(`/foliogram/portfolios/${portfolioId}/testimonials/${testimonialId}`, data),
  delete: (portfolioId: string, testimonialId: string) => 
    apiClient.delete(`/foliogram/portfolios/${portfolioId}/testimonials/${testimonialId}`),
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

export const authApi = {
  register: (data: RegisterRequest) => apiClient.post<AuthResponse>('/foliogram/register', data),
  login: (data: LoginRequest) => apiClient.post<AuthResponse>('/foliogram/login', data),
  logout: () => apiClient.post('/foliogram/logout'),
}
