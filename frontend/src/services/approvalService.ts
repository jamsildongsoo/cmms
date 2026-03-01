
import api from '@/utils/api'; import { useAuthStore } from "@/features/auth/useAuthStore";


// Approval Status Enum
export type ApprovalStatus = 'T' | 'A' | 'C' | 'R'; // T:임시, A:상신(진행), C:결재완료, R:반려

// Approval Step Decision Enum
export type DecisionType = '00' | '01' | '02' | '03' | '04';
// 00: 기안, 01:결재, 02:합의, 03:통보, 04:반려

// Approval Step Result Enum
export type ResultType = '00' | 'Y' | 'N';
// 00: 미결, Y:승인, N:반려

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

    // For UI convenience
    approver_name?: string;
    approver_position?: string;
    approver_dept?: string;
}

export const approvalService = {
    // Save Approval (Branching T vs A)
    save: async (data: Partial<Approval>, steps: Partial<ApprovalStep>[], status: 'T' | 'A'): Promise<Approval> => {
        const companyId = useAuthStore.getState().user?.companyId;
        if (!companyId) throw new Error("User not authenticated");

        const request = {
            approval: { ...data, companyId: companyId },
            steps: steps.map(s => ({ ...s, companyId: companyId })),
            status: status
        };
        const response = await api.post('/api/approval', request);
        return response.data;
    },

    // Process Decision (Approve/Reject)
    processDecision: async (approvalId: string, decision: 'APPROVE' | 'REJECT', comment: string): Promise<void> => {
        const user = useAuthStore.getState().user;
        if (!user || !user.companyId || !user.personId) throw new Error("User not authenticated");

        const request = {
            companyId: user.companyId,
            approvalId: approvalId,
            personId: user.personId,
            decision: decision,
            comment: comment
        };
        await api.post('/api/approval/decision', request);
    },

    // Get List (Inbox/Outbox)
    getList: async (userId: string, type: 'inbox-pending' | 'inbox-completed' | 'inbox-reference' | 'outbox'): Promise<Approval[]> => {
        const storeCompanyId = useAuthStore.getState().user?.companyId;
        if (!storeCompanyId) throw new Error("User not authenticated");

        let endpoint = '';
        if (type === 'outbox') {
            endpoint = `/api/approval/outbox?companyId=${storeCompanyId}&personId=${userId}`;
        } else {
            const apiType = type.replace('inbox-', ''); // 'pending', 'completed', 'reference'
            endpoint = `/api/approval/inbox?companyId=${storeCompanyId}&personId=${userId}&type=${apiType}`;
        }

        const response = await api.get(endpoint);
        return response.data;
    },

    // Get Detail
    getById: async (id: string): Promise<Approval | undefined> => {
        const companyId = useAuthStore.getState().user?.companyId;
        if (!companyId) throw new Error("User not authenticated");
        try {
            const response = await api.get(`/api/approval/${id}?companyId=${companyId}`);
            const approval = response.data;

            // Fetch steps separately
            const stepsRes = await api.get(`/api/approval/${id}/steps?companyId=${companyId}`);
            approval.approval_steps = stepsRes.data;

            return approval;
        } catch (e) {
            return undefined;
        }
    }
};
