export default function Button({
  children,
  onClick,
  type = "button",
  className = "",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`p-2 text-white font-semibold rounded-lg shadow-md  transition ease-in-out duration-400 transform hover:scale-105 ${className}`}
    >
      {children}
    </button>
  );
}
