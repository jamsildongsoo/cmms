
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
        if (user?.companyId && user?.personId) {
            approvalService.getList(user.personId, 'outbox').then(setOutboxData);
        }
    }, [user]);

    const pendingList = outboxData.filter(item => item.status === 'A');
    const completedList = outboxData.filter(item => item.status === 'C');
    const rejectedList = outboxData.filter(item => item.status === 'R');

    const renderTable = (data: Approval[], emptyMessage: string) => (
        <div className="rounded-md border bg-white">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">상태</TableHead>
                        <TableHead>제목</TableHead>
                        <TableHead className="w-[150px]">기안일</TableHead>
                        <TableHead className="w-[100px]">현재 결재자</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length > 0 ? (
                        data.map((item) => (
                            <TableRow
                                key={item.approvalId}
                                className="cursor-pointer hover:bg-slate-50"
                                onClick={() => navigate(`/approval/${item.approvalId}`)}
                            >
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
                                <TableCell className="font-medium">{item.title}</TableCell>
                                <TableCell className="text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" /> {item.createdAt?.split(' ')[0]}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1 text-sm">
                                        {item.currentStep}단계
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                                {emptyMessage}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );

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

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4 max-w-2xl bg-slate-100">
                    <TabsTrigger value="all">전체 ({outboxData.length})</TabsTrigger>
                    <TabsTrigger value="pending">진행 중 ({pendingList.length})</TabsTrigger>
                    <TabsTrigger value="completed">결재 완료 ({completedList.length})</TabsTrigger>
                    <TabsTrigger value="rejected">반려됨 ({rejectedList.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6">
                    <Card>
                        <CardContent className="p-0">
                            {renderTable(outboxData, "상신한 문서가 없습니다.")}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="pending" className="mt-6">
                    <Card>
                        <CardContent className="p-0">
                            {renderTable(pendingList, "진행 중인 결재가 없습니다.")}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="completed" className="mt-6">
                    <Card>
                        <CardContent className="p-0">
                            {renderTable(completedList, "완료된 결재가 없습니다.")}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="rejected" className="mt-6">
                    <Card>
                        <CardContent className="p-0">
                            {renderTable(rejectedList, "반려된 결재가 없습니다.")}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
