import { Navbar } from "@/components/layout/navbar";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{/* Sections will go here */}</main>
    </div>
  );
}
