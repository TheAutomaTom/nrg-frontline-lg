import type { WorkOrderDto } from "../../Core/Models/nrg-dtos/WorkOrderDto";
import type { LaborItemDto } from "../../Core/Models/nrg-dtos/LaborItemDto";
import type { MesLaborGridResponseDto } from "../../Core/Models/nrg-dtos/MesLaborGrid";
// import type { DateManagementByMonthDto } from "../../Core/Models/nrg-dtos/DateManagementByMonth";
import type { WorkflowsDto } from "../../Core/Models/nrg-dtos/WorkflowDto";
import type { OperationDtos } from "@/Core/Models/nrg-dtos/Operation/OperationDto";
import type { LaborKanbanGridItemsDto } from "@/Core/Models/nrg-dtos/ProdGantt/Ticket";

export interface INrgClient {
  GetWorkOrders(
    user: string,
    pw: string,
    timezone: number,
  ): Promise<WorkOrderDto[]>;
  GetLaborItems(): Promise<LaborItemDto[]>;
  GetLaborKanbanGridItems(): Promise<LaborKanbanGridItemsDto>;
  GetLaborKanbanGridItemsByProjectNumber(
    projectNumber: string,
  ): Promise<LaborKanbanGridItemsDto>;
  // GetDateManagementByMonth(year: number, month: number): Promise<DateManagementByMonthDto>;
  GetWorkflows(): Promise<WorkflowsDto>;
  GetOperations(): Promise<OperationDtos>;
}
