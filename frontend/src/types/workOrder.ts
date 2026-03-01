
export interface WorkOrder {
    orderId: string;
    name: string;
    equipmentId?: string;
    equipmentName: string;
    date: string; // Request Date
    status?: 'REQ' | 'T' | 'A' | 'C'; // Requested, Temp, Assigned, Completed
    stage?: 'PLN' | 'ACT';
    refEntity?: string; // WO, IN
    refId?: string;
    cost?: number;
    note?: string; // description -> note
    priority?: string; // High, Medium, Low
    dueDate?: string;

    // Backend mapped fields
    codeItem?: string; // type -> codeItem
    deptId?: string; // Department
    deptName?: string;
    personId?: string; // Manager/Person in charge
    personName?: string;
    time?: number; // Estimated Man-Day

    // Result fields
    startDt?: string;
    endDt?: string;
    workerName?: string;
    actionDesc?: string;
    laborCost?: number;
    materialCost?: number;

    items?: any[]; // Allow any for now to avoid strict type issues with flexible item structure, or define interface
}

export interface WorkOrderItem {
    lineNo: number;
    name: string; // Task Name
    method: string;
    result?: string;
}
