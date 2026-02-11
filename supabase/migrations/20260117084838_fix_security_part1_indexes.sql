/*
  # Security Fix Part 1: Add Missing Indexes on Foreign Keys
  
  1. Performance Improvements
     - Adds 41 missing indexes on foreign key columns
     - Improves query performance for joins and foreign key lookups
  
  2. Tables Affected
     - about_consulate_sections, about_sudan_page, ambassadors
     - application_pricing_items, application_pricing_summary
     - appointments, breaking_news_ticker, chatbot tables
     - CMS tables (contact_info, counters, footer_content, etc.)
     - educational_cards, events, news, services, and more
*/

-- About Consulate & Sudan
CREATE INDEX IF NOT EXISTS idx_about_consulate_sections_created_by ON public.about_consulate_sections(created_by);
CREATE INDEX IF NOT EXISTS idx_about_consulate_sections_updated_by ON public.about_consulate_sections(updated_by);
CREATE INDEX IF NOT EXISTS idx_about_sudan_page_updated_by ON public.about_sudan_page(updated_by);
CREATE INDEX IF NOT EXISTS idx_about_sudan_section_stats_section_id ON public.about_sudan_section_stats(section_id);

-- Ambassadors
CREATE INDEX IF NOT EXISTS idx_ambassadors_created_by ON public.ambassadors(created_by);
CREATE INDEX IF NOT EXISTS idx_ambassadors_updated_by ON public.ambassadors(updated_by);

-- Application Pricing
CREATE INDEX IF NOT EXISTS idx_application_pricing_items_created_by ON public.application_pricing_items(created_by);
CREATE INDEX IF NOT EXISTS idx_application_pricing_items_updated_by ON public.application_pricing_items(updated_by);
CREATE INDEX IF NOT EXISTS idx_application_pricing_summary_created_by ON public.application_pricing_summary(created_by);
CREATE INDEX IF NOT EXISTS idx_application_pricing_summary_updated_by ON public.application_pricing_summary(updated_by);

-- Appointments
CREATE INDEX IF NOT EXISTS idx_appointments_slot_id ON public.appointments(slot_id);

-- Breaking News
CREATE INDEX IF NOT EXISTS idx_breaking_news_ticker_created_by ON public.breaking_news_ticker(created_by);

-- Chatbot
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_matched_qa_id ON public.chatbot_conversations(matched_qa_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_questions_answers_created_by ON public.chatbot_questions_answers(created_by);

-- CMS Tables
CREATE INDEX IF NOT EXISTS idx_contact_info_updated_by ON public.contact_info(updated_by);
CREATE INDEX IF NOT EXISTS idx_counters_updated_by ON public.counters(updated_by);
CREATE INDEX IF NOT EXISTS idx_footer_content_updated_by ON public.footer_content(updated_by);
CREATE INDEX IF NOT EXISTS idx_page_sections_updated_by ON public.page_sections(updated_by);
CREATE INDEX IF NOT EXISTS idx_site_settings_updated_by ON public.site_settings(updated_by);
CREATE INDEX IF NOT EXISTS idx_slider_items_updated_by ON public.slider_items(updated_by);
CREATE INDEX IF NOT EXISTS idx_social_links_updated_by ON public.social_links(updated_by);

-- Educational Cards
CREATE INDEX IF NOT EXISTS idx_educational_cards_created_by ON public.educational_cards(created_by);
CREATE INDEX IF NOT EXISTS idx_educational_cards_updated_by ON public.educational_cards(updated_by);

-- Events & News
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_updated_by ON public.events(updated_by);
CREATE INDEX IF NOT EXISTS idx_news_created_by ON public.news(created_by);
CREATE INDEX IF NOT EXISTS idx_news_updated_by ON public.news(updated_by);

-- Important Links
CREATE INDEX IF NOT EXISTS idx_important_links_created_by ON public.important_links(created_by);
CREATE INDEX IF NOT EXISTS idx_important_links_updated_by ON public.important_links(updated_by);

-- Invoices
CREATE INDEX IF NOT EXISTS idx_invoices_created_by ON public.invoices(created_by);

-- Service Conditions
CREATE INDEX IF NOT EXISTS idx_service_document_conditions_condition_field_id ON public.service_document_conditions(condition_field_id);
CREATE INDEX IF NOT EXISTS idx_service_field_conditions_condition_field_id ON public.service_field_conditions(condition_field_id);

-- Service Documents & Requirements
CREATE INDEX IF NOT EXISTS idx_service_documents_service_type_id ON public.service_documents(service_type_id);
CREATE INDEX IF NOT EXISTS idx_service_requirements_service_type_id ON public.service_requirements(service_type_id);

-- Services
CREATE INDEX IF NOT EXISTS idx_services_created_by ON public.services(created_by);
CREATE INDEX IF NOT EXISTS idx_services_updated_by ON public.services(updated_by);

-- Services Guide
CREATE INDEX IF NOT EXISTS idx_services_guide_sections_created_by ON public.services_guide_sections(created_by);
CREATE INDEX IF NOT EXISTS idx_services_guide_sections_updated_by ON public.services_guide_sections(updated_by);

-- System Tables
CREATE INDEX IF NOT EXISTS idx_system_announcements_updated_by ON public.system_announcements(updated_by);
CREATE INDEX IF NOT EXISTS idx_system_maintenance_updated_by ON public.system_maintenance(updated_by);
CREATE INDEX IF NOT EXISTS idx_system_settings_updated_by ON public.system_settings(updated_by);

-- Remove duplicate index
DROP INDEX IF EXISTS public.idx_shipments_application;
