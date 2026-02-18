
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Trash, Calendar, User, Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { FileAttachmentList, type AttachedFileInfo } from '@/components/common/FileAttachmentList';
import { memoService, type Memo } from '@/services/memoService';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { systemService } from '@/services/systemService';

export default function MemoDetailPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { toast } = useToast();
    const user = useAuthStore((state) => state.user);
    const [memo, setMemo] = useState<Memo | null>(null);
    const [files, setFiles] = useState<AttachedFileInfo[]>([]);

    // Comments State (Mock for now as backend support isn't explicit in basic Requirement)
    const [comments, setComments] = useState([
        { id: 1, author: '김철수', content: '확인했습니다.', date: '2024-03-15 14:30' },
    ]);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        const fetchMemo = async () => {
            if (!id) return;
            const companyId = user?.company_id || 'COM-001';
            try {
                const data = await memoService.getMemoById(companyId, id);
                setMemo(data);

                // Fetch files if group id exists
                if (data.file_group_id) {
                    const fileGroup = await systemService.getFileGroup(companyId, data.file_group_id);
                    if (fileGroup && fileGroup.items) {
                        setFiles(fileGroup.items.map(item => ({
                            id: item.file_item_id.line_no.toString(),
                            name: item.original_name,
                            size: item.size,
                            // Store full item for download
                            raw: item
                        } as any)));
                    }
                }
            } catch (error) {
                console.error("Failed to fetch memo", error);
            }
        };
        fetchMemo();
    }, [id, user]);

    const handleAddComment = () => {
        if (!newComment.trim()) return;
        const comment = {
            id: Date.now(),
            author: user?.name || '익명',
            content: newComment,
            date: new Date().toISOString().slice(0, 16).replace('T', ' ')
        };
        setComments([...comments, comment]);
        setNewComment('');
    };

    const handleDeleteComment = (id: number) => {
        setComments(comments.filter(c => c.id !== id));
    };

    const handleDelete = () => {
        if (confirm('정말 삭제하시겠습니까?')) {
            toast({ title: "삭제 완료", description: "메모가 삭제되었습니다." });
            navigate('/memo');
        }
    };

    const handleDownload = (file: AttachedFileInfo & { raw?: any }) => {
        if (memo && file.raw) {
            const companyId = memo.company_id;
            const fileGroupId = file.raw.file_item_id.file_group_id;
            const lineNo = file.raw.file_item_id.line_no;
            const url = systemService.getDownloadUrl(companyId, fileGroupId, lineNo);

            // Trigger download via new window or anchor
            window.open(url, '_blank');
        }
    };

    if (!memo) return <div>Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/memo')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h2 className="text-2xl font-bold tracking-tight">메모 상세</h2>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate(`/memo/${id}/edit`)}>
                        <Edit className="mr-2 h-4 w-4" /> 수정
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                        <Trash className="mr-2 h-4 w-4" /> 삭제
                    </Button>
                </div>
            </div>

            {/* Content Viewer */}
            <Card>
                <CardHeader className="pb-4">
                    <div className="space-y-4">
                        <CardTitle className="text-xl">{memo.title}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <User className="h-4 w-4" /> {memo.author_name || memo.created_by}
                            </div>
                            <div className="h-3 w-px bg-slate-300 mx-2" />
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" /> {memo.created_at?.split('T')[0]}
                            </div>
                            <div className="h-3 w-px bg-slate-300 mx-2" />
                            <div className="flex items-center gap-1">
                                <Eye className="h-4 w-4" /> {memo.views || 0}
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <div className="h-px bg-slate-100 mx-6" />
                <CardContent className="pt-6 min-h-[300px]">
                    <div className="whitespace-pre-line leading-relaxed text-slate-800">
                        {memo.content}
                    </div>

                    {/* Attachments */}
                    {files.length > 0 && (
                        <div className="mt-8 pt-4 border-t">
                            <div className="text-sm font-medium text-slate-500 mb-2">첨부파일</div>
                            <FileAttachmentList
                                files={files}
                                onDownload={handleDownload}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Comments Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">댓글 <span className="text-slate-500 text-base font-normal">({comments.length})</span></CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Comment List */}
                    <div className="space-y-4">
                        {comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600">
                                    {(comment.author || '익')[0]}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm">{comment.author}</span>
                                        <span className="text-xs text-muted-foreground">{comment.date}</span>
                                    </div>
                                    <p className="text-sm text-slate-700">{comment.content}</p>
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-500" onClick={() => handleDeleteComment(comment.id)}>
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    {/* Add Comment */}
                    <div className="flex gap-2">
                        <Input
                            placeholder="댓글을 입력하세요..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                                    handleAddComment();
                                }
                            }}
                        />
                        <Button onClick={handleAddComment}>등록</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
