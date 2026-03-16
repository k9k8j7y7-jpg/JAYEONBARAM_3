export default function NoticePage() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-secondary/30">
      <div className="flex-grow pt-40 pb-20 px-6 max-w-7xl mx-auto w-full">
        <div className="space-y-4">
          <h1 className="text-4xl font-serif font-bold text-brand-primary">공지사항</h1>
          <div className="h-px w-12 bg-brand-primary/20" />
        </div>
        
        {/* Empty Content Area */}
        <div className="mt-20 flex items-center justify-center text-gray-400 font-light tracking-widest text-sm uppercase">
          No notices available yet
        </div>
      </div>
    </div>
  );
}
