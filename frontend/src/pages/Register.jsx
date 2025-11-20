export default function Register() {
  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <h2 className="text-3xl font-bold mb-6">Registro</h2>

      <form className="flex flex-col gap-4 w-80">
        <input className="bg-neutral-900 border border-neutral-700 p-3 rounded" placeholder="Nombre completo" />
        <input className="bg-neutral-900 border border-neutral-700 p-3 rounded" placeholder="Carne / ID" />
        <input className="bg-neutral-900 border border-neutral-700 p-3 rounded" placeholder="Correo institucional" />
        <input type="password" className="bg-neutral-900 border border-neutral-700 p-3 rounded" placeholder="Contraseña" />
        <button className="bg-white text-black p-3 rounded font-medium">Crear cuenta</button>
      </form>

      <a href="/login" className="text-gray-400 text-sm mt-4">¿Ya tienes cuenta? Inicia sesión</a>
    </div>
  );
}
