
import React from 'react';
import type { WorkPermit } from '@/types/workPermit';
import { WP_TEMPLATES } from '@/constants/wpTemplates';
import { type ApprovalStep } from '@/services/approvalService';

interface WorkPermitPrintProps {
    permit: WorkPermit;
    companyName?: string;
    approvalSteps?: ApprovalStep[];
}

const PrintHeader = ({ companyName, printDate }: { companyName?: string, printDate: string }) => (
    <div className="flex justify-between text-[10px] text-slate-400 border-b border-slate-100 pb-1 mb-6">
        <div>소속: {companyName || '-'}</div>
        <div>출력일자: {printDate}</div>
    </div>
);

const PageBreak = () => <div className="print:break-before-page h-0 w-0" />;

export const WorkPermitPrint: React.FC<WorkPermitPrintProps> = ({ permit, companyName, approvalSteps = [] }) => {
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
            const approvers = approvalSteps.filter(s => s.decision !== '03' && s.decision !== '00');
            const lastApproverPersonId = approvers.length > 0 ? approvers[approvers.length - 1].personId : null;
            if (step.personId === lastApproverPersonId) return "[완결]";
            return "[결재]";
        }
        return "";
    };

    // Prepare 4 slots for approval boxes
    const displaySteps = approvalSteps.filter(s => s.decision !== '03').slice(0, 4);
    const boxes = [...displaySteps];
    while (boxes.length < 4) {
        boxes.push({} as ApprovalStep);
    }

    // Filter references
    const references = approvalSteps.filter(s => s.role === 'REFERER');
    const referenceNames = references.map(s => s.personName).join(', ');

    const renderChecksheet = (templateKey: string, data: Record<string, any> | undefined) => {
        const template = WP_TEMPLATES[templateKey];
        if (!template) return null;

        return (
            <div className="mt-4">
                <table className="w-full border-collapse border border-black text-xs">
                    <thead>
                        <tr className="bg-slate-50">
                            <th className="border border-black p-2 w-12 text-center">확인</th>
                            <th className="border border-black p-2 text-left">안전 점검 항목 ({template.title})</th>
                        </tr>
                    </thead>
                    <tbody>
                        {template.questions.map((q) => (
                            <tr key={q.id}>
                                <td className="border border-black p-2 text-center font-bold">
                                    {q.type === 'checkbox' ? (data?.[q.id] ? 'V' : '') : (data?.[q.id] || '')}
                                </td>
                                <td className="border border-black p-2 text-left">{q.label}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="print-container p-0 text-black bg-white w-full hidden print:block overflow-visible h-auto">
            <style dangerouslySetInnerHTML={{
                __html: `
                @page { margin: 0; }
                body { margin: 0; padding: 0; }
            `}} />

            {/* Page 1: Common Work Permit (공통작업허가) */}
            <div className="p-[15mm] max-w-[800px] mx-auto min-h-screen flex flex-col">
                <PrintHeader companyName={companyName} printDate={printDate} />

                <div className="flex justify-between mb-10 items-start">
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold border-b-2 border-black pb-1 inline-block px-4 mb-6">
                            안전 작업 허가서 (공통)
                        </h1>
                        <div className="space-y-1.5 text-xs text-slate-700">
                            <div className="flex"><span className="font-bold w-16">허가번호:</span><span>{permit.permitId}</span></div>
                            <div className="flex"><span className="font-bold w-16">작업명:</span><span>{permit.name}</span></div>
                            <div className="flex"><span className="font-bold w-16">작업장소:</span><span>{permit.location || '-'}</span></div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end">
                        <div className="flex border-t border-l border-black">
                            {boxes.slice(0, 4).map((step, idx) => (
                                <div key={idx} className="w-20 border-r border-b border-black text-center min-h-[90px] flex flex-col">
                                    <div className="h-6 bg-slate-50 border-b border-black text-[10px] flex items-center justify-center font-bold">
                                        {step.personId && isFinalized(step) ? (step.position || step.approver_position) : ""}
                                    </div>
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
                        <div className="text-[10px] mt-1 text-slate-700 w-full text-left pl-1">
                            참조 : {referenceNames}
                        </div>
                    </div>
                </div>

                <div className="space-y-4 text-sm mb-6 border-t border-slate-200 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex"><span className="font-bold w-24">작업부서:</span><span>{permit.deptId || '-'}</span></div>
                        <div className="flex"><span className="font-bold w-24">신청자:</span><span>{permit.personName}</span></div>
                        <div className="flex">
                            <span className="font-bold w-24">작업기간:</span>
                            <span className="text-xs">{permit.startDt} ~ {permit.endDt}</span>
                        </div>
                        <div className="flex"><span className="font-bold w-24">상태:</span><span className="font-bold text-blue-700">승인완료</span></div>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="font-bold mb-1 text-sm border-l-4 border-slate-400 pl-2">작업 개요:</div>
                    <div className="border border-slate-300 p-3 min-h-[60px] text-xs whitespace-pre-wrap bg-slate-50/20">
                        {permit.workSummary || '-'}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <div className="font-bold mb-1 text-sm border-l-4 border-slate-400 pl-2">위험 요인:</div>
                        <div className="border border-slate-300 p-3 min-h-[40px] text-xs whitespace-pre-wrap">
                            {permit.hazardFactor || '-'}
                        </div>
                    </div>
                    <div>
                        <div className="font-bold mb-1 text-sm border-l-4 border-slate-400 pl-2">안전 대책:</div>
                        <div className="border border-slate-300 p-3 min-h-[40px] text-xs whitespace-pre-wrap">
                            {permit.safetyFactor || '-'}
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="font-bold mb-1 text-sm border-l-4 border-slate-400 pl-2">공통 안전 조치 사항:</div>
                    {renderChecksheet('COM', permit.checksheetJsonCom)}
                </div>
            </div>

            {/* Additional Pages for Specific Types */}
            {(permit.wpTypes || []).filter(t => t !== 'GEN').map((type) => {
                const template = WP_TEMPLATES[type];
                if (!template) return null;

                let data: Record<string, any> | undefined;
                if (type === 'HOT') data = permit.checksheetJsonHot;
                else if (type === 'CONF') data = permit.checksheetJsonConf;
                else if (type === 'ELEC') data = permit.checksheetJsonElec;
                else if (type === 'HIGH') data = permit.checksheetJsonHigh;
                else if (type === 'DIG') data = permit.checksheetJsonDig;
                else if (type === 'HEAVY') data = (permit as any).checksheetJsonHeavy;

                return (
                    <React.Fragment key={type}>
                        <PageBreak />
                        <div className="p-[15mm] max-w-[800px] mx-auto min-h-screen flex flex-col">
                            <PrintHeader companyName={companyName} printDate={printDate} />

                            <div className="text-center mb-10">
                                <h1 className="text-2xl font-bold border-b-2 border-black pb-1 inline-block px-4">
                                    추가 허가서 - {template.title.replace(/[^가-힣\s]/g, '').trim()}
                                </h1>
                            </div>

                            <div className="mb-6 space-y-2 text-sm">
                                <div className="flex"><span className="font-bold w-24 text-slate-500">허가번호:</span><span>{permit.permitId}</span></div>
                                <div className="flex"><span className="font-bold w-24 text-slate-500">작업명:</span><span>{permit.name}</span></div>
                                <div className="flex"><span className="font-bold w-24 text-slate-500">대상설비:</span><span>{permit.equipmentName || '-'}</span></div>
                            </div>

                            <div className="flex-grow">
                                <div className="font-bold mb-2 text-sm border-l-4 border-slate-400 pl-2 text-slate-700">특수 작업 안전 조치:</div>
                                {renderChecksheet(type, data)}
                            </div>
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );
};
