import type { PersonRefDto } from "./PersonRefDto";

export interface WorkOrdersDtosChunked {
  Items: WorkOrderDto[][];
}

export interface WorkOrderDto {
  // ===================================================//
  PlannedStartDate?: string | null;
  PlannedCriticalDate?: string | null;
  ActualStartDate?: string | null;
  FieldVerifiedStepItemPlannedDate?: string | null;
  FieldVerifiedStepItemActualDate?: string | null;
  // ===================================================//
  ProjectNumber: string;
  ProjectName: string;
  Id: string;
  Number: string;
  Name: string;
  Type: string;
  // CreatedBy: CreatedBy
  // CreatedOn: string
  // Facility: string
  // Outsourced: boolean
  // Tags: string[]
  Status: string;
  // MaterialOnHandDays: number
  Step: string;
  // StepIndex: number
  StepType: string;
  // InvoiceStatus: string
  WorkflowName?: string;
  Owner?: PersonRefDto;
  Assignees?: PersonRefDto[];
  // Drafters?: Drafter[]
  // Engineers?: Engineer[]
  // Estimators?: Estimator[]
  // SalesPersons?: SalesPerson[]
  // Coordinators?: Coordinator[]
  // Installers?: Installer[]
  ProjectManager?: PersonRefDto;
  // PlannedStartDate: string
  // ActualStartDate?: string
  // PlannedCriticalDate: string
  // MaterialNeededDate?: string
  // PlannedEndDate: string
  // PlannedEndMonth: string
  // ActualEndDate?: string
  // ActualEndMonth?: string
  Instructions: string;
  // EstimatedLaborCost: EstimatedLaborCost
  // EstimatedMaterialCost: EstimatedMaterialCost
  // EstimatedCost: EstimatedCost
  // EstimatedHours: string
  // EstimatedMargin: EstimatedMargin
  // LaborHours: string
  // RemainingHours: string
  // PlannedHours: string
  // LaborCost: LaborCost
  // PlannedLaborCost: PlannedLaborCost
  // LaborGrandTotalPrice: LaborGrandTotalPrice
  // ActualLaborHours: string
  // ActualCost: ActualCost
  // ActualMaterialCost: ActualMaterialCost
  // ActualLaborCost: ActualLaborCost
  // ActualExpensesCost: ActualExpensesCost
  // ActualMargin: ActualMargin
  // MarginVariance: MarginVariance
  // GrandTotalPrice: GrandTotalPrice
  // PreSalesTaxPrice: PreSalesTaxPrice
  // SalesTax: SalesTax
  // ExternalIdentifier: string
  // ProductsQuantitySum: number
  // ShipmentItemsQuantitySum: number
  // ReadyForFieldVerificationStepItemPlannedDate?: string
  // ReadyForFieldVerificationStepItemActualDate?: string
  // FieldVerifiedStepItemPlannedDate?: string
  // FieldVerifiedStepItemActualDate?: string
  // PlannedLaborLastUpdatedDate?: string
  // PercentInstalled: number
  // PercentInstalledLastUpdatedDate?: string
  // ProjectedInstallRemainingHours: string
  // ShipmentDate?: string
  // PlannedShipmentDate?: string
  // ActualShipmentDate?: string
  // JobCostingStatus: string
  // TeamLead?: TeamLead
  // Impediments?: string[]
  // CustomFields: CustomField[]
  MasterNote?: string;
  // WorkflowStepEnteredDate: string
  // WorkflowStepEnteredDate: string
  // WorkflowStepEnteredDays: number
}

// export interface CreatedBy {
//   Id: string
//   FullName: string
// }

// export interface EstimatedLaborCost {
//   Value: number
//   OriginalValue: number
//   CurrencyCode: string
// }

// export interface EstimatedMaterialCost {
//   Value: number
//   OriginalValue: number
//   CurrencyCode: string
// }

// export interface EstimatedCost {
//   Value: number
//   OriginalValue: number
//   CurrencyCode: string
// }

// export interface EstimatedMargin {
//   Cash: Cash
//   Percentage: number
// }

// export interface Cash {
//   Value: number
//   OriginalValue: number
//   CurrencyCode: string
// }

// export interface LaborCost {
//   Value: number
//   OriginalValue: number
//   CurrencyCode: string
// }

// export interface PlannedLaborCost {
//   Value: number
//   OriginalValue: number
//   CurrencyCode: string
// }

// export interface LaborGrandTotalPrice {
//   Value: number
//   OriginalValue: number
//   CurrencyCode: string
// }

// export interface ActualCost {
//   Value: number
//   OriginalValue: number
//   CurrencyCode: string
// }

// export interface ActualMaterialCost {
//   Value: number
//   OriginalValue: number
//   CurrencyCode: string
// }

// export interface ActualLaborCost {
//   Value: number
//   OriginalValue: number
//   CurrencyCode: string
// }

// export interface ActualExpensesCost {
//   Value: number
//   OriginalValue: number
//   CurrencyCode: string
// }

// export interface ActualMargin {
//   Cash: Cash2
//   Percentage: number
// }

// export interface Cash2 {
//   Value: number
//   OriginalValue: number
//   CurrencyCode: string
// }

// export interface MarginVariance {
//   Value: number
//   OriginalValue: number
//   CurrencyCode: string
// }

// export interface GrandTotalPrice {
//   Value: number
//   OriginalValue: number
//   CurrencyCode: string
// }

// export interface PreSalesTaxPrice {
//   Value: number
//   OriginalValue: number
//   CurrencyCode: string
// }

// export interface SalesTax {
//   Value: number
//   OriginalValue: number
//   CurrencyCode: string
// }

// export interface TeamLead {
//   Id: string
//   FullName: string
// }

// export interface CustomField {
//   Name: string
//   Type: number
//   Value: string
// }
