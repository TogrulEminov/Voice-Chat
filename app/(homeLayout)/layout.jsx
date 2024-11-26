import Header from "@/components/layout/header";

export default function HomeLayout({ children }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
