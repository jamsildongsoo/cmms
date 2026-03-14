
import api from '@/utils/api';

// Approval Status Enum
export type ApprovalStatus = 'T' | 'A' | 'C' | 'R'; // T:임시, A:상신(진행), C:결재완료, R:반려

// Approval Step Decision Enum
export type DecisionType = '00' | '01' | '02' | '03' | '04';
// 00: 기안, 01:결재, 02:합의, 03:통보, 04:반려

// Approval Step Result Enum
export type ResultType = 'P' | 'Y' | 'N';
// P: 미결(Pending), Y:승인, N:반려

export interface Approval {
    companyId: string;
    approvalId: string;
    title: string;
    content: string;
    requesterId: string;
    currentStep: number;
    fileGroupId?: string;
    delete_mark: 'Y' | 'N';
    status: ApprovalStatus;
    refEntity?: string;
    refId?: string;
    createdAt?: string;
    createdBy?: string;
    updatedAt?: string;
    updatedBy?: string;

    // For UI convenience
    requester_name?: string;
    approval_steps?: ApprovalStep[];
}

export interface ApprovalStep {
    companyId: string;
    approvalId?: string;
    lineNo: number;
    personId: string;
    decision: DecisionType | string;
    result: ResultType | string;
    decidedAt?: string;
    comment?: string;

    personName?: string;
    position?: string;
    title?: string;
    role?: string;
    // For UI convenience
    approver_name?: string;
    approver_position?: string;
    approver_dept?: string;
}

export const approvalService = {
    // Save Approval (Branching T vs A)
    save: async (data: Partial<Approval>, steps: Partial<ApprovalStep>[], status: 'T' | 'A'): Promise<Approval> => {
        const request = {
            approval: data,
            steps: steps,
            status: status
        };
        const response = await api.post('/api/approval', request);
        return response.data;
    },

    // Process Decision (Approve/Reject)
    processDecision: async (approvalId: string, decision: 'APPROVE' | 'REJECT', comment: string): Promise<void> => {
        const request = {
            approvalId: approvalId,
            decision: decision,
            comment: comment
        };
        await api.post('/api/approval/decision', request);
    },

    // Get List (Inbox/Outbox)
    getList: async (_userId: string, type: 'inbox-pending' | 'inbox-completed' | 'inbox-reference' | 'outbox'): Promise<Approval[]> => {
        let endpoint = '';
        if (type === 'outbox') {
            endpoint = '/api/approval/outbox';
        } else {
            const apiType = type.replace('inbox-', '');
            endpoint = `/api/approval/inbox?type=${apiType}`;
        }

        const response = await api.get(endpoint);
        return response.data;
    },

    // Get Detail
    getById: async (id: string): Promise<Approval | undefined> => {
        try {
            const response = await api.get(`/api/approval/${id}`);
            const approval = response.data;

            // Fetch steps separately
            const stepsRes = await api.get(`/api/approval/${id}/steps`);
            approval.approval_steps = stepsRes.data;

            return approval;
        } catch (e) {
            return undefined;
        }
    }
};
