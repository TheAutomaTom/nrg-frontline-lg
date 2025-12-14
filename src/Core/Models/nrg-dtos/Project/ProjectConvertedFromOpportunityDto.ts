import type { PersonRefDto } from "../PersonRefDto";

export interface ProjectConvertedFromOpportunityDto {
  Id: string;
  Name: string | null;
  ConversionDate: string | null;
  ConvertedBy: PersonRefDto | null;
}
