import type { FacilityDto } from "./TenantDto";
// Deprecated: use ProjectModelResultModel instead
export interface ProjectsChunckedApiResponseDto {
  Items: ProjectDto[][];
}

export interface ProjectDto {
  Number: string;
  Name: string;
  Status: string;
  Address?: AddressModel | null;
  WorkflowStepName?: string;
  Facilities?: FacilityDto[]; // Optional facilities list; only first address is used where needed
}

export interface AddressModel {
  Address1?: string | null;
  Address2?: string | null;
  City?: string | null;
  State?: string | null;
  ZipCode?: string | null;
  Country?: string | null;
  County?: string | null;
}
