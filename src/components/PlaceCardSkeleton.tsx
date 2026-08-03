export default function PlaceCardSkeleton() {
  return (
    <div className="bg-white border border-slate-150 rounded-[28px] overflow-hidden shadow-sm h-full flex flex-col justify-between p-5 animate-pulse gap-3.5">
      <div className="w-full h-44 bg-slate-100 rounded-[20px] shrink-0"></div>
      <div className="flex flex-col gap-2">
        <div className="w-2/3 h-5 bg-slate-100 rounded-md"></div>
        <div className="w-5/6 h-3 bg-slate-100 rounded-md"></div>
        <div className="w-1/3 h-3 bg-slate-100 rounded-md"></div>
      </div>
      <div className="flex gap-2 items-center mt-2">
        <div className="w-1/2 h-9 bg-slate-100 rounded-full"></div>
        <div className="w-1/2 h-9 bg-slate-100 rounded-full"></div>
      </div>
    </div>
  );
}
