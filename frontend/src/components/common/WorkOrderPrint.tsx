
import React from 'react';
import { type ApprovalStep } from '@/services/approvalService';

interface PrintItem {
    name: string;
    method?: string;
    result?: string | number;
    remark?: string;
}

interface WorkOrderPrintProps {
    stage: 'PLN' | 'ACT';
    id: string;
    name: string;
    equipment: string;
    dept: string;
    person: string;
    date: string;
    items: PrintItem[];
    note?: string;
    companyName?: string;
    approvalSteps?: ApprovalStep[];
}

export const WorkOrderPrint: React.FC<WorkOrderPrintProps> = ({
    stage, id, name, equipment, dept, person, date, items, note, companyName, approvalSteps = []
}) => {
    const title = `작업지시 ${stage === 'PLN' ? '계획' : '실적'} 보고서`;
    const printDate = new Date().toLocaleDateString();

    const isFinalized = (step: ApprovalStep) => {
        if (!step.personId) return false;
        if (step.decision === '00') return true;
        return step.result === 'Y' || step.result === 'N';
    };

    const getStatusText = (step: ApprovalStep) => {
        if (!step.personId || !isFinalized(step)) return "";
        if (step.decision === '00') return "[기안]";
        if (step.result === 'N') return "[반려]";
        if (step.result === 'Y') {
            // Filter approvers only for last step check
            const approvers = approvalSteps.filter(s => s.decision !== '03' && s.decision !== '00');
            const lastApproverPersonId = approvers.length > 0 ? approvers[approvers.length - 1].personId : null;
            if (step.personId === lastApproverPersonId) return "[완결]";
            return "[결재]";
        }
        return "";
    };

    // Prepare 4 slots for approval boxes
    // Filter out references first
    const displaySteps = approvalSteps.filter(s => s.decision !== '03').slice(0, 4);
    const boxes = [...displaySteps];
    while (boxes.length < 4) {
        boxes.push({} as ApprovalStep);
    }

    // Filter references
    const references = approvalSteps.filter(s => s.role === 'REFERER');
    const referenceNames = references.map(s => s.personName).join(', ');

    return (
        <div className="print-container p-0 text-black bg-white w-full hidden print:block overflow-visible h-auto">
            <style dangerouslySetInnerHTML={{
                __html: `
                @page { margin: 0; }
                body { margin: 0; padding: 0; }
            `}} />
            <div className="p-[15mm] max-w-[800px] mx-auto">
                <div className="flex justify-between text-[10px] text-slate-400 border-b border-slate-100 pb-1 mb-6">
                    <div>소속: {companyName || '-'}</div>
                    <div>출력일자: {printDate}</div>
                </div>

                <div className="flex justify-between mb-10 items-start">
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold border-b-2 border-black pb-1 inline-block px-4 mb-6">
                            {title}
                        </h1>
                        <div className="space-y-1.5 text-xs text-slate-700">
                            <div className="flex"><span className="font-bold w-16">지시번호:</span><span>{id}</span></div>
                            <div className="flex"><span className="font-bold w-16">작업명:</span><span>{name}</span></div>
                            <div className="flex"><span className="font-bold w-16">대상설비:</span><span>{equipment}</span></div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end">
                        <div className="flex border-t border-l border-black">
                            {boxes.slice(0, 4).map((step, idx) => (
                                <div key={idx} className="w-20 border-r border-b border-black text-center min-h-[90px] flex flex-col">
                                    {/* Row 1: Position (When finalized) */}
                                    <div className="h-6 bg-slate-50 border-b border-black text-[10px] flex items-center justify-center font-bold">
                                        {step.personId && isFinalized(step) ? (step.position || step.approver_position) : ""}
                                    </div>
                                    {/* Row 2: Name/Status & Date */}
                                    <div className="flex-1 flex flex-col justify-center p-1 leading-tight">
                                        {step.personId && isFinalized(step) ? (
                                            <>
                                                <div className="text-[10px] font-bold">
                                                    {(step.personName || step.approver_name)} {getStatusText(step)}
                                                </div>
                                                <div className="text-[8px] mt-1 text-slate-500">
                                                    {step.decidedAt ? new Date(step.decidedAt).toLocaleDateString() : ""}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="h-full"></div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Always show Reference label - Aligned to left of the boxes grid */}
                        <div className="text-[10px] mt-1 text-slate-700 w-full text-left pl-1">
                            참조 : {referenceNames}
                        </div>
                    </div>
                </div>

                <div className="mb-6 space-y-2 text-sm">
                    <div className="flex flex-wrap items-center gap-x-6 border-t border-slate-200 pt-2 mt-2">
                        <div className="flex"><span className="font-bold mr-2 text-slate-500">관리부서:</span><span>{dept}</span></div>
                        <div className="flex"><span className="font-bold mr-2 text-slate-500">담당자:</span><span>{person}</span></div>
                        <div className="flex"><span className="font-bold mr-2 text-slate-500 text-xs">작업일자:</span><span>{date}</span></div>
                    </div>
                </div>

                {note && (
                    <div className="mb-8 break-inside-avoid">
                        <div className="font-bold mb-1 text-sm border-l-4 border-slate-400 pl-2">종합 소견 / 요청 내용:</div>
                        <div className="border border-slate-300 p-3 min-h-[60px] text-xs whitespace-pre-wrap bg-slate-50/30">
                            {note}
                        </div>
                    </div>
                )}

                <div className="mb-10">
                    <div className="font-bold mb-1 text-sm border-l-4 border-slate-400 pl-2">상세 작업 내역:</div>
                    <table className="w-full border-collapse border border-black text-[11px]">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="border border-black p-2 w-10 text-center">No.</th>
                                <th className="border border-black p-2 text-center">작업 항목</th>
                                <th className="border border-black p-2 text-center">작업 방법</th>
                                <th className="border border-black p-2 w-28 text-center">조치 결과</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length > 0 ? items.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="border border-black p-2 text-center font-mono">{idx + 1}</td>
                                    <td className="border border-black p-2 font-medium">{item.name}</td>
                                    <td className="border border-black p-2 text-slate-600">{item.method || '-'}</td>
                                    <td className="border border-black p-2 text-center font-bold text-slate-800">{item.result || '-'}</td>
                                </tr>
                            )) : <tr><td colSpan={4} className="border border-black p-8 text-center text-slate-400">내역 없음</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
