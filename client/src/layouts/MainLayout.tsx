import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="pt-28">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;