"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import {
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart as RechartsBarChart,
  Bar,
  Legend,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { Eye, Heart, ExternalLink, Trash2, EyeOff, Upload, FileText, MessageCircle, Share2, BarChart } from "lucide-react";
import { apiClient } from "../services/api";
import type { Portfolio } from "../types/portfolio";
import type { BlogPost } from "../types/blog";

export default function AnalyticsPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [allPortfolios, setAllPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [showUnpublished, setShowUnpublished] = useState(false);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [allBlogPosts, setAllBlogPosts] = useState<BlogPost[]>([]);
  const [showUnpublishedPosts, setShowUnpublishedPosts] = useState(false);
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [mySubscriptions, setMySubscriptions] = useState<any[]>([]);

  useEffect(() => {
    async function loadPortfolios() {
      try {
        // Try to fetch from backend API
        const response = await apiClient.get<Portfolio[]>('/portfolios/user/me');
        setAllPortfolios(response);
        const publishedPortfolios = response.filter((p: Portfolio) => p.isPublished);
        setPortfolios(publishedPortfolios);
        
        // Set first portfolio as selected by default
        if (publishedPortfolios.length > 0) {
          setSelectedPortfolio(publishedPortfolios[0]);
        }
      } catch (err) {
        console.warn('Backend API not available, loading from localStorage');
        
        // Fallback: Load from localStorage
        // Get current user from AuthContext (stored in localStorage)
        const currentUserData = localStorage.getItem('user');
        let currentUsername = '';
        let currentEmail = '';
        
        if (currentUserData) {
          try {
            const parsedUser = JSON.parse(currentUserData);
            currentUsername = parsedUser.username || '';
            currentEmail = parsedUser.email || '';
          } catch (parseErr) {
            console.error('Failed to parse user data:', parseErr);
          }
        }
        
        console.log('Current user:', { username: currentUsername, email: currentEmail });
        
        const localPortfolios = JSON.parse(localStorage.getItem('portfolios') || '{}');
        const portfoliosList = Object.values(localPortfolios) as Portfolio[];
        
        console.log('All portfolios from localStorage:', portfoliosList.map(p => ({ id: p.id, name: p.name, userId: p.userId })));
        
        // Filter to only include portfolios owned by current user
        const userPortfolios = portfoliosList.filter((p: Portfolio) => 
          p.userId === currentUsername || p.userId === currentEmail
        );
        
        console.log('Filtered user portfolios:', userPortfolios.map(p => ({ id: p.id, name: p.name, userId: p.userId })));
        
        setAllPortfolios(userPortfolios);
        const publishedPortfolios = userPortfolios.filter((p: any) => p.isPublished);
        
        setPortfolios(publishedPortfolios);
        
        if (publishedPortfolios.length > 0) {
          setSelectedPortfolio(publishedPortfolios[0]);
        }
      }
    }

    async function loadBlogPosts() {
      try {
        // Try to fetch from backend API
        const response = await apiClient.get<BlogPost[]>('/blog/user/me');
        setAllBlogPosts(response);
        const publishedPosts = response.filter((p: BlogPost) => p.published);
        setBlogPosts(publishedPosts);
      } catch (err) {
        console.warn('Backend API not available, loading blog posts from localStorage');
        
        // Fallback: Load from localStorage
        // Get current user from AuthContext (stored in localStorage)
        const currentUserData = localStorage.getItem('user');
        let currentUsername = '';
        
        if (currentUserData) {
          try {
            const parsedUser = JSON.parse(currentUserData);
            currentUsername = parsedUser.username || '';
          } catch (parseErr) {
            console.error('Failed to parse user data:', parseErr);
          }
        }
        
        console.log('Current user for blog posts:', currentUsername);
        
        const localPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
        
        console.log('All blog posts from localStorage:', localPosts.map((p: BlogPost) => ({ id: p.id, title: p.title, author: p.author })));
        
        // Filter to only include posts authored by current user
        const userPosts = localPosts.filter((p: BlogPost) => p.author === currentUsername);
        
        console.log('Filtered user blog posts:', userPosts.map((p: BlogPost) => ({ id: p.id, title: p.title, author: p.author })));
        
        setAllBlogPosts(userPosts);
        const publishedPosts = userPosts.filter((p: BlogPost) => p.published);
        setBlogPosts(publishedPosts);
      }
    }

    loadPortfolios();
    loadBlogPosts();
    loadSubscribers();
  }, []);

  async function loadSubscribers() {
    try {
      // Try to fetch subscribers from backend API
      const response = await apiClient.get<any[]>('/subscriptions/me/subscribers');
      setSubscribers(response);
      
      // Load my subscriptions
      const mySubsResponse = await apiClient.get<any[]>('/subscriptions/me');
      setMySubscriptions(mySubsResponse);
    } catch (err) {
      console.warn('Backend API not available, loading subscribers from localStorage');
      
      // Fallback: Load from localStorage
      const allSubscriptions = JSON.parse(localStorage.getItem('subscriptions') || '{}');
      const currentUserId = localStorage.getItem('currentUserId') || 'current-user';
      
      // Get subscribers (users who subscribed to me)
      const mySubscribersList = Object.entries(allSubscriptions)
        .filter(([_, sub]: [string, any]) => sub.subscribedTo === currentUserId)
        .map(([portfolioId, sub]: [string, any]) => ({
          id: portfolioId,
          subscriberId: sub.subscriberId || 'unknown',
          subscriberName: sub.subscriberName || 'Anonymous User',
          subscriberEmail: sub.subscriberEmail || '',
          subscribedAt: sub.subscribedAt,
          portfolioId: portfolioId
        }));
      
      setSubscribers(mySubscribersList);
      
      // Get my subscriptions (portfolios I subscribed to)
      const mySubsList = Object.entries(allSubscriptions)
        .filter(([_, sub]: [string, any]) => sub.subscriberId === currentUserId)
        .map(([portfolioId, sub]: [string, any]) => ({
          portfolioId,
          subscribedAt: sub.subscribedAt
        }));
      
      setMySubscriptions(mySubsList);
    }
  }

  const handleRemoveSubscriber = async (subscriberId: string, portfolioId: string) => {
    if (!window.confirm('Remove this subscriber? They will no longer receive updates.')) return;
    
    try {
      await apiClient.delete(`/subscriptions/${portfolioId}/subscriber/${subscriberId}`);
      setSubscribers(subscribers.filter(s => s.subscriberId !== subscriberId));
      alert('✓ Subscriber removed successfully!');
    } catch (err) {
      console.warn('Backend API not available, removing from localStorage');
      
      // Fallback: Remove from localStorage
      const allSubscriptions = JSON.parse(localStorage.getItem('subscriptions') || '{}');
      delete allSubscriptions[portfolioId];
      localStorage.setItem('subscriptions', JSON.stringify(allSubscriptions));
      
      setSubscribers(subscribers.filter(s => s.id !== portfolioId));
      alert('✓ Subscriber removed successfully!');
    }
  };

  const handleSubscribeBack = async (portfolioId: string, subscriberName: string) => {
    // Check if already subscribed
    const alreadySubscribed = mySubscriptions.some(sub => sub.portfolioId === portfolioId);
    
    if (alreadySubscribed) {
      alert('You are already subscribed to this user!');
      return;
    }
    
    try {
      await apiClient.post('/subscriptions', {
        portfolioId,
        subscribedAt: new Date().toISOString()
      });
      
      const newSub = { portfolioId, subscribedAt: new Date().toISOString() };
      setMySubscriptions([...mySubscriptions, newSub]);
      alert(`✓ Successfully subscribed to ${subscriberName}!`);
    } catch (err) {
      console.warn('Backend API not available, saving to localStorage');
      
      // Fallback: Save to localStorage
      const allSubscriptions = JSON.parse(localStorage.getItem('subscriptions') || '{}');
      const currentUserId = localStorage.getItem('currentUserId') || 'current-user';
      
      allSubscriptions[portfolioId] = {
        portfolioId,
        subscriberId: currentUserId,
        subscribedAt: new Date().toISOString()
      };
      
      localStorage.setItem('subscriptions', JSON.stringify(allSubscriptions));
      
      const newSub = { portfolioId, subscribedAt: new Date().toISOString() };
      setMySubscriptions([...mySubscriptions, newSub]);
      alert(`✓ Successfully subscribed to ${subscriberName}!`);
    }
  };

  const isSubscribedTo = (portfolioId: string) => {
    return mySubscriptions.some(sub => sub.portfolioId === portfolioId);
  };

  const handleDeletePortfolio = async (portfolioId: string) => {
    // Check ownership before allowing delete
    const portfolio = allPortfolios.find(p => p.id === portfolioId);
    if (!portfolio) return;
    
    // Get current user from localStorage (set by AuthContext)
    const currentUserData = localStorage.getItem('user');
    let currentUsername = '';
    let currentEmail = '';
    
    if (currentUserData) {
      try {
        const parsedUser = JSON.parse(currentUserData);
        currentUsername = parsedUser.username || '';
        currentEmail = parsedUser.email || '';
      } catch (parseErr) {
        console.error('Failed to parse user data:', parseErr);
      }
    }
    
    if (portfolio.userId !== currentUsername && portfolio.userId !== currentEmail) {
      alert('You do not have permission to delete this portfolio.');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this portfolio? This action cannot be undone.')) return;
    
    try {
      await apiClient.delete(`/portfolios/${portfolioId}`);
      const updatedAll = allPortfolios.filter(p => p.id !== portfolioId);
      setAllPortfolios(updatedAll);
      setPortfolios(updatedAll.filter(p => p.isPublished));
      if (selectedPortfolio?.id === portfolioId) {
        const remaining = updatedAll.filter(p => p.isPublished);
        setSelectedPortfolio(remaining[0] || null);
      }
    } catch (err) {
      // Fallback: Remove from localStorage
      const localPortfolios = JSON.parse(localStorage.getItem('portfolios') || '{}');
      delete localPortfolios[portfolioId];
      localStorage.setItem('portfolios', JSON.stringify(localPortfolios));
      const updatedAll = allPortfolios.filter(p => p.id !== portfolioId);
      setAllPortfolios(updatedAll);
      setPortfolios(updatedAll.filter(p => p.isPublished));
      if (selectedPortfolio?.id === portfolioId) {
        const remaining = updatedAll.filter(p => p.isPublished);
        setSelectedPortfolio(remaining[0] || null);
      }
    }
  };

  const handleUnpublishPortfolio = async (portfolioId: string) => {
    // Check ownership before allowing unpublish
    const portfolio = allPortfolios.find(p => p.id === portfolioId);
    if (!portfolio) return;
    
    // Get current user from localStorage (set by AuthContext)
    const currentUserData = localStorage.getItem('user');
    let currentUsername = '';
    let currentEmail = '';
    
    if (currentUserData) {
      try {
        const parsedUser = JSON.parse(currentUserData);
        currentUsername = parsedUser.username || '';
        currentEmail = parsedUser.email || '';
      } catch (parseErr) {
        console.error('Failed to parse user data:', parseErr);
      }
    }
    
    if (portfolio.userId !== currentUsername && portfolio.userId !== currentEmail) {
      alert('You do not have permission to unpublish this portfolio.');
      return;
    }
    
    if (!window.confirm('Unpublish this portfolio? It will no longer be accessible via its public URL.')) return;
    
    try {
      const updatedPortfolio = { isPublished: false, unpublishedAt: new Date().toISOString() };
      await apiClient.patch(`/portfolios/${portfolioId}`, updatedPortfolio);
      
      const updatedAll = allPortfolios.map(p => 
        p.id === portfolioId ? { ...p, ...updatedPortfolio } : p
      );
      setAllPortfolios(updatedAll);
      setPortfolios(updatedAll.filter(p => p.isPublished));
      
      if (selectedPortfolio?.id === portfolioId) {
        const remaining = updatedAll.filter(p => p.isPublished);
        setSelectedPortfolio(remaining[0] || null);
      }
    } catch (err) {
      // Fallback: Update in localStorage
      const localPortfolios = JSON.parse(localStorage.getItem('portfolios') || '{}');
      if (localPortfolios[portfolioId]) {
        localPortfolios[portfolioId].isPublished = false;
        localPortfolios[portfolioId].unpublishedAt = new Date().toISOString();
        localStorage.setItem('portfolios', JSON.stringify(localPortfolios));
        
        const updatedAll = allPortfolios.map(p => 
          p.id === portfolioId ? { ...p, isPublished: false } : p
        );
        setAllPortfolios(updatedAll);
        setPortfolios(updatedAll.filter(p => p.isPublished));
        
        if (selectedPortfolio?.id === portfolioId) {
          const remaining = updatedAll.filter(p => p.isPublished);
          setSelectedPortfolio(remaining[0] || null);
        }
      }
    }
  };

  const handleRepublishPortfolio = async (portfolioId: string) => {
    try {
      const updatedPortfolio = { 
        isPublished: true, 
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await apiClient.patch(`/portfolios/${portfolioId}`, updatedPortfolio);
      
      const updatedAll = allPortfolios.map(p => 
        p.id === portfolioId ? { ...p, ...updatedPortfolio } : p
      );
      setAllPortfolios(updatedAll);
      setPortfolios(updatedAll.filter(p => p.isPublished));
      setSelectedPortfolio(updatedAll.find(p => p.id === portfolioId) || null);
    } catch (err) {
      // Fallback: Update in localStorage
      const localPortfolios = JSON.parse(localStorage.getItem('portfolios') || '{}');
      if (localPortfolios[portfolioId]) {
        localPortfolios[portfolioId].isPublished = true;
        localPortfolios[portfolioId].publishedAt = new Date().toISOString();
        localPortfolios[portfolioId].updatedAt = new Date().toISOString();
        localStorage.setItem('portfolios', JSON.stringify(localPortfolios));
        
        const updatedAll = allPortfolios.map(p => 
          p.id === portfolioId ? { ...p, isPublished: true, publishedAt: new Date().toISOString() } : p
        );
        setAllPortfolios(updatedAll);
        setPortfolios(updatedAll.filter(p => p.isPublished));
        setSelectedPortfolio(updatedAll.find(p => p.id === portfolioId) || null);
      }
    }
  };

  const handleDeleteBlogPost = async (postId: string) => {
    // Check ownership before allowing delete
    const post = allBlogPosts.find(p => p.id === postId);
    if (!post) return;
    
    // Get current user from localStorage (set by AuthContext)
    const currentUserData = localStorage.getItem('user');
    let currentUsername = '';
    
    if (currentUserData) {
      try {
        const parsedUser = JSON.parse(currentUserData);
        currentUsername = parsedUser.username || '';
      } catch (parseErr) {
        console.error('Failed to parse user data:', parseErr);
      }
    }
    
    if (post.author !== currentUsername) {
      alert('You do not have permission to delete this blog post.');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) return;
    
    try {
      await apiClient.delete(`/blog/${postId}`);
      const updatedAll = allBlogPosts.filter(p => p.id !== postId);
      setAllBlogPosts(updatedAll);
      setBlogPosts(updatedAll.filter(p => p.published));
      if (selectedBlogPost?.id === postId) {
        const remaining = updatedAll.filter(p => p.published);
        setSelectedBlogPost(remaining[0] || null);
      }
    } catch (err) {
      // Fallback: Remove from localStorage
      const localPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
      const updated = localPosts.filter((p: BlogPost) => p.id !== postId);
      localStorage.setItem('blogPosts', JSON.stringify(updated));
      const updatedAll = allBlogPosts.filter(p => p.id !== postId);
      setAllBlogPosts(updatedAll);
      setBlogPosts(updatedAll.filter(p => p.published));
      if (selectedBlogPost?.id === postId) {
        const remaining = updatedAll.filter(p => p.published);
        setSelectedBlogPost(remaining[0] || null);
      }
    }
  };

  const handleUnpublishBlogPost = async (postId: string) => {
    // Check ownership before allowing unpublish
    const post = allBlogPosts.find(p => p.id === postId);
    if (!post) return;
    
    // Get current user from localStorage (set by AuthContext)
    const currentUserData = localStorage.getItem('user');
    let currentUsername = '';
    
    if (currentUserData) {
      try {
        const parsedUser = JSON.parse(currentUserData);
        currentUsername = parsedUser.username || '';
      } catch (parseErr) {
        console.error('Failed to parse user data:', parseErr);
      }
    }
    
    if (post.author !== currentUsername) {
      alert('You do not have permission to unpublish this blog post.');
      return;
    }
    
    if (!window.confirm('Unpublish this blog post? It will no longer be visible to others.')) return;
    
    try {
      await apiClient.patch(`/blog/${postId}`, { published: false });
      const updatedAll = allBlogPosts.map(p => 
        p.id === postId ? { ...p, published: false } : p
      );
      setAllBlogPosts(updatedAll);
      setBlogPosts(updatedAll.filter(p => p.published));
    } catch (err) {
      // Fallback: Update in localStorage
      const localPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
      const updated = localPosts.map((p: BlogPost) => 
        p.id === postId ? { ...p, published: false } : p
      );
      localStorage.setItem('blogPosts', JSON.stringify(updated));
      const updatedAll = allBlogPosts.map(p => 
        p.id === postId ? { ...p, published: false } : p
      );
      setAllBlogPosts(updatedAll);
      setBlogPosts(updatedAll.filter(p => p.published));
    }
  };

  const handleRepublishBlogPost = async (postId: string) => {
    // Check ownership before allowing republish
    const post = allBlogPosts.find(p => p.id === postId);
    if (!post) return;
    
    // Get current user from localStorage (set by AuthContext)
    const currentUserData = localStorage.getItem('user');
    let currentUsername = '';
    
    if (currentUserData) {
      try {
        const parsedUser = JSON.parse(currentUserData);
        currentUsername = parsedUser.username || '';
      } catch (parseErr) {
        console.error('Failed to parse user data:', parseErr);
      }
    }
    
    if (post.author !== currentUsername) {
      alert('You do not have permission to republish this blog post.');
      return;
    }
    
    try {
      await apiClient.patch(`/blog/${postId}`, { published: true });
      const updatedAll = allBlogPosts.map(p => 
        p.id === postId ? { ...p, published: true } : p
      );
      setAllBlogPosts(updatedAll);
      setBlogPosts(updatedAll.filter(p => p.published));
    } catch (err) {
      // Fallback: Update in localStorage
      const localPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
      const updated = localPosts.map((p: BlogPost) => 
        p.id === postId ? { ...p, published: true } : p
      );
      localStorage.setItem('blogPosts', JSON.stringify(updated));
      const updatedAll = allBlogPosts.map(p => 
        p.id === postId ? { ...p, published: true } : p
      );
      setAllBlogPosts(updatedAll);
      setBlogPosts(updatedAll.filter(p => p.published));
    }
  };

  const displayedPortfolios = showUnpublished ? allPortfolios : portfolios;
  const displayedBlogPosts = showUnpublishedPosts ? allBlogPosts : blogPosts;

  return (
    <div className="p-6 space-y-8 w-full max-w-6xl mx-auto">

      <h1 className="text-3xl font-bold tracking-tight">Analytics Overview</h1>
      <p className="text-gray-500">Track how your portfolio performs across the internet.</p>

      {/* PUBLISHED PORTFOLIOS SECTION */}
      <Card className="shadow-md rounded-xl border border-gray-200">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">My Portfolios</h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowUnpublished(!showUnpublished)}
                className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
              >
                {showUnpublished ? (
                  <>
                    <Eye size={14} />
                    Show Published Only
                  </>
                ) : (
                  <>
                    <EyeOff size={14} />
                    Show All
                  </>
                )}
              </button>
              <span className="text-gray-500 text-sm">
                {displayedPortfolios.length} portfolio{displayedPortfolios.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          {displayedPortfolios.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-2">No published portfolios yet.</p>
              <a href="/templates" className="text-indigo-600 hover:underline">
                Create your first portfolio →
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedPortfolios.map((portfolio) => {
                const slug = portfolio.name 
                  ? portfolio.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                  : portfolio.id;
                const portfolioUrl = `${window.location.origin}/portfolio/${slug}`;
                const isPublished = portfolio.isPublished;
                
                return (
                  <div 
                    key={portfolio.id} 
                    className={`border rounded-lg p-4 hover:shadow-lg transition cursor-pointer relative ${
                      selectedPortfolio?.id === portfolio.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                    } ${!isPublished ? 'opacity-75' : ''}`}
                    onClick={() => setSelectedPortfolio(portfolio)}
                  >
                    {!isPublished && (
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-0.5 bg-gray-500 text-white text-xs rounded-full">
                          Unpublished
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg truncate">
                          {portfolio.name || 'Untitled Portfolio'}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">{portfolio.headline}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Eye size={16} />
                        <span>{portfolio.views || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart size={16} />
                        <span>{portfolio.likes || 0}</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-400 mb-3">
                      {isPublished ? (
                        <>Published: {new Date(portfolio.publishedAt || portfolio.createdAt).toLocaleDateString()}</>
                      ) : (
                        <>Unpublished: {portfolio.unpublishedAt ? new Date(portfolio.unpublishedAt).toLocaleDateString() : 'N/A'}</>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPortfolio(portfolio);
                          setSelectedBlogPost(null);
                        }}
                        className="flex items-center justify-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm w-full mb-2"
                        title="View Analytics"
                      >
                        <BarChart size={14} />
                        Analytics
                      </button>
                      {isPublished ? (
                        <>
                          <a
                            href={portfolioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm flex-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink size={14} />
                            View
                          </a>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnpublishPortfolio(portfolio.id!);
                            }}
                            className="flex items-center justify-center gap-1 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 text-sm"
                            title="Unpublish"
                          >
                            <EyeOff size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePortfolio(portfolio.id!);
                            }}
                            className="flex items-center justify-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRepublishPortfolio(portfolio.id!);
                            }}
                            className="flex items-center justify-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm flex-1"
                            title="Republish"
                          >
                            <Upload size={14} />
                            Republish
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePortfolio(portfolio.id!);
                            }}
                            className="flex items-center justify-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* BLOG POSTS SECTION */}
      <Card className="shadow-md rounded-xl border border-gray-200">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">My Blog Posts</h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowUnpublishedPosts(!showUnpublishedPosts)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition"
              >
                {showUnpublishedPosts ? 'Show Published Only' : 'Show All Posts'}
              </button>
              <span className="text-sm text-gray-600">
                {displayedBlogPosts.length} post{displayedBlogPosts.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {displayedBlogPosts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText size={48} className="mx-auto mb-3 text-gray-300" />
              <p>No blog posts found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedBlogPosts.map((post) => {
                const isPublished = post.published;
                
                return (
                  <div
                    key={post.id}
                    className={`border rounded-lg p-4 hover:shadow-lg transition cursor-pointer relative ${
                      selectedBlogPost?.id === post.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                    } ${!isPublished ? 'opacity-75' : ''}`}
                    onClick={() => setSelectedBlogPost(post)}
                  >
                    {!isPublished && (
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-0.5 bg-gray-500 text-white text-xs rounded-full">
                          Unpublished
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg line-clamp-2 mb-1">
                          {post.title}
                        </h3>
                        <p className="text-xs text-gray-500">
                          By {post.authorName} • {post.authorRole}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                      {post.content}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Heart size={16} />
                        <span>{post.likes?.length || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle size={16} />
                        <span>{post.comments?.length || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 size={16} />
                        <span>{post.shares || 0}</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-400 mb-3">
                      {new Date(post.timestamp).toLocaleDateString()}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBlogPost(post);
                          setSelectedPortfolio(null);
                        }}
                        className="flex items-center justify-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm w-full mb-2"
                        title="View Analytics"
                      >
                        <BarChart size={14} />
                        Analytics
                      </button>
                      {isPublished ? (
                        <>
                          <a
                            href={`/blog/${post.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm flex-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink size={14} />
                            View
                          </a>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnpublishBlogPost(post.id);
                            }}
                            className="flex items-center justify-center gap-1 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 text-sm"
                            title="Unpublish"
                          >
                            <EyeOff size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBlogPost(post.id);
                            }}
                            className="flex items-center justify-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRepublishBlogPost(post.id);
                            }}
                            className="flex items-center justify-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm flex-1"
                            title="Republish"
                          >
                            <Upload size={14} />
                            Republish
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBlogPost(post.id);
                            }}
                            className="flex items-center justify-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* SUBSCRIBERS SECTION */}
      <Card className="shadow-md rounded-xl border border-gray-200">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">My Subscribers</h2>
            <span className="text-sm text-gray-600">
              {subscribers.length} subscriber{subscribers.length !== 1 ? 's' : ''}
            </span>
          </div>

          {subscribers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Heart size={48} className="mx-auto mb-3 text-gray-300" />
              <p>No subscribers yet. Keep creating great content!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subscribers.map((subscriber) => {
                const isSubscribed = isSubscribedTo(subscriber.portfolioId);
                
                return (
                  <div
                    key={subscriber.id}
                    className="border rounded-lg p-4 hover:shadow-lg transition bg-white"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg truncate flex items-center gap-2">
                          <Eye size={18} className="text-indigo-500" />
                          {subscriber.subscriberName}
                        </h3>
                        {subscriber.subscriberEmail && (
                          <p className="text-sm text-gray-500 truncate">{subscriber.subscriberEmail}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-400 mb-3">
                      Subscribed: {new Date(subscriber.subscribedAt).toLocaleDateString()}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {isSubscribed ? (
                        <button
                          className="flex items-center justify-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-md text-sm flex-1"
                          disabled
                          title="Already subscribed"
                        >
                          <Heart size={14} className="fill-current" />
                          Subscribed
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSubscribeBack(subscriber.portfolioId, subscriber.subscriberName)}
                          className="flex items-center justify-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm flex-1"
                          title="Subscribe back"
                        >
                          <Heart size={14} />
                          Subscribe Back
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveSubscriber(subscriber.subscriberId, subscriber.portfolioId)}
                        className="flex items-center justify-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
                        title="Remove subscriber"
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* SELECTED ITEM ANALYTICS */}
      {selectedPortfolio && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <p className="text-sm text-indigo-800">
            📊 Showing analytics for Portfolio: <strong>{selectedPortfolio.name || 'Untitled Portfolio'}</strong>
          </p>
        </div>
      )}
      {selectedBlogPost && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-800">
            📝 Showing analytics for Blog Post: <strong>{selectedBlogPost.title}</strong>
          </p>
        </div>
      )}

      {/* STATISTICS CARDS */}
      {selectedBlogPost && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              label: "Likes",
              value: selectedBlogPost.likes?.length || 0,
              icon: <Heart size={20} className="text-red-500" />,
            },
            {
              label: "Comments",
              value: selectedBlogPost.comments?.length || 0,
              icon: <MessageCircle size={20} className="text-blue-500" />,
            },
            {
              label: "Shares",
              value: selectedBlogPost.shares || 0,
              icon: <Share2 size={20} className="text-green-500" />,
            },
            {
              label: "Posted",
              value: new Date(selectedBlogPost.timestamp).toLocaleDateString(),
              icon: <FileText size={20} className="text-purple-500" />,
            },
          ].map((item, idx) => (
            <Card key={idx} className="shadow-md rounded-xl border border-gray-200 hover:shadow-lg transition">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-semibold">{item.value}</h2>
                  {item.icon}
                </div>
                <p className="text-gray-500 text-sm">{item.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedPortfolio && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              label: "Total Views",
              value: selectedPortfolio.views || 0,
              icon: <Eye size={20} className="text-blue-500" />,
            },
            {
              label: "Total Likes",
              value: selectedPortfolio.likes || 0,
              icon: <Heart size={20} className="text-red-500" />,
            },
            {
              label: "Published",
              value: selectedPortfolio.publishedAt ? new Date(selectedPortfolio.publishedAt).toLocaleDateString() : 'N/A',
              icon: <Upload size={20} className="text-green-500" />,
            },
            {
              label: "Status",
              value: selectedPortfolio.isPublished ? 'Published' : 'Unpublished',
              icon: selectedPortfolio.isPublished ? <Eye size={20} className="text-green-500" /> : <EyeOff size={20} className="text-gray-500" />,
            },
          ].map((item, idx) => (
            <Card key={idx} className="shadow-md rounded-xl border border-gray-200 hover:shadow-lg transition">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-semibold">{item.value}</h2>
                  {item.icon}
                </div>
                <p className="text-gray-500 text-sm">{item.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ENGAGEMENT BREAKDOWN PIE CHART - Only for Blog Posts */}
      {selectedBlogPost && (
        <Card className="shadow-md rounded-xl border border-gray-200">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Engagement Breakdown</h2>
            <div className="w-full flex justify-center h-72">
              <ResponsiveContainer width="80%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Likes', value: selectedBlogPost.likes?.length || 0 },
                      { name: 'Comments', value: selectedBlogPost.comments?.length || 0 },
                      { name: 'Shares', value: selectedBlogPost.shares || 0 },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={120}
                    label
                  >
                    {[0, 1, 2].map((index: number) => (
                      <Cell
                        key={index}
                        fill={["#EF4444", "#3B82F6", "#10B981"][index]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* RECENT COMMENTS - Only for Blog Posts */}
      {selectedBlogPost && (
        <Card className="shadow-md rounded-xl border border-gray-200">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Comments</h2>
            <div className="space-y-3">
              {selectedBlogPost.comments && selectedBlogPost.comments.length > 0 ? (
                selectedBlogPost.comments.slice(0, 5).map((comment: any, i: number) => (
                  <div
                    key={i}
                    className="border p-4 rounded-xl bg-gray-50 hover:bg-white transition shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">{comment.authorName}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(comment.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{comment.content}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle size={48} className="mx-auto mb-3 text-gray-300" />
                  <p>No comments yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* VIEWS OVER TIME LINE CHART - For Portfolios */}
      {selectedPortfolio && (
        <Card className="shadow-md rounded-xl border border-gray-200">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Views Over Time</h2>
            <div className="w-full h-80">
              <ResponsiveContainer>
                <LineChart
                  data={[
                    { date: 'Mon', views: Math.floor(Math.random() * 50) + 10 },
                    { date: 'Tue', views: Math.floor(Math.random() * 50) + 10 },
                    { date: 'Wed', views: Math.floor(Math.random() * 50) + 10 },
                    { date: 'Thu', views: Math.floor(Math.random() * 50) + 10 },
                    { date: 'Fri', views: Math.floor(Math.random() * 50) + 10 },
                    { date: 'Sat', views: Math.floor(Math.random() * 50) + 10 },
                    { date: 'Sun', views: Math.floor(Math.random() * 50) + 10 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="views" stroke="#6366F1" strokeWidth={3} name="Views" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ENGAGEMENT OVER TIME LINE CHART - For Blog Posts */}
      {selectedBlogPost && (
        <Card className="shadow-md rounded-xl border border-gray-200">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Engagement Over Time</h2>
            <div className="w-full h-80">
              <ResponsiveContainer>
                <LineChart
                  data={[
                    { date: 'Mon', likes: Math.floor(Math.random() * 20), comments: Math.floor(Math.random() * 10), shares: Math.floor(Math.random() * 5) },
                    { date: 'Tue', likes: Math.floor(Math.random() * 20), comments: Math.floor(Math.random() * 10), shares: Math.floor(Math.random() * 5) },
                    { date: 'Wed', likes: Math.floor(Math.random() * 20), comments: Math.floor(Math.random() * 10), shares: Math.floor(Math.random() * 5) },
                    { date: 'Thu', likes: Math.floor(Math.random() * 20), comments: Math.floor(Math.random() * 10), shares: Math.floor(Math.random() * 5) },
                    { date: 'Fri', likes: Math.floor(Math.random() * 20), comments: Math.floor(Math.random() * 10), shares: Math.floor(Math.random() * 5) },
                    { date: 'Sat', likes: Math.floor(Math.random() * 20), comments: Math.floor(Math.random() * 10), shares: Math.floor(Math.random() * 5) },
                    { date: 'Sun', likes: Math.floor(Math.random() * 20), comments: Math.floor(Math.random() * 10), shares: Math.floor(Math.random() * 5) },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="likes" stroke="#EF4444" strokeWidth={2} name="Likes" />
                  <Line type="monotone" dataKey="comments" stroke="#3B82F6" strokeWidth={2} name="Comments" />
                  <Line type="monotone" dataKey="shares" stroke="#10B981" strokeWidth={2} name="Shares" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* VIEWS & LIKES BAR CHART - For Portfolios */}
      {selectedPortfolio && (
        <Card className="shadow-md rounded-xl border border-gray-200">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Weekly Performance</h2>
            <div className="w-full h-80">
              <ResponsiveContainer>
                <RechartsBarChart
                  data={[
                    { day: 'Mon', views: Math.floor(Math.random() * 50) + 10, likes: Math.floor(Math.random() * 20) + 5 },
                    { day: 'Tue', views: Math.floor(Math.random() * 50) + 10, likes: Math.floor(Math.random() * 20) + 5 },
                    { day: 'Wed', views: Math.floor(Math.random() * 50) + 10, likes: Math.floor(Math.random() * 20) + 5 },
                    { day: 'Thu', views: Math.floor(Math.random() * 50) + 10, likes: Math.floor(Math.random() * 20) + 5 },
                    { day: 'Fri', views: Math.floor(Math.random() * 50) + 10, likes: Math.floor(Math.random() * 20) + 5 },
                    { day: 'Sat', views: Math.floor(Math.random() * 50) + 10, likes: Math.floor(Math.random() * 20) + 5 },
                    { day: 'Sun', views: Math.floor(Math.random() * 50) + 10, likes: Math.floor(Math.random() * 20) + 5 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="day" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="views" fill="#6366F1" name="Views" />
                  <Bar dataKey="likes" fill="#EC4899" name="Likes" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ENGAGEMENT BAR CHART - For Blog Posts */}
      {selectedBlogPost && (
        <Card className="shadow-md rounded-xl border border-gray-200">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Weekly Engagement</h2>
            <div className="w-full h-80">
              <ResponsiveContainer>
                <RechartsBarChart
                  data={[
                    { day: 'Mon', likes: Math.floor(Math.random() * 20), comments: Math.floor(Math.random() * 10), shares: Math.floor(Math.random() * 5) },
                    { day: 'Tue', likes: Math.floor(Math.random() * 20), comments: Math.floor(Math.random() * 10), shares: Math.floor(Math.random() * 5) },
                    { day: 'Wed', likes: Math.floor(Math.random() * 20), comments: Math.floor(Math.random() * 10), shares: Math.floor(Math.random() * 5) },
                    { day: 'Thu', likes: Math.floor(Math.random() * 20), comments: Math.floor(Math.random() * 10), shares: Math.floor(Math.random() * 5) },
                    { day: 'Fri', likes: Math.floor(Math.random() * 20), comments: Math.floor(Math.random() * 10), shares: Math.floor(Math.random() * 5) },
                    { day: 'Sat', likes: Math.floor(Math.random() * 20), comments: Math.floor(Math.random() * 10), shares: Math.floor(Math.random() * 5) },
                    { day: 'Sun', likes: Math.floor(Math.random() * 20), comments: Math.floor(Math.random() * 10), shares: Math.floor(Math.random() * 5) },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="day" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="likes" fill="#EF4444" name="Likes" />
                  <Bar dataKey="comments" fill="#3B82F6" name="Comments" />
                  <Bar dataKey="shares" fill="#10B981" name="Shares" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CUMULATIVE AREA CHART - For Portfolios */}
      {selectedPortfolio && (
        <Card className="shadow-md rounded-xl border border-gray-200">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Cumulative Growth</h2>
            <div className="w-full h-80">
              <ResponsiveContainer>
                <AreaChart
                  data={[
                    { month: 'Jan', views: 120, likes: 45 },
                    { month: 'Feb', views: 245, likes: 98 },
                    { month: 'Mar', views: 390, likes: 156 },
                    { month: 'Apr', views: 565, likes: 223 },
                    { month: 'May', views: 720, likes: 312 },
                    { month: 'Jun', views: 890, likes: 401 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="views" stackId="1" stroke="#6366F1" fill="#6366F1" fillOpacity={0.6} name="Total Views" />
                  <Area type="monotone" dataKey="likes" stackId="1" stroke="#EC4899" fill="#EC4899" fillOpacity={0.6} name="Total Likes" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CUMULATIVE ENGAGEMENT AREA CHART - For Blog Posts */}
      {selectedBlogPost && (
        <Card className="shadow-md rounded-xl border border-gray-200">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Cumulative Engagement</h2>
            <div className="w-full h-80">
              <ResponsiveContainer>
                <AreaChart
                  data={[
                    { week: 'Week 1', likes: 15, comments: 8, shares: 3 },
                    { week: 'Week 2', likes: 32, comments: 18, shares: 7 },
                    { week: 'Week 3', likes: 54, comments: 31, shares: 12 },
                    { week: 'Week 4', likes: 78, comments: 45, shares: 19 },
                    { week: 'Week 5', likes: 105, comments: 62, shares: 28 },
                    { week: 'Week 6', likes: 134, comments: 79, shares: 36 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="week" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="likes" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} name="Likes" />
                  <Area type="monotone" dataKey="comments" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Comments" />
                  <Area type="monotone" dataKey="shares" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Shares" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PERFORMANCE RADAR CHART - For Portfolios */}
      {selectedPortfolio && (
        <Card className="shadow-md rounded-xl border border-gray-200">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
            <div className="w-full h-80">
              <ResponsiveContainer>
                <RadarChart
                  data={[
                    { metric: 'Views', value: Math.min((selectedPortfolio.views || 0) / 10, 100) },
                    { metric: 'Likes', value: Math.min((selectedPortfolio.likes || 0) * 5, 100) },
                    { metric: 'Engagement', value: Math.floor(Math.random() * 40) + 60 },
                    { metric: 'Reach', value: Math.floor(Math.random() * 40) + 60 },
                    { metric: 'Quality', value: Math.floor(Math.random() * 40) + 60 },
                  ]}
                >
                  <PolarGrid stroke="#e0e0e0" />
                  <PolarAngleAxis dataKey="metric" stroke="#666" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#666" />
                  <Radar name="Performance" dataKey="value" stroke="#6366F1" fill="#6366F1" fillOpacity={0.6} />
                  <Tooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ENGAGEMENT RADAR CHART - For Blog Posts */}
      {selectedBlogPost && (
        <Card className="shadow-md rounded-xl border border-gray-200">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Engagement Metrics</h2>
            <div className="w-full h-80">
              <ResponsiveContainer>
                <RadarChart
                  data={[
                    { metric: 'Likes', value: Math.min((selectedBlogPost.likes?.length || 0) * 10, 100) },
                    { metric: 'Comments', value: Math.min((selectedBlogPost.comments?.length || 0) * 15, 100) },
                    { metric: 'Shares', value: Math.min((selectedBlogPost.shares || 0) * 20, 100) },
                    { metric: 'Reach', value: Math.floor(Math.random() * 40) + 60 },
                    { metric: 'Virality', value: Math.floor(Math.random() * 40) + 60 },
                  ]}
                >
                  <PolarGrid stroke="#e0e0e0" />
                  <PolarAngleAxis dataKey="metric" stroke="#666" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#666" />
                  <Radar name="Engagement" dataKey="value" stroke="#9333EA" fill="#9333EA" fillOpacity={0.6} />
                  <Tooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
