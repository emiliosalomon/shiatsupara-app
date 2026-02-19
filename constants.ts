
import { ShiatsuDatabase } from './types';

export const INITIAL_DATABASE: ShiatsuDatabase = {
  kunden_stamm: [],
  buchungen_und_kalender: [],
  buchhaltung_und_finanzen: []
};

// Hilfsfunktion für Beispiel-Daten (optional zum Testen)
export const DEMO_DATA: ShiatsuDatabase = {
  kunden_stamm: [
    { id: "K-001", name: "Max Mustermann", email: "max@example.com", telefon: "0123", adresse: "Musterstr 1" }
  ],
  buchungen_und_kalender: [
    {
      id: "B-2026-001",
      kunden_id: "K-001",
      kalender_event_id: "gcal_123",
      leistungs_art: "1 Stunde Shiatsu",
      termin_datum: "2026-01-15T10:00:00",
      therapeutische_notizen: "Beispiel Notiz"
    }
  ],
  buchhaltung_und_finanzen: [
    {
      rechnungs_id: "R-001",
      buchung_id: "B-2026-001",
      rechnungsnummer: "RE-2026-001",
      betrag_brutto: 85.00,
      rechnungs_datum: "2026-01-15",
      zahlungs_datum: "2026-01-15",
      zahlungsstatus: "bezahlt",
      zahlungsmethode: "Bar"
    }
  ]
};
