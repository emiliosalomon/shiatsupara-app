
import React, { useState } from 'react';
import { ShiatsuDatabase } from '../types';

interface Props {
  db: ShiatsuDatabase;
}

const CalendarView: React.FC<Props> = ({ db }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const startDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Start Monday
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('de-DE', { month: 'long' });

  const totalDays = daysInMonth(year, month);
  const startOffset = startDayOfMonth(year, month);
  
  const days = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let i = 1; i <= totalDays; i++) days.push(i);

  const getBookingsForDay = (day: number) => {
    return db.buchungen_und_kalender.filter(b => {
      const d = new Date(b.termin_datum);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  };

  const getCustomerName = (id: string) => db.kunden_stamm.find(k => k.id === id)?.name || 'Gelöschter Kunde';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-500">
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center bg-white gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{monthName} {year}</h2>
          <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-indigo-100">
            <i className="fa-brands fa-google"></i>
            Sync: Nur "Shiatsu"
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2.5 hover:bg-slate-50 rounded-xl border border-slate-200 text-slate-600 transition-all">
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="px-5 py-2.5 hover:bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 transition-all">Heute</button>
          <button onClick={nextMonth} className="p-2.5 hover:bg-slate-50 rounded-xl border border-slate-200 text-slate-600 transition-all">
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/30">
        {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
          <div key={day} className="py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-r border-slate-100 last:border-0">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 grid-rows-5 auto-rows-fr min-h-[600px]">
        {days.map((day, idx) => {
          const bookings = day ? getBookingsForDay(day) : [];
          const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
          
          return (
            <div key={idx} className={`p-2 border-r border-b border-slate-100 last:border-r-0 transition-colors group ${!day ? 'bg-slate-50/10' : 'hover:bg-slate-50/50'}`}>
              {day && (
                <>
                  <div className={`text-xs font-black mb-3 flex items-center justify-center w-7 h-7 rounded-lg transition-all ${isToday ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 ring-2 ring-indigo-50' : 'text-slate-300 group-hover:text-slate-500'}`}>
                    {day}
                  </div>
                  <div className="space-y-1.5">
                    {bookings.map(b => (
                      <div key={b.id} className="text-[10px] p-2 rounded-xl bg-white border border-slate-100 shadow-sm text-slate-700 leading-tight cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all">
                        <div className="font-black text-indigo-600 mb-0.5">{new Date(b.termin_datum).toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'})}</div>
                        <div className="truncate font-semibold">{getCustomerName(b.kunden_id)}</div>
                        <div className="text-[8px] text-slate-400 mt-0.5 uppercase tracking-tighter">{b.leistungs_art}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
