import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { WPCategoryTemplate, WorkPermit } from '@/types/workPermit';
import { cn } from '@/utils/cn';
import { CheckCircle, XCircle } from 'lucide-react';

interface WPValueCardProps {
    template: WPCategoryTemplate;
    permit: WorkPermit;
}

export function WPValueCard({ template, permit }: WPValueCardProps) {
    const jsonKey = `checksheet_json_${template.id}` as keyof WorkPermit;
    const data = (permit[jsonKey] as Record<string, any>) || {};

    return (
        <Card className={cn("transition-all duration-200", template.colorClass)}>
            <CardHeader className="pb-3 border-b border-white/20">
                <CardTitle className="text-base flex items-center gap-2">
                    {template.title}
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                {template.questions.map((q) => {
                    const value = data[q.id];
                    return (
                        <div key={q.id} className={cn("space-y-1", q.type === 'checkbox' ? "flex flex-row items-center space-x-2 space-y-0" : "")}>
                            {q.type === 'checkbox' ? (
                                <>
                                    {value ? (
                                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                    ) : (
                                        <XCircle className="h-4 w-4 text-slate-300 flex-shrink-0" />
                                    )}
                                    <span className={cn("text-sm", value ? "text-slate-900 font-medium" : "text-slate-500")}>
                                        {q.label}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span className="text-xs text-muted-foreground block">{q.label}</span>
                                    <span className="text-sm font-medium bg-white/50 px-2 py-1 rounded border border-slate-100 block min-h-[28px]">
                                        {value || '-'}
                                    </span>
                                </>
                            )}
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
