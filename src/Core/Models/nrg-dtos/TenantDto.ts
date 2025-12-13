import type { FacilityDto } from "./FacilityDto";
import type { AddressDto } from "./Project/AddressDto";

export interface TenantDto {
  CompanyName: string;
  // Website: string;
  // Email: string;
  // Phone: string;
  // Fax: string;
  // TollFree: string;
  Address: AddressDto;
  // Social: SocialDto;
  Facilities: FacilityDto[];
}
