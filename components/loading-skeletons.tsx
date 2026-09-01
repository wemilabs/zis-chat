import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const historyWidths = ["w-36", "w-28", "w-40", "w-32", "w-24"];
const messageWidths = ["w-2/3", "w-5/6", "w-1/2"];

function SidebarSkeleton() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r md:flex">
      <div className="p-2">
        <Skeleton className="h-8 w-full" />
      </div>
      <Separator />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Skeleton className="h-3 w-14" />
        {historyWidths.map((width) => (
          <Skeleton key={width} className={`h-5 ${width}`} />
        ))}
      </div>
      <div className="p-2">
        <Skeleton className="h-12 w-full" />
      </div>
    </aside>
  );
}

function ContentFrame({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-0 min-w-0 flex-1 flex-col">
      <Skeleton className="absolute top-3 left-3 size-7" />
      {children}
    </main>
  );
}

export function HomeSkeleton() {
  return (
    <div className="flex min-h-svh">
      <SidebarSkeleton />
      <ContentFrame>
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="flex w-full max-w-md flex-col items-center gap-4">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-72" />
            <div className="flex flex-wrap justify-center gap-2">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-28" />
            </div>
          </div>
        </div>
        <div className="mx-auto w-full max-w-2xl px-6 pb-6">
          <Skeleton className="h-24 w-full rounded-3xl" />
        </div>
      </ContentFrame>
    </div>
  );
}

export function SavedChatSkeleton() {
  return (
    <div className="flex min-h-svh">
      <SidebarSkeleton />
      <ContentFrame>
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-8">
          {messageWidths.map((width, index) => (
            <div
              key={width}
              className={index % 2 === 0 ? "flex justify-end" : "flex"}
            >
              <Skeleton className={`h-16 ${width}`} />
            </div>
          ))}
        </div>
        <div className="mx-auto w-full max-w-2xl px-6 pb-6">
          <Skeleton className="h-24 w-full rounded-3xl" />
        </div>
      </ContentFrame>
    </div>
  );
}
