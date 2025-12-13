export interface OperationDtos {
  Items?: OperationDto[] | null;
}

export interface OperationDto {
  Name?: string | null;
  SequenceId?: string | null;
  BaseUoM?: string | null;
  OperationCategory?: string | null;
  Description?: string | null;
  LaborCurves?: LaborCurveDto[] | null;
  WorkOrderType?: string | null;
}

export interface LaborCurveDto {
  FacilityName?: string | null;
  LaborItem?: string | null;
  TimeUnit?: string | null;
  Enabled: boolean;
  LineType?: string | null;
  Equation?: number[] | null;
  DataPoints?: DataPointsDto[] | null;
}

export interface DataPointsDto {
  Duration: number;
  Quantity: number;
}
