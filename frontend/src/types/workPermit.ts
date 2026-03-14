
export type WPQuestionType = 'checkbox' | 'input';

export interface WPQuestion {
    id: string;
    label: string;
    type: WPQuestionType;
    placeholder?: string;
    className?: string;
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
    wpTypes: string[]; // HOT, CONF, ELEC, DIG, HIGH, HEAVY (GEN is always implied)
    name: string;
    date: string;
    startDt: string;
    endDt: string;
    personName: string;
    status: 'T' | 'A' | 'C' | 'R';

    // Dynamic Form Data (JSON) — camelCase keys matching backend entity
    checksheetJsonCom?: Record<string, any>;   // GEN (일반작업, 별지 제7호)
    checksheetJsonHot?: Record<string, any>;   // HOT (화기작업, 별지 제1호)
    checksheetJsonConf?: Record<string, any>;  // CONF (밀폐공간, 별지 제2호)
    checksheetJsonElec?: Record<string, any>;  // ELEC (정전작업, 별지 제3호)
    checksheetJsonDig?: Record<string, any>;   // DIG (굴착작업, 별지 제4호)
    checksheetJsonHigh?: Record<string, any>;  // HIGH (고소작업, 별지 제5호)
    checksheetJsonHeavy?: Record<string, any>; // HEAVY (중량물, 별지 제6호)

    location?: string;
    workSummary?: string;
    hazardFactor?: string;
    safetyFactor?: string;

    equipmentId?: string;
    equipmentName?: string;
    deptId?: string;
    personId?: string;

    orderId?: string;
    stage?: 'PLN' | 'ACT';
    parentPermitId?: string;
    approvalId?: string;
}
