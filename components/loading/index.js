const Loading = () => {
  return (
    <div className="flex bg-white z-[999] items-center justify-center h-screen w-full fixed inset-0">
      <div className="w-16 h-16 border-8 border-dashed rounded-full animate-spin border-gray-900"></div>
    </div>
  );
};

export default Loading;
