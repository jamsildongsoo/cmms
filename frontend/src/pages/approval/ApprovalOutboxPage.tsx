
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

export default function ApprovalOutboxPage() {
    const navigate = useNavigate();
    const [outboxData, setOutboxData] = useState<Approval[]>([]);
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        if (user?.company_id && user?.id) {
            approvalService.getList(user.id, 'outbox').then(setOutboxData);
        }
    }, [user]);

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">상신함</h1>
                    <p className="text-muted-foreground">내가 기안한 결재 문서 목록입니다.</p>
                </div>
                <Button onClick={() => navigate('/approval/register')} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> 기안 작성
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>진행 중인 결재</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">구분</TableHead>
                                    <TableHead>제목</TableHead>
                                    <TableHead className="w-[120px]">기안일</TableHead>
                                    <TableHead className="w-[100px]">현재 결재자</TableHead>
                                    <TableHead className="w-[100px]">상태</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {outboxData.length > 0 ? (
                                    outboxData.map((item) => (
                                        <TableRow
                                            key={item.approval_id}
                                            className="cursor-pointer hover:bg-slate-50"
                                            onClick={() => navigate(`/approval/${item.approval_id}`)}
                                        >
                                            <TableCell>기안</TableCell>
                                            <TableCell className="font-medium">{item.title}</TableCell>
                                            <TableCell className="text-muted-foreground flex items-center gap-1">
                                                <Calendar className="h-3 w-3" /> {item.created_at}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm">
                                                    {item.current_step}단계
                                                </div>
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
                                            상신한 문서가 없습니다.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
