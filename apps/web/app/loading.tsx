export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center mb-4">
          <div className="w-12 h-12 border-4 border-[#f84704]/20 border-t-[#f84704] rounded-full animate-spin" />
        </div>
        <p className="text-gray-600 text-lg">Carregando...</p>
      </div>
    </div>
  );
}
