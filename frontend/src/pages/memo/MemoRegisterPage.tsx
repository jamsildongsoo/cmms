
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { FileAttachment, type AttachedFile } from '@/components/common/FileAttachment';
import { Checkbox } from '@/components/ui/checkbox';
import { memoService } from '@/services/memoService';
import { useAuthStore } from '@/features/auth/useAuthStore';
import api from '@/utils/api';

export default function MemoRegisterPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isNotice, setIsNotice] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
    const user = useAuthStore((state) => state.user);

    const handleSave = async (status: 'T' | 'C') => {
        if (!title.trim() || !content.trim()) {
            toast({
                title: "입력 오류",
                description: "제목과 내용을 모두 입력해주세요.",
                variant: "destructive"
            });
            return;
        }

        try {
            const companyId = user?.company_id;
            if (!companyId) throw new Error("로그인 정보가 없습니다.");
            let fileGroupId = null;

            // ... file upload logic remains unchanged
            if (attachedFiles.length > 0) {
                for (const f of attachedFiles) {
                    if (f.file) {
                        const formData = new FormData();
                        formData.append('file', f.file);
                        formData.append('companyId', companyId);
                        if (fileGroupId) {
                            formData.append('fileGroupId', fileGroupId);
                        }

                        const response = await api.post('/api/sys/files/upload', formData, {
                            headers: { 'Content-Type': 'multipart/form-data' }
                        });

                        if (!fileGroupId) {
                            fileGroupId = response.data.file_group_id || response.data.fileGroupId;
                        }
                    }
                }
            }

            await memoService.createMemo({
                company_id: companyId,
                title: title,
                content: content,
                is_notice: isNotice ? 'Y' : 'N',
                status: status,
                file_group_id: fileGroupId,
                created_by: user?.person_id || 'SYSTEM'
            });

            toast({
                title: "저장 완료",
                description: status === 'T' ? "메모가 임시 저장되었습니다." : "메모가 확정되어 공유되었습니다.",
            });
            navigate('/memo');
        } catch (error) {
            console.error(error);
            toast({
                title: "저장 실패",
                description: "메모 저장 중 오류가 발생했습니다.",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h2 className="text-2xl font-bold tracking-tight">메모 작성</h2>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate(-1)}>취소</Button>
                    <Button variant="secondary" onClick={() => handleSave('T')}>
                        <Save className="mr-2 h-4 w-4" /> 임시 저장
                    </Button>
                    <Button onClick={() => handleSave('C')} className="bg-blue-600 hover:bg-blue-700">
                        <Save className="mr-2 h-4 w-4" /> 확정 (공유)
                    </Button>
                </div>
            </div>

            {/* Form */}
            <Card>
                <CardHeader>
                    <CardTitle>내용 작성</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="notice"
                            checked={isNotice}
                            onCheckedChange={(checked) => setIsNotice(checked as boolean)}
                        />
                        <Label htmlFor="notice" className="font-medium cursor-pointer">공지사항으로 등록</Label>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title">제목</Label>
                        <Input
                            id="title"
                            placeholder="제목을 입력하세요"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="file">첨부파일</Label>
                        <FileAttachment
                            files={attachedFiles}
                            onChange={setAttachedFiles}
                            maxFiles={5}
                            acceptTypes=".pdf,.xlsx,.docx,.jpg,.png,.hwp"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">내용</Label>
                        <Textarea
                            id="content"
                            placeholder="내용을 입력하세요"
                            className="min-h-[400px] resize-none"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
