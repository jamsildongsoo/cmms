
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
import axios from 'axios';

export default function MemoRegisterPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isNotice, setIsNotice] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
    const user = useAuthStore((state) => state.user);

    const handleSave = async () => {
        if (!title.trim() || !content.trim()) {
            toast({
                title: "입력 오류",
                description: "제목과 내용을 모두 입력해주세요.",
                variant: "destructive"
            });
            return;
        }

        try {
            const companyId = user?.company_id || 'COM-001';
            let fileGroupId = null;

            // Upload files if any
            if (attachedFiles.length > 0) {
                // Determine fileGroupId if multiple files need to go to same group
                // Typically first upload creates group, subsequent can add to it?
                // Or backend handles it? 
                // SystemController upload takes: file, companyId, optional fileGroupId.
                // Returns FileGroup.

                for (const f of attachedFiles) {
                    if (f.file) {
                        const formData = new FormData();
                        formData.append('file', f.file);
                        formData.append('companyId', companyId);
                        if (fileGroupId) {
                            formData.append('fileGroupId', fileGroupId);
                        }

                        const response = await axios.post('/api/sys/files/upload', formData, {
                            headers: { 'Content-Type': 'multipart/form-data' }
                        });

                        // First file upload returns the new FileGroup ID
                        if (!fileGroupId) {
                            fileGroupId = response.data.fileGroupId; // Assuming snake case might be file_group_id? Check controller return.
                            // Controller returns FileGroup entity.
                            // Let's assume it has fileGroupId property.
                            // PropertyNamingStrategy is SNAKE_CASE, so likely file_group_id.
                            if (response.data.file_group_id) {
                                fileGroupId = response.data.file_group_id;
                            } else if (response.data.fileGroupId) {
                                // Fallback check
                                fileGroupId = response.data.fileGroupId;
                            }
                        }
                    }
                }
            }

            await memoService.createMemo({
                company_id: companyId,
                title: title, // isNotice logic handled by title prefix?
                content: content,
                file_group_id: fileGroupId,
                created_by: user?.person_id || 'SYSTEM'
            });

            toast({
                title: "저장 완료",
                description: "메모가 성공적으로 저장되었습니다.",
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
                    <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                        <Save className="mr-2 h-4 w-4" /> 저장
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
