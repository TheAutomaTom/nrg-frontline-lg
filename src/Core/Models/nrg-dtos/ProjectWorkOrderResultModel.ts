export interface ProjectWorkOrderResultModel {
  ProjectNumber: string | null;
  ProjectName: string | null;
  Items: ProjectWorkOrderModel[] | null;
}

export interface ProjectWorkOrderModel {
  Id: string;
  Number: string | null;
  Name: string | null;
  Type: string | null;
  // CreatedBy: UserIdentifierModel | null;
  // CreatedOn: string;
  // Facility: string | null;
  Outsourced: boolean;
  // Tags: string[] | null;
  Status: string | null;
  // MaterialOnHandDays: number | null;
  Step: string | null;
  StepIndex: number;
  StepType: string | null;
  // InvoiceStatus: string | null;
  // Owner: UserIdentifierModel | null;
  // Assignees: UserIdentifierModel[] | null;
  // Drafters: UserIdentifierModel[] | null;
  // Engineers: UserIdentifierModel[] | null;
  // Estimators: UserIdentifierModel[] | null;
  // SalesPersons: UserIdentifierModel[] | null;
  // Coordinators: UserIdentifierModel[] | null;
  // Installers: UserIdentifierModel[] | null;
  // ProjectManager: UserIdentifierModel | null;
  PlannedStartDate: string | null;
  ActualStartDate: string | null;
  PlannedCriticalDate: string | null;
  // MaterialNeededDate: string | null;
  // PlannedEndMonth: string | null;
  // ActualEndDate: string | null;
  // ActualEndMonth: string | null;
  // Instructions: string | null;
  // EstimatedLaborCost: MonetaryValueModel | null;
  // EstimatedMaterialCost: MonetaryValueModel | null;
  // EstimatedCost: MonetaryValueModel | null;
  // EstimatedHours: string;
  // EstimatedMargin: MarginModel | null;
  RemainingHours: string;
  PlannedHours: string;
  // PlannedLaborCost: MonetaryValueModel | null;
  // LaborGrandTotalPrice: MonetaryValueModel | null;
  // ActualLaborHours: string;
  // ActualCost: MonetaryValueModel | null;
  // ActualMaterialCost: MonetaryValueModel | null;
  // ActualLaborCost: MonetaryValueModel | null;
  // ActualExpensesCost: MonetaryValueModel | null;
  // ActualMargin: MarginModel | null;
  // MarginVariance: MonetaryValueModel | null;
  GrandTotalPrice: MonetaryValueModel | null;
  // PreSalesTaxPrice: MonetaryValueModel | null;
  // SalesTax: MonetaryValueModel | null;
  ExternalIdentifier: string | null;
  // ProductsQuantitySum: number;
  // ShipmentItemsQuantitySum: number;
  // ReadyForFieldVerificationStepItemPlannedDate: string | null;
  // ReadyForFieldVerificationStepItemActualDate: string | null;
  // FieldVerifiedStepItemPlannedDate: string | null;
  // FieldVerifiedStepItemActualDate: string | null;
  // PlannedLaborLastUpdatedDate: string | null;
  // PercentInstalled: number;
  // PercentInstalledLastUpdatedDate: string | null;
  // ProjectedInstallRemainingHours: string;
  // ShipmentDate: string | null;
  // PlannedShipmentDate: string | null;
  // ActualShipmentDate: string | null;
  // JobCostingStatus: string | null;
  // TeamLead: UserIdentifierModel | null;
  // Impediments: string[] | null;
  // CustomFields: ApiCustomField[] | null;
  // MasterNote: string | null;
  WorkflowName: string | null;
  // WorkflowStepEnteredDate: string;
  // WorkflowStepEnteredDays: number;
  // Finishes: ProjectFinishModel[] | null;
}

export interface UserIdentifierModel {
  Id: string;
  FullName: string | null;
}

export interface MonetaryValueModel {
  Value: number;
  OriginalValue: number;
  CurrencyCode: string;
}

export interface MarginModel {
  Cash: MonetaryValueModel | null;
  Percentage: number;
}

export interface ApiCustomField {
  Name: string | null;
  Type: number;
  Value: string | null;
}

export interface ProjectFinishModel {
  Id: string;
  Name: string | null;
  Code: string | null;
  Number: string | null;
}
