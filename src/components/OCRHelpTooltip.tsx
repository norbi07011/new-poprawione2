/**
 * OCR Help Tooltip Component
 * Wyświetla pomoc i wskazówki dla funkcji OCR skanowania paragonów
 */

import { Info } from '@phosphor-icons/react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

export function OCRHelpTooltip() {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
          aria-label="Pomoc OCR"
        >
          <Info size={14} weight="bold" className="text-blue-600" />
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-4" side="top">
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-blue-900">
            📸 Jak zrobić dobre zdjęcie paragonu?
          </h4>
          
          <div className="space-y-2 text-xs text-gray-700">
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Wyraźne</strong> - bez rozmazania, stabilny telefon</span>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Dobre światło</strong> - bez cieni i odbić</span>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Prosto</strong> - paragon równolegle do ekranu</span>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Blisko</strong> - paragon wypełnia 80% kadru</span>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              <strong className="text-blue-700">System rozpoznaje:</strong> kwotę, datę, nazwę sklepu, VAT, numer paragonu
            </p>
          </div>

          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs text-amber-700">
              ⚠️ <strong>Sprawdź dane po skanowaniu</strong> - OCR może pomylić cyfry
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
