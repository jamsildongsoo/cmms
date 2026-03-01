
export interface Equipment {
    companyId?: string;
    plantId?: string;
    equipmentId: string; // PK, previously 'code' or 'id'
    name: string;
    codeItem?: string; // Equipment Type
    installLocation?: string;
    status?: 'T' | 'A' | 'C' | 'R' | string; // T:임시, A:결재중, C:확정, R:반려
    deptId?: string;
    makerName?: string;
    model?: string;
    spec?: string;
    serial?: string;
    installDate?: string;
    purchaseCost?: number; // NUMERIC(18,2)
    residualValue?: number; // NUMERIC(18,2)
    depreMethod?: string;
    deprePeriod?: number;
    inspectionYn?: 'Y' | 'N';
    inspectionInterval?: number;
    inspectionUnit?: string;
    psmYn?: 'Y' | 'N';
    workpermitYn?: 'Y' | 'N';
    lastInspection?: string;
    nextInspection?: string;
    note?: string;
    fileGroupId?: string;

    // Additional fields for frontend convenience or future use
    createdAt?: string;
    updatedAt?: string;
}

export const EQUIPMENT_TYPES = [
    "Pump", "Motor", "Valve", "Tank", "Sensor", "Conveyor"
];

export const LOCATIONS = [
    "Line A", "Line B", "Warehouse", "Utility Room"
];
