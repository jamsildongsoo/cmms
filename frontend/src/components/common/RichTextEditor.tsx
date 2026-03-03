
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Underline } from '@tiptap/extension-underline';
import { Placeholder } from '@tiptap/extension-placeholder';
import {
    Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
    Table as TableIcon, Columns, Rows, Trash2, Heading1, Heading2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Tooltip Fallback (Simple version since shadcn tooltip installation failed)
const TooltipProvider = ({ children }: { children: React.ReactNode, delayDuration?: number }) => <>{children}</>;
const Tooltip = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const TooltipTrigger = ({ children }: { children: React.ReactNode, asChild?: boolean }) => <div className="inline-block">{children}</div>;
const TooltipContent = ({ children }: { children: React.ReactNode }) => <>{children}</>;

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

const MenuButton = ({
    onClick,
    isActive = false,
    disabled = false,
    children,
    tooltip
}: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    tooltip: string;
}) => (
    <TooltipProvider delayDuration={300}>
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    type="button"
                    variant={isActive ? "secondary" : "ghost"}
                    size="icon"
                    className={`h-8 w-8 ${isActive ? 'bg-slate-200' : ''}`}
                    onMouseDown={(e) => {
                        e.preventDefault(); // Prevent editor focus loss
                    }}
                    onClick={onClick}
                    disabled={disabled}
                >
                    {children}
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p className="text-xs">{tooltip}</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
);

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            Placeholder.configure({
                placeholder: placeholder || '내용을 입력하세요...',
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    if (!editor) {
        return null;
    }

    return (
        <div className={`border rounded-md overflow-hidden flex flex-col bg-white ${className}`}>
            {/* Toolbar */}
            <div className="border-b bg-slate-50 p-1 flex flex-wrap gap-1 items-center sticky top-0 z-10">
                <MenuButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    isActive={editor.isActive('heading', { level: 1 })}
                    tooltip="제목 1"
                >
                    <Heading1 className="h-4 w-4" />
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive('heading', { level: 2 })}
                    tooltip="제목 2"
                >
                    <Heading2 className="h-4 w-4" />
                </MenuButton>

                <div className="w-px h-4 bg-slate-300 mx-1" />

                <MenuButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    tooltip="굵게"
                >
                    <Bold className="h-4 w-4" />
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    tooltip="기울임"
                >
                    <Italic className="h-4 w-4" />
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    isActive={editor.isActive('underline')}
                    tooltip="밑줄"
                >
                    <UnderlineIcon className="h-4 w-4" />
                </MenuButton>

                <div className="w-px h-4 bg-slate-300 mx-1" />

                <MenuButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    tooltip="글머리 기호"
                >
                    <List className="h-4 w-4" />
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    tooltip="번호 매기기"
                >
                    <ListOrdered className="h-4 w-4" />
                </MenuButton>

                <div className="w-px h-4 bg-slate-300 mx-1" />

                {/* Table Controls */}
                <MenuButton
                    onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                    tooltip="표 삽입"
                >
                    <TableIcon className="h-4 w-4" />
                </MenuButton>

                <div className="flex gap-1 border-l pl-1 border-slate-300 ml-1">
                    <MenuButton onClick={() => editor.chain().focus().addColumnBefore().run()} disabled={!editor.can().addColumnBefore()} tooltip="열 추가 (이전)">
                        <div className="relative">
                            <Columns className="h-4 w-4" />
                            <span className="absolute -top-1 -left-1 text-[8px] font-bold">+</span>
                        </div>
                    </MenuButton>
                    <MenuButton onClick={() => editor.chain().focus().addColumnAfter().run()} disabled={!editor.can().addColumnAfter()} tooltip="열 추가 (이후)">
                        <div className="relative">
                            <Columns className="h-4 w-4" />
                            <span className="absolute -top-1 -right-1 text-[8px] font-bold">+</span>
                        </div>
                    </MenuButton>
                    <MenuButton onClick={() => editor.chain().focus().deleteColumn().run()} disabled={!editor.can().deleteColumn()} tooltip="열 삭제">
                        <div className="relative">
                            <Columns className="h-4 w-4 opacity-50" />
                            <span className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center text-[10px] font-bold">×</span>
                        </div>
                    </MenuButton>

                    <MenuButton onClick={() => editor.chain().focus().addRowBefore().run()} disabled={!editor.can().addRowBefore()} tooltip="행 추가 (이전)">
                        <div className="relative">
                            <Rows className="h-4 w-4" />
                            <span className="absolute -top-1 -left-1 text-[8px] font-bold">+</span>
                        </div>
                    </MenuButton>
                    <MenuButton onClick={() => editor.chain().focus().addRowAfter().run()} disabled={!editor.can().addRowAfter()} tooltip="행 추가 (이후)">
                        <div className="relative">
                            <Rows className="h-4 w-4" />
                            <span className="absolute -top-1 -right-1 text-[8px] font-bold">+</span>
                        </div>
                    </MenuButton>
                    <MenuButton onClick={() => editor.chain().focus().deleteRow().run()} disabled={!editor.can().deleteRow()} tooltip="행 삭제">
                        <div className="relative">
                            <Rows className="h-4 w-4 opacity-50" />
                            <span className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center text-[10px] font-bold">×</span>
                        </div>
                    </MenuButton>

                    <MenuButton onClick={() => editor.chain().focus().deleteTable().run()} disabled={!editor.can().deleteTable()} tooltip="표 삭제">
                        <Trash2 className="h-4 w-4 text-red-500" />
                    </MenuButton>
                </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 p-4 overflow-auto min-h-[400px]">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
