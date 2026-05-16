import { Navbar } from "@/components/Navbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] selection:bg-[#FBDA00] selection:text-black">
      {children}
    </div>
  );
}
