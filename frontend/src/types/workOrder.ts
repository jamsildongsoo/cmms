
export interface WorkOrder {
    order_id: string;
    name: string;
    equipment_id?: string;
    equipment_name: string;
    date: string; // Request Date
    status?: 'REQ' | 'T' | 'A' | 'C'; // Requested, Temp, Assigned, Completed
    stage?: 'PLN' | 'ACT';
    ref_entity?: string; // WO, IN
    ref_id?: string;
    cost?: number;
    note?: string; // description -> note
    priority?: string; // High, Medium, Low
    due_date?: string;

    // Backend mapped fields
    code_item?: string; // type -> code_item
    dept_id?: string; // Department
    person_id?: string; // Manager/Person in charge
    time?: number; // Estimated Man-Day

    // Result fields
    start_dt?: string;
    end_dt?: string;
    worker_name?: string;
    action_desc?: string;
    labor_cost?: number;
    material_cost?: number;

    items?: any[]; // Allow any for now to avoid strict type issues with flexible item structure, or define interface
}

export interface WorkOrderItem {
    line_no: number;
    name: string; // Task Name
    method: string;
    result?: string;
}
