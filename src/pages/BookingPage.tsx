import React, { useState } from "react";
import { FiCalendar, FiClock, FiUser, FiVideo } from "react-icons/fi";

// Note: Remove this page from App.tsx and Header.tsx once added in Portfolio View Page

const timeSlots = [
  "09:00 AM", "09:30 AM",
  "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM",
  "01:00 PM", "01:30 PM",
  "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM",
  "04:00 PM", "04:30 PM",
  "05:00 PM", "05:30 PM"
];

const BookingPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("Zoom");
  const [attendee, setAttendee] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="w-full bg-gray-100 p-8">
      {!confirmed ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* LEFT — Calendar + Time */}
          <div className="bg-white shadow-lg rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FiCalendar /> Select a Date
            </h2>

            {/* Date Picker */}
            <input
              type="date"
              className="w-full p-3 rounded-lg border border-gray-300 mb-6 hover:border-blue-500 transition-all"
              value={selectedDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
            />

            {/* Time Slots */}
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FiClock /> Available Times
            </h3>

            <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-1">
              {timeSlots.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTime(t)}
                  className={`p-2 rounded-lg border text-sm transition-all
                    ${selectedTime === t
                      ? "bg-blue-600 text-white"
                      : "border-gray-300 hover:bg-blue-100"
                    }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT — Form */}
          <div className="bg-white shadow-lg rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Virtual Appointment Booking</h2>

            <div className="space-y-4">
              {/* Owner */}
              <div>
                <label className="block text-sm mb-1 font-medium">Portfolio Owner</label>
                <input
                  type="text"
                  className="w-full p-3 rounded-lg border border-gray-300 bg-gray-100"
                  value="Mr. Raviteja Gundu"
                  readOnly
                />
              </div>

              {/* Attendee */}
              <div>
                <label className="block text-sm mb-1 font-medium">Meeting Attendee</label>
                <input
                  type="text"
                  className="w-full p-3 rounded-lg border border-gray-300"
                  placeholder="Enter your full name"
                  value={attendee}
                  onChange={(e) => setAttendee(e.target.value)}
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm mb-1 font-medium">Appointment Date</label>
                <input
                  type="text"
                  className="w-full p-3 rounded-lg border border-gray-300 bg-gray-100"
                  value={selectedDate || "Select a date from calendar"}
                  readOnly
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm mb-1 font-medium">Appointment Time</label>
                <input
                  type="text"
                  className="w-full p-3 rounded-lg border border-gray-300 bg-gray-100"
                  value={selectedTime || "Select a time slot"}
                  readOnly
                />
              </div>

              {/* Platform */}
              <div>
                <label className="block text-sm mb-1 font-medium">Virtual Platform</label>
                <select
                  className="w-full p-3 rounded-lg border border-gray-300"
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                >
                  <option>Zoom</option>
                  <option>Skype</option>
                  <option>Google Meet</option>
                </select>
              </div>

              {/* Confirm Button */}
              <button
                onClick={() => setConfirmed(true)}
                disabled={!attendee || !selectedDate || !selectedTime}
                className={`w-full mt-4 py-3 rounded-xl text-white text-lg font-medium transition-all
                  ${attendee && selectedDate && selectedTime
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-400 cursor-not-allowed"
                  }`}
              >
                Confirm Appointment
              </button>
            </div>
          </div>
        </div>
      ) : (
        // CONFIRMATION PAGE
        <div className="flex flex-col items-center justify-center mt-16">
          <div className="bg-white shadow-lg rounded-2xl p-12 text-center">
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-semibold mb-2">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-6">
              Your appointment has been successfully scheduled.
            </p>

            <div className="grid grid-cols-2 gap-8 text-left mt-6">
              <div>
                <p><strong>Portfolio Owner:</strong> Mr. Raviteja Gundu</p>
                <p><strong>Date:</strong> {selectedDate}</p>
                <p><strong>Mode:</strong> Virtual</p>
              </div>
              <div>
                <p><strong>Attendee:</strong> {attendee}</p>
                <p><strong>Time:</strong> {selectedTime}</p>
                <p><strong>Platform:</strong> {selectedPlatform}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
