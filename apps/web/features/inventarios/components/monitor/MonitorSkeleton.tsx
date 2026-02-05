"use client"

function SkeletonCard() {
  return (
    <div className="bg-zinc-100 rounded-xl p-5 border border-zinc-100 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="bg-zinc-200 rounded-lg h-9 w-9" />
        <div className="h-4 bg-zinc-200 rounded w-24" />
      </div>
      <div className="mt-3 h-8 bg-zinc-200 rounded w-20" />
    </div>
  )
}

function SkeletonSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 pb-2 border-b border-zinc-200">
        <div className="bg-zinc-200 rounded-lg h-9 w-9 animate-pulse" />
        <div className="h-4 bg-zinc-200 rounded w-40 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  )
}

export function MonitorSkeleton() {
  return (
    <div className="space-y-8">
      <SkeletonSection />
      <SkeletonSection />
      <SkeletonSection />
      <SkeletonSection />
    </div>
  )
}
