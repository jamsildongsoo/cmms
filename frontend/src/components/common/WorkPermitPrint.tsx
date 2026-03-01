
import React from 'react';
import type { WorkPermit } from '@/types/workPermit';
import { WP_TEMPLATES } from '@/constants/wpTemplates';

interface WorkPermitPrintProps {
    permit: WorkPermit;
    companyName?: string;
}

const PrintHeader = ({ companyName, printDate }: { companyName?: string, printDate: string }) => (
    <div className="flex justify-between text-[10px] text-slate-400 border-b border-slate-100 pb-1 mb-6">
        <div>소속: {companyName || '-'}</div>
        <div>출력일자: {printDate}</div>
    </div>
);

const PageBreak = () => <div className="print:break-before-page h-0 w-0" />;

export const WorkPermitPrint: React.FC<WorkPermitPrintProps> = ({ permit, companyName }) => {
    const printDate = new Date().toLocaleDateString();

    const renderChecksheet = (templateKey: string, data: Record<string, any> | undefined) => {
        const template = WP_TEMPLATES[templateKey];
        if (!template) return null;

        return (
            <div className="mt-4">
                <table className="w-full border-collapse border border-black text-xs">
                    <thead>
                        <tr className="bg-slate-50">
                            <th className="border border-black p-2 w-12 text-center">확인</th>
                            <th className="border border-black p-2 text-left">안전 점검 항목</th>
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
            <style dangerouslySetInnerHTML={{ __html: `
                @page { margin: 0; }
                body { margin: 0; padding: 0; }
            `}} />

            {/* Page 1: Common Work Permit (공통작업허가) */}
            <div className="p-[15mm] max-w-[800px] mx-auto min-h-screen flex flex-col">
                <PrintHeader companyName={companyName} printDate={printDate} />
                
                <div className="text-center mb-10">
                    <h1 className="text-2xl font-bold border-b-2 border-black pb-1 inline-block px-4">
                        안전 작업 허가서 (공통)
                    </h1>
                </div>

                <div className="space-y-4 text-sm mb-6">
                    <div className="flex"><span className="font-bold w-24">허가번호:</span><span>{permit.permitId}</span></div>
                    <div className="flex"><span className="font-bold w-24">작업명:</span><span>{permit.name}</span></div>
                    <div className="flex">
                        <span className="font-bold w-24">작업기간:</span>
                        <span>{permit.startDt} ~ {permit.endDt}</span>
                    </div>
                    <div className="flex"><span className="font-bold w-24">작업장소:</span><span>{permit.location || '-'}</span></div>
                    <div className="flex flex-wrap items-center gap-x-6 border-t border-slate-200 pt-2 mt-2">
                        <div className="flex"><span className="font-bold mr-2">신청부서:</span><span>{permit.deptId || '-'}</span></div>
                        <div className="flex"><span className="font-bold mr-2">신청자:</span><span>{permit.personName}</span></div>
                        <div className="flex"><span className="font-bold mr-2">상태:</span><span className="font-bold text-blue-700">승인완료</span></div>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="font-bold mb-1 text-sm">작업 개요:</div>
                    <div className="border border-slate-300 p-3 min-h-[60px] text-xs whitespace-pre-wrap">
                        {permit.workSummary || '-'}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <div className="font-bold mb-1 text-sm">위험 요인:</div>
                        <div className="border border-slate-300 p-3 min-h-[40px] text-xs whitespace-pre-wrap">
                            {permit.hazardFactor || '-'}
                        </div>
                    </div>
                    <div>
                        <div className="font-bold mb-1 text-sm">안전 대책:</div>
                        <div className="border border-slate-300 p-3 min-h-[40px] text-xs whitespace-pre-wrap">
                            {permit.safetyFactor || '-'}
                        </div>
                    </div>
                </div>

                <div>
                    <div className="font-bold mb-1 text-sm">공통 안전 조치 사항:</div>
                    {renderChecksheet('COM', permit.checksheetJsonCom)}
                </div>

                <div className="mt-auto pt-10 flex justify-end gap-10">
                    <div className="text-center">
                        <div className="text-[10px] mb-1">작업 부서장</div>
                        <div className="w-16 h-16 border border-black flex items-center justify-center text-slate-300 text-[10px]">(인)</div>
                    </div>
                    <div className="text-center">
                        <div className="text-[10px] mb-1">안전 관리자</div>
                        <div className="w-16 h-16 border border-black flex items-center justify-center text-slate-300 text-[10px]">(인)</div>
                    </div>
                </div>
            </div>

            {/* Additional Pages for Specific Types */}
            {(permit.wpTypes || []).filter(t => t !== 'GEN').map((type) => {
                const template = WP_TEMPLATES[type];
                if (!template) return null;

                // Determine data field
                let data: Record<string, any> | undefined;
                if (type === 'HOT') data = permit.checksheetJsonHot;
                else if (type === 'CONF') data = permit.checksheetJsonConf;
                else if (type === 'ELEC') data = permit.checksheetJsonElec;
                else if (type === 'HIGH') data = permit.checksheetJsonHigh;
                else if (type === 'DIG') data = permit.checksheetJsonDig;

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
                                <div className="flex"><span className="font-bold w-24">허가번호:</span><span>{permit.permitId}</span></div>
                                <div className="flex"><span className="font-bold w-24">작업명:</span><span>{permit.name}</span></div>
                                <div className="flex"><span className="font-bold w-24">대상설비:</span><span>{permit.equipmentName || '-'}</span></div>
                            </div>

                            <div className="flex-grow">
                                <div className="font-bold mb-2 text-sm">특수 작업 안전 조치:</div>
                                {renderChecksheet(type, data)}
                            </div>

                            <div className="mt-auto pt-10 flex justify-end gap-10">
                                <div className="text-center">
                                    <div className="text-[10px] mb-1">입회인 / 감시인</div>
                                    <div className="w-16 h-16 border border-black flex items-center justify-center text-slate-300 text-[10px]">(인)</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-[10px] mb-1">안전 관리자</div>
                                    <div className="w-16 h-16 border border-black flex items-center justify-center text-slate-300 text-[10px]">(인)</div>
                                </div>
                            </div>
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );
};
