import React from 'react';
import { type ApprovalStep } from '@/services/approvalService';

interface PrintItem {
    name: string;
    method?: string;
    result?: string | number;
    remark?: string;
}

interface InspectionPrintProps {
    stage: 'PLN' | 'ACT';
    status?: string;
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

export const InspectionPrint: React.FC<InspectionPrintProps> = ({
    stage, status, id, name, equipment, dept, person, date, items, note, companyName, approvalSteps = []
}) => {
    const title = `예방점검 ${stage === 'PLN' ? '계획' : '실적'} 보고서`;
    const printDate = new Date().toLocaleDateString();

    // Filter approvers (excluding references '03')
    const approvers = approvalSteps.filter(s => s.decision !== '03').slice(0, 4);
    // Reference names
    const referenceNames = approvalSteps
        .filter(s => s.decision === '03')
        .map(s => s.personName || s.personId)
        .join(', ');

    // Fill empty boxes if less than 4 approvers
    const totalBoxes = 4;
    const boxes = [...approvers];
    while (boxes.length < totalBoxes) {
        boxes.push({} as ApprovalStep);
    }

    const isFinalized = (step: ApprovalStep) => {
        if (!step.personId) return false;
        if (step.decision === '00') return true; // Draftsman is always finalized in the view
        return step.result === 'Y' || step.result === 'N';
    };

    const getStatusText = (step: ApprovalStep, index: number) => {
        if (!step.personId || !isFinalized(step)) return "";
        if (step.decision === '00') return "[기안]";
        if (step.result === 'N') return "[반려]";
        if (step.result === 'Y') {
            const lastIdx = boxes.filter((b: any) => b.personId).length - 1;
            if (index === lastIdx) return "[완결]";
            return "[결재]";
        }
        return "";
    };

    const formatDateTime = (dt?: string) => {
        if (!dt) return '';
        const normalized = dt.replace('T', ' ');
        return normalized.length >= 16 ? normalized.substring(0, 16) : normalized;
    };

    return (
        <div className="print-container p-0 text-black bg-white w-full hidden print:block overflow-visible h-auto leading-normal">
            <style dangerouslySetInnerHTML={{
                __html: `
                @page { margin: 0; }
                body { margin: 0; padding: 0; }
                table { page-break-inside: auto; }
                tr { page-break-inside: avoid; page-break-after: auto; }
            `}} />
            <div className="p-[10mm] max-w-[800px] mx-auto font-sans">
                <div className="flex justify-between text-[10px] text-slate-400 border-b border-slate-100 pb-1 mb-4">
                    <div>소속: {companyName || '-'}</div>
                    <div>출력일자: {printDate}</div>
                </div>

                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold border-b-2 border-black pb-1 inline-block px-4">
                        {title}
                    </h1>
                </div>

                {/* Header Information & Approval Boxes */}
                <div className="flex justify-between items-start mb-6 w-full">
                    {/* Left: Basic Info */}
                    <div className="space-y-1 text-sm pt-2 flex-1 min-w-0 mr-4">
                        <div className="flex"><span className="font-bold w-20 shrink-0">점검번호:</span><span className="truncate">{id}</span></div>
                        <div className="flex"><span className="font-bold w-20 shrink-0">점검명:</span><span className="truncate">{name}</span></div>
                        <div className="flex"><span className="font-bold w-20 shrink-0">대상설비:</span><span className="truncate">{equipment}</span></div>
                    </div>

                    {/* Right: Approval Boxes & References */}
                    <div className="flex flex-col items-end">
                        <div className="flex border-t border-l border-black">
                            {boxes.map((step, idx) => (
                                <div key={idx} className="w-20 border-r border-b border-black text-center min-h-[90px] flex flex-col">
                                    {/* First Row: Position (Only when finalized) */}
                                    <div className="h-6 bg-slate-50 border-b border-black text-[10px] flex items-center justify-center font-bold">
                                        {step.personId && (isFinalized(step) || step.decision === '00') ? (step.position || step.approver_position) : ""}
                                    </div>
                                    {/* Second Row: Name / [Status] \n Date (Only when finalized) */}
                                    <div className="flex-1 flex flex-col justify-center p-1 leading-tight">
                                        {step.personId && (isFinalized(step) || step.decision === '00') ? (
                                            <>
                                                <div className="text-[10px] font-bold">
                                                    {(step.personName || step.approver_name || step.personId)} {getStatusText(step, idx)}
                                                </div>
                                                <div className="text-[8px] mt-1 text-slate-500">
                                                    {formatDateTime(step.decidedAt)}
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

                {/* Meta Info Bar */}
                <div className="grid grid-cols-4 gap-4 border-t border-b border-black py-2 mb-6 text-xs text-center border-collapse">
                    <div className="flex justify-center gap-2"><span className="font-bold">관리부서:</span><span>{dept}</span></div>
                    <div className="flex justify-center gap-2"><span className="font-bold">담당자:</span><span>{person}</span></div>
                    <div className="flex justify-center gap-2"><span className="font-bold">점검일자:</span><span>{formatDateTime(date)}</span></div>
                    <div className="flex justify-center gap-2"><span className="font-bold">상태:</span><span className={`font-bold ${status === 'C' ? 'text-blue-700' : status === 'A' ? 'text-orange-600' : 'text-slate-500'}`}>{status === 'C' ? '완료' : status === 'A' ? '상신' : status === 'T' ? '임시저장' : status || '-'}</span></div>
                </div>

                {note && (
                    <div className="mb-6 break-inside-avoid">
                        <div className="font-bold mb-1 text-sm">종합 소견:</div>
                        <div className="border border-black p-3 min-h-[60px] text-xs whitespace-pre-wrap">
                            {note}
                        </div>
                    </div>
                )}

                <div className="mb-10">
                    <div className="font-bold mb-1 text-sm">상세 점검 내역:</div>
                    <table className="w-full border-collapse border border-black text-xs">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="border border-black p-2 w-10 text-center">No.</th>
                                <th className="border border-black p-2 text-center">점검 항목</th>
                                <th className="border border-black p-2 text-center">점검 방법/기준</th>
                                <th className="border border-black p-2 w-24 text-center">점검 결과</th>
                                <th className="border border-black p-2 text-center">비고</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length > 0 ? items.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="border border-black p-2 text-center font-mono">{idx + 1}</td>
                                    <td className="border border-black p-2 font-medium">{item.name}</td>
                                    <td className="border border-black p-2 text-slate-600">{item.method || '-'}</td>
                                    <td className="border border-black p-2 text-center font-bold">{item.result || '-'}</td>
                                    <td className="border border-black p-2 text-[10px]">{item.remark || '-'}</td>
                                </tr>
                            )) : <tr><td colSpan={5} className="border border-black p-8 text-center text-slate-400">내역 없음</td></tr>}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
};
