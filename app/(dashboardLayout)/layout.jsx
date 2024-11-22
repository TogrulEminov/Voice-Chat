import Header from "@/components/layout/header";

export default function DashboardLayout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  );
}
