import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash, Calendar, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { FileAttachmentList, type AttachedFileInfo } from '@/components/common/FileAttachmentList';
import { memoService, type Memo, type MemoComment } from '@/services/memoService';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { systemService } from '@/services/systemService';

export default function MemoDetailPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { toast } = useToast();
    const user = useAuthStore((state) => state.user);
    const [memo, setMemo] = useState<Memo | null>(null);
    const [files, setFiles] = useState<AttachedFileInfo[]>([]);

    const [comments, setComments] = useState<MemoComment[]>([]);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        const fetchMemoData = async () => {
            if (!id) return;
            const companyId = user?.companyId || 'COM-001';
            try {
                // Fetch Memo
                const data = await memoService.getMemoById(companyId, id);
                setMemo(data);

                // Fetch Comments
                const commentsData = await memoService.getComments(id);
                setComments(commentsData);

                // Fetch files if group id exists
                if (data.fileGroupId) {
                    const fileGroup = await systemService.getFileGroup(companyId, data.fileGroupId);
                    if (fileGroup && fileGroup.items) {
                        setFiles(fileGroup.items.map(item => ({
                            id: item.lineNo.toString(),
                            name: item.originalName,
                            size: item.size,
                            raw: item
                        } as any)));
                    }
                }
            } catch (error) {
                console.error("Failed to fetch memo details", error);
            }
        };
        fetchMemoData();
    }, [id, user]);

    const handleAddComment = async () => {
        if (!newComment.trim() || !id) return;
        try {
            const added = await memoService.addComment(id, newComment);
            // author_name is typically attached by joining person table on backend, or we can mock it here temporarily if missing.
            setComments([...comments, { ...added, author_name: user?.name || user?.personId }]);
            setNewComment('');
        } catch (error) {
            console.error("Failed to add comment", error);
            toast({
                title: "오류",
                description: "댓글 등록에 실패했습니다.",
                variant: "destructive"
            });
        }
    };

    const handleDeleteComment = async (commentId: number, authorId: string) => {
        if (!id) return;
        if (user?.personId !== authorId) {
            toast({ title: "권한 오류", description: "본인이 작성한 댓글만 삭제할 수 있습니다.", variant: "destructive" });
            return;
        }

        if (confirm('댓글을 정말 삭제하시겠습니까?')) {
            try {
                await memoService.deleteComment(id, commentId);
                setComments(comments.filter(c => c.commentId !== commentId));
            } catch (error) {
                console.error("Failed to delete comment", error);
                toast({ title: "오류", description: "댓글 삭제에 실패했습니다.", variant: "destructive" });
            }
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        if (confirm('정말 삭제하시겠습니까?')) {
            try {
                // Call delete API
                await memoService.deleteMemo(id, user?.personId || '');
                toast({ title: "삭제 완료", description: "메모가 삭제되었습니다." });
                navigate('/memo');
            } catch (error: any) {
                console.error(error);
                toast({ title: "삭제 실패", description: error.response?.data?.message || "메모 삭제 중 오류가 발생했습니다.", variant: "destructive" });
            }
        }
    };

    const handleDownload = (file: AttachedFileInfo & { raw?: any }) => {
        if (memo && file.raw) {
            const companyId = memo.companyId;
            const fileGroupId = file.raw.fileGroupId;
            const lineNo = file.raw.lineNo;
            systemService.downloadFile(companyId, fileGroupId, lineNo, file.name || file.raw.originalName);
        }
    };

    if (!memo) return <div>Loading...</div>;

    const canDelete = memo.status === 'T' && user?.personId === memo.createdBy;

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
                {canDelete && (
                    <Button variant="destructive" size="sm" onClick={handleDelete}>
                        <Trash className="h-4 w-4 mr-2" /> 삭제
                    </Button>
                )}
            </div>

            {/* Content Viewer */}
            <Card>
                <CardHeader className="pb-4">
                    <div className="space-y-4">
                        <CardTitle className="text-xl">
                            {memo.status === 'T' && <span className="text-purple-600 mr-2">[임시저장]</span>}
                            {memo.isNotice === 'Y' && <span className="text-red-500 mr-2">[공지]</span>}
                            {memo.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <User className="h-4 w-4" /> {memo.author_name || memo.createdBy}
                            </div>
                            <div className="h-3 w-px bg-slate-300 mx-2" />
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" /> {memo.createdAt?.split('T')[0]}
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <div className="h-px bg-slate-100 mx-6" />
                <CardContent className="pt-6 min-h-[300px]">
                    <div className="leading-relaxed text-slate-800 rich-text-content" dangerouslySetInnerHTML={{ __html: memo.content }} />

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
                            <div key={comment.commentId} className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600">
                                    {(comment.author_name || comment.authorId || '익')[0]}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm">{comment.author_name || comment.authorId}</span>
                                        <span className="text-xs text-muted-foreground">{comment.date ? new Date(comment.date).toLocaleString() : ''}</span>
                                    </div>
                                    <p className="text-sm text-slate-700">{comment.content}</p>
                                </div>
                                {user?.personId === comment.authorId && (
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-500" onClick={() => handleDeleteComment(comment.commentId, comment.authorId)}>
                                        <X className="h-3 w-3" />
                                    </Button>
                                )}
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
