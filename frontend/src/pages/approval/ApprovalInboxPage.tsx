
import { useNavigate } from 'react-router-dom';
import { Calendar, User, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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

export default function ApprovalInboxPage() {
    const navigate = useNavigate();
    const [pendingData, setPendingData] = useState<Approval[]>([]);
    const [completedData, setCompletedData] = useState<Approval[]>([]);
    const [referenceData, setReferenceData] = useState<Approval[]>([]);
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        if (user?.company_id && user?.person_id) {
            approvalService.getList(user.person_id, 'inbox-pending').then(setPendingData);
            approvalService.getList(user.person_id, 'inbox-completed').then(setCompletedData);
            approvalService.getList(user.person_id, 'inbox-reference').then(setReferenceData);
        }
    }, [user]);

    const approvedList = completedData.filter(item => item.status !== 'R');
    const rejectedList = completedData.filter(item => item.status === 'R');

    const renderTable = (data: Approval[], emptyMessage: string) => {
        return (
            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">상태</TableHead>
                            <TableHead>제목</TableHead>
                            <TableHead className="w-[120px]">기안자</TableHead>
                            <TableHead className="w-[150px]">기안일</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length > 0 ? (
                            data.map((item) => (
                                <TableRow
                                    key={item.approval_id}
                                    className="cursor-pointer hover:bg-slate-50"
                                    onClick={() => navigate(`/approval/${item.approval_id}`)}
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
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-slate-400" />
                                        {item.title}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-sm">
                                            <User className="h-3 w-3 text-muted-foreground" />
                                            {item.requester_name || item.requester_id}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> {item.created_at?.split(' ')[0]}
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
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">수신함(결재함)</h1>
                    <p className="text-muted-foreground">내게 요청되었거나 참조된 결재 문서를 확인합니다.</p>
                </div>
            </div>

            <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full grid-cols-4 max-w-2xl bg-slate-100">
                    <TabsTrigger value="pending">미결함 ({pendingData.length})</TabsTrigger>
                    <TabsTrigger value="completed">기결함 ({approvedList.length})</TabsTrigger>
                    <TabsTrigger value="rejected">반려함 ({rejectedList.length})</TabsTrigger>
                    <TabsTrigger value="reference">참조함 ({referenceData.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-6">
                    <Card>
                        <CardContent className="p-0">
                            {renderTable(pendingData, "결재를 대기 중인 문서가 없습니다.")}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="completed" className="mt-6">
                    <Card>
                        <CardContent className="p-0">
                            {renderTable(approvedList, "내가 결재한 문서가 없습니다.")}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="rejected" className="mt-6">
                    <Card>
                        <CardContent className="p-0">
                            {renderTable(rejectedList, "반려된 문서가 없습니다.")}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="reference" className="mt-6">
                    <Card>
                        <CardContent className="p-0">
                            {renderTable(referenceData, "참조/통보된 문서가 없습니다.")}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
