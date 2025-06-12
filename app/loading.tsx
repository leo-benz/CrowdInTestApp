import { Skeleton } from '@/components/ui/skeleton';

/**
 * Global loading page for Next.js App Router.
 * This will be shown while pages are loading.
 */
export default function Loading() {
  return (
    <div className="bg-background text-foreground relative flex min-h-screen flex-col items-center">
      <div className="flex h-screen w-full items-center justify-center">
        <div className="relative flex w-full max-w-4xl flex-col items-center justify-center px-4">
          {/* Header Section Skeleton */}
          <div className="relative z-10 flex w-full flex-col items-center border-b pb-20 text-center">
            <div className="mb-16">
              <Skeleton className="h-[54px] w-[180px]" />
            </div>

            <div className="w-full max-w-2xl space-y-6">
              <Skeleton className="h-12 w-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="mx-auto h-6 w-4/5" />
                <Skeleton className="mx-auto h-6 w-3/4" />
              </div>
            </div>

            <div className="mt-16 flex flex-col gap-4 sm:flex-row">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>

          {/* Content Section Skeleton */}
          <section className="flex w-full max-w-4xl flex-col items-center px-4 py-24 text-center">
            <div className="w-full space-y-6">
              <Skeleton className="mx-auto h-10 w-3/4" />
              <div className="mx-auto max-w-2xl space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="mx-auto h-5 w-5/6" />
              </div>
            </div>

            <div className="mt-12 flex w-full max-w-xl flex-col items-center gap-3 sm:flex-row">
              <div className="flex w-full flex-grow items-center">
                <Skeleton className="h-10 flex-grow rounded-r-none" />
                <Skeleton className="h-10 w-10 rounded-l-none" />
              </div>
              <Skeleton className="h-10 w-full sm:w-32" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
