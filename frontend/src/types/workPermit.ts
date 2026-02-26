
export type WPQuestionType = 'checkbox' | 'input';

export interface WPQuestion {
    id: string;
    label: string;
    type: WPQuestionType;
    placeholder?: string;
    className?: string; // For layout control (e.g., col-span-2)
}

export interface WPCategoryTemplate {
    id: string;
    title: string;
    icon?: string;
    questions: WPQuestion[];
    colorClass?: string;
}

export interface WorkPermit {
    permit_id: string;
    wp_types: string[]; // HOT, CONF, ELEC, etc. (Multi-select)
    name: string;
    date: string; // Application Date
    // ... rest of the existing interface
    start_dt: string;
    end_dt: string;
    person_name: string;
    status: 'T' | 'A' | 'C'; // Temp, Approved, Completed(Closed)

    // Dynamic Form Data (JSON)
    checksheet_json_com?: Record<string, any>; // Common (Mandatory)
    checksheet_json_hot?: Record<string, any>;
    checksheet_json_conf?: Record<string, any>;
    checksheet_json_elec?: Record<string, any>;
    checksheet_json_high?: Record<string, any>;
    checksheet_json_dig?: Record<string, any>;

    location?: string;

    // Risk Assessment
    work_summary?: string;
    hazard_factor?: string;
    safety_factor?: string;

    // Additional Fields for UI Spec
    equipment_id?: string;
    equipment_name?: string;
    dept_id?: string;
    person_id?: string;

    order_id?: string;
    stage?: 'PLN' | 'ACT'; // Plan / Actual
    parent_permit_id?: string;
    approval_id?: string;

}
