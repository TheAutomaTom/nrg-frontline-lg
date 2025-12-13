import type { UserIdentifierDto } from "./UserIdentifierDto";

export interface ProjectConvertedFromOpportunityDto {
  Id: string;
  Name: string | null;
  ConversionDate: string | null;
  ConvertedBy: UserIdentifierDto | null;
}
