export interface OperationDurationProductivityEntryModel {
  Duration: number;
  Quantity: number;
}

export interface OperationDurationModel {
  FacilityName?: string | null;
  LaborItem?: string | null;
  TimeUnit?: string | null;
  Enabled: boolean;
  LineType?: string | null;
  Equation?: number[] | null;
  DataPoints?: OperationDurationProductivityEntryModel[] | null;
}

export interface OperationModel {
  Name?: string | null;
  SequenceId?: string | null;
  BaseUoM?: string | null;
  OperationCategory?: string | null;
  Description?: string | null;
  LaborCurves?: OperationDurationModel[] | null;
  WorkOrderType?: string | null;
}

export interface OperationModelResultModel {
  Items?: OperationModel[] | null;
}
