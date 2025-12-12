export interface ImportEngineeringSyncDataModel {
  LoggedInUserEmail: string;
  ProjectIdentifier?: string | null;
  // ProjectName?: string | null;
  EngineeringBomItems?: EngineeringBomItemModel[] | null;
  EngineeringShipmentItems?: EngineeringShipmentItemModel[] | null;
  // EngineeringNestSheets?: EngineeringNestSheetModel[] | null;
  // IsMetricSystem: boolean;
  // EngineeringSyncImportVersion?: string | null;
}

export interface EngineeringBomItemModel {
  Name?: string | null;
  UOM?: string | null;
  Quantity: number;
  EngineeringID?: string | null;
  // PanelWidth: number;
  // PanelLength: number;
  // PanelThickness: number;
  // IsFromNesting: boolean;
  Type: number;
  // SpecificDataSourceType?: string | null;
}

export interface EngineeringShipmentItemModel {
  Quantity: number;
  // UOM?: string | null;
  Location?: string | null;
  Name?: string | null;
  Description?: string | null;
  InternalEngineeringId?: string | null;
  PublicEngineeringId?: string | null;
  ShopDrawing?: string | null;
  // DX: number;
  // DY: number;
  // DZ: number;
  EngineeringName?: string | null;
  DraftingPrice: number;
  FabricationPrice: number;
  InstallationPrice: number;
  // Parts?: EngineeringPartApiModel[] | null;
  Type: EngineeringSyncProductProcessingType;
  // Subassemblies?: EngineeringSubassemblyApiModel[] | null;
  // NonNestedParts?: EngineeringNonNestedPartApiModel[] | null;
  // RegressionType?: EngineeringRegressionTypeApiModel | null;
}

// export interface EngineeringPartApiModel {
//   EngineeringPartId: string;
//   ShipmentItemId: string;
//   Name: string;
//   Width: number;
//   Length: number;
//   Thickness: number;
//   EngineeringMaterialId: string;
//   EngineeringMaterialName: string;
//   NestSheetId: string;
//   Description: string;
//   RotationAngleOnSheet: number;
//   StartPointOnSheet: {
//     Order: number;
//     X: number;
//     Y: number;
//   };
//   OriginalShapePositions?: Array<{
//     Position: {
//       Points: Array<{
//         Order: number;
//         X: number;
//         Y: number;
//       }>;
//     };
//     Figure: number;
//     Dimensions: number;
//   }>;
//   IsShaped: boolean;
//   EngineeringIndex: string;
//   BarcodeData: string;
//   SubassemblyId: string;
// }

// export interface EngineeringSubassemblyApiModel {
//   Id?: string | null;
//   WidthInches: number;
//   HeightInches: number;
//   DepthInches: number;
// }

// export interface EngineeringNonNestedPartApiModel {
//   NonNestedPartId: string;
//   InternalEngineeringId?: string | null;
//   Name?: string | null;
//   Description?: string | null;
//   Comments?: string[] | null;
//   WidthImperial: number;
//   LengthImperial: number;
//   ThickImperial: number;
//   EngineeringMaterialName?: string | null;
//   EngineeringIndex?: string | null;
//   BarcodeData?: string | null;
// }

// export interface EngineeringRegressionTypeApiModel {
//   Group?: string | null;
//   Value?: string | null;
// }

// export interface EngineeringNestSheetModel {
//   NestSheetId?: string | null;
//   Width: number;
//   Length: number;
//   Thickness: number;
//   MaterialHasGrain: boolean;
//   EngineeringMaterialName?: string | null;
//   FaceUpDescription?: string | null;
//   FaceDownDescription?: string | null;
//   ProcessingStation?: string | null;
//   PrimaryCodeFileName?: string | null;
//   SecondaryCodeFileName?: string | null;
// }

export enum EngineeringSyncProductProcessingType {
  Type1 = 1, // Assume "Material"
  Type2 = 2, // Assume "Labor"
}

export interface ResultTypeExceptionDetails {
  Messages?: string[] | null;
  CorrelationId: string;
  OutcomeType: ResultType;
}

export enum ResultType {
  Success = "Success",
  Failure = "Failure",
  ForbiddenError = "ForbiddenError",
  AuthenticationError = "AuthenticationError",
  InvalidLoginWarning = "InvalidLoginWarning",
  CaptchaWarning = "CaptchaWarning",
  TwoFactorRequired = "TwoFactorRequired",
}
