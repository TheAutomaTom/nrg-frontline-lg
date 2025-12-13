import type { AddressDto } from "./Project/AddressDto";

export interface FacilityDto {
  Name: string;
  Email: string;
  Phone: string;
  TimeZone: string;
  Address: AddressDto;
}
