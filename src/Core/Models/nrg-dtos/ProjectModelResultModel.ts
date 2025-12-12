import type { AddressModel } from "./ProjectDto";

export interface ProjectModelResultModel {
  Items: ProjectModel[] | null;
}

export interface ProjectModel {
  Id: string;
  Number: string | null;
  Name: string | null;
  ExternalId: string | null;
  Status: string | null;
  WorkflowStepName: string | null;
  WorkflowStepIndex: number | null;
  // CreatedBy: UserIdentifierModel | null;
  // CreatedOn: string;
  // ModifiedBy: UserIdentifierModel | null;
  // ModifiedOn: string | null;
  // Customer: OfficeIdentifierModel | null;
  // Address: AddressModel | null;
  // BidPercentageMargin: number | null;
  // PlannedPercentageMargin: number | null;
  // ActualPercentageMargin: number | null;
  // Opportunity: ProjectConvertedFromOpportunityModel | null;
  // OriginalPreTaxDraftingRevenue: MonetaryValueModel | null;
  // OriginalPreTaxFabricationRevenue: MonetaryValueModel | null;
  // OriginalPreTaxProductRevenue: MonetaryValueModel | null;
  // OriginalDraftingSalesTax: MonetaryValueModel | null;
  // OriginalFabricationSalesTax: MonetaryValueModel | null;
  // OriginalProductSalesTax: MonetaryValueModel | null;
  // OriginalDraftingSalesTaxPercentage: number | null;
  // OriginalFabricationSalesTaxPercentage: number | null;
  // OriginalProductSalesTaxPercentage: number | null;
  // OriginalTotalDraftingAmount: MonetaryValueModel | null;
  // OriginalTotalFabricationAmount: MonetaryValueModel | null;
  // OriginalTotalProductAmount: MonetaryValueModel | null;
  // OriginalPreTaxInstallRevenue: MonetaryValueModel | null;
  // OriginalInstallSalesTax: MonetaryValueModel | null;
  // OriginalInstallSalesTaxPercentage: number | null;
  // OriginalTotalInstallAmount: MonetaryValueModel | null;
  // OriginalPreTaxTotalRevenue: MonetaryValueModel | null;
  // OriginalTotalSalesTax: MonetaryValueModel | null;
  // OriginalTotalSalesTaxPercentage: number | null;
  // OriginalTotalContract: MonetaryValueModel | null;
  // PreTaxProductRevenue: MonetaryValueModel | null;
  // ProductSalesTax: MonetaryValueModel | null;
  // ProductSalesTaxPercentage: number | null;
  // TotalProductAmount: MonetaryValueModel | null;
  // PreTaxInstallRevenue: MonetaryValueModel | null;
  // InstallSalesTax: MonetaryValueModel | null;
  // InstallSalesTaxPercentage: number | null;
  // TotalInstallAmount: MonetaryValueModel | null;
  // PreTaxTotalRevenue: MonetaryValueModel | null;
  // TotalSalesTax: MonetaryValueModel | null;
  // TotalSalesTaxPercentage: number | null;
  // TotalContract: MonetaryValueModel | null;
  // EstimatedBudgetGroupsTotalCost: MonetaryValueModel | null;
  // PendingBudgetGroupsTotalCost: MonetaryValueModel | null;
  // PlannedBudgetGroupsTotalCost: MonetaryValueModel | null;
  // ActualBudgetGroupsTotalCost: MonetaryValueModel | null;
  // EstimatedLaborItemsTotalCost: MonetaryValueModel | null;
  // PendingLaborItemsTotalCost: MonetaryValueModel | null;
  PlannedLaborItemsTotalCost: MonetaryValueModel | null;
  // ActualLaborItemsTotalCost: MonetaryValueModel | null;
  // EstimatedLaborItemsTotalHours: string | null;
  // PendingLaborItemsTotalHours: string | null;
  // PlannedLaborItemsTotalHours: string | null;
  // ActualLaborItemsTotalHours: string | null;
  // EstimatedGrandTotalCost: MonetaryValueModel | null;
  // PendingGrandTotalCost: MonetaryValueModel | null;
  // PlannedGrandTotalCost: MonetaryValueModel | null;
  // ActualGrandTotalCost: MonetaryValueModel | null;
  // Estimators: UserIdentifierModel[] | null;
  // SalesPersons: UserIdentifierModel[] | null;
  // Coordinators: UserIdentifierModel[] | null;
  // Engineers: UserIdentifierModel[] | null;
  // CustomFields: ApiCustomField[] | null;
  // Installers: UserIdentifierModel[] | null;
  // MasterNote: string | null;
  // EstimatedDraftingUseTax: MonetaryValueModel | null;
  // EstimatedFabricationUseTax: MonetaryValueModel | null;
  // EstimatedInstallUseTax: MonetaryValueModel | null;
  // EstimatedTotalUseTax: MonetaryValueModel | null;
  // NextMilestone: string | null;
  // WorkflowStepIndex: number | null;
  // WorkflowStepName: string | null;
  // CloseDate: string | null;
}

export interface UserIdentifierModel {
  Id: string;
  FullName: string | null;
}

export interface OfficeIdentifierModel {
  Id: string;
  Name: string | null;
}

export interface MonetaryValueModel {
  Value: number;
  OriginalValue: number;
  CurrencyCode: string;
}

export interface ProjectConvertedFromOpportunityModel {
  Id: string;
  Name: string | null;
  ConversionDate: string | null;
  ConvertedBy: UserIdentifierModel | null;
}

export interface ApiCustomField {
  Name: string | null;
  Type: number;
  Value: string | null;
}
