
import axios from 'axios';
import { standardService, type Person } from './standardService';

// Approval Status Enum
export type ApprovalStatus = 'T' | 'A' | 'C' | 'R'; // T:임시, A:결재중, C:확정, R:반려

// Approval Step Decision Enum
export type DecisionType = '00' | '01' | '02' | '03' | '04';
// 00: 기안, 01:결재, 02:합의, 03:통보, 04:반려

// Approval Step Result Enum
export type ResultType = '00' | '01' | '02' | '03' | '04';
// 00: 미결, 01:결재승인, 02:합의승인, 03:통보승인, 04:반려

export interface Approval {
    company_id: string;
    approval_id: string;
    title: string;
    content: string;
    requester_id: string;
    current_step: number;
    file_group_id?: string;
    delete_mark: 'Y' | 'N';
    status: ApprovalStatus;
    ref_entity?: string;
    ref_id?: string;
    created_at?: string;
    created_by?: string;
    updated_at?: string;
    updated_by?: string;

    // For UI convenience
    requester_name?: string;
    approval_steps?: ApprovalStep[];
}

export interface ApprovalStep {
    company_id: string;
    approval_id?: string;
    line_no: number;
    person_id: string;
    decision: DecisionType;
    result: ResultType;
    decided_at?: string;
    comment?: string;

    // For UI convenience
    approver_name?: string;
    approver_position?: string;
    approver_dept?: string;
}

export const approvalService = {
    // Create Approval
    create: async (data: Partial<Approval>, steps: Partial<ApprovalStep>[]): Promise<Approval> => {
        const request = {
            approval: data,
            steps: steps
        };
        const response = await axios.post('/api/approval', request);
        return response.data;
    },

    // Get List (Inbox/Outbox)
    getList: async (companyId: string, userId: string, type: 'inbox' | 'outbox'): Promise<Approval[]> => {
        const endpoint = type === 'inbox' ? '/api/approval/inbox' : '/api/approval/outbox';
        const response = await axios.get(`${endpoint}?companyId=${companyId}&personId=${userId}`);
        return response.data;
    },

    // Get Detail
    getById: async (id: string): Promise<Approval | undefined> => {
        // Defaulting companyId to COM-001 as per current partial implementation context
        const companyId = 'COM-001';
        try {
            const response = await axios.get(`/api/approval/${id}?companyId=${companyId}`);
            return response.data;
        } catch (e) {
            return undefined;
        }
    }
};
