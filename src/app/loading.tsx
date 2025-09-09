import { Loader2, Award } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="mx-auto flex items-center justify-center w-16 h-16 bg-black rounded-full shadow-lg">
          <Award className="size-8 text-white" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-black">
            KPI Central
          </h2>
          <p className="text-gray-600">Đang tải...</p>
        </div>
        <Loader2 className="h-8 w-8 animate-spin text-black mx-auto" />
      </div>
    </div>
  );
}
