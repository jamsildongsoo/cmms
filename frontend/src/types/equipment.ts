
export interface Equipment {
    company_id?: string;
    plant_id?: string;
    equipment_id: string; // PK, previously 'code' or 'id'
    name: string;
    code_item?: string; // Equipment Type
    install_location?: string;
    status?: 'T' | 'A' | 'C' | 'R' | string; // T:임시, A:결재중, C:확정, R:반려
    dept_id?: string;
    maker_name?: string;
    model?: string;
    spec?: string;
    serial?: string;
    install_date?: string;
    purchase_cost?: number; // NUMERIC(18,2)
    residual_value?: number; // NUMERIC(18,2)
    depre_method?: string;
    depre_period?: number;
    inspection_yn?: 'Y' | 'N';
    inspection_interval?: number;
    inspection_unit?: string;
    psm_yn?: 'Y' | 'N';
    workpermit_yn?: 'Y' | 'N';
    last_inspection?: string;
    next_inspection?: string;
    note?: string;
    file_group_id?: string;

    // Additional fields for frontend convenience or future use
    created_at?: string;
    updated_at?: string;
}

export const EQUIPMENT_TYPES = [
    "Pump", "Motor", "Valve", "Tank", "Sensor", "Conveyor"
];

export const LOCATIONS = [
    "Line A", "Line B", "Warehouse", "Utility Room"
];
