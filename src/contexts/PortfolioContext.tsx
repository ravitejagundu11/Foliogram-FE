import React, { createContext, useContext, useState, ReactNode } from 'react'
import { portfolioApi, templateApi, uploadApi, Portfolio, Template, CreatePortfolioRequest, UpdatePortfolioRequest } from '@services/api'

interface PortfolioContextType {
  portfolios: Portfolio[]
  currentPortfolio: Portfolio | null
  templates: Template[]
  loading: boolean
  error: string | null
  fetchPortfolios: () => Promise<void>
  fetchPortfolioById: (id: string) => Promise<Portfolio | null>
  fetchPortfolioBySlug: (slug: string) => Promise<Portfolio | null>
  createPortfolio: (data: CreatePortfolioRequest) => Promise<Portfolio | null>
  updatePortfolio: (id: string, data: UpdatePortfolioRequest) => Promise<Portfolio | null>
  deletePortfolio: (id: string) => Promise<boolean>
  fetchTemplates: (category?: string, premium?: boolean) => Promise<void>
  uploadImage: (file: File) => Promise<string | null>
  uploadMultipleImages: (files: File[]) => Promise<string[]>
  setCurrentPortfolio: (portfolio: Portfolio | null) => void
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined)

export const PortfolioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [currentPortfolio, setCurrentPortfolio] = useState<Portfolio | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPortfolios = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await portfolioApi.getAll()
      setPortfolios(data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch portfolios')
      console.error('Error fetching portfolios:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchPortfolioById = async (id: string): Promise<Portfolio | null> => {
    setLoading(true)
    setError(null)
    try {
      const data = await portfolioApi.getById(id)
      setCurrentPortfolio(data)
      return data
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch portfolio')
      console.error('Error fetching portfolio:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const fetchPortfolioBySlug = async (slug: string): Promise<Portfolio | null> => {
    setLoading(true)
    setError(null)
    try {
      const data = await portfolioApi.getBySlug(slug)
      setCurrentPortfolio(data)
      return data
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch portfolio')
      console.error('Error fetching portfolio:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const createPortfolio = async (data: CreatePortfolioRequest): Promise<Portfolio | null> => {
    setLoading(true)
    setError(null)
    try {
      const portfolio = await portfolioApi.create(data)
      setPortfolios([...portfolios, portfolio])
      setCurrentPortfolio(portfolio)
      return portfolio
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create portfolio')
      console.error('Error creating portfolio:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const updatePortfolio = async (id: string, data: UpdatePortfolioRequest): Promise<Portfolio | null> => {
    setLoading(true)
    setError(null)
    try {
      const portfolio = await portfolioApi.update(id, data)
      setPortfolios(portfolios.map(p => p.id === id ? portfolio : p))
      if (currentPortfolio?.id === id) {
        setCurrentPortfolio(portfolio)
      }
      return portfolio
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update portfolio')
      console.error('Error updating portfolio:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const deletePortfolio = async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      await portfolioApi.delete(id)
      setPortfolios(portfolios.filter(p => p.id !== id))
      if (currentPortfolio?.id === id) {
        setCurrentPortfolio(null)
      }
      return true
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete portfolio')
      console.error('Error deleting portfolio:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  const fetchTemplates = async (category?: string, premium?: boolean) => {
    setLoading(true)
    setError(null)
    try {
      const data = await templateApi.getAll(category, premium)
      setTemplates(data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch templates')
      console.error('Error fetching templates:', err)
    } finally {
      setLoading(false)
    }
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    setError(null)
    try {
      const result = await uploadApi.uploadImage(file)
      return result.url
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload image')
      console.error('Error uploading image:', err)
      return null
    }
  }

  const uploadMultipleImages = async (files: File[]): Promise<string[]> => {
    setError(null)
    try {
      const result = await uploadApi.uploadMultiple(files)
      return result.uploaded.map(item => item.url)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload images')
      console.error('Error uploading images:', err)
      return []
    }
  }

  return (
    <PortfolioContext.Provider
      value={{
        portfolios,
        currentPortfolio,
        templates,
        loading,
        error,
        fetchPortfolios,
        fetchPortfolioById,
        fetchPortfolioBySlug,
        createPortfolio,
        updatePortfolio,
        deletePortfolio,
        fetchTemplates,
        uploadImage,
        uploadMultipleImages,
        setCurrentPortfolio,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  )
}

export const usePortfolio = () => {
  const context = useContext(PortfolioContext)
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider')
  }
  return context
}
