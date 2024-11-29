import Header from "@/components/layout/header";

export default function ChatHistoryLayout({ children }) {
  return (
    <main>
      <Header />
      {children}
    </main>
  );
}
