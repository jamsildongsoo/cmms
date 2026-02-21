
export interface InspectionItem {
    seq: number;
    check_item: string;
    method: string;
    criteria: string;
    unit?: string;
    result_value?: number;
    result?: 'OK' | 'NG' | 'NA';
    remarks?: string;
}

export interface Inspection {
    inspection_id: string;
    name: string;
    note?: string;
    code_item: string; // e.g. 'Regular', 'Spot'
    stage: 'PLN' | 'ACT'; // Plan | Action
    status: 'T' | 'S' | 'P' | 'C'; // Temp(Draft) | Scheduled(Confirmed) | Progress | Complete
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
