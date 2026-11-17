import { App } from "@/proto/App";
import { ErrorBoundary, GlobalErrors } from "@/proto/ErrorBoundary";

export default function Page() {
  return (
    <ErrorBoundary>
      <App />
      <GlobalErrors />
    </ErrorBoundary>
  );
}
