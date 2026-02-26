import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import type { WPCategoryTemplate, WorkPermit } from '@/types/workPermit';
import { cn } from '@/utils/cn';

interface WPTemplateCardProps {
    template: WPCategoryTemplate;
    register: UseFormRegister<WorkPermit>;
    watch: UseFormWatch<WorkPermit>;
    setValue: UseFormSetValue<WorkPermit>;
    disabled?: boolean;
}

export function WPTemplateCard({ template, register, watch, setValue, disabled }: WPTemplateCardProps) {
    const jsonKey = `checksheet_json_${template.id}` as keyof WorkPermit;
    
    // Helper to get current value for checkbox (React Hook Form with JSON objects can be tricky)
    const getVal = (id: string) => {
        const data = watch(jsonKey) as Record<string, any>;
        return data ? data[id] : false;
    };

    return (
        <Card className={cn("transition-all duration-200", template.colorClass)}>
            <CardHeader className="pb-3 border-b border-white/20">
                <CardTitle className="text-base flex items-center gap-2">
                    {template.title}
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                {template.questions.map((q) => (
                    <div key={q.id} className={cn("space-y-2", q.type === 'checkbox' ? "flex flex-row items-center space-x-2 space-y-0 pt-2" : "")}>
                        {q.type === 'checkbox' ? (
                            <>
                                <Checkbox
                                    id={`${template.id}-${q.id}`}
                                    checked={!!getVal(q.id)}
                                    onCheckedChange={(checked) => {
                                        const current = (watch(jsonKey) as Record<string, any>) || {};
                                        setValue(jsonKey, { ...current, [q.id]: !!checked });
                                    }}
                                    disabled={disabled}
                                />
                                <Label htmlFor={`${template.id}-${q.id}`} className="cursor-pointer font-normal">
                                    {q.label}
                                </Label>
                            </>
                        ) : (
                            <>
                                <Label htmlFor={`${template.id}-${q.id}`} className="text-sm font-medium">
                                    {q.label}
                                </Label>
                                <Input
                                    id={`${template.id}-${q.id}`}
                                    {...register(`${jsonKey}.${q.id}` as any)}
                                    placeholder={q.placeholder}
                                    disabled={disabled}
                                    className={cn("bg-white/50 focus:bg-white", disabled && "bg-slate-50")}
                                />
                            </>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
