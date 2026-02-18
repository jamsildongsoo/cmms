
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
    description?: string;
    priority?: string; // High, Medium, Low
    due_date?: string;

    // New fields for UI Specs
    type?: string; // Work Type (e.g., 'Regular', 'Breakdown')
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
}
