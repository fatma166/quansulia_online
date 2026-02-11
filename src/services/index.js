// Services Index - Central registry for all services
import { passportsConfig } from './passports/config';
import { attestationsConfig } from './attestations/config';
import { powerOfAttorneyConfig, poaSubtypes } from './powerOfAttorney/config';
import { civilRegistryConfig } from './civilRegistry/config';
import { endorsementsConfig } from './endorsements/config';
import { familyAffairsConfig } from './familyAffairs/config';
import { visasConfig } from './visas/config';
import { declarationsConfig, declarationSubtypes } from './declarations/config';
import { workAndPrisonsConfig } from './workAndPrisons/config';
import { bodyCoveringConfig } from './bodyCovering/config';
import { khartoomBankConfig } from './khartoomBank/config';
import { madhooniaConfig } from './madhoonia/config';
import { educationConfig, educationSubtypes } from './education/config';

// Service Components
import PassportsForm from './passports/PassportsForm';
import AttestationsForm from './attestations/AttestationsForm';
import PowerOfAttorneyForm from './powerOfAttorney/PowerOfAttorneyForm';
import CivilRegistryForm from './civilRegistry/CivilRegistryForm';
import EndorsementsForm from './endorsements/EndorsementsForm';
import FamilyAffairsForm from './familyAffairs/FamilyAffairsForm';
import VisasForm from './visas/VisasForm';
import DeclarationsForm from './declarations/DeclarationsForm';
import RegularDeclarationsForm from './declarations/regular/RegularDeclarationsForm';
import SwornDeclarationsForm from './declarations/sworn/SwornDeclarationsForm';
import WorkAndPrisonsForm from './workAndPrisons/WorkAndPrisonsForm';
import BodyCoveringForm from './bodyCovering/BodyCoveringForm';
import KhartoomBankForm from './khartoomBank/KhartoomBankForm';
import MadhooniaForm from './madhoonia/MadhooniaForm';
import EducationForm from './education/EducationForm';

// Services Configuration
export const servicesConfig = {
  passports: passportsConfig,
  attestations: attestationsConfig,
  powerOfAttorney: powerOfAttorneyConfig,
  civilRegistry: civilRegistryConfig,
  endorsements: endorsementsConfig,
  familyAffairs: familyAffairsConfig,
  visas: visasConfig,
  declarations: declarationsConfig,
  workAndPrisons: workAndPrisonsConfig,
  bodyCovering: bodyCoveringConfig,
  khartoomBank: khartoomBankConfig,
  madhoonia: madhooniaConfig,
  education: educationConfig
};

// Service Components Map
export const serviceComponents = {
  passports: PassportsForm,
  attestations: AttestationsForm,
  powerOfAttorney: PowerOfAttorneyForm,
  civilRegistry: CivilRegistryForm,
  endorsements: EndorsementsForm,
  familyAffairs: FamilyAffairsForm,
  visas: VisasForm,
  declarations: DeclarationsForm,
  regular_declarations: RegularDeclarationsForm,
  sworn_declarations: SwornDeclarationsForm,
  workAndPrisons: WorkAndPrisonsForm,
  bodyCovering: BodyCoveringForm,
  khartoomBank: KhartoomBankForm,
  madhoonia: MadhooniaForm,
  education: EducationForm
};

// Service Categories
export const serviceCategories = {
  all: { label: 'جميع الخدمات', icon: 'Grid' },
  documents: { label: 'الوثائق والمستندات', icon: 'FileText' },
  legal: { label: 'الخدمات القانونية', icon: 'Scale' },
  travel: { label: 'السفر والتأشيرات', icon: 'Plane' }
};

// Subtypes for services with subcategories
export { poaSubtypes, declarationSubtypes, educationSubtypes };

// Helper function to get service configuration
export const getServiceConfig = (serviceId) => {
  return servicesConfig[serviceId] || null;
};

// Helper function to get service component
export const getServiceComponent = (serviceId) => {
  return serviceComponents[serviceId] || null;
};