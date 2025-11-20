import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Register() {
  const { register } = useContext(AuthContext);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    await register(form);
    window.location.href = "/login";
  }

  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <h2 className="text-3xl font-bold mb-6">Registro</h2>

      <form className="flex flex-col gap-4 w-80" onSubmit={handleSubmit}>
        <input
          name="name"
          onChange={handleChange}
          className="bg-neutral-900 border border-neutral-700 p-3 rounded"
          placeholder="Nombre completo"
        />

        <input
          name="email"
          onChange={handleChange}
          className="bg-neutral-900 border border-neutral-700 p-3 rounded"
          placeholder="Correo institucional"
        />

        <input
          type="password"
          name="password"
          onChange={handleChange}
          className="bg-neutral-900 border border-neutral-700 p-3 rounded"
          placeholder="Contraseña"
        />

        <button className="bg-white text-black p-3 rounded font-medium">
          Crear cuenta
        </button>
      </form>

      <a href="/login" className="text-gray-400 text-sm mt-4">
        ¿Ya tienes cuenta? Inicia sesión
      </a>
    </div>
  );
}
