
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

/** template.id → camelCase key matching WorkPermit type */
function toJsonKey(id: string): keyof WorkPermit {
    return `checksheetJson${id.charAt(0).toUpperCase()}${id.slice(1)}` as keyof WorkPermit;
}

export const WorkPermitPrint: React.FC<WorkPermitPrintProps> = ({ permit, companyName, approvalSteps = [] }) => {
    const printDate = new Date().toLocaleDateString();

    const isFinalized = (step: ApprovalStep) => {
        if (!step.personId) return false;
        if (step.decision === '00') return true;
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

    const displaySteps = approvalSteps.filter(s => s.decision !== '03').slice(0, 4);
    const boxes = [...displaySteps];
    while (boxes.length < 4) {
        boxes.push({} as ApprovalStep);
    }

    const referenceNames = approvalSteps
        .filter(s => s.decision === '03')
        .map(s => s.personName || s.personId)
        .join(', ');

    const renderChecksheet = (templateKey: string) => {
        const template = WP_TEMPLATES[templateKey];
        if (!template) return null;
        const jsonKey = toJsonKey(template.id);
        const data = permit[jsonKey] as Record<string, any> | undefined;

        // Split into two columns
        const mid = Math.ceil(template.questions.length / 2);
        const leftCol = template.questions.slice(0, mid);
        const rightCol = template.questions.slice(mid);
        const maxRows = Math.max(leftCol.length, rightCol.length);

        return (
            <table className="w-full border-collapse border border-black text-xs">
                <thead>
                    <tr className="bg-slate-50">
                        <th className="border border-black p-1.5 w-8 text-center">확인</th>
                        <th className="border border-black p-1.5 text-left">안전 점검 항목</th>
                        <th className="border border-black p-1.5 w-8 text-center">확인</th>
                        <th className="border border-black p-1.5 text-left">안전 점검 항목</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: maxRows }).map((_, i) => {
                        const lq = leftCol[i];
                        const rq = rightCol[i];
                        return (
                            <tr key={i}>
                                <td className="border border-black p-1.5 text-center font-bold">
                                    {lq ? (lq.type === 'checkbox' ? (data?.[lq.id] ? 'V' : '') : (data?.[lq.id] || '')) : ''}
                                </td>
                                <td className="border border-black p-1.5 text-left">
                                    {lq?.label || ''}
                                </td>
                                <td className="border border-black p-1.5 text-center font-bold">
                                    {rq ? (rq.type === 'checkbox' ? (data?.[rq.id] ? 'V' : '') : (data?.[rq.id] || '')) : ''}
                                </td>
                                <td className="border border-black p-1.5 text-left">
                                    {rq?.label || ''}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    };

    const specificTypes = (permit.wpTypes || []).filter(t => WP_TEMPLATES[t]);

    return (
        <div className="print-container p-0 text-black bg-white w-full hidden print:block overflow-visible h-auto">
            <style dangerouslySetInnerHTML={{
                __html: `
                @page { margin: 0; }
                body { margin: 0; padding: 0; }
            `}} />

            {/* ===== Page 1: 기본 정보 (표지) ===== */}
            <div className="p-[15mm] max-w-[800px] mx-auto flex flex-col">
                <PrintHeader companyName={companyName} printDate={printDate} />

                <div className="flex justify-between mb-8 items-start">
                    <div className="flex-1 min-w-0 mr-4">
                        <h1 className="text-2xl font-bold border-b-2 border-black pb-1 inline-block px-4 mb-6">
                            안전 작업 허가서
                        </h1>
                        <div className="space-y-1.5 text-xs text-slate-700">
                            <div className="flex"><span className="font-bold w-16 shrink-0">허가번호:</span><span className="truncate">{permit.permitId}</span></div>
                            <div className="flex"><span className="font-bold w-16 shrink-0">작업명:</span><span className="truncate">{permit.name}</span></div>
                            <div className="flex"><span className="font-bold w-16 shrink-0">대상설비:</span><span className="truncate">{permit.equipmentId ? `${permit.equipmentId} / ${permit.equipmentName || ''}` : '-'}</span></div>
                            <div className="flex"><span className="font-bold w-16 shrink-0">작업장소:</span><span className="truncate">{permit.location || '-'}</span></div>
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
                            <span className="text-xs">{formatDateTime(permit.startDt)} ~ {formatDateTime(permit.endDt)}</span>
                        </div>
                        <div className="flex"><span className="font-bold w-24">상태:</span><span className={`font-bold ${permit.status === 'C' ? 'text-blue-700' : permit.status === 'A' ? 'text-orange-600' : 'text-slate-500'}`}>{permit.status === 'C' ? '승인완료' : permit.status === 'A' ? '상신' : permit.status === 'T' ? '임시저장' : permit.status || '-'}</span></div>
                        <div className="flex col-span-2">
                            <span className="font-bold w-24">보충허가:</span>
                            <span>{specificTypes.length > 0 ? specificTypes.map(t => WP_TEMPLATES[t]?.title.split('(')[0].trim()).join(', ') : '없음'}</span>
                        </div>
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
            </div>

            {/* ===== Page 2: 일반작업 허가서 ===== */}
            <PageBreak />
            <div className="p-[15mm] max-w-[800px] mx-auto flex flex-col">
                <PrintHeader companyName={companyName} printDate={printDate} />

                <h1 className="text-2xl font-bold border-b-2 border-black pb-1 inline-block px-4 mb-8">
                    일반작업 허가서
                </h1>

                <div className="mb-6 space-y-1.5 text-xs text-slate-700">
                    <div className="flex"><span className="font-bold w-16 shrink-0">허가번호:</span><span>{permit.permitId}</span></div>
                    <div className="flex"><span className="font-bold w-16 shrink-0">작업명:</span><span>{permit.name}</span></div>
                    <div className="flex"><span className="font-bold w-16 shrink-0">대상설비:</span><span>{permit.equipmentId ? `${permit.equipmentId} / ${permit.equipmentName || ''}` : '-'}</span></div>
                </div>

                {/* 일반작업 체크시트 */}
                <div className="mb-4">
                    <div className="bg-slate-800 text-white text-sm font-bold py-2 px-3 rounded-t">
                        안전보건조치 요구사항
                    </div>
                    {renderChecksheet('GEN')}
                </div>

                {/* 가스점검 */}
                <table className="w-full border-collapse border border-black text-xs mb-4">
                    <tbody>
                        <tr>
                            <td rowSpan={3} className="border border-black p-1.5 text-center font-bold w-10 align-middle" style={{ writingMode: 'vertical-rl' }}>가스점검</td>
                            <td className="border border-black p-1.5 font-bold text-center w-20">가스명</td>
                            <td className="border border-black p-1.5 text-center w-20">점검시간</td>
                            <td className="border border-black p-1.5 text-center w-16">결과</td>
                            <td rowSpan={3} className="border border-black p-2 text-left align-top leading-relaxed">
                                <div>점검기기명 :</div>
                                <div className="mt-2">점검자 : <span className="inline-block w-24 border-b border-black"></span> (서명)</div>
                                <div className="mt-2">확인자(입회자) : <span className="inline-block w-24 border-b border-black"></span> (서명)</div>
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-black p-1.5 h-6"></td>
                            <td className="border border-black p-1.5"></td>
                            <td className="border border-black p-1.5"></td>
                        </tr>
                        <tr>
                            <td className="border border-black p-1.5 h-6"></td>
                            <td className="border border-black p-1.5"></td>
                            <td className="border border-black p-1.5"></td>
                        </tr>
                    </tbody>
                </table>

                {/* 안전조치 확인 + 작업완료확인 */}
                <table className="w-full border-collapse border border-black text-xs mb-4">
                    <tbody>
                        <tr>
                            <td className="border border-black p-2 w-1/2 align-top">
                                <div className="font-bold mb-2">안전조치 확인</div>
                                <div className="space-y-2">
                                    <div>정비부서 책임자 : <span className="inline-block w-28 border-b border-black"></span> (서명)</div>
                                    <div>입 회 자 : <span className="inline-block w-28 border-b border-black ml-[1.5em]"></span> (서명)</div>
                                </div>
                            </td>
                            <td className="border border-black p-2 w-1/2 align-top">
                                <div className="font-bold mb-2">작업완료확인</div>
                                <div className="space-y-2">
                                    <div>완료시간 : <span className="inline-block w-28 border-b border-black ml-[0.5em]"></span></div>
                                    <div>입 회 자 : <span className="inline-block w-28 border-b border-black ml-[0.5em]"></span> (서명)</div>
                                    <div>작 업 자 : <span className="inline-block w-28 border-b border-black ml-[0.5em]"></span> (서명)</div>
                                    <div>조치사항 : <span className="inline-block w-28 border-b border-black"></span></div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* 검토자 / 승인자 / 관련부서 협조자 */}
                <table className="w-full border-collapse border border-black text-xs">
                    <tbody>
                        <tr>
                            <td className="border border-black p-2 w-1/2 align-top">
                                <div className="space-y-2">
                                    <div>검토자 : <span className="inline-block w-12 border-b border-black"></span> 부서 <span className="inline-block w-12 border-b border-black"></span> 직책 <span className="inline-block w-14 border-b border-black"></span> 성명 (서명)</div>
                                    <div>승인자 : <span className="inline-block w-12 border-b border-black"></span> 부서 <span className="inline-block w-12 border-b border-black"></span> 직책 <span className="inline-block w-14 border-b border-black"></span> 성명 (서명)</div>
                                </div>
                            </td>
                            <td className="border border-black p-2 w-1/2 align-top">
                                <div className="font-bold mb-2">관련부서 협조자</div>
                                <div className="space-y-2">
                                    <div><span className="inline-block w-12 border-b border-black"></span> 부서 <span className="inline-block w-12 border-b border-black"></span> 직책 <span className="inline-block w-14 border-b border-black"></span> 성명 (서명)</div>
                                    <div><span className="inline-block w-12 border-b border-black"></span> 부서 <span className="inline-block w-12 border-b border-black"></span> 직책 <span className="inline-block w-14 border-b border-black"></span> 성명 (서명)</div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* ===== Page 3+: 보충 허가 (각 유형별 1페이지) ===== */}
            {specificTypes.map((type) => {
                const template = WP_TEMPLATES[type];
                if (!template) return null;
                const formTitle = template.title.split('(')[0].trim();

                return (
                    <React.Fragment key={type}>
                        <PageBreak />
                        <div className="p-[15mm] max-w-[800px] mx-auto flex flex-col">
                            <PrintHeader companyName={companyName} printDate={printDate} />

                            <h1 className="text-2xl font-bold border-b-2 border-black pb-1 inline-block px-4 mb-8">
                                {formTitle.includes('허가') ? formTitle : `${formTitle} 허가서`}
                            </h1>

                            <div className="mb-6 space-y-1.5 text-xs text-slate-700">
                                <div className="flex"><span className="font-bold w-16 shrink-0">허가번호:</span><span>{permit.permitId}</span></div>
                                <div className="flex"><span className="font-bold w-16 shrink-0">작업명:</span><span>{permit.name}</span></div>
                                <div className="flex"><span className="font-bold w-16 shrink-0">대상설비:</span><span>{permit.equipmentId ? `${permit.equipmentId} / ${permit.equipmentName || ''}` : '-'}</span></div>
                            </div>

                            <div className="mb-4">
                                <div className="bg-slate-800 text-white text-sm font-bold py-2 px-3 rounded-t">
                                    안전조치 요구사항
                                </div>
                                {renderChecksheet(type)}
                            </div>

                            {/* 안전조치 확인자 + 담당 책임자 + 작업자 */}
                            <table className="w-full border-collapse border border-black text-xs mb-4">
                                <tbody>
                                    <tr>
                                        <td className="border border-black p-2 w-1/2 align-top">
                                            <div className="font-bold mb-2">안전조치 확인</div>
                                            <div className="space-y-2">
                                                <div>안전조치 확인자 : <span className="inline-block w-24 border-b border-black"></span> (서명)</div>
                                                <div>담당 책임자 : <span className="inline-block w-24 border-b border-black ml-[1em]"></span> (서명)</div>
                                                <div>작 업 자 : <span className="inline-block w-24 border-b border-black ml-[2.5em]"></span> (서명)</div>
                                            </div>
                                        </td>
                                        <td className="border border-black p-2 w-1/2 align-top">
                                            <div className="font-bold mb-2">작업완료확인</div>
                                            <div className="space-y-2">
                                                <div>완료시간 : <span className="inline-block w-28 border-b border-black ml-[0.5em]"></span></div>
                                                <div>확 인 자 : <span className="inline-block w-28 border-b border-black ml-[0.5em]"></span> (서명)</div>
                                                <div>작 업 자 : <span className="inline-block w-28 border-b border-black ml-[0.5em]"></span> (서명)</div>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* 검토자 / 승인자 / 관련부서 협조자 */}
                            <table className="w-full border-collapse border border-black text-xs">
                                <tbody>
                                    <tr>
                                        <td className="border border-black p-2 w-1/2 align-top">
                                            <div className="space-y-2">
                                                <div>검토자 : <span className="inline-block w-12 border-b border-black"></span> 부서 <span className="inline-block w-12 border-b border-black"></span> 직책 <span className="inline-block w-14 border-b border-black"></span> 성명 (서명)</div>
                                                <div>승인자 : <span className="inline-block w-12 border-b border-black"></span> 부서 <span className="inline-block w-12 border-b border-black"></span> 직책 <span className="inline-block w-14 border-b border-black"></span> 성명 (서명)</div>
                                            </div>
                                        </td>
                                        <td className="border border-black p-2 w-1/2 align-top">
                                            <div className="font-bold mb-2">관련부서 협조자</div>
                                            <div className="space-y-2">
                                                <div><span className="inline-block w-12 border-b border-black"></span> 부서 <span className="inline-block w-12 border-b border-black"></span> 직책 <span className="inline-block w-14 border-b border-black"></span> 성명 (서명)</div>
                                                <div><span className="inline-block w-12 border-b border-black"></span> 부서 <span className="inline-block w-12 border-b border-black"></span> 직책 <span className="inline-block w-14 border-b border-black"></span> 성명 (서명)</div>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );
};
