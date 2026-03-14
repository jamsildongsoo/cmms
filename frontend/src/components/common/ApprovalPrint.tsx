import React from 'react';
import DOMPurify from 'dompurify';
import { type Approval } from '@/services/approvalService';
import { type AttachedFileInfo } from '@/components/common/FileAttachmentList';

interface ApprovalPrintProps {
    approval: Approval;
    companyName?: string;
    files?: AttachedFileInfo[];
}

/** 날짜 문자열을 yyyy-MM-dd HH:mm 형식으로 잘라냄 */
const formatDateTime = (dt?: string) => {
    if (!dt) return '';
    // Replace 'T' with space and normalize: "2026-03-04T14:30:22" -> "2026-03-04 14:30"
    const normalized = dt.replace('T', ' ');
    return normalized.length >= 16 ? normalized.substring(0, 16) : normalized;
};

export const ApprovalPrint: React.FC<ApprovalPrintProps> = ({
    approval, companyName, files
}) => {
    const printDate = new Date().toLocaleDateString();

    // Approval steps excluding references ('03'), drafter (lineNo=0, decision='00') is included as first box
    const boxes: any[] = (approval.approval_steps || [])
        .filter(s => s.decision !== '03')
        .slice(0, 4);
    while (boxes.length < 4) {
        boxes.push({});
    }

    const getStatusText = (step: any, index: number) => {
        if (!step.personId) return "";
        if (step.decision === '00') return "[기안]";
        if (step.result === 'N') return "[반려]";
        if (step.result === 'Y') {
            const lastIdx = boxes.filter((b: any) => b.personId).length - 1;
            if (index === lastIdx) return "[완결]";
            return "[결재]";
        }
        return "";
    };

    return (
        <div className="print-container p-0 text-black bg-white w-full hidden print:block overflow-visible h-auto leading-normal">
            <style dangerouslySetInnerHTML={{
                __html: `
                @page { margin: 0; }
                body { margin: 0; padding: 0; }
                table { page-break-inside: auto; }
                tr { page-break-inside: avoid; page-break-after: auto; }
                .rich-text-content table { border-collapse: collapse; width: 100% !important; }
                .rich-text-content th, .rich-text-content td { border: 1px solid black; padding: 4px; }
            `}} />
            <div className="p-[15mm] max-w-[800px] mx-auto font-sans">
                <div className="flex justify-between text-[10px] text-slate-400 border-b border-slate-100 pb-1 mb-4">
                    <div>소속: {companyName || '-'}</div>
                    <div>출력일자: {printDate}</div>
                </div>

                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold border-b-2 border-black pb-1 inline-block px-4">
                        결재 문서 출력
                    </h1>
                </div>

                {/* Header Information & Approval Boxes */}
                <div className="flex justify-between items-start mb-6 w-full">
                    {/* Left: Basic Info */}
                    <div className="space-y-1 text-sm pt-2 flex-1">
                        <div className="flex"><span className="font-bold w-20">문서번호:</span><span>{approval.approvalId}</span></div>
                        <div className="flex"><span className="font-bold w-20">제 목:</span><span>{approval.title}</span></div>
                        <div className="flex"><span className="font-bold w-20">기안자:</span><span>{approval.requester_name || approval.requesterId}</span></div>
                        <div className="flex"><span className="font-bold w-20">기안일시:</span><span>{formatDateTime(approval.createdAt)}</span></div>
                    </div>

                    {/* Right: Approval Boxes + 참조자 */}
                    <div className="flex flex-col items-end">
                        <div className="flex border-t border-l border-black">
                            {boxes.map((step, idx) => (
                                <div key={idx} className="w-20 border-r border-b border-black text-center min-h-[90px] flex flex-col">
                                    {/* First Row: Title (직책) */}
                                    <div className="h-6 bg-slate-50 border-b border-black text-[10px] flex items-center justify-center font-bold">
                                        {step.personId ? (step.title || step.position || step.approver_position || '-') : ""}
                                    </div>
                                    {/* Second Row: Name / [Status] / Date */}
                                    <div className="flex-1 flex flex-col justify-center p-1 leading-tight">
                                        {step.personId ? (
                                            <>
                                                <div className="text-[10px] font-bold">
                                                    {(step.personName || step.approver_name || step.personId)}
                                                </div>
                                                <div className="text-[9px] mt-0.5 font-medium text-blue-700">
                                                    {getStatusText(step, idx)}
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
                        {/* 참조자: 결재 박스 하단 왼쪽 정렬 */}
                        {(approval.approval_steps || []).some(s => s.decision === '03') && (
                            <div className="w-full text-left text-[10px] mt-1">
                                <span className="font-bold">참조: </span>
                                {(approval.approval_steps || [])
                                    .filter(s => s.decision === '03')
                                    .map(s => {
                                        const t = s.title || s.approver_position || '';
                                        const name = s.personName || s.approver_name || s.personId;
                                        return t ? `${t} ${name}` : name;
                                    })
                                    .join(', ')}
                            </div>
                        )}
                    </div>
                </div>

                <Separator className="my-6 bg-black h-[1px]" />

                <div className="mb-6">
                    <div className="font-bold mb-2 text-sm">상세 내용:</div>
                    <div
                        className="border border-black p-4 min-h-[400px] text-sm whitespace-normal rich-text-content"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(approval.content) }}
                    />
                </div>

                {/* 첨부파일 목록 */}
                {files && files.length > 0 && (
                    <div className="mb-4">
                        <div className="font-bold mb-2 text-sm">첨부파일:</div>
                        <div className="border border-black p-3">
                            <ul className="list-disc list-inside text-sm space-y-1">
                                {files.map((file, idx) => (
                                    <li key={idx}>{file.name}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

const Separator = ({ className }: { className?: string }) => (
    <div className={`h-px w-full bg-slate-200 ${className}`} />
);
