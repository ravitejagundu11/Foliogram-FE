import React, { useState, useEffect } from "react";
import { FiCalendar, FiClock, FiUser, FiMail, FiPhone, FiBriefcase, FiMessageSquare } from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import type { CreateAppointmentData } from "../types/appointment";
import type { Portfolio } from "../types/portfolio";

const timeSlots = [
  "09:00", "09:30",
  "10:00", "10:30",
  "11:00", "11:30",
  "12:00", "12:30",
  "13:00", "13:30",
  "14:00", "14:30",
  "15:00", "15:30",
  "16:00", "16:30",
  "17:00", "17:30"
];

const BookingPage: React.FC = () => {
  const { portfolioId } = useParams<{ portfolioId: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    bookerName: "",
    bookerEmail: "",
    bookerPhone: "",
    bookerCompany: "",
    bookerRole: "",
    date: "",
    time: "",
    duration: 30,
    reason: ""
  });
  
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    loadPortfolio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolioId]);

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      if (!portfolioId) {
        setLoading(false);
        return;
      }

      const response = await apiClient.get<Portfolio>(`/portfolios/${portfolioId}`);
      
      // Check if portfolio is published
      if (!response.isPublished) {
        alert("This portfolio is not available for appointment booking.");
        navigate('/');
        return;
      }
      
      setPortfolio(response);
    } catch (err) {
      console.warn('Backend API not available, loading from localStorage');
      
      const localPortfolios = JSON.parse(localStorage.getItem('portfolios') || '{}');
      const foundPortfolio = localPortfolios[portfolioId || ''];
      
      if (foundPortfolio && foundPortfolio.isPublished) {
        setPortfolio(foundPortfolio);
      } else {
        alert("Portfolio not found or not available for booking.");
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!portfolio || !portfolioId) return;
    
    setSubmitting(true);

    try {
      const appointmentData: CreateAppointmentData = {
        portfolioId,
        date: formData.date,
        time: formData.time,
        duration: Number(formData.duration),
        bookerName: formData.bookerName,
        bookerEmail: formData.bookerEmail,
        bookerPhone: formData.bookerPhone,
        bookerCompany: formData.bookerCompany,
        bookerRole: formData.bookerRole,
        reason: formData.reason
      };

      await apiClient.post('/appointments', appointmentData);
      
      // Send notification to portfolio owner about new appointment
      if (portfolio.userId) {
        addNotification({
          type: 'appointment',
          recipientUsername: portfolio.userId,
          actorUsername: formData.bookerEmail,
          actorName: formData.bookerName,
          appointmentId: `appt_${Date.now()}`,
          appointmentDate: formData.date,
          appointmentTime: formData.time,
          message: `booked an appointment for ${new Date(formData.date).toLocaleDateString()} at ${formData.time}`,
        });
      }
      
      setConfirmed(true);
    } catch (err) {
      console.warn('Backend API not available, saving to localStorage');
      
      // CRITICAL: Ensure portfolioOwnerId is set correctly
      if (!portfolio.userId || portfolio.userId.trim() === '') {
        alert('Cannot book appointment: Portfolio owner information is missing. Please contact the portfolio owner to update their profile.');
        setSubmitting(false);
        return;
      }
      
      const appointment = {
        id: Date.now().toString(),
        portfolioId,
        portfolioOwnerId: portfolio.userId,
        portfolioOwnerName: portfolio.name || 'Portfolio Owner',
        booker: {
          id: Date.now().toString(),
          name: formData.bookerName,
          email: formData.bookerEmail,
          phone: formData.bookerPhone,
          company: formData.bookerCompany,
          role: formData.bookerRole
        },
        date: formData.date,
        time: formData.time,
        duration: Number(formData.duration),
        status: 'pending' as const,
        reason: formData.reason,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const existingAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      localStorage.setItem('appointments', JSON.stringify([...existingAppointments, appointment]));
      
      // Send notification to portfolio owner about new appointment
      if (portfolio.userId) {
        addNotification({
          type: 'appointment',
          recipientUsername: portfolio.userId,
          actorUsername: formData.bookerEmail,
          actorName: formData.bookerName,
          appointmentId: appointment.id,
          appointmentDate: formData.date,
          appointmentTime: formData.time,
          message: `booked an appointment for ${new Date(formData.date).toLocaleDateString()} at ${formData.time}`,
        });
      }
      
      setConfirmed(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="w-full min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <p className="text-gray-600">Portfolio not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-100 p-8">
      {!confirmed ? (
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white shadow-lg rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-4">
              {portfolio.profilePicture && (
                <img 
                  src={portfolio.profilePicture} 
                  alt={portfolio.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Book an Appointment</h1>
                <p className="text-gray-600">Schedule a meeting with {portfolio.name}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* LEFT — Calendar + Time */}
              <div className="bg-white shadow-lg rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FiCalendar className="text-blue-600" /> Select Date & Time
                </h2>

                {/* Date Picker */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    className="w-full p-3 rounded-lg border border-gray-300 hover:border-gray-400 transition-all focus:ring-0 focus:border-black outline-none bg-white"
                    value={formData.date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Time Slots */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FiClock className="text-blue-600" /> Available Time Slots *
                  </label>
                  <div className="grid grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
                    {timeSlots.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, time: t }))}
                        className={`p-3 rounded-lg border text-sm font-medium transition-all
                          ${formData.time === t
                            ? "bg-blue-600 text-white border-blue-600 shadow-md"
                            : "border-gray-300 hover:bg-blue-50 hover:border-blue-400"
                          }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration *
                  </label>
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                    className="w-full p-3 rounded-lg border border-gray-300 hover:border-gray-400 focus:ring-0 focus:border-black outline-none bg-white cursor-pointer transition-all appearance-none text-gray-800"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23374151' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                      paddingRight: '40px'
                    }}
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>
              </div>

              {/* RIGHT — Form */}
              <div className="bg-white shadow-lg rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-4">Your Information</h2>

                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <FiUser className="text-blue-600" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="bookerName"
                      value={formData.bookerName}
                      onChange={handleChange}
                      required
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring-0 focus:border-black outline-none bg-white"
                      placeholder="John Doe"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <FiMail className="text-blue-600" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="bookerEmail"
                      value={formData.bookerEmail}
                      onChange={handleChange}
                      required
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring-0 focus:border-black outline-none bg-white"
                      placeholder="john@example.com"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <FiPhone className="text-blue-600" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="bookerPhone"
                      value={formData.bookerPhone}
                      onChange={handleChange}
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring-0 focus:border-black outline-none bg-white"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  {/* Company */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <FiBriefcase className="text-blue-600" />
                      Company
                    </label>
                    <input
                      type="text"
                      name="bookerCompany"
                      value={formData.bookerCompany}
                      onChange={handleChange}
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring-0 focus:border-black outline-none bg-white"
                      placeholder="Acme Corp"
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <FiBriefcase className="text-blue-600" />
                      Your Role
                    </label>
                    <input
                      type="text"
                      name="bookerRole"
                      value={formData.bookerRole}
                      onChange={handleChange}
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring-0 focus:border-black outline-none bg-white"
                      placeholder="Software Engineer"
                    />
                  </div>

                  {/* Reason */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <FiMessageSquare className="text-blue-600" />
                      Reason for Appointment
                    </label>
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      rows={3}
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring-0 focus:border-black outline-none resize-none bg-white"
                      placeholder="Please briefly describe the purpose of this meeting..."
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting || !formData.bookerName || !formData.bookerEmail || !formData.date || !formData.time}
                    className={`w-full mt-4 py-3 rounded-xl text-white text-lg font-medium transition-all
                      ${formData.bookerName && formData.bookerEmail && formData.date && formData.time && !submitting
                        ? "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl"
                        : "bg-gray-400 cursor-not-allowed"
                      }`}
                  >
                    {submitting ? 'Submitting...' : 'Book Appointment'}
                  </button>
                  
                  <p className="text-xs text-gray-500 text-center mt-2">
                    * A Zoom meeting link will be sent to your email after approval
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      ) : (
        // CONFIRMATION PAGE
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <div className="bg-white shadow-2xl rounded-2xl p-12 max-w-2xl w-full text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold mb-3 text-gray-800">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-8">
              Your appointment request has been sent to {portfolio.name}.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">Portfolio Owner</p>
                    <p className="text-gray-800 font-semibold">{portfolio.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">Your Name</p>
                    <p className="text-gray-800 font-semibold">{formData.bookerName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">Email</p>
                    <p className="text-gray-800 font-semibold">{formData.bookerEmail}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">Date</p>
                    <p className="text-gray-800 font-semibold">{new Date(formData.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">Time</p>
                    <p className="text-gray-800 font-semibold">{formData.time}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">Duration</p>
                    <p className="text-gray-800 font-semibold">{formData.duration} minutes</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                📧 You will receive a confirmation email with the Zoom meeting link once the appointment is approved.
              </p>
            </div>

            <button
              onClick={() => navigate('/')}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium"
            >
              Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
