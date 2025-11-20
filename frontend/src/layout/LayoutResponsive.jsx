import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { FiHome, FiCreditCard, FiList, FiUser } from "react-icons/fi";

export default function LayoutResponsive({ children }) {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const isMobile = window.innerWidth < 768;

  return (
    <div className="h-screen w-screen flex bg-black text-gray-100 relative">

      {/* ============ DESKTOP SIDEBAR ============ */}
      {!isMobile && (
        <aside className="w-60 border-r border-neutral-800 p-6 flex flex-col">
          <h1 className="text-2xl font-bold mb-8">Atlasium</h1>

          <nav className="flex flex-col gap-4">
            <Link to="/dashboard" className="hover:text-white">Dashboard</Link>
            <Link to="/wallet" className="hover:text-white">Wallet</Link>
            <Link to="/transactions" className="hover:text-white">Transacciones</Link>
            <Link to="/profile" className="hover:text-white">Perfil</Link>
          </nav>

          <div className="mt-auto">
            <p className="text-gray-500 text-sm mb-2">{user?.email}</p>
            <button onClick={logout} className="text-red-500 hover:text-red-400 text-sm">
              Cerrar sesión
            </button>
          </div>
        </aside>
      )}

      {/* ============ MOBILE HEADER (VACÍO) ============ */}
      {isMobile && (
        <header className="fixed top-0 left-0 w-full h-14 bg-black border-b border-neutral-800"></header>
      )}

      {/* ============ MAIN CONTENT ============ */}
      <main className={`flex-1 overflow-y-auto px-6 py-20 md:p-10`}>
        {children}
      </main>

      {/* ============ MOBILE BOTTOM NAV ============ */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 w-full h-16 bg-black border-t border-neutral-800 flex justify-around items-center">

          {/* Home */}
          <Link to="/dashboard" className="flex flex-col items-center">
            <FiHome size={22} />
            <span className="text-xs mt-1">Home</span>
          </Link>

          {/* Wallet */}
          <Link to="/wallet" className="flex flex-col items-center">
            <FiCreditCard size={22} />
            <span className="text-xs mt-1">Wallet</span>
          </Link>

          {/* Transacciones */}
          <Link to="/transactions" className="flex flex-col items-center">
            <FiList size={22} />
            <span className="text-xs mt-1">Trs</span>
          </Link>

          {/* Perfil */}
          <Link to="/profile" className="flex flex-col items-center">
            <FiUser size={22} />
            <span className="text-xs mt-1">Perfil</span>
          </Link>

        </nav>
      )}
    </div>
  );
}
