# Atlasium-ATL

**Atlasium** es una plataforma de pagos descentralizada para eventos universitarios, construida sobre la blockchain de Ethereum (Sepolia). Permite a los estudiantes pagar entradas, comida y productos utilizando tokens **ATL** mediante códigos QR, eliminando la necesidad de efectivo y colas.

---

## Características Principales

- **Wallet Automática:** Cada usuario recibe una Wallet Ethereum única y encriptada al registrarse.
- **Gas Subsidiado:** El sistema fondea automáticamente las wallets nuevas con ETH (Sepolia) para cubrir las comisiones de transacción.
- **Scan & Pay:** Pagos instantáneos escaneando códigos QR con la cámara del dispositivo.
- **Gestión de Eventos:** Los organizadores pueden crear eventos, invitar staff y generar cobros.
- **Transparencia Total:** Todas las transacciones son verificables en la Blockchain (Etherscan).

---

## Stack Tecnológico

### Frontend (Cliente)

- **React 19 + Vite:** Para una interfaz rápida y reactiva.
- **Tailwind CSS:** Diseño moderno y 100% responsivo (Mobile First).
- **Librerías QR:** `qrcode.react` (Generación) y `@yudiel/react-qr-scanner` (Lectura).

### Backend (Serverless)

- **Supabase:** Base de datos PostgreSQL en tiempo real y Autenticación.
- **Edge Functions (Deno):** Lógica de negocio segura que corre en el borde (Edge). Aquí es donde ocurre la magia de la criptografía.

### Blockchain (Web3)

- **Ethereum Sepolia:** Red de pruebas donde vive el token ATL.
- **Ethers.js v6:** Librería para conectar el backend con la Blockchain.
- **Alchemy:** Proveedor de infraestructura de nodos RPC.

---

## Seguridad y Arquitectura

La seguridad es la prioridad #1 de Atlasium.

1.  **Custodia Segura:** Las llaves privadas de los usuarios se encriptan usando AES-256-GCM antes de guardarse en la base de datos.
2.  **Derivación de Claves:** Usamos PBKDF2 con 100,000 iteraciones para proteger las claves de encriptación contra ataques de fuerza bruta.
3.  **Aislamiento:** La desencriptación de wallets solo ocurre dentro de las Edge Functions por milisegundos para firmar una transacción. La llave privada NUNCA se expone al frontend ni al navegador del usuario.

---

## Flujo de Usuario (User Journey)

1.  **Registro:** El usuario crea su cuenta. El sistema genera su wallet y le envía ETH para gas.
2.  **Top Up (Recarga):** El usuario compra tokens ATL (simulado) usando su tarjeta.
3.  **Scan & Pay:**
    - El usuario escanea el QR de un comercio o amigo.
    - Confirma el monto.
    - La transacción se envía a la blockchain.
4.  **Verificación:** El usuario recibe un Hash de transacción y puede verlo en el explorador de bloques.

---

## API Endpoints (Edge Functions)

Nuestra API es completamente Serverless:

- `POST /register`: Crea usuario y wallet.
- `POST /login`: Autenticación.
- `POST /transfer`: Ejecuta una transferencia de tokens en la blockchain.
- `POST /topup`: Mintea tokens ATL para el usuario.
- `GET /get-transactions`: Obtiene el historial on-chain.
- `POST /create-event`: Crea un nuevo evento.

---

## Instalación y Ejecución

Sigue estos pasos para correr el proyecto localmente:

### Prerrequisitos

- Node.js (v18 o superior)
- NPM

### Pasos

1.  **Clonar el repositorio:**

    ```bash
    git clone https://github.com/tu-usuario/Atlasium-ATL.git
    cd Atlasium-ATL
    ```

2.  **Instalar dependencias del Frontend:**

    ```bash
    cd frontend
    npm install
    ```

3.  **Configurar Variables de Entorno:**

    - Asegúrate de tener el archivo `.env` con las credenciales de Supabase (URL y Anon Key).

4.  **Ejecutar el Frontend:**
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:5173`.

---

## Estructura del Proyecto

El proyecto está organizado de la siguiente manera:

```
Atlasium-ATL/
├── frontend/               # Cliente React (Vite)
│   ├── src/
│   │   ├── components/     # Componentes UI reutilizables
│   │   ├── context/        # Estados globales (Auth, Eventos)
│   │   ├── layout/         # Layouts principales (Responsive)
│   │   ├── lib/            # Configuración de Supabase
│   │   └── pages/          # Vistas principales (Login, Dashboard, etc.)
│   └── package.json
│
├── supabase/               # Backend Serverless
│   ├── functions/          # Edge Functions (API Endpoints)
│   │   ├── register/       # Lógica de registro y creación de wallet
│   │   ├── transfer/       # Lógica de transferencias en blockchain
│   │   └── ...
│   └── migrations/         # Esquemas de base de datos SQL
│
└── README.md               # Documentación
```

---

## Variables de Entorno

Para que el frontend funcione correctamente, necesitas crear un archivo `.env` en la carpeta `frontend/` con las siguientes variables:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

**Nota:** Las claves privadas y secretos de encriptación se configuran directamente en el panel de Supabase (Edge Functions Secrets) y nunca en el código del frontend.
