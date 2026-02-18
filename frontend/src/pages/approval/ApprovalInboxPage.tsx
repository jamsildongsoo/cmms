
import { useNavigate } from 'react-router-dom';
import { Calendar, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { approvalService, type Approval } from '@/services/approvalService';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { useEffect, useState } from 'react';

export default function ApprovalInboxPage() {
    const navigate = useNavigate();
    const [inboxData, setInboxData] = useState<Approval[]>([]);
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        if (user?.company_id && user?.id) {
            approvalService.getList(user.company_id, user.id, 'inbox').then(setInboxData);
        }
    }, [user]);

    const renderTable = (filterType: string) => {
        const filteredData = inboxData.filter(item => {
            if (filterType === 'ALL') return true;
            if (filterType === 'APPROVAL') return item.status === 'A';
            if (filterType === 'REJECT') return item.status === 'R';
            return true;
        });

        return (
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">상태</TableHead>
                            <TableHead>제목</TableHead>
                            <TableHead className="w-[100px]">기안자</TableHead>
                            <TableHead className="w-[120px]">기안일</TableHead>
                            <TableHead className="w-[100px]">결과</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length > 0 ? (
                            filteredData.map((item) => (
                                <TableRow
                                    key={item.approval_id}
                                    className="cursor-pointer hover:bg-slate-50"
                                    onClick={() => navigate(`/approval/${item.approval_id}`)}
                                >
                                    <TableCell>
                                        <Badge variant="outline">{item.status === 'A' ? '결재중' : item.status === 'R' ? '반려' : '확정'}</Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">{item.title}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-sm">
                                            <User className="h-3 w-3 text-muted-foreground" />
                                            {item.requester_id}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> {item.created_at}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                item.status === 'C' ? 'default' :
                                                    item.status === 'R' ? 'destructive' : 'secondary'
                                            }
                                        >
                                            {item.status === 'C' ? '확정' : item.status === 'R' ? '반려' : '결재중'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    결재 문서가 없습니다.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">수신함</h1>
                    <p className="text-muted-foreground">내가 결재해야 할 문서 목록입니다.</p>
                </div>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>결재 대기</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {renderTable('APPROVAL')}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>전체 문서</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {renderTable('ALL')}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
