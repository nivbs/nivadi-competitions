import { Die } from "@/components/board/Die";

export default function AppLoading() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-16" role="status" aria-busy="true">
      <div className="flex gap-3" dir="ltr">
        <Die face={6} size={44} className="animate-bounce" style={{ animationDuration: "1.1s" }} />
        <Die face={5} size={44} className="animate-bounce" style={{ animationDuration: "1.1s", animationDelay: "0.15s" }} />
      </div>
    </div>
  );
}
