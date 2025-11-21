import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Register() {
  const { signUp, verifyOtp, completeRegistration } = useContext(AuthContext);
  const [step, setStep] = useState(1); // 1: Form, 2: OTP
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    carnet: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleRegister(e) {
    e.preventDefault();
    
    // Validations
    if (!form.email.endsWith("@ufm.edu")) {
      alert("El correo debe ser institucional (@ufm.edu)");
      return;
    }
    if (form.carnet.length !== 8 || isNaN(form.carnet)) {
      alert("El carnet debe tener 8 dígitos numéricos");
      return;
    }
    if (form.password !== form.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }
    if (form.password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      await signUp(form.email, form.password, {
        name: form.name,
        carnet: form.carnet
      });
      setStep(2);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Verify OTP
      await verifyOtp(form.email, otp);
      
      // 2. Complete Registration (Create Wallet)
      await completeRegistration();
      
      // 3. Redirect
      window.location.href = "/dashboard";
    } catch (error) {
      alert("Error de verificación: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <h2 className="text-3xl font-bold mb-6">
        {step === 1 ? "Registro" : "Verificar Email"}
      </h2>

      {step === 1 ? (
        <form className="flex flex-col gap-4 w-80" onSubmit={handleRegister}>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="bg-neutral-900 border border-neutral-700 p-3 rounded text-white"
            placeholder="Nombre completo"
            required
          />

          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="bg-neutral-900 border border-neutral-700 p-3 rounded text-white"
            placeholder="Correo UFM (@ufm.edu)"
            required
          />

          <input
            name="carnet"
            value={form.carnet}
            onChange={handleChange}
            className="bg-neutral-900 border border-neutral-700 p-3 rounded text-white"
            placeholder="Carnet (8 dígitos)"
            maxLength={8}
            required
          />

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="bg-neutral-900 border border-neutral-700 p-3 rounded text-white"
            placeholder="Contraseña"
            required
          />

          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            className="bg-neutral-900 border border-neutral-700 p-3 rounded text-white"
            placeholder="Confirmar Contraseña"
            required
          />

          <button 
            disabled={loading}
            className="bg-white text-black p-3 rounded font-medium hover:bg-gray-200 disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Siguiente"}
          </button>
        </form>
      ) : (
        <form className="flex flex-col gap-4 w-80" onSubmit={handleVerify}>
          <p className="text-gray-400 text-center text-sm mb-2">
            Hemos enviado un código de verificación a {form.email}
          </p>
          
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="bg-neutral-900 border border-neutral-700 p-3 rounded text-white text-center text-2xl tracking-widest"
            placeholder="00000000"
            maxLength={8}
            required
          />

          <button 
            disabled={loading}
            className="bg-white text-black p-3 rounded font-medium hover:bg-gray-200 disabled:opacity-50"
          >
            {loading ? "Verificando..." : "Verificar y Crear Cuenta"}
          </button>
          
          <button 
            type="button"
            onClick={() => setStep(1)}
            className="text-gray-500 text-sm hover:text-white"
          >
            Volver
          </button>
        </form>
      )}

      <a href="/login" className="text-gray-400 text-sm mt-4">
        ¿Ya tienes cuenta? Inicia sesión
      </a>
    </div>
  );
}
