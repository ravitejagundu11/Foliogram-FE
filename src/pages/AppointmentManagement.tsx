import React from "react";
import { FiUser, FiClock, FiCalendar, FiExternalLink } from "react-icons/fi";

interface Appointment {
  id: number;
  name: string;
  date: string;
  time: string;
  meetingLinkType?: string; 
}

const appointments: Appointment[] = [
  {
    id: 1,
    name: "Ms. Yashada Ajit Tembe",
    date: "9/22/2025",
    time: "14:30",
    meetingLinkType: "Zoom",
  },
  {
    id: 2,
    name: "Mr. Bharathwaj Nedoumaran",
    date: "9/24/2025",
    time: "12:30",
    meetingLinkType: "Skype",
  },
  {
    id: 3,
    name: "Ms. Nidhi Musale",
    date: "9/26/2025",
    time: "16:00",
  },
];

const AppointmentManagement: React.FC = () => {
  return (
    <div className="w-full bg-gray-100 flex px-8 py-10 gap-8">

      {/* LEFT PROFILE PANEL */}
      <div className="w-1/4 bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center relative border border-gray-200">
        <img
          src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e"
          className="w-40 h-40 rounded-full object-cover shadow-md border-4 border-white"
        />

        <h2 className="mt-6 text-2xl font-semibold tracking-wide text-gray-800 text-center">
          Mr. Raviteja Gundu
        </h2>
        <p className="text-gray-500 text-sm mt-1">ML • AI Engineer</p>

        <div className="mt-10 bg-gradient-to-r from-blue-50 to-blue-100 w-full p-6 rounded-2xl text-center border border-blue-200 shadow-inner">
          <p className="text-gray-600 font-medium">Subscribers</p>
          <p className="text-5xl mt-2 font-bold text-blue-700">143</p>
        </div>
      </div>

      {/* RIGHT APPOINTMENTS PANEL */}
      <div className="flex-1 flex flex-col gap-6">

        {appointments.map((appt) => (
          <div
            key={appt.id}
            className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex justify-between">
              
              {/* LEFT: APPOINTMENT INFO */}
              <div className="flex flex-col gap-2 text-gray-800">
                <div className="flex items-center gap-2">
                  <FiUser className="text-gray-500" />
                  <span className="font-semibold">Attendee</span>
                </div>
                <p className="ml-6 text-lg">{appt.name}</p>

                <div className="mt-3 flex gap-10">
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <FiCalendar />
                      Appointment Date
                    </div>
                    <p className="font-medium text-gray-900 ml-6">{appt.date}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <FiClock />
                      Appointment Time
                    </div>
                    <p className="font-medium text-gray-900 ml-6">{appt.time}</p>
                  </div>
                </div>
              </div>

              {/* RIGHT BUTTONS */}
              <div className="flex flex-col gap-3 items-end min-w-[160px]">

                <button className="w-full px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition flex items-center justify-center gap-2">
                  Attendee Info
                </button>

                <button className="w-full px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-2">
                  Cancel
                </button>

                {appt.meetingLinkType && (
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2">
                    {appt.meetingLinkType} Link <FiExternalLink />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
};

export default AppointmentManagement;
