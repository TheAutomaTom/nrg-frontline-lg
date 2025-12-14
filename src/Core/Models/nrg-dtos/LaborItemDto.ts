export interface LaborItemDtos {
  Items: LaborItemDto[];
}
export interface LaborItemDto {
  LaborId: string;
  Name: string;
  // ExternalId: string | null;
  // DirectCost: MoneyValueDto;
  // TotalCost: MoneyValueDto;
  // Margin: MoneyValueDto;
  // MarginPercent: number;
  // TotalSell: MoneyValueDto;
  Department: string | null;
  JobCosting: string | null;
  // GlAccount: string | null;
  // DebitGLAccount: string | null;
  Type: string | null;
  WorkOrderType: "Drafting" | "Production" | "Installation" | null;
  // Burdens: unknown[]; // placeholder for burden items if needed later
  HideInKiosk: boolean;
}
