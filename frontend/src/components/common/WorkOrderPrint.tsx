
import React from 'react';

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
}

export const WorkOrderPrint: React.FC<WorkOrderPrintProps> = ({ 
    stage, id, name, equipment, dept, person, date, items, note, companyName 
}) => {
    const title = `작업지시 ${stage === 'PLN' ? '계획' : '실적'} 보고서`;
    const printDate = new Date().toLocaleDateString();

    return (
        <div className="print-container p-0 text-black bg-white w-full hidden print:block overflow-visible h-auto">
            <style dangerouslySetInnerHTML={{ __html: `
                @page { margin: 0; }
                body { margin: 0; padding: 0; }
            `}} />
            <div className="p-[15mm] max-w-[800px] mx-auto">
                <div className="flex justify-between text-[10px] text-slate-400 border-b border-slate-100 pb-1 mb-6">
                    <div>소속: {companyName || '-'}</div>
                    <div>출력일자: {printDate}</div>
                </div>

                <div className="text-center mb-10">
                    <h1 className="text-2xl font-bold border-b-2 border-black pb-1 inline-block px-4">
                        {title}
                    </h1>
                </div>

                <div className="mb-6 space-y-2 text-sm">
                    <div className="flex"><span className="font-bold w-24">지시번호:</span><span>{id}</span></div>
                    <div className="flex"><span className="font-bold w-24">작업명:</span><span>{name}</span></div>
                    <div className="flex"><span className="font-bold w-24">대상설비:</span><span>{equipment}</span></div>
                    <div className="flex flex-wrap items-center gap-x-6 border-t border-slate-200 pt-2 mt-2">
                        <div className="flex"><span className="font-bold mr-2">관리부서:</span><span>{dept}</span></div>
                        <div className="flex"><span className="font-bold mr-2">담당자:</span><span>{person}</span></div>
                        <div className="flex"><span className="font-bold mr-2">작업일자:</span><span>{date}</span></div>
                        <div className="flex"><span className="font-bold mr-2">상태:</span><span className="font-bold text-blue-700">완료</span></div>
                    </div>
                </div>

                {note && (
                    <div className="mb-8 break-inside-avoid">
                        <div className="font-bold mb-1 text-sm">종합 소견 / 요청 내용:</div>
                        <div className="border border-slate-300 p-3 min-h-[60px] text-xs whitespace-pre-wrap bg-slate-50/30">
                            {note}
                        </div>
                    </div>
                )}

                <div className="mb-10">
                    <div className="font-bold mb-1 text-sm">상세 작업 내역:</div>
                    <table className="w-full border-collapse border border-black text-xs">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="border border-black p-2 w-10 text-center">No.</th>
                                <th className="border border-black p-2 text-center">작업 항목</th>
                                <th className="border border-black p-2 text-center">작업 방법</th>
                                <th className="border border-black p-2 w-24 text-center">조치 결과</th>
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
