
import React from 'react';
import { ShiatsuDatabase } from '../types';

interface Props {
  db: ShiatsuDatabase;
}

const Dashboard: React.FC<Props> = ({ db }) => {
  const currentYear = new Date().getFullYear();

  // Statistik-Berechnung basierend auf dem aktuellen Jahr und bezahlten Rechnungen
  const yearlyFinances = db.buchhaltung_und_finanzen.filter(f => {
    const booking = db.buchungen_und_kalender.find(b => b.id === f.buchung_id);
    if (!booking) return false;
    const bookingYear = new Date(booking.termin_datum).getFullYear();
    return bookingYear === currentYear && f.zahlungsstatus === 'bezahlt';
  });

  const stats = {
    totalEarnings: yearlyFinances.reduce((sum, f) => sum + f.betrag_brutto, 0),
    cashEarnings: yearlyFinances.filter(f => f.zahlungsmethode === 'Bar').reduce((sum, f) => sum + f.betrag_brutto, 0),
    transferEarnings: yearlyFinances.filter(f => f.zahlungsmethode === 'Überweisung').reduce((sum, f) => sum + f.betrag_brutto, 0),
    count: yearlyFinances.length
  };

  const totalCustomers = db.kunden_stamm.length;
  const openInvoicesCount = db.buchhaltung_und_finanzen.filter(f => f.zahlungsstatus === 'offen').length;

  return (
    <div className="space-y-8">
      {/* Haupt-Statistiken (Cards aus User-Snippet-Logik) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">Gesamtumsatz {currentYear}</h3>
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <i className="fa-solid fa-chart-line"></i>
            </div>
          </div>
          <p className="text-3xl font-black text-blue-600">{stats.totalEarnings.toFixed(2)} €</p>
          <p className="text-xs text-slate-400 mt-2 font-medium">{stats.count} Behandlungen im laufenden Jahr</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">Davon Barzahlungen</h3>
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <i className="fa-solid fa-wallet"></i>
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-600">{stats.cashEarnings.toFixed(2)} €</p>
          <p className="text-xs text-slate-400 mt-2 font-medium">Direkt in der Praxis erhalten</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">Davon Überweisungen</h3>
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
              <i className="fa-solid fa-building-columns"></i>
            </div>
          </div>
          <p className="text-3xl font-black text-purple-600">{stats.transferEarnings.toFixed(2)} €</p>
          <p className="text-xs text-slate-400 mt-2 font-medium">Eingang auf dem Bankkonto</p>
        </div>
      </div>

      {/* Ergänzende Metriken */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">Kundenstamm</span>
            <div className="text-2xl font-black text-slate-800">{totalCustomers} Personen</div>
          </div>
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
            <i className="fa-solid fa-users text-xl"></i>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">Offene Rechnungen</span>
            <div className="text-2xl font-black text-orange-600">{openInvoicesCount} Belege</div>
          </div>
          <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-400">
            <i className="fa-solid fa-file-invoice-dollar text-xl"></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
