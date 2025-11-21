import LayoutResponsive from "../layout/LayoutResponsive";

export default function Profile() {
  return (
    <LayoutResponsive>
      <h1 className="text-3xl font-bold">Perfil</h1>
      <p className="text-gray-400 mt-2">Aquí aparecerá tu informacion en Atlasium.</p>

      <button
        onClick={logout}
        className="text-red-500 hover:text-red-400 text-sm"
      >
        Cerrar sesión
      </button>
    </LayoutResponsive>
  );
}
