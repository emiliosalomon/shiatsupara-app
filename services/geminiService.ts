
import { GoogleGenAI } from "@google/genai";
import { ShiatsuDatabase } from "../types";

export const analyzeAccountingData = async (db: ShiatsuDatabase): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Handle als Buchhaltungs-Assistent für eine Shiatsu-Praxis.
    Analysiere folgende Daten:
    Kunden: ${db.kunden_stamm.length}
    Buchungen: ${db.buchungen_und_kalender.length}
    Finanzen: ${JSON.stringify(db.buchhaltung_und_finanzen)}
    
    Erstelle eine kurze, professionelle Zusammenfassung (3-4 Sätze) für den Jahresabschluss 2026. 
    Erwähne die Gesamteinnahmen, den Anteil von Barzahlungen und ob es kritische offene Posten gibt.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "Keine Analyse verfügbar.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Fehler bei der KI-Analyse.";
  }
};
