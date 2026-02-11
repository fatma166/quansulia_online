/*
  # Security Fix Part 2 (Final): Fix Function Search Paths
  
  Only alters functions that actually exist with correct signatures
*/

DO $$
BEGIN
  -- Functions with no arguments
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'generate_otp_code' AND pronargs = 0) THEN
    ALTER FUNCTION public.generate_otp_code() SET search_path = pg_catalog, public;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'cleanup_expired_otps' AND pronargs = 0) THEN
    ALTER FUNCTION public.cleanup_expired_otps() SET search_path = pg_catalog, public;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_export_templates_updated_at' AND pronargs = 0) THEN
    ALTER FUNCTION public.update_export_templates_updated_at() SET search_path = pg_catalog, public;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'generate_reference_number' AND pronargs = 0) THEN
    ALTER FUNCTION public.generate_reference_number() SET search_path = pg_catalog, public;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_reference_number' AND pronargs = 0) THEN
    ALTER FUNCTION public.set_reference_number() SET search_path = pg_catalog, public;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'generate_educational_card_number' AND pronargs = 0) THEN
    ALTER FUNCTION public.generate_educational_card_number() SET search_path = pg_catalog, public;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_educational_cards_updated_at' AND pronargs = 0) THEN
    ALTER FUNCTION public.update_educational_cards_updated_at() SET search_path = pg_catalog, public;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_breaking_news_updated_at' AND pronargs = 0) THEN
    ALTER FUNCTION public.update_breaking_news_updated_at() SET search_path = pg_catalog, public;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_slot_availability' AND pronargs = 0) THEN
    ALTER FUNCTION public.update_slot_availability() SET search_path = pg_catalog, public;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_pricing_rules_updated_at' AND pronargs = 0) THEN
    ALTER FUNCTION public.update_pricing_rules_updated_at() SET search_path = pg_catalog, public;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_application_statuses_updated_at' AND pronargs = 0) THEN
    ALTER FUNCTION public.update_application_statuses_updated_at() SET search_path = pg_catalog, public;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_pricing_updated_at' AND pronargs = 0) THEN
    ALTER FUNCTION public.update_pricing_updated_at() SET search_path = pg_catalog, public;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_shipping_companies_updated_at' AND pronargs = 0) THEN
    ALTER FUNCTION public.update_shipping_companies_updated_at() SET search_path = pg_catalog, public;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'check_pricing_editable' AND pronargs = 0) THEN
    ALTER FUNCTION public.check_pricing_editable() SET search_path = pg_catalog, public;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'lock_pricing_on_payment' AND pronargs = 0) THEN
    ALTER FUNCTION public.lock_pricing_on_payment() SET search_path = pg_catalog, public;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'generate_invoice_number' AND pronargs = 0) THEN
    ALTER FUNCTION public.generate_invoice_number() SET search_path = pg_catalog, public;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_invoice_updated_at' AND pronargs = 0) THEN
    ALTER FUNCTION public.update_invoice_updated_at() SET search_path = pg_catalog, public;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column' AND pronargs = 0) THEN
    ALTER FUNCTION public.update_updated_at_column() SET search_path = pg_catalog, public;
  END IF;
  
  -- Functions with arguments - use EXECUTE for proper handling
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'increment_qa_usage' AND pronargs = 1) THEN
    EXECUTE 'ALTER FUNCTION public.increment_qa_usage(uuid) SET search_path = pg_catalog, public';
  END IF;
  
  -- check_staff_service_access takes (uuid, text) not (uuid, uuid)
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'check_staff_service_access' 
             AND pg_get_function_identity_arguments(oid) = 'staff_user_id uuid, service_slug text') THEN
    EXECUTE 'ALTER FUNCTION public.check_staff_service_access(uuid, text) SET search_path = pg_catalog, public';
  END IF;
END $$;
