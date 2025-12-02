import React, { useState, useEffect } from "react";
import { FiUser, FiClock, FiCalendar, FiExternalLink, FiMail, FiPhone, FiBriefcase, FiCheck, FiX, FiInfo, FiFolder } from "react-icons/fi";
import { Calendar as CalendarIcon } from 'lucide-react';
import { apiClient } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";
import PageHeader from '@components/PageHeader';
import type { Appointment } from "../types/appointment";
import '../styles/PageHeader.css';

const AppointmentManagement: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [receivedAppointments, setReceivedAppointments] = useState<Appointment[]>([]);
  const [bookedAppointments, setBookedAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [viewMode, setViewMode] = useState<'received' | 'booked'>('received');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'cancelled'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await apiClient.get<Appointment[]>('/appointments/all');
      
      // Separate appointments into received (I'm the owner) and booked (I'm the booker)
      // Use case-insensitive comparison
      const received = response.filter(apt => {
        const ownerId = (apt.portfolioOwnerId || '').toLowerCase().trim()
        const username = (user.username || '').toLowerCase().trim()
        const email = (user.email || '').toLowerCase().trim()
        return ownerId === username || ownerId === email
      });
      const booked = response.filter(apt => {
        const bookerEmail = (apt.booker.email || '').toLowerCase().trim()
        const userEmail = (user.email || '').toLowerCase().trim()
        return bookerEmail === userEmail || apt.booker.name === `${user.firstName} ${user.lastName}`
      });
      
      setReceivedAppointments(received);
      setBookedAppointments(booked);
    } catch (err) {
      console.warn('Backend API not available, loading from localStorage');
      const localAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      
      console.log('========== Appointments Debug ==========')
      console.log('Current user:', { username: user.username, email: user.email })
      console.log('Total appointments in localStorage:', localAppointments.length)
      
      // Separate appointments with case-insensitive comparison
      const received = localAppointments.filter((apt: Appointment) => {
        const ownerId = (apt.portfolioOwnerId || '').toLowerCase().trim()
        const username = (user.username || '').toLowerCase().trim()
        const email = (user.email || '').toLowerCase().trim()
        const matches = ownerId === username || ownerId === email
        console.log(`Appointment for ${apt.portfolioOwnerName}: ownerId="${apt.portfolioOwnerId}", matches=${matches}`)
        return matches
      });
      const booked = localAppointments.filter((apt: Appointment) => {
        const bookerEmail = (apt.booker.email || '').toLowerCase().trim()
        const userEmail = (user.email || '').toLowerCase().trim()
        return bookerEmail === userEmail || apt.booker.name === `${user.firstName} ${user.lastName}`
      });
      
      console.log('Received appointments:', received.length)
      console.log('Booked appointments:', booked.length)
      console.log('========================================')
      
      // MIGRATION: Fix appointments with invalid portfolioOwnerId
      let needsMigration = false
      const portfolios = JSON.parse(localStorage.getItem('portfolios') || '{}')
      
      const migratedAppointments = localAppointments.map((apt: Appointment) => {
        // Check if portfolioOwnerId is invalid (empty or 'owner-id')
        if (!apt.portfolioOwnerId || apt.portfolioOwnerId.trim() === '' || apt.portfolioOwnerId === 'owner-id') {
          // Try to find the correct owner from the portfolio
          const portfolio = portfolios[apt.portfolioId]
          if (portfolio && portfolio.userId) {
            console.log(`⚠️ Migrating appointment: "${apt.portfolioOwnerName}" from ownerId="${apt.portfolioOwnerId}" to "${portfolio.userId}"`)
            needsMigration = true
            return {
              ...apt,
              portfolioOwnerId: portfolio.userId
            }
          } else {
            console.warn(`Cannot migrate appointment for ${apt.portfolioOwnerName}: Portfolio not found or has no userId`)
          }
        }
        return apt
      })
      
      if (needsMigration) {
        console.log('✅ Migrating appointments to localStorage...')
        localStorage.setItem('appointments', JSON.stringify(migratedAppointments))
        
        // Re-filter with migrated data
        const migratedReceived = migratedAppointments.filter((apt: Appointment) => {
          const ownerId = (apt.portfolioOwnerId || '').toLowerCase().trim()
          const username = (user.username || '').toLowerCase().trim()
          const email = (user.email || '').toLowerCase().trim()
          return ownerId === username || ownerId === email
        });
        const migratedBooked = migratedAppointments.filter((apt: Appointment) => {
          const bookerEmail = (apt.booker.email || '').toLowerCase().trim()
          const userEmail = (user.email || '').toLowerCase().trim()
          return bookerEmail === userEmail || apt.booker.name === `${user.firstName} ${user.lastName}`
        });
        
        console.log('After migration - Received:', migratedReceived.length, 'Booked:', migratedBooked.length)
        
        setReceivedAppointments(migratedReceived);
        setBookedAppointments(migratedBooked);
      } else {
        setReceivedAppointments(received);
        setBookedAppointments(booked);
      }
    } finally {
      setLoading(false);
    }
  };

  const generateZoomLink = async (appointmentId: string): Promise<string> => {
    try {
      const response = await apiClient.post<{ meetingLink: string }>(`/appointments/${appointmentId}/generate-zoom`);
      return response.meetingLink;
    } catch (err) {
      // Fallback: Generate a mock Zoom link
      const meetingId = Math.floor(Math.random() * 10000000000).toString();
      return `https://zoom.us/j/${meetingId}`;
    }
  };

  const handleApprove = async (appointment: Appointment) => {
    if (!window.confirm(`Approve appointment with ${appointment.booker.name}?`)) return;

    try {
      const zoomLink = await generateZoomLink(appointment.id);
      
      const updatedAppointment = {
        ...appointment,
        status: 'approved' as const,
        meetingLink: zoomLink,
        updatedAt: new Date().toISOString()
      };

      await apiClient.patch(`/appointments/${appointment.id}`, {
        status: 'approved',
        meetingLink: zoomLink
      });

      // Update local state
      updateAppointmentInState(updatedAppointment);

      // Send notification to the booker about approval
      addNotification({
        type: 'appointment',
        recipientUsername: appointment.booker.email,
        actorUsername: user?.username || '',
        actorName: appointment.portfolioOwnerName,
        appointmentId: appointment.id,
        appointmentDate: appointment.date,
        appointmentTime: appointment.time,
        message: `approved your appointment for ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time}. Zoom link: ${zoomLink}`,
      });

      alert('Appointment approved! Zoom link has been generated and sent to the booker.');
    } catch (err) {
      // Fallback: Update in localStorage
      const zoomLink = await generateZoomLink(appointment.id);
      const updatedAppointment = {
        ...appointment,
        status: 'approved' as const,
        meetingLink: zoomLink,
        updatedAt: new Date().toISOString()
      };

      updateAppointmentInState(updatedAppointment);
      
      // Send notification
      addNotification({
        type: 'appointment',
        recipientUsername: appointment.booker.email,
        actorUsername: user?.username || '',
        actorName: appointment.portfolioOwnerName,
        appointmentId: appointment.id,
        appointmentDate: appointment.date,
        appointmentTime: appointment.time,
        message: `approved your appointment for ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time}. Zoom link: ${zoomLink}`,
      });
      
      alert('Appointment approved! Zoom link has been generated.');
    }
  };

  const handleCancel = async (appointment: Appointment, isOwnerCanceling: boolean) => {
    const confirmMessage = isOwnerCanceling
      ? `Cancel appointment with ${appointment.booker.name}? This action cannot be undone.`
      : `Cancel your appointment on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time}?`;
    
    if (!window.confirm(confirmMessage)) return;

    try {
      const updatedAppointment = {
        ...appointment,
        status: 'cancelled' as const,
        updatedAt: new Date().toISOString()
      };

      await apiClient.patch(`/appointments/${appointment.id}`, {
        status: 'cancelled'
      });

      // Update local state
      updateAppointmentInState(updatedAppointment);

      // Send notification to the appropriate party
      if (isOwnerCanceling) {
        // Owner is canceling - notify the booker
        addNotification({
          type: 'appointment',
          recipientUsername: appointment.booker.email,
          actorUsername: user?.username || '',
          actorName: appointment.portfolioOwnerName,
          appointmentId: appointment.id,
          appointmentDate: appointment.date,
          appointmentTime: appointment.time,
          message: `cancelled your appointment scheduled for ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time}`,
        });
      } else {
        // Booker is canceling - notify the owner
        addNotification({
          type: 'appointment',
          recipientUsername: appointment.portfolioOwnerId,
          actorUsername: appointment.booker.email,
          actorName: appointment.booker.name,
          appointmentId: appointment.id,
          appointmentDate: appointment.date,
          appointmentTime: appointment.time,
          message: `cancelled the appointment scheduled for ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time}`,
        });
      }

      alert('Appointment cancelled successfully.');
    } catch (err) {
      // Fallback: Update in localStorage
      const updatedAppointment = {
        ...appointment,
        status: 'cancelled' as const,
        updatedAt: new Date().toISOString()
      };

      updateAppointmentInState(updatedAppointment);
      
      // Send notification
      if (isOwnerCanceling) {
        addNotification({
          type: 'appointment',
          recipientUsername: appointment.booker.email,
          actorUsername: user?.username || '',
          actorName: appointment.portfolioOwnerName,
          appointmentId: appointment.id,
          appointmentDate: appointment.date,
          appointmentTime: appointment.time,
          message: `cancelled your appointment scheduled for ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time}`,
        });
      } else {
        addNotification({
          type: 'appointment',
          recipientUsername: appointment.portfolioOwnerId,
          actorUsername: appointment.booker.email,
          actorName: appointment.booker.name,
          appointmentId: appointment.id,
          appointmentDate: appointment.date,
          appointmentTime: appointment.time,
          message: `cancelled the appointment scheduled for ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time}`,
        });
      }
      
      alert('Appointment cancelled.');
    }
  };

  const updateAppointmentInState = (updatedAppointment: Appointment) => {
    // Update in both lists
    setReceivedAppointments(prev => 
      prev.map(a => a.id === updatedAppointment.id ? updatedAppointment : a)
    );
    setBookedAppointments(prev => 
      prev.map(a => a.id === updatedAppointment.id ? updatedAppointment : a)
    );

    // Update in localStorage
    const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const updated = allAppointments.map((a: Appointment) => 
      a.id === updatedAppointment.id ? updatedAppointment : a
    );
    localStorage.setItem('appointments', JSON.stringify(updated));
  };

  const handleViewUserInfo = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowUserInfo(true);
  };

  // Get current appointments based on view mode
  const currentAppointments = viewMode === 'received' ? receivedAppointments : bookedAppointments;
  
  const filteredAppointments = currentAppointments.filter(appt => {
    if (filter === 'all') return true;
    return appt.status === filter;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      approved: 'bg-green-100 text-green-700 border-green-300',
      cancelled: 'bg-red-100 text-red-700 border-red-300',
      completed: 'bg-blue-100 text-blue-700 border-blue-300'
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <PageHeader
        title="Appointment Management"
        subtitle="Manage your appointments and bookings"
        icon={CalendarIcon}
        actions={
          <div className="flex gap-2 p-1.5 bg-gray-100 rounded-xl border border-gray-200">
            <button
              onClick={() => setViewMode('received')}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                viewMode === 'received' 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md transform scale-105' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white'
              }`}
            >
              <FiUser size={16} />
              Received ({receivedAppointments.length})
            </button>
            <button
              onClick={() => setViewMode('booked')}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                viewMode === 'booked' 
                  ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-md transform scale-105' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white'
              }`}
            >
              <FiFolder size={16} />
              My Bookings ({bookedAppointments.length})
            </button>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-8 py-8 flex gap-6">
        {/* LEFT STATS & FILTER PANEL */}
        <div className="w-80 flex flex-col gap-6">
          {/* STATS CARDS */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiClock className="text-blue-600" />
              Statistics
            </h3>
            <div className="space-y-3">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200 hover:shadow-md transition-shadow">
                <p className="text-sm font-medium text-blue-900">Total Appointments</p>
                <p className="text-3xl font-bold text-blue-700 mt-1">{currentAppointments.length}</p>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200 hover:shadow-md transition-shadow">
                <p className="text-sm font-medium text-yellow-900">Pending Review</p>
                <p className="text-3xl font-bold text-yellow-700 mt-1">
                  {currentAppointments.filter(a => a.status === 'pending').length}
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200 hover:shadow-md transition-shadow">
                <p className="text-sm font-medium text-green-900">Approved</p>
                <p className="text-3xl font-bold text-green-700 mt-1">
                  {currentAppointments.filter(a => a.status === 'approved').length}
                </p>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border border-red-200 hover:shadow-md transition-shadow">
                <p className="text-sm font-medium text-red-900">Cancelled</p>
                <p className="text-3xl font-bold text-red-700 mt-1">
                  {currentAppointments.filter(a => a.status === 'cancelled').length}
                </p>
              </div>
            </div>
          </div>

          {/* FILTER BUTTONS */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiCheck className="text-blue-600" />
              Filter
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => setFilter('all')}
                className={`w-full px-4 py-3 rounded-xl transition-all duration-200 font-medium text-left flex items-center justify-between ${
                  filter === 'all' 
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md transform scale-105' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                All Appointments
                <span className={`text-xs px-2 py-1 rounded-full ${
                  filter === 'all' ? 'bg-white/20' : 'bg-gray-200'
                }`}>
                  {currentAppointments.length}
                </span>
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`w-full px-4 py-3 rounded-xl transition-all duration-200 font-medium text-left flex items-center justify-between ${
                  filter === 'pending' 
                    ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-white shadow-md transform scale-105' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Pending
                <span className={`text-xs px-2 py-1 rounded-full ${
                  filter === 'pending' ? 'bg-white/20' : 'bg-gray-200'
                }`}>
                  {currentAppointments.filter(a => a.status === 'pending').length}
                </span>
              </button>
              <button
                onClick={() => setFilter('approved')}
                className={`w-full px-4 py-3 rounded-xl transition-all duration-200 font-medium text-left flex items-center justify-between ${
                  filter === 'approved' 
                    ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-md transform scale-105' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Approved
                <span className={`text-xs px-2 py-1 rounded-full ${
                  filter === 'approved' ? 'bg-white/20' : 'bg-gray-200'
                }`}>
                  {currentAppointments.filter(a => a.status === 'approved').length}
                </span>
              </button>
              <button
                onClick={() => setFilter('cancelled')}
                className={`w-full px-4 py-3 rounded-xl transition-all duration-200 font-medium text-left flex items-center justify-between ${
                  filter === 'cancelled' 
                    ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md transform scale-105' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Cancelled
                <span className={`text-xs px-2 py-1 rounded-full ${
                  filter === 'cancelled' ? 'bg-white/20' : 'bg-gray-200'
                }`}>
                  {currentAppointments.filter(a => a.status === 'cancelled').length}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT APPOINTMENTS PANEL */}
        <div className="flex-1">
          {filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-16 text-center">
              <div className="inline-block p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full mb-6">
                <FiCalendar className="text-gray-400" size={64} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No appointments found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {viewMode === 'received' 
                  ? 'Appointments booked through your published portfolios will appear here'
                  : 'Appointments you\'ve booked with others will appear here'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appt) => {
                const isOwner = viewMode === 'received';
                
                return (
                  <div
                    key={appt.id}
                    className="bg-white rounded-2xl shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    {/* Status Banner */}
                    <div className={`h-1.5 ${
                      appt.status === 'pending' ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                      appt.status === 'approved' ? 'bg-gradient-to-r from-green-400 to-green-500' :
                      appt.status === 'cancelled' ? 'bg-gradient-to-r from-red-400 to-red-500' :
                      'bg-gradient-to-r from-blue-400 to-blue-500'
                    }`} />
                    
                    <div className="p-6">
                      <div className="flex justify-between items-start gap-6">
                        {/* LEFT: APPOINTMENT INFO */}
                        <div className="flex-1 space-y-4">
                          {/* Header with Status */}
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border-2 ${getStatusBadge(appt.status)}`}>
                              {appt.status}
                            </span>
                            {appt.reason && (
                              <span className="text-sm text-gray-600 italic bg-gray-50 px-3 py-1.5 rounded-lg">
                                "{appt.reason}"
                              </span>
                            )}
                          </div>

                          {/* Portfolio Badge */}
                          <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-3 rounded-xl border-2 border-purple-200">
                            <FiFolder className="text-purple-600 flex-shrink-0" size={20} />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-purple-900 uppercase tracking-wide">Portfolio</p>
                              <p className="text-sm font-bold text-purple-700 truncate">{appt.portfolioOwnerName}</p>
                            </div>
                          </div>

                          {/* Attendee/Owner Info */}
                          <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-xl">
                            <FiUser className="text-blue-600 flex-shrink-0" size={20} />
                            <div>
                              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                {isOwner ? 'Attendee' : 'Portfolio Owner'}
                              </p>
                              <p className="text-base font-bold text-gray-900">
                                {isOwner ? appt.booker.name : appt.portfolioOwnerName}
                              </p>
                            </div>
                          </div>

                          {/* Date, Time, Email Grid */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-3 bg-blue-50 px-4 py-3 rounded-xl border border-blue-100">
                              <FiCalendar className="text-blue-600 flex-shrink-0" size={18} />
                              <div>
                                <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide">Date</p>
                                <p className="text-sm font-bold text-blue-700">
                                  {new Date(appt.date).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric', 
                                    year: 'numeric' 
                                  })}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 bg-indigo-50 px-4 py-3 rounded-xl border border-indigo-100">
                              <FiClock className="text-indigo-600 flex-shrink-0" size={18} />
                              <div>
                                <p className="text-xs font-semibold text-indigo-900 uppercase tracking-wide">Time</p>
                                <p className="text-sm font-bold text-indigo-700">{appt.time} · {appt.duration}m</p>
                              </div>
                            </div>

                            {isOwner && appt.booker.email && (
                              <div className="col-span-2 flex items-center gap-3 bg-green-50 px-4 py-3 rounded-xl border border-green-100">
                                <FiMail className="text-green-600 flex-shrink-0" size={18} />
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-green-900 uppercase tracking-wide">Email</p>
                                  <p className="text-sm font-bold text-green-700 truncate">{appt.booker.email}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Zoom Link (if approved) */}
                          {appt.status === 'approved' && appt.meetingLink && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-300">
                              <div className="flex items-start gap-3">
                                <FiExternalLink className="text-green-600 mt-1 flex-shrink-0" size={20} />
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-bold text-green-900 uppercase tracking-wide mb-1.5">
                                    🎥 Zoom Meeting Link
                                  </p>
                                  <a
                                    href={appt.meetingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-green-700 hover:text-green-900 underline font-medium break-all"
                                  >
                                    {appt.meetingLink}
                                  </a>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* RIGHT: ACTION BUTTONS */}
                        <div className="flex flex-col gap-2.5 min-w-[160px]">
                          {isOwner && (
                            <button 
                              onClick={() => handleViewUserInfo(appt)}
                              className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-semibold text-sm"
                            >
                              <FiInfo size={16} />
                              Details
                            </button>
                          )}

                          {isOwner && appt.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleApprove(appt)}
                                className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-semibold text-sm"
                              >
                                <FiCheck size={16} />
                                Approve
                              </button>
                              <button 
                                onClick={() => handleCancel(appt, true)}
                                className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:from-red-700 hover:to-red-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-semibold text-sm"
                              >
                                <FiX size={16} />
                                Reject
                              </button>
                            </>
                          )}

                          {isOwner && appt.status === 'approved' && (
                            <>
                              <a
                                href={appt.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-semibold text-sm"
                              >
                                <FiExternalLink size={16} />
                                Join
                              </a>
                              <button 
                                onClick={() => handleCancel(appt, true)}
                                className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:from-red-700 hover:to-red-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-semibold text-sm"
                              >
                                <FiX size={16} />
                                Cancel
                              </button>
                            </>
                          )}

                          {!isOwner && appt.status === 'approved' && appt.meetingLink && (
                            <a
                              href={appt.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-semibold text-sm"
                            >
                              <FiExternalLink size={16} />
                              Join Zoom
                            </a>
                          )}

                          {!isOwner && (appt.status === 'pending' || appt.status === 'approved') && (
                            <button 
                              onClick={() => handleCancel(appt, false)}
                              className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:from-red-700 hover:to-red-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-semibold text-sm"
                            >
                              <FiX size={16} />
                              Cancel
                            </button>
                          )}

                          {appt.status === 'cancelled' && (
                            <div className="px-4 py-2.5 bg-gray-200 text-gray-600 rounded-xl text-center text-sm font-bold border-2 border-gray-300">
                              Cancelled
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* USER INFO MODAL */}
      {showUserInfo && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden animate-fade-in">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Appointment Details</h2>
                  <p className="text-blue-100 text-sm">Complete information about the booker</p>
                </div>
                <button
                  onClick={() => setShowUserInfo(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition"
                >
                  <FiX size={24} />
                </button>
              </div>
            </div>

            <div className="p-8">
              {/* Profile Section */}
              <div className="flex gap-6 mb-8 items-center">
                {selectedAppointment.booker.profilePicture ? (
                  <img
                    src={selectedAppointment.booker.profilePicture}
                    alt={selectedAppointment.booker.name}
                    className="w-28 h-28 rounded-2xl object-cover border-4 border-blue-100 shadow-lg"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg border-4 border-blue-100">
                    {selectedAppointment.booker.name.charAt(0).toUpperCase()}
                  </div>
                )}
                
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{selectedAppointment.booker.name}</h3>
                  {selectedAppointment.booker.role && (
                    <p className="text-gray-700 font-medium text-lg">{selectedAppointment.booker.role}</p>
                  )}
                  {selectedAppointment.booker.company && (
                    <p className="text-gray-500 flex items-center gap-2 mt-1">
                      <FiBriefcase size={16} />
                      {selectedAppointment.booker.company}
                    </p>
                  )}
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-5 rounded-2xl border-2 border-blue-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <FiMail className="text-white" size={20} />
                    </div>
                    <p className="text-xs font-bold text-blue-900 uppercase tracking-wide">Email Address</p>
                  </div>
                  <p className="text-gray-900 font-semibold ml-11 break-all">{selectedAppointment.booker.email}</p>
                </div>

                {selectedAppointment.booker.phone && (
                  <div className="bg-green-50 p-5 rounded-2xl border-2 border-green-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-600 rounded-lg">
                        <FiPhone className="text-white" size={20} />
                      </div>
                      <p className="text-xs font-bold text-green-900 uppercase tracking-wide">Phone Number</p>
                    </div>
                    <p className="text-gray-900 font-semibold ml-11">{selectedAppointment.booker.phone}</p>
                  </div>
                )}

                <div className="bg-indigo-50 p-5 rounded-2xl border-2 border-indigo-200 md:col-span-2">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-indigo-600 rounded-lg">
                      <FiCalendar className="text-white" size={20} />
                    </div>
                    <p className="text-xs font-bold text-indigo-900 uppercase tracking-wide">Appointment Schedule</p>
                  </div>
                  <div className="ml-11 space-y-1">
                    <p className="text-lg font-bold text-gray-900">
                      {new Date(selectedAppointment.date).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                    <p className="text-gray-700 font-medium">
                      <FiClock className="inline mr-2" size={16} />
                      {selectedAppointment.time} · {selectedAppointment.duration} minutes
                    </p>
                  </div>
                </div>
              </div>

              {selectedAppointment.reason && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200 mb-6">
                  <p className="text-xs font-bold text-purple-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <FiInfo size={16} />
                    Reason for Appointment
                  </p>
                  <p className="text-gray-800 leading-relaxed">{selectedAppointment.reason}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t-2 border-gray-100">
                <button
                  onClick={() => setShowUserInfo(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-semibold"
                >
                  Close
                </button>
                {selectedAppointment.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleApprove(selectedAppointment);
                        setShowUserInfo(false);
                      }}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition font-semibold shadow-md hover:shadow-lg"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => {
                        handleCancel(selectedAppointment, true);
                        setShowUserInfo(false);
                      }}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:from-red-700 hover:to-red-600 transition font-semibold shadow-md hover:shadow-lg"
                    >
                      ✕ Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentManagement;
