import React from 'react';
import type { InventoryTransaction } from '@/services/inventoryService';

const TX_TITLE: Record<string, string> = {
    IN: '입고증',
    OUT: '출고증',
    MOVE_OUT: '이동출고증',
    MOVE_IN: '이동입고증',
    ADJUST_IN: '재고조정증 (증가)',
    ADJUST_OUT: '재고조정증 (감소)',
};

interface InventoryVoucherPrintProps {
    items: InventoryTransaction[];
    companyName?: string;
}

export const InventoryVoucherPrint: React.FC<InventoryVoucherPrintProps> = ({ items, companyName }) => {
    if (items.length === 0) return null;

    const printDate = new Date().toLocaleDateString();
    const txType = items[0].type;
    const title = TX_TITLE[txType] || '수불 전표';
    const historyId = items[0].history_id;
    const txDate = items[0].date;
    const user = items[0].user || '-';

    const totalQty = items.reduce((sum, item) => sum + (item.qty || 0), 0);
    const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0);

    return (
        <div className="print-container p-0 text-black bg-white w-full hidden print:block overflow-visible h-auto">
            <style dangerouslySetInnerHTML={{
                __html: `
                @page { margin: 0; }
                body { margin: 0; padding: 0; }
            `}} />
            <div className="p-[15mm] max-w-[700px] mx-auto font-sans">
                <div className="flex justify-between text-[10px] text-slate-400 border-b border-slate-100 pb-1 mb-4">
                    <div>소속: {companyName || '-'}</div>
                    <div>출력일자: {printDate}</div>
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold border-b-2 border-black pb-1 inline-block px-6">
                        {title}
                    </h1>
                </div>

                {/* 전표 정보 */}
                <div className="border border-black mb-6">
                    <div className="grid grid-cols-2 text-sm">
                        <div className="border-b border-r border-black p-2 flex">
                            <span className="font-bold w-20 shrink-0">전표번호:</span>
                            <span className="font-mono">{historyId}</span>
                        </div>
                        <div className="border-b border-black p-2 flex">
                            <span className="font-bold w-16 shrink-0">일시:</span>
                            <span>{txDate}</span>
                        </div>
                        <div className="p-2 flex border-r border-black">
                            <span className="font-bold w-20 shrink-0">처리자:</span>
                            <span>{user}</span>
                        </div>
                        <div className="p-2 flex">
                            <span className="font-bold w-16 shrink-0">구분:</span>
                            <span>{TX_TITLE[txType] || txType}</span>
                        </div>
                    </div>
                </div>

                {/* 품목 목록 */}
                <table className="w-full border-collapse border border-black text-xs mb-8">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="border border-black p-2 w-8 text-center">No.</th>
                            <th className="border border-black p-2 text-center">자재코드</th>
                            <th className="border border-black p-2 text-center">품명</th>
                            <th className="border border-black p-2 text-center">규격</th>
                            <th className="border border-black p-2 text-center">창고</th>
                            <th className="border border-black p-2 text-center">단위</th>
                            <th className="border border-black p-2 text-center w-16">수량</th>
                            <th className="border border-black p-2 text-center w-24">금액</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, idx) => (
                            <tr key={`${item.inventoryId}-${idx}`}>
                                <td className="border border-black p-2 text-center font-mono">{idx + 1}</td>
                                <td className="border border-black p-2 font-mono text-[10px]">{item.inventoryId}</td>
                                <td className="border border-black p-2 font-medium">{item.name}</td>
                                <td className="border border-black p-2 text-slate-600">{item.spec || '-'}</td>
                                <td className="border border-black p-2">{item.storage || '-'}</td>
                                <td className="border border-black p-2 text-center">{item.unit || '-'}</td>
                                <td className="border border-black p-2 text-right font-bold">{item.qty.toLocaleString()}</td>
                                <td className="border border-black p-2 text-right">{item.amount && item.amount > 0 ? item.amount.toLocaleString() : '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-slate-50 font-bold">
                        <tr>
                            <td colSpan={6} className="border border-black p-2 text-center">합계</td>
                            <td className="border border-black p-2 text-right">{totalQty.toLocaleString()}</td>
                            <td className="border border-black p-2 text-right">{totalAmount > 0 ? totalAmount.toLocaleString() : '-'}</td>
                        </tr>
                    </tfoot>
                </table>

                {/* 서명란 */}
                <div className="flex justify-end">
                    <div className="border border-black w-64">
                        <div className="grid grid-cols-2 text-sm text-center">
                            <div className="border-b border-r border-black p-2 bg-slate-50 font-bold">담당</div>
                            <div className="border-b border-black p-2 bg-slate-50 font-bold">확인</div>
                            <div className="border-r border-black p-6"></div>
                            <div className="p-6"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
