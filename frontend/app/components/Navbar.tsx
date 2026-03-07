export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-10 py-5 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="text-2xl font-black tracking-tighter text-blue-600">
        GOLDEN <span className="text-zinc-800">REF.</span>
      </div>
      <div className="hidden md:flex gap-8 font-medium text-zinc-600">
        <a href="#" className="hover:text-blue-600 transition">Buy Products</a>
        <a href="#" className="hover:text-blue-600 transition">AI Diagnosis</a>
        <a href="#" className="hover:text-blue-600 transition">Book Service</a>
      </div>
      <div className="flex gap-4">
        <button className="px-5 py-2 rounded-full font-medium text-zinc-700 hover:bg-zinc-100 transition">Login</button>
        <button className="px-5 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 shadow-lg shadow-blue-200 transition">Get Started</button>
      </div>
    </nav>
  );
}
