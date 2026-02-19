
export interface KundenStamm {
  id: string;
  name: string;
  email: string;
  telefon: string;
  adresse: string;
}

export interface Buchung {
  id: string;
  kunden_id: string;
  kalender_event_id: string;
  leistungs_art: "1 Stunde Shiatsu" | "6 Stunden Intensiv";
  termin_datum: string;
  therapeutische_notizen: string;
}

export interface Buchhaltung {
  rechnungs_id: string;
  buchung_id: string;
  rechnungsnummer: string;
  betrag_brutto: number;
  rechnungs_datum: string;
  zahlungs_datum: string | null;
  zahlungsstatus: "bezahlt" | "offen" | "storniert";
  zahlungsmethode: "Bar" | "Überweisung";
}

export interface JahresabschlussExport {
  jahr: number;
  gesamt_einnahmen_brutto: number;
  einnahmen_nach_methode: {
    bar: number;
    ueberweisung: number;
  };
  anzahl_behandlungen: number;
  offene_posten: number;
}

export interface ShiatsuDatabase {
  kunden_stamm: KundenStamm[];
  buchungen_und_kalender: Buchung[];
  buchhaltung_und_finanzen: Buchhaltung[];
  jahresabschluss_export_2026?: JahresabschlussExport;
}
