
// 1. 공통 상태 (Common Status)
export const STATUS = {
    TEMPORARY: 'T',
    APPROVAL: 'A',
    CONFIRMED: 'C',
    REJECTED: 'R',
    CANCELED: 'X',
} as const;

export type StatusType = typeof STATUS[keyof typeof STATUS];

export const STATUS_INFO: Record<StatusType, { label: string, variant: "default" | "secondary" | "destructive" | "outline" }> = {
    [STATUS.TEMPORARY]: { label: '임시', variant: 'secondary' },
    [STATUS.APPROVAL]: { label: '결재중', variant: 'outline' },
    [STATUS.CONFIRMED]: { label: '완료', variant: 'default' },
    [STATUS.REJECTED]: { label: '반려', variant: 'destructive' },
    [STATUS.CANCELED]: { label: '취소', variant: 'secondary' },
};

// 2. 결재 유형 (Decision Type)
export const DECISION_TYPE = {
    DRAFT: '00',
    APPROVAL: '01',
    AGREEMENT: '02',
    NOTICE: '03',
} as const;

export type DecisionType = typeof DECISION_TYPE[keyof typeof DECISION_TYPE];

export const DECISION_TYPE_MAP: Record<DecisionType, string> = {
    [DECISION_TYPE.DRAFT]: '기안',
    [DECISION_TYPE.APPROVAL]: '결재',
    [DECISION_TYPE.AGREEMENT]: '합의',
    [DECISION_TYPE.NOTICE]: '참조',
};

// 3. 결재 결과 (Step Result)
export const STEP_RESULT = {
    PENDING: 'P',
    APPROVED: 'Y',
    REJECTED: 'N',
} as const;

export type StepResultType = typeof STEP_RESULT[keyof typeof STEP_RESULT];

export const STEP_RESULT_MAP: Record<StepResultType, string> = {
    [STEP_RESULT.PENDING]: '미결',
    [STEP_RESULT.APPROVED]: '승인',
    [STEP_RESULT.REJECTED]: '반려',
};
