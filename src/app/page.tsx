import Form from "@/app/components/ui/form";
import { Card } from "antd";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-0 sm:p-0 font-[family-name:var(--font-geist-sans)]">
      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center px-4">
        <Card
          className="w-full max-w-xl shadow-xl border-0 rounded-2xl transition-transform duration-300 hover:shadow-2xl bg-white/90 backdrop-blur-md animate-fade-in"
          style={{ padding: 32 }}
        >
          <Form />
        </Card>
      </main>
      {/* Footer */}
      <footer className="w-full text-center py-4 text-xs text-gray-400 animate-fade-in">
        &copy; {new Date().getFullYear()} Aulia El Ihza Fariz Rafiqi. Dibuat dengan <span className="text-pink-500">&#10084;</span> menggunakan Next.js, Ant Design, dan Tailwind CSS.
      </footer>
    </div>
  );
}
