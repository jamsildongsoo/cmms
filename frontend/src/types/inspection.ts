
export interface InspectionItem {
    lineNo: number; // Renamed from seq to match backend
    name: string; // Used to be check_item
    method: string;
    stdVal?: number; // Used to be criteria
    unit?: string;
    resultVal?: number; // Used to be result_value
}

export interface Inspection {
    inspectionId: string;
    name: string;
    note?: string;
    codeItem: string; // e.g. 'Regular', 'Spot'
    stage: 'PLN' | 'ACT'; // Plan | Action
    status: 'T' | 'S' | 'P' | 'C' | 'A' | 'R'; // Temp(Draft) | Scheduled(Confirmed) | Progress | Complete | Approval | Rejected
    date: string; // plan_date -> date (Backend sync)
    actualDate?: string;

    // References
    refEntity?: string; // e.g. 'IN', 'WO'
    refId?: string;     // ID of the referenced entity
    approvalId?: string;

    equipmentId?: string;
    equipmentName?: string;
    deptId?: string;
    deptName?: string;
    personId?: string;
    personName?: string;

    // Items
    items: InspectionItem[];
}
