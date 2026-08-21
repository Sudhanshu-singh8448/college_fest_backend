export declare class WorkflowStageDto {
    name: string;
    orderIndex: number;
    approverRole: string;
}
export declare class CreateWorkflowDto {
    name: string;
    stages: WorkflowStageDto[];
}
