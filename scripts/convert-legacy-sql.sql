-- تحويل جميع الشروط القديمة إلى الصيغة الجديدة

-- Passports Service
UPDATE service_requirements SET conditions = '{"show_when":[{"field":"isAdult","operator":"equals","value":"no"},{"field":"passportType","operator":"equals","value":"new"}],"logic":"AND"}'::jsonb WHERE conditions->>'category' = 'minors_new';
UPDATE service_requirements SET conditions = '{"show_when":[{"field":"isAdult","operator":"equals","value":"no"},{"field":"passportType","operator":"equals","value":"renewal"}],"logic":"AND"}'::jsonb WHERE conditions->>'category' = 'minors_renewal';
UPDATE service_requirements SET conditions = '{"show_when":[{"field":"isAdult","operator":"equals","value":"no"},{"field":"passportType","operator":"in","value":["renewal","replacement"]}],"logic":"AND"}'::jsonb WHERE conditions->>'category' = 'minors_renewal_replacement';
UPDATE service_requirements SET conditions = '{"show_when":[{"field":"isAdult","operator":"equals","value":"yes"},{"field":"passportType","operator":"equals","value":"emergency"}],"logic":"AND"}'::jsonb WHERE conditions->>'category' = 'emergency_adults';
UPDATE service_requirements SET conditions = '{"show_when":[{"field":"isAdult","operator":"equals","value":"no"},{"field":"passportType","operator":"equals","value":"emergency"}],"logic":"AND"}'::jsonb WHERE conditions->>'category' = 'emergency_children';
UPDATE service_requirements SET conditions = '{"show_when":[{"field":"isAdult","operator":"equals","value":"yes"},{"field":"passportType","operator":"equals","value":"new"}],"logic":"AND"}'::jsonb WHERE conditions->>'category' = 'adults_new';
UPDATE service_requirements SET conditions = '{"show_when":[{"field":"isAdult","operator":"equals","value":"yes"},{"field":"passportType","operator":"equals","value":"renewal"}],"logic":"AND"}'::jsonb WHERE conditions->>'category' = 'adults_renewal';
UPDATE service_requirements SET conditions = '{"show_when":[{"field":"passportType","operator":"equals","value":"renewal"}],"logic":"OR"}'::jsonb WHERE conditions->>'category' = 'renewal';
UPDATE service_requirements SET conditions = '{"show_when":[{"field":"passportType","operator":"equals","value":"replacement"}],"logic":"OR"}'::jsonb WHERE conditions->>'category' = 'replacement';

-- Civil Registry Service
UPDATE service_requirements SET conditions = '{"show_when":[{"field":"idType","operator":"equals","value":"newborn"}],"logic":"OR"}'::jsonb WHERE conditions->>'category' = 'national_id_newborn';
UPDATE service_requirements SET conditions = '{"show_when":[{"field":"idType","operator":"equals","value":"under12"}],"logic":"OR"}'::jsonb WHERE conditions->>'category' = 'national_id_under12';
UPDATE service_requirements SET conditions = '{"show_when":[{"field":"idType","operator":"equals","value":"replacement"}],"logic":"OR"}'::jsonb WHERE conditions->>'category' = 'national_id_replacement';
UPDATE service_requirements SET conditions = '{"show_when":[{"field":"recordType","operator":"equals","value":"name_correction"}],"logic":"OR"}'::jsonb WHERE conditions->>'category' = 'name_correction';
UPDATE service_requirements SET conditions = '{"show_when":[{"field":"recordType","operator":"equals","value":"age_correction"}],"logic":"OR"}'::jsonb WHERE conditions->>'category' = 'age_correction';
UPDATE service_requirements SET conditions = '{"show_when":[{"field":"recordType","operator":"equals","value":"conduct_certificate"}],"logic":"OR"}'::jsonb WHERE conditions->>'category' = 'conduct_certificate';
UPDATE service_requirements SET conditions = '{"show_when":[{"field":"recordType","operator":"equals","value":"towhomitmayconcern"}],"logic":"OR"}'::jsonb WHERE conditions->>'category' = 'towhomitmayconcern';

-- Madhoonia Service
UPDATE service_requirements SET conditions = '{"show_when":[{"field":"serviceType","operator":"equals","value":"marriage"}],"logic":"OR"}'::jsonb WHERE conditions->>'category' = 'marriage';
UPDATE service_requirements SET conditions = '{"show_when":[{"field":"serviceType","operator":"equals","value":"divorce"}],"logic":"OR"}'::jsonb WHERE conditions->>'category' = 'divorce';

-- Visas Service
UPDATE service_requirements SET conditions = '{"show_when":[{"field":"visaType","operator":"equals","value":"general"}],"logic":"OR"}'::jsonb WHERE conditions->>'category' = 'general';
UPDATE service_requirements SET conditions = '{"show_when":[{"field":"visaType","operator":"equals","value":"business_visit"}],"logic":"OR"}'::jsonb WHERE conditions->>'category' = 'business_visit';
UPDATE service_requirements SET conditions = '{"show_when":[{"field":"visaType","operator":"equals","value":"personal_visit"}],"logic":"OR"}'::jsonb WHERE conditions->>'category' = 'personal_visit';
UPDATE service_requirements SET conditions = '{"show_when":[{"field":"visaType","operator":"equals","value":"sudanese_origin"}],"logic":"OR"}'::jsonb WHERE conditions->>'category' = 'sudanese_origin';

-- Work and Prisons Service
UPDATE service_requirements SET conditions = '{"show_when":[{"field":"requestReason","operator":"equals","value":"finalExit"}],"logic":"OR"}'::jsonb WHERE conditions->>'category' = 'finalExit';

-- عرض النتائج
SELECT
  CASE
    WHEN conditions IS NULL THEN 'بدون شروط'
    WHEN conditions->'show_when' IS NOT NULL THEN 'صيغة جديدة'
    ELSE 'صيغة قديمة'
  END as condition_type,
  COUNT(*) as count
FROM service_requirements
GROUP BY condition_type
ORDER BY count DESC;
