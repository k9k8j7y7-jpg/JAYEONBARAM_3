import CommunitySidebar from "@/components/layout/CommunitySidebar";
import ReviewWrite from "@/components/community/ReviewWrite";

export default function ReviewWritePage() {
  return (
    <div className="min-h-screen bg-[#fcfcfc] pb-20">
      <div className="max-w-[1240px] mx-auto px-4 md:px-0">
        <div className="flex flex-col md:flex-row pt-10 md:pt-20 gap-10">
          <aside className="w-full md:w-[240px] shrink-0">
            <CommunitySidebar />
          </aside>
          
          <main className="flex-1">
            <ReviewWrite />
          </main>
        </div>
      </div>
    </div>
  );
}
