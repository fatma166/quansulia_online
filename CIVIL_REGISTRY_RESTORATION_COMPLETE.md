# Civil Registry Service Restoration

## Summary

Successfully generated a comprehensive SQL migration to restore all fields, requirements, and documents for the civil registry service (الأحوال المدنية) from the complete configuration file.

## Files Generated

1. **Migration File**: `supabase/migrations/99999999999998_restore_civil_registry_service.sql` (83KB)
   - Contains 66 form fields with conditional logic
   - Contains 30 service requirements
   - Contains 30 service documents
   - All with proper conditional rendering based on service type

2. **Helper Scripts**:
   - `scripts/generate-civil-registry-sql.js` - Generates the SQL migration from config.js
   - `scripts/restore-civil-registry-from-config.js` - Direct database restoration script

## What Was Restored

### Form Fields (66 total)
- **Service Type Selection**: recordType, idType
- **Replacement ID**: nationalId, motherFullName, birthDate
- **Newborn/Under12**: childGender, childFullNameArabic, childFullNameEnglish, bloodType, birthRegion, birthCity, birthHospital
- **Father Attendance**: fatherAttending with witness fields (2 witnesses each with name, passport, relation, phone)
- **Name Correction**: correctedName, nameCorrectionReason
- **Age Correction**: wrongBirthDate, correctBirthDate, ageCorrectionReason
- **Conduct Certificate**: nationalNumber, requestingAuthority, requestReason
- **To Whom It May Concern**: concernSubject, civilRegistryData, requestExplanation
- **Document Upload Fields**: 33 conditional file upload fields

### Requirements (30 total)
- Replacement: 2 requirements
- Newborn: 5 requirements
- Under12: 4 requirements
- Name Correction: 9 requirements
- Age Correction: 6 requirements
- Conduct Certificate: 3 requirements
- To Whom It May Concern: 1 requirement

### Documents (30 total)
- All requirements are also included as documents with proper file upload specifications

## Conditional Logic

All fields, requirements, and documents include proper conditional logic:
- Simple conditions: `{"field": "recordType", "values": ["national_id"]}`
- Complex AND conditions: `[{"operator": "AND", "conditions": [...]}]`
- Nested conditions for witness fields based on father attendance

## Migration File Location

```
supabase/migrations/99999999999998_restore_civil_registry_service.sql
```

## How the Migration Works

The SQL migration:
1. Gets the service UUID for 'civil-registry'
2. Deletes all existing fields, requirements, and documents
3. Inserts all 66 fields with proper order and conditions
4. Inserts all 30 requirements with conditions
5. Inserts all 30 documents with conditions

## Manual Application (If Needed)

If automatic application doesn't work, you can apply the migration manually:

### Option 1: Through Supabase Dashboard
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy the contents of `supabase/migrations/99999999999998_restore_civil_registry_service.sql`
4. Paste and run the SQL

### Option 2: Using Local Script
The migration file is ready in the migrations folder and will be automatically applied on next deployment.

## Verification

After application, the service should have:
- 66 fields across 2 steps
- 30 requirements (conditional based on service type)
- 30 documents (conditional based on service type)
- Full conditional rendering logic working as before

All data is restored exactly as defined in `src/services/civilRegistry/config.js`.
