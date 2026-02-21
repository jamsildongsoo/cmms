
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Plus, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { memoService, type Memo } from '@/services/memoService';
import { useAuthStore } from '@/features/auth/useAuthStore';

export default function MemoListPage() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [memos, setMemos] = useState<Memo[]>([]);
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        const fetchMemos = async () => {
            // Defaulting companyId to COM-001 if user not logged in or missing company_id
            // Ideally should depend on user.
            const companyId = user?.company_id || 'COM-001';
            try {
                const data = await memoService.getAllMemos(companyId);
                setMemos(data);
            } catch (error) {
                console.error("Failed to fetch memos", error);
            }
        };
        fetchMemos();
    }, [user]);

    const filteredData = memos.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.author_name && item.author_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">TM 메모</h2>
                    <p className="text-muted-foreground">
                        주요 공지사항 및 업무 공유 게시판입니다.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="제목 또는 작성자 검색"
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => navigate('/memo/new')}>
                        <Plus className="mr-2 h-4 w-4" /> 글쓰기
                    </Button>
                </div>
            </div>

            {/* Board List */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px] text-center">No.</TableHead>
                                <TableHead>제목</TableHead>
                                <TableHead className="w-[120px] text-center">작성자</TableHead>
                                <TableHead className="w-[120px] text-center">작성일</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        검색 결과가 없습니다.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredData.map((item) => (
                                    <TableRow
                                        key={item.memo_id}
                                        className="cursor-pointer hover:bg-slate-50"
                                        onClick={() => navigate(`/memo/${item.memo_id}`)}
                                    >
                                        <TableCell className="text-center font-medium">
                                            {item.is_notice === 'Y' ? (
                                                <Badge variant="secondary" className="bg-red-50 text-red-600 hover:bg-red-100 border-red-100">공지</Badge>
                                            ) : (
                                                // Extract number from ID or just show ID
                                                item.memo_id
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className={item.is_notice === 'Y' ? "font-bold text-slate-900" : "text-slate-700"}>
                                                    {item.title}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center text-muted-foreground">{item.author_name || item.created_by}</TableCell>
                                        <TableCell className="text-center text-muted-foreground">{item.created_at?.split('T')[0]}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pagination Mock - Keep it static or remove */}
            <div className="flex items-center justify-center gap-2">
                <Button variant="outline" size="icon" disabled>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="bg-blue-50 text-blue-600 border-blue-200">1</Button>
                <Button variant="outline" size="icon">
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
