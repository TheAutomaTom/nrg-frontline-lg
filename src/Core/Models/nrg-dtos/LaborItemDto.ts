// export type CurrencyCode = "USD" | string;

// export interface MoneyValueDto {
//   Value: number;
//   OriginalValue: number;
//   CurrencyCode: CurrencyCode;
// }

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
  WorkOrderType: string | null;
  // Burdens: unknown[]; // placeholder for burden items if needed later
  // HideInKiosk: boolean;
}

export interface LaborItemsResponseDto {
  Items: LaborItemDto[];
}
