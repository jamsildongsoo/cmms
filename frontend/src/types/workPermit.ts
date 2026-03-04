
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
    permitId: string;
    wpTypes: string[]; // HOT, CONF, ELEC, etc. (Multi-select)
    name: string;
    date: string; // Application Date
    // ... rest of the existing interface
    startDt: string;
    endDt: string;
    personName: string;
    status: 'T' | 'A' | 'C' | 'R'; // Temp, Approved, Completed(Closed), Rejected

    // Dynamic Form Data (JSON)
    checksheetJsonCom?: Record<string, any>; // Common (Mandatory)
    checksheetJsonHot?: Record<string, any>;
    checksheetJsonConf?: Record<string, any>;
    checksheetJsonElec?: Record<string, any>;
    checksheetJsonHigh?: Record<string, any>;
    checksheetJsonDig?: Record<string, any>;

    location?: string;

    // Risk Assessment
    workSummary?: string;
    hazardFactor?: string;
    safetyFactor?: string;

    // Additional Fields for UI Spec
    equipmentId?: string;
    equipmentName?: string;
    deptId?: string;
    personId?: string;

    orderId?: string;
    stage?: 'PLN' | 'ACT'; // Plan / Actual
    parentPermitId?: string;
    approvalId?: string;

}
