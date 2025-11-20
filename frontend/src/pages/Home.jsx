export default function Home() {
  return (
    <div className="h-screen flex flex-col justify-center items-center text-center">
      <h1 className="text-5xl font-bold mb-6">Atlasium</h1>
      <p className="text-gray-400 mb-8">La plataforma oficial para wallets Atlasium.</p>

      <div className="flex gap-4">
        <a href="/login" className="px-6 py-3 bg-white text-black rounded-lg font-medium">Ingresar</a>
        <a href="/register" className="px-6 py-3 border border-gray-500 rounded-lg font-medium">Registrarse</a>
      </div>
    </div>
  );
}
