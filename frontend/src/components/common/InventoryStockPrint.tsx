import React from 'react';
import type { InventoryStockItem } from '@/services/inventoryService';

interface InventoryStockPrintProps {
    items: InventoryStockItem[];
    companyName?: string;
}

export const InventoryStockPrint: React.FC<InventoryStockPrintProps> = ({ items, companyName }) => {
    const printDate = new Date().toLocaleDateString();

    const totalQty = items.reduce((sum, item) => sum + (item.qty || 0), 0);
    const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0);

    return (
        <div className="print-container p-0 text-black bg-white w-full hidden print:block overflow-visible h-auto">
            <style dangerouslySetInnerHTML={{
                __html: `
                @page { margin: 0; size: landscape; }
                body { margin: 0; padding: 0; }
            `}} />
            <div className="p-[10mm] max-w-[1100px] mx-auto font-sans">
                <div className="flex justify-between text-[10px] text-slate-400 border-b border-slate-100 pb-1 mb-4">
                    <div>소속: {companyName || '-'}</div>
                    <div>출력일자: {printDate}</div>
                </div>

                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold border-b-2 border-black pb-1 inline-block px-4">
                        재고 현황 보고서
                    </h1>
                </div>

                <div className="flex justify-between text-xs mb-4">
                    <div>총 {items.length}건</div>
                    <div className="flex gap-6">
                        <span>총 수량: <strong>{totalQty.toLocaleString()}</strong></span>
                        {totalAmount > 0 && <span>총 금액: <strong>{totalAmount.toLocaleString()}</strong></span>}
                    </div>
                </div>

                <table className="w-full border-collapse border border-black text-xs">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="border border-black p-2 w-8 text-center">No.</th>
                            <th className="border border-black p-2 text-center">자재코드</th>
                            <th className="border border-black p-2 text-center">품명</th>
                            <th className="border border-black p-2 text-center">규격</th>
                            <th className="border border-black p-2 text-center">창고</th>
                            <th className="border border-black p-2 text-center">BIN</th>
                            <th className="border border-black p-2 text-center">위치</th>
                            <th className="border border-black p-2 text-center">단위</th>
                            <th className="border border-black p-2 text-center w-20">수량</th>
                            <th className="border border-black p-2 text-center w-24">금액</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length > 0 ? items.map((item, idx) => (
                            <tr key={`${item.inventoryId}-${item.storageId}-${item.binId}-${idx}`}>
                                <td className="border border-black p-1.5 text-center font-mono">{idx + 1}</td>
                                <td className="border border-black p-1.5 font-mono text-[10px]">{item.inventoryId}</td>
                                <td className="border border-black p-1.5 font-medium">{item.name}</td>
                                <td className="border border-black p-1.5 text-slate-600">{item.spec || '-'}</td>
                                <td className="border border-black p-1.5">{item.storageName || '-'}</td>
                                <td className="border border-black p-1.5">{item.binName || '-'}</td>
                                <td className="border border-black p-1.5">{item.locationName || '-'}</td>
                                <td className="border border-black p-1.5 text-center">{item.unit || '-'}</td>
                                <td className="border border-black p-1.5 text-right font-bold">{item.qty.toLocaleString()}</td>
                                <td className="border border-black p-1.5 text-right">{item.amount > 0 ? item.amount.toLocaleString() : '-'}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={10} className="border border-black p-8 text-center text-slate-400">데이터 없음</td>
                            </tr>
                        )}
                    </tbody>
                    {items.length > 0 && (
                        <tfoot className="bg-slate-50 font-bold">
                            <tr>
                                <td colSpan={8} className="border border-black p-2 text-center">합계</td>
                                <td className="border border-black p-2 text-right">{totalQty.toLocaleString()}</td>
                                <td className="border border-black p-2 text-right">{totalAmount > 0 ? totalAmount.toLocaleString() : '-'}</td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
};
