export default function DestinationCardSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="h-56 bg-slate-200 rounded-[24px] mb-4 relative overflow-hidden shadow-md animate-pulse"></div>
      
      <div className="flex justify-between items-start px-1">
        <div className="flex-1 pr-4">
          <div className="h-5 bg-slate-200 rounded-md mb-2 w-3/4 animate-pulse"></div>
          <div className="h-3 bg-slate-200 rounded-md w-1/2 animate-pulse"></div>
        </div>
        <div className="h-4 bg-slate-200 rounded-md w-10 animate-pulse mt-1"></div>
      </div>
    </div>
  );
}
