import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/features/auth/useAuthStore"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"

const loginSchema = z.object({
    employeeId: z.string().min(1, "사번을 입력해주세요."),
    password: z.string().min(1, "비밀번호를 입력해주세요."),
    companyCode: z.string().min(1, "회사 코드를 입력해주세요."),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
    const navigate = useNavigate()
    const login = useAuthStore((state) => state.login)
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    const [saveInfo, setSaveInfo] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            employeeId: "",
            password: "",
            companyCode: "",
        },
    })

    // Load saved info on mount
    useEffect(() => {
        const savedCompanyCode = localStorage.getItem('savedCompanyCode');
        const savedEmployeeId = localStorage.getItem('savedEmployeeId');

        if (savedCompanyCode && savedEmployeeId) {
            setValue('companyCode', savedCompanyCode);
            setValue('employeeId', savedEmployeeId);
            setSaveInfo(true);
        }
    }, [setValue]);

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true)
        try {
            await login(data.companyCode, data.employeeId, data.password);

            // Handle save info
            if (saveInfo) {
                localStorage.setItem('savedCompanyCode', data.companyCode);
                localStorage.setItem('savedEmployeeId', data.employeeId);
            } else {
                localStorage.removeItem('savedCompanyCode');
                localStorage.removeItem('savedEmployeeId');
            }

            toast({
                title: "로그인 성공",
                description: "환영합니다!",
            });
            navigate("/")
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "로그인 실패",
                description: "회사코드, 사번 또는 비밀번호를 확인해주세요."
            });
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">CMMS 로그인</CardTitle>
                    <CardDescription className="text-center">
                        시스템 접속을 위해 정보를 입력해주세요.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="companyCode">회사 코드</Label>
                            <Input
                                id="companyCode"
                                placeholder="예: 1000"
                                {...register("companyCode")}
                            />
                            {errors.companyCode && (
                                <p className="text-sm text-red-500">{errors.companyCode.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="employeeId">사번</Label>
                            <Input
                                id="employeeId"
                                placeholder="예: 20230001"
                                {...register("employeeId")}
                            />
                            {errors.employeeId && (
                                <p className="text-sm text-red-500">{errors.employeeId.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">비밀번호</Label>
                            <Input
                                id="password"
                                type="password"
                                {...register("password")}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-500">{errors.password.message}</p>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="saveInfo"
                                checked={saveInfo}
                                onCheckedChange={(checked) => setSaveInfo(checked as boolean)}
                            />
                            <Label
                                htmlFor="saveInfo"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                사용자 정보 저장
                            </Label>
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "로그인 중..." : "로그인"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center text-sm text-slate-500">
                    Hankook Plant Service CMMS
                </CardFooter>
            </Card>
        </div>
    )
}
