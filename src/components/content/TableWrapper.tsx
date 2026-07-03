import { WideContent } from "./WideContent";

export function TableWrapper({ children }: { children: React.ReactNode }) {
  return (
    <WideContent className="my-8 overflow-x-auto border border-border bg-surface/60">
      <table className="w-full border-collapse text-sm [&_td]:border-b [&_td]:border-border [&_td]:p-3 [&_td]:text-left [&_th]:border-b [&_th]:border-border [&_th]:p-3 [&_th]:text-left [&_th]:font-mono [&_th]:text-[0.72rem] [&_th]:uppercase [&_th]:text-foreground/58">
        {children}
      </table>
    </WideContent>
  );
}
