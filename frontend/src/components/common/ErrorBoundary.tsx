import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
          <div className="mb-6 rounded-full bg-red-100 p-4 text-red-600">
            <AlertTriangle size={48} />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-slate-900">문제가 발생했습니다.</h1>
          <p className="mb-8 max-w-md text-slate-500">
            애플리케이션 실행 중 예기치 못한 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.
          </p>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              <RotateCcw size={16} /> 페이지 새로고침
            </Button>
            <Button
              onClick={() => (window.location.href = "/")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              홈으로 이동
            </Button>
          </div>
          {import.meta.env.DEV && (
            <div className="mt-10 max-w-2xl overflow-auto rounded-lg bg-slate-100 p-4 text-left text-xs text-red-800">
              <p className="font-bold">Error: {this.state.error?.message}</p>
              <pre className="mt-2">{this.state.error?.stack}</pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
