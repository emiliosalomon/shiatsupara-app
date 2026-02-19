
import React, { useState } from 'react';
import { ShiatsuDatabase, JahresabschlussExport } from '../types';
import { analyzeAccountingData } from '../services/geminiService';

interface Props {
  db: ShiatsuDatabase;
}

const YearEndReport: React.FC<Props> = ({ db }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const report: JahresabschlussExport = {
    jahr: 2026,
    gesamt_einnahmen_brutto: db.buchhaltung_und_finanzen
      .filter(f => f.zahlungsstatus === 'bezahlt')
      .reduce((sum, f) => sum + f.betrag_brutto, 0),
    einnahmen_nach_methode: {
      bar: db.buchhaltung_und_finanzen
        .filter(f => f.zahlungsstatus === 'bezahlt' && f.zahlungsmethode === 'Bar')
        .reduce((sum, f) => sum + f.betrag_brutto, 0),
      ueberweisung: db.buchhaltung_und_finanzen
        .filter(f => f.zahlungsstatus === 'bezahlt' && f.zahlungsmethode === 'Überweisung')
        .reduce((sum, f) => sum + f.betrag_brutto, 0),
    },
    anzahl_behandlungen: db.buchungen_und_kalender.length,
    offene_posten: db.buchhaltung_und_finanzen
      .filter(f => f.zahlungsstatus === 'offen')
      .reduce((sum, f) => sum + f.betrag_brutto, 0),
  };

  const handleAnalyze = async () => {
    setLoading(true);
    const result = await analyzeAccountingData(db);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 max-w-4xl mx-auto print:shadow-none print:border-none print:p-0">
      <div className="flex justify-between items-start mb-8 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Buchhaltungsbericht {report.jahr}</h1>
          <p className="text-slate-500 mt-1 uppercase tracking-widest text-sm">Shiatsu Praxis - Jahresabschluss</p>
        </div>
        <div className="text-right text-sm text-slate-400">
          Erstellt am: {new Date().toLocaleDateString('de-DE')}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-10">
        <div>
          <h2 className="text-lg font-semibold mb-4 text-slate-700">Zusammenfassung Einnahmen</h2>
          <div className="space-y-3">
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="text-slate-600">Gesamteinnahmen (Brutto):</span>
              <span className="font-bold">{report.gesamt_einnahmen_brutto.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-2 pl-4">
              <span className="text-slate-500 text-sm">davon Bar:</span>
              <span className="text-sm font-medium">{report.einnahmen_nach_methode.bar.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-2 pl-4">
              <span className="text-slate-500 text-sm">davon Überweisung:</span>
              <span className="text-sm font-medium">{report.einnahmen_nach_methode.ueberweisung.toFixed(2)} €</span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4 text-slate-700">Betriebliche Kennzahlen</h2>
          <div className="space-y-3">
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="text-slate-600">Anzahl Behandlungen:</span>
              <span className="font-bold">{report.anzahl_behandlungen}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="text-slate-600">Offene Posten (Forderungen):</span>
              <span className="font-bold text-orange-600">{report.offene_posten.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="text-slate-600">Steuerstatus:</span>
              <span className="text-emerald-600 font-semibold italic">Kleinunternehmer (§19 UStG)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-lg font-semibold mb-4 text-slate-700">Detailauflistung Zahlungen</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase">
              <th className="py-2 px-3 border">Datum</th>
              <th className="py-2 px-3 border">Beleg-Nr.</th>
              <th className="py-2 px-3 border">Kunde</th>
              <th className="py-2 px-3 border">Methode</th>
              <th className="py-2 px-3 border text-right">Betrag</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {db.buchhaltung_und_finanzen.map((f, idx) => {
              const customer = db.kunden_stamm.find(k => k.id === db.buchungen_und_kalender.find(b => b.id === f.buchung_id)?.kunden_id);
              return (
                <tr key={f.rechnungs_id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="py-2 px-3 border">{f.zahlungs_datum || '-'}</td>
                  <td className="py-2 px-3 border font-mono">{f.rechnungsnummer}</td>
                  <td className="py-2 px-3 border">{customer?.name}</td>
                  <td className="py-2 px-3 border">{f.zahlungsmethode}</td>
                  <td className="py-2 px-3 border text-right font-medium">{f.betrag_brutto.toFixed(2)} €</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 no-print">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">KI-Finanz-Assistent</h3>
          <button 
            onClick={handleAnalyze} 
            disabled={loading}
            className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-full hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Analysiere...' : 'Bericht generieren'}
          </button>
        </div>
        {analysis ? (
          <p className="text-sm text-slate-600 italic leading-relaxed">
            "{analysis}"
          </p>
        ) : (
          <p className="text-sm text-slate-400">Nutze Gemini AI, um eine kurze Zusammenfassung für deine Steuererklärung zu erstellen.</p>
        )}
      </div>

      <div className="mt-12 pt-12 border-t text-center text-slate-400 text-xs italic">
        Dieser Bericht wurde automatisch aus der Shiatsu-Praxis Datenbank generiert. Alle Angaben ohne Gewähr.
      </div>

      <div className="mt-8 flex justify-end gap-4 no-print">
        <button 
          onClick={() => window.print()} 
          className="flex items-center gap-2 bg-slate-800 text-white px-6 py-2 rounded-lg hover:bg-slate-900 transition"
        >
          <i className="fa-solid fa-print"></i> Als PDF drucken
        </button>
      </div>
    </div>
  );
};

export default YearEndReport;
