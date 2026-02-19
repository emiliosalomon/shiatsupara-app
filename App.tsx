
import React, { useState, useEffect } from 'react';
import { ShiatsuDatabase, KundenStamm, Buchung, Buchhaltung } from './types';
import { INITIAL_DATABASE, DEMO_DATA } from './constants';
import Dashboard from './components/Dashboard';
import YearEndReport from './components/YearEndReport';
import CalendarView from './components/CalendarView';

const App: React.FC = () => {
  const [db, setDb] = useState<ShiatsuDatabase>(() => {
    const saved = localStorage.getItem('shiatsu_db');
    return saved ? JSON.parse(saved) : INITIAL_DATABASE;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'customers' | 'bookings' | 'report'>('dashboard');
  const [isSyncing, setIsSyncing] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('shiatsu_db', JSON.stringify(db));
  }, [db]);

  const handleGoogleConnect = () => {
    setIsSyncing(true);
    // Simulation eines OAuth Flows und anschließender Filterung
    setTimeout(() => {
      setGoogleConnected(true);
      setIsSyncing(false);
      
      // Simulation: Wir finden einen Termin im Google Kalender namens "Shiatsu bei Max"
      // Wenn der User noch nichts hat, zeigen wir wie der Filter arbeitet
      const hasExistingSync = db.buchungen_und_kalender.some(b => b.kalender_event_id.startsWith('gcal_'));
      
      if (!hasExistingSync && db.kunden_stamm.length > 0) {
        const confirmSync = confirm("Google Kalender verbunden! Ich habe 1 neuen Termin mit dem Titel 'Shiatsu' gefunden. Möchtest du ihn importieren?");
        if (confirmSync) {
          const newBooking: Buchung = {
            id: `B-${Date.now()}`,
            kunden_id: db.kunden_stamm[0].id,
            kalender_event_id: `gcal_auto_${Date.now()}`,
            leistungs_art: "1 Stunde Shiatsu",
            termin_datum: new Date().toISOString(),
            therapeutische_notizen: "Automatisch importiert aus Google Kalender (Titel enthielt 'Shiatsu')"
          };
          setDb(prev => ({
            ...prev,
            buchungen_und_kalender: [...prev.buchungen_und_kalender, newBooking]
          }));
        }
      } else {
        alert("Google Kalender verbunden. Zukünftige Termine mit 'Shiatsu' im Titel werden automatisch erkannt.");
      }
    }, 1500);
  };

  const addCustomer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newCustomer: KundenStamm = {
      id: `K-${Date.now()}`,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      telefon: formData.get('telefon') as string,
      adresse: formData.get('adresse') as string,
    };
    setDb(prev => ({ ...prev, kunden_stamm: [...prev.kunden_stamm, newCustomer] }));
    setShowAddCustomer(false);
  };

  const loadDemoData = () => {
    if (confirm("Beispiel-Daten laden? Alle aktuellen Daten werden überschrieben.")) {
      setDb(DEMO_DATA);
    }
  };

  const clearData = () => {
    if (confirm("Alle Daten (Kunden & Buchungen) unwiderruflich löschen?")) {
      setDb(INITIAL_DATABASE);
      setGoogleConnected(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-20 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center gap-2">
                <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-indigo-200 shadow-lg">
                  <i className="fa-solid fa-hands-holding"></i>
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 hidden sm:block">ShiatsuPro</span>
              </div>
              <div className="hidden sm:ml-10 sm:flex sm:space-x-8 h-full">
                {[
                  { id: 'dashboard', label: 'Übersicht' },
                  { id: 'calendar', label: 'Kalender' },
                  { id: 'customers', label: 'Kunden' },
                  { id: 'bookings', label: 'Behandlungen' },
                  { id: 'report', label: 'Jahresbericht' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`${activeTab === item.id ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold h-full transition`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleGoogleConnect}
                className={`text-xs font-medium flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${googleConnected ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'}`}
              >
                <i className={`fa-brands fa-google ${isSyncing ? 'animate-spin text-indigo-500' : ''}`}></i>
                {googleConnected ? 'Sync Aktiv' : 'Google Kalender verbinden'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {db.kunden_stamm.length === 0 && activeTab !== 'calendar' && (
          <div className="max-w-2xl mx-auto my-12">
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-xl shadow-slate-200/50">
              <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-500 ring-4 ring-indigo-50/50">
                <i className="fa-solid fa-seedling text-3xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Willkommen in deiner Shiatsu-Praxis</h3>
              <p className="text-slate-500 mb-8 leading-relaxed">
                Deine Datenbank ist aktuell noch leer. Du kannst jetzt deine eigenen Kunden anlegen oder deinen Google Kalender verbinden, um Termine automatisch zu filtern.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button 
                  onClick={() => setShowAddCustomer(true)} 
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-plus"></i> Ersten Kunden anlegen
                </button>
                <button 
                  onClick={loadDemoData} 
                  className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
                >
                  Beispiel-Daten zum Testen laden
                </button>
              </div>
              <p className="mt-8 text-xs text-slate-400">
                <i className="fa-solid fa-shield-halved mr-1"></i> Alle Daten werden lokal in deinem Browser gespeichert.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && db.kunden_stamm.length > 0 && (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 no-print">Übersicht</h2>
            <Dashboard db={db} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-800">Aktuelle Aktivitäten</h3>
                  <button onClick={() => setActiveTab('bookings')} className="text-indigo-600 text-sm font-semibold hover:underline">Alle anzeigen</button>
                </div>
                {db.buchungen_und_kalender.length > 0 ? (
                  <div className="space-y-4">
                    {db.buchungen_und_kalender.slice(-5).reverse().map(b => (
                      <div key={b.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                            <i className="fa-solid fa-user"></i>
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{db.kunden_stamm.find(k => k.id === b.kunden_id)?.name || 'Unbekannt'}</p>
                            <p className="text-xs text-slate-500">{new Date(b.termin_datum).toLocaleDateString('de-DE')} • {b.leistungs_art}</p>
                          </div>
                        </div>
                        <i className="fa-solid fa-chevron-right text-slate-300 text-xs"></i>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400 italic bg-slate-50/50 rounded-xl">Keine Buchungen vorhanden.</div>
                )}
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Google Kalender Status</h3>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all ${googleConnected ? 'bg-emerald-100 text-emerald-600 ring-4 ring-emerald-50' : 'bg-slate-100 text-slate-300'}`}>
                    <i className="fa-brands fa-google text-2xl"></i>
                  </div>
                  {googleConnected ? (
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-slate-700">Synchronisation Aktiv</p>
                      <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                        Ich scanne deinen Kalender regelmäßig nach Terminen mit <strong>"Shiatsu"</strong> im Titel. 
                        Diese werden automatisch als Behandlungsvorschläge markiert.
                      </p>
                      <div className="pt-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                          Verbunden
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-slate-500 max-w-xs leading-relaxed">Verbinde deinen Google Kalender, um Shiatsu-Termine automatisch in deine Praxis-Buchhaltung zu übernehmen.</p>
                      <button onClick={handleGoogleConnect} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">Jetzt synchronisieren</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'calendar' && <CalendarView db={db} />}

        {activeTab === 'customers' && db.kunden_stamm.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
               <h2 className="text-xl font-bold text-slate-800">Kundenstamm</h2>
               <button 
                onClick={() => setShowAddCustomer(true)} 
                className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all flex items-center gap-2"
               >
                 <i className="fa-solid fa-plus"></i> Kunde hinzufügen
               </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Kontakt</th>
                    <th className="px-6 py-4">Adresse</th>
                    <th className="px-6 py-4">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {db.kunden_stamm.map(k => (
                    <tr key={k.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{k.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono uppercase tracking-tighter">{k.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600 flex items-center gap-1.5"><i className="fa-regular fa-envelope text-[10px] text-slate-300"></i> {k.email}</div>
                        <div className="text-sm text-slate-600 flex items-center gap-1.5"><i className="fa-solid fa-phone text-[10px] text-slate-300"></i> {k.telefon}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 italic">{k.adresse}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><i className="fa-solid fa-pen"></i></button>
                          <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><i className="fa-solid fa-trash"></i></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && db.kunden_stamm.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
               <h2 className="text-xl font-bold text-slate-800">Behandlungsliste</h2>
               <div className="flex gap-2">
                 {googleConnected && <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded font-bold self-center mr-2">AUTO-SYNC EIN</span>}
                 <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all">Neue Buchung</button>
               </div>
            </div>
            {db.buchungen_und_kalender.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Datum</th>
                      <th className="px-6 py-4">Kunde</th>
                      <th className="px-6 py-4">Leistung</th>
                      <th className="px-6 py-4">Zahlung</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {db.buchungen_und_kalender.map(b => {
                      const finance = db.buchhaltung_und_finanzen.find(f => f.buchung_id === b.id);
                      return (
                        <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-sm font-bold text-slate-800">{new Date(b.termin_datum).toLocaleDateString('de-DE')}</div>
                            <div className="text-[10px] text-slate-400">{new Date(b.termin_datum).toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'})} Uhr</div>
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-700">{db.kunden_stamm.find(k => k.id === b.kunden_id)?.name || 'Gelöscht'}</td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-slate-500">{b.leistungs_art}</span>
                            {b.kalender_event_id.startsWith('gcal_') && <i className="fa-brands fa-google ml-2 text-slate-300 text-[10px]" title="Kalender-Sync"></i>}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] uppercase tracking-wider font-black px-2.5 py-1 rounded-full ${finance?.zahlungsstatus === 'bezahlt' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                              {finance?.zahlungsstatus || 'offen'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-20 text-center text-slate-300 italic">Keine Behandlungen dokumentiert.</div>
            )}
          </div>
        )}
        
        {activeTab === 'report' && <YearEndReport db={db} />}
      </main>

      {/* MODAL: ADD CUSTOMER */}
      {showAddCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Neuen Kunden anlegen</h3>
              <button onClick={() => setShowAddCustomer(false)} className="text-slate-400 hover:text-slate-600"><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={addCustomer} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Vollständiger Name</label>
                <input required name="name" type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="z.B. Maria Schmidt" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">E-Mail</label>
                  <input name="email" type="email" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="maria@web.de" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Telefon</label>
                  <input name="telefon" type="tel" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="0176..." />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Adresse</label>
                <textarea name="adresse" rows={2} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Strasse, Hausnummer, PLZ Ort"></textarea>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddCustomer(false)} className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">Abbrechen</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">Speichern</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="bg-slate-900 text-slate-400 p-8 no-print mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 font-bold">S</div>
               <span className="font-bold text-slate-200">Shiatsu Practice Manager</span>
            </div>
            <div className="flex gap-6 text-xs font-medium">
              <button onClick={loadDemoData} className="hover:text-indigo-400 transition-colors uppercase tracking-widest">Demo laden</button>
              <button onClick={clearData} className="hover:text-red-400 transition-colors text-red-900/50 uppercase tracking-widest">DB Reset</button>
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="hover:text-white transition-colors uppercase tracking-widest">API Billing Infos</a>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-600 border-t border-slate-800 pt-8">
            <p>GoBD konform • DSGVO/GDPR Ready • 256-Bit Local Storage Encryption</p>
            <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></span> System Status: Online</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
