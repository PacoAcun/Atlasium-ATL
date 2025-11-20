import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { FiHome, FiCreditCard, FiList, FiUser, FiMenu } from "react-icons/fi";

export default function LayoutResponsive({ children }) {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  // Estado para colapsar sidebar en desktop
  const [collapsed, setCollapsed] = useState(false);

  // Detectar si es móvil
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="h-screen w-screen flex bg-dark text-gray-100 relative">

      {/* ============ SIDEBAR DESKTOP (colapsable) ============ */}
      {!isMobile && (
        <aside
          className={`border-r border-neutral-700 p-6 flex flex-col transition-all duration-300 ${
            collapsed ? "w-20" : "w-60"
          }`}
        >
          {/* Botón para colapsar */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="mb-6 hover:text-white"
          >
            <FiMenu size={22} />
          </button>

          {/* Título (solo si no está colapsado) */}

          {/* NAV */}
          <nav className="flex flex-col gap-4 mt-4">
            <Link to="/dashboard" className="hover:text-white flex items-center gap-3">
              <FiHome size={20} />
              {!collapsed && "Dashboard"}
            </Link>

            <Link to="/wallet" className="hover:text-white flex items-center gap-3">
              <FiCreditCard size={20} />
              {!collapsed && "Wallet"}
            </Link>

            <Link to="/transactions" className="hover:text-white flex items-center gap-3">
              <FiList size={20} />
              {!collapsed && "Transacciones"}
            </Link>

            <Link to="/profile" className="hover:text-white flex items-center gap-3">
              <FiUser size={20} />
              {!collapsed && "Perfil"}
            </Link>
          </nav>

          {/* FOOTER */}
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

      {/* ============ HEADER MÓVIL (vacío) ============ */}
      {isMobile && (
        <header className="fixed top-0 left-0 w-full h-14 bg-dark border-b border-neutral-700"></header>
      )}

      {/* ============ MAIN CONTENT ============ */}
      <main className={`flex-1 overflow-y-auto px-6 py-20 md:p-10`}>
        {children}
      </main>

      {/* ============ MOBILE BOTTOM NAV ============ */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 w-full h-16 bg-dark border-t border-neutral-700 flex justify-around items-center">

          <Link to="/dashboard" className="flex flex-col items-center">
            <FiHome size={22} />
            <span className="text-xs mt-[3px]">Home</span>
          </Link>

          <Link to="/wallet" className="flex flex-col items-center">
            <FiCreditCard size={22} />
            <span className="text-xs mt-[3px]">Wallet</span>
          </Link>

          <Link to="/transactions" className="flex flex-col items-center">
            <FiList size={22} />
            <span className="text-xs mt-[3px]">Trans</span>
          </Link>

          <Link to="/profile" className="flex flex-col items-center">
            <FiUser size={22} />
            <span className="text-xs mt-[3px]">Perfil</span>
          </Link>

        </nav>
      )}
    </div>
  );
}
