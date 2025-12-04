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
export const portfolioApi = {
  getAll: () => apiClient.get('/portfolios'),
  getById: (id: string) => apiClient.get(`/portfolios/${id}`),
  create: (data: any) => apiClient.post('/portfolios', data),
  update: (id: string, data: any) => apiClient.put(`/portfolios/${id}`, data),
  delete: (id: string) => apiClient.delete(`/portfolios/${id}`),
}

// Template API endpoints
export const templateApi = {
  getAll: () => apiClient.get('/templates'),
  getById: (id: string) => apiClient.get(`/templates/${id}`),
  getByCategory: (category: string) => apiClient.get(`/templates?category=${category}`),
}

// Upload API endpoints
export const uploadApi = {
  uploadImage: (file: FormData) => apiClient.post('/upload', file, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadMultiple: (files: FormData) => apiClient.post('/upload/multiple', files, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}

// Project API endpoints
export const projectApi = {
  getAll: (portfolioId: string) => apiClient.get(`/portfolios/${portfolioId}/projects`),
  getById: (portfolioId: string, projectId: string) => apiClient.get(`/portfolios/${portfolioId}/projects/${projectId}`),
  create: (portfolioId: string, data: any) => apiClient.post(`/portfolios/${portfolioId}/projects`, data),
  update: (portfolioId: string, projectId: string, data: any) => apiClient.put(`/portfolios/${portfolioId}/projects/${projectId}`, data),
  delete: (portfolioId: string, projectId: string) => apiClient.delete(`/portfolios/${portfolioId}/projects/${projectId}`),
}

// Skill API endpoints
export const skillApi = {
  getAll: (portfolioId: string) => apiClient.get(`/portfolios/${portfolioId}/skills`),
  getById: (portfolioId: string, skillId: string) => apiClient.get(`/portfolios/${portfolioId}/skills/${skillId}`),
  create: (portfolioId: string, data: any) => apiClient.post(`/portfolios/${portfolioId}/skills`, data),
  update: (portfolioId: string, skillId: string, data: any) => apiClient.put(`/portfolios/${portfolioId}/skills/${skillId}`, data),
  delete: (portfolioId: string, skillId: string) => apiClient.delete(`/portfolios/${portfolioId}/skills/${skillId}`),
}

// Testimonial API endpoints
export const testimonialApi = {
  getAll: (portfolioId: string) => apiClient.get(`/portfolios/${portfolioId}/testimonials`),
  getById: (portfolioId: string, testimonialId: string) => apiClient.get(`/portfolios/${portfolioId}/testimonials/${testimonialId}`),
  create: (portfolioId: string, data: any) => apiClient.post(`/portfolios/${portfolioId}/testimonials`, data),
  update: (portfolioId: string, testimonialId: string, data: any) => apiClient.put(`/portfolios/${portfolioId}/testimonials/${testimonialId}`, data),
  delete: (portfolioId: string, testimonialId: string) => apiClient.delete(`/portfolios/${portfolioId}/testimonials/${testimonialId}`),
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
