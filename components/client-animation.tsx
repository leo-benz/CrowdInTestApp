'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const MotionDiv = dynamic(
  () => import('framer-motion').then(mod => ({ default: mod.motion.div })),
  {
    ssr: false,
    loading: () => <AnimationSkeleton />,
  }
);

const AnimationSkeleton = () => (
  <div className="relative flex flex-col items-center justify-center opacity-50">
    {/* Header Section Skeleton */}
    <div className="relative z-10 mb-24 flex w-full flex-col items-center border-b pb-20 text-center">
      <div className="mb-16">
        <Skeleton className="h-[54px] w-[180px]" />
      </div>

      <div className="w-full max-w-2xl space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="mx-auto h-6 w-4/5" />
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
);

interface ClientAnimationProps {
  children: React.ReactNode;
  className?: string;
}

export const ClientAnimation: React.FC<ClientAnimationProps> = ({ children, className }) => {
  return (
    <Suspense fallback={<AnimationSkeleton />}>
      <MotionDiv
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: 'easeInOut',
        }}
        className={className}
      >
        {children}
      </MotionDiv>
    </Suspense>
  );
};
