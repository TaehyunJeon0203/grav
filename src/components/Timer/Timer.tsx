export const Timer = () => {
  return (
    <div className="mb-8 p-6 bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">타이머</h2>
      <div className="text-4xl font-mono">00:00:00</div>
      <div className="mt-4 space-x-4">
        <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">
          시작
        </button>
        <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded">
          정지
        </button>
      </div>
    </div>
  );
};
