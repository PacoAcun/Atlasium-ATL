import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiCreditCard,
  FiList,
  FiUser,
  FiMenu,
  FiCamera,
  FiRefreshCw,
} from "react-icons/fi";

export default function LayoutResponsive({ children }) {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="h-screen w-screen flex bg-dark text-gray-100 relative">

      {/* ============ SIDEBAR DESKTOP ============ */}
      {!isMobile && (
        <aside
          className={`border-r border-neutral-700 p-6 flex flex-col transition-all duration-300 bg-dark ${
            collapsed ? "w-20" : "w-60"
          }`}
        >
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="mb-6 hover:text-white"
          >
            <FiMenu size={22} />
          </button>

          <nav className="flex flex-col gap-4 mt-4">
            <Link to="/dashboard" className="hover:text-white flex items-center gap-3">
              <FiHome size={20} />
              {!collapsed && "Dashboard"}
            </Link>

            <Link to="/wallet" className="hover:text-white flex items-center gap-3">
              <FiCreditCard size={20} />
              {!collapsed && "Wallet"}
            </Link>

            <Link to="/history" className="hover:text-white flex items-center gap-3">
              <FiList size={20} />
              {!collapsed && "Historial"}
            </Link>

            <Link to="/topup" className="hover:text-white flex items-center gap-3">
              <FiRefreshCw size={20} />
              {!collapsed && "Recargar"}
            </Link>

            <Link to="/scan" className="hover:text-white flex items-center gap-3">
              <FiCamera size={20} />
              {!collapsed && "Pagar"}
            </Link>
          </nav>

          {!collapsed && (
            <div className="mt-auto">
              <p className="text-gray-500 text-sm mb-2">{user?.email}</p>
              <button
                onClick={logout}
                className="text-red-500 hover:text-red-400 text-sm"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </aside>
      )}

      {/* ============ HEADER MÓVIL ============ */}
      {isMobile && (
        <header className="fixed top-0 left-0 w-full h-14 bg-dark z-50 border-b border-neutral-700 flex items-center px-4 shadow-md">
          <Link to="/profile" className="flex items-center gap-2 text-gray-400 hover:text-white">
            <FiUser size={20} />
            <span className="text-xs">Perfil</span>
          </Link>
        </header>
      )}

      {/* ============ MAIN CONTENT ============ */}
      <main
        className={`
          flex-1 overflow-y-auto px-6
          ${isMobile ? "pt-16 pb-32" : "py-10"}
        `}
      >
        {children}
      </main>

      {/* ============ BOTTOM NAV MÓVIL ============ */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 w-full h-16 bg-dark z-50 border-t border-neutral-700 flex justify-around items-center shadow-lg">
          <Link to="/dashboard" className="flex flex-col items-center text-gray-400 hover:text-white">
            <FiHome size={20} />
            <span className="text-[10px] mt-1">Home</span>
          </Link>

          <Link to="/wallet" className="flex flex-col items-center text-gray-400 hover:text-white">
            <FiCreditCard size={20} />
            <span className="text-[10px] mt-1">Wallet</span>
          </Link>

          <Link to="/history" className="flex flex-col items-center text-gray-400 hover:text-white">
            <FiList size={20} />
            <span className="text-[10px] mt-1">Historial</span>
          </Link>

          <Link to="/topup" className="flex flex-col items-center text-gray-400 hover:text-white">
            <FiRefreshCw size={20} />
            <span className="text-[10px] mt-1">Recargar</span>
          </Link>

          <Link to="/scan" className="flex flex-col items-center text-gray-400 hover:text-white">
            <FiCamera size={20} />
            <span className="text-[10px] mt-1">Pagar</span>
          </Link>
        </nav>
      )}
    </div>
  );
}
