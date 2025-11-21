-- ============================================
-- MIGRATION: Dodaj brakujące kolumny dla invoices
-- Data: 2025-11-21
-- ============================================

-- 1. Dodaj brakujące kolumny do tabeli INVOICES
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS vat_note TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS payment_qr_payload TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS payment_reference TEXT DEFAULT '';

-- 2. Dodaj index dla company_id
CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON invoices(company_id);

-- 3. Zaktualizuj istniejące faktury (jeśli są)
-- Ustaw domyślne wartości dla istniejących rekordów
UPDATE invoices SET vat_note = '' WHERE vat_note IS NULL;
UPDATE invoices SET payment_qr_payload = '' WHERE payment_qr_payload IS NULL;
UPDATE invoices SET payment_reference = '' WHERE payment_reference IS NULL;

-- ============================================
-- GOTOWE! ✅
-- ============================================
-- Tabela invoices ma teraz wszystkie potrzebne kolumny:
-- - company_id (relacja z companies)
-- - vat_note (reverse charge note)
-- - payment_qr_payload (QR kod SEPA)
-- - payment_reference (numer referencyjny płatności)
