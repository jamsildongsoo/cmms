
export interface InspectionItem {
    seq: number;
    name: string; // Used to be check_item
    method: string;
    std_val?: number; // Used to be criteria
    unit?: string;
    result_val?: number; // Used to be result_value
}

export interface Inspection {
    inspection_id: string;
    name: string;
    note?: string;
    code_item: string; // e.g. 'Regular', 'Spot'
    stage: 'PLN' | 'ACT'; // Plan | Action
    status: 'T' | 'S' | 'P' | 'C' | 'A'; // Temp(Draft) | Scheduled(Confirmed) | Progress | Complete | Approval
    date: string; // plan_date -> date (Backend sync)
    actual_date?: string;

    // References
    ref_entity?: string; // e.g. 'IN', 'WO'
    ref_id?: string;     // ID of the referenced entity

    equipment_id?: string;
    equipment_name?: string;
    dept_id?: string;
    dept_name?: string;
    person_id?: string;
    person_name?: string;

    // Items
    items: InspectionItem[];
}
