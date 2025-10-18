# 🚀 Shift Token Web3

Un proyecto educativo completo de blockchain que integra dos smart contracts interconectados con un frontend moderno en Next.js, permitiendo a los usuarios gestionar tokens SHIFT y participar en un muro descentralizado público en Sepolia Testnet.

## 🎯 Características

### 💰 Gestión de Tokens
- **Conexión de Wallet**: Conecta tu MetaMask y cambia automáticamente a Sepolia Testnet
- **Balance de Tokens**: Consulta tu balance de tokens SHIFT en tiempo real
- **Faucet de Tokens**: Reclama tokens gratuitos cada 24 horas
- **Transferencias**: Envía tokens a otras direcciones de Ethereum

### 🧱 Muro Descentralizado (ShiftWall)
- **Publicación de Mensajes**: Publica mensajes pagando 1 SHIFT por mensaje
- **Lectura Pública**: Visualiza todos los mensajes sin necesidad de conectar wallet
- **Aprobación de Tokens**: Sistema de approve() para autorizar gastos
- **Actualización Automática**: El muro se actualiza cada 10 segundos

### 🎨 Interfaz Moderna
- **Diseño Glass Morphism**: UI moderna con efectos de vidrio y gradientes
- **Animaciones Fluidas**: Transiciones suaves con Framer Motion
- **Responsive**: Diseño adaptable a todos los dispositivos
- **Feedback en Tiempo Real**: Seguimiento de transacciones con enlaces a Etherscan

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 15, TypeScript, React 19
- **Web3**: ethers.js v6
- **Animaciones**: Framer Motion
- **Estilos**: TailwindCSS v4 con Glass Morphism
- **Blockchain**: Ethereum Sepolia Testnet
- **Smart Contracts**: 
  - ShiftERC20: Token ERC-20 con faucet
  - ShiftWall: Muro descentralizado con sistema de pagos

## 🚀 Instalación y Configuración

### 1. Clonar e instalar dependencias

```bash
git clone <tu-repo>
cd shift-web3
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# ShiftERC20 Token Contract
NEXT_PUBLIC_CONTRACT_ADDRESS=0xa9283EDBf026689A5f5B6DF4c318E7b1934f5655

# ShiftWall Contract
NEXT_PUBLIC_WALL_CONTRACT_ADDRESS=0xcb2D4C1912a160A4097D9C4F988C7a8D1233c58c

# RPC URL para Sepolia (opcional)
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
```

### 3. Ejecutar el proyecto

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📋 Smart Contracts

### 🪙 ShiftERC20 Token Contract

Dirección en Sepolia: `0xa9283EDBf026689A5f5B6DF4c318E7b1934f5655`

Token ERC-20 con funcionalidad de faucet integrada.

**Funciones Principales:**
- `claim()`: Reclama tokens del faucet (una vez cada 24 horas)
- `transfer(address to, uint256 amount)`: Transfiere tokens
- `balanceOf(address account)`: Consulta balance de una dirección
- `FAUCET_AMOUNT()`: Cantidad de tokens por reclamación (100 SHIFT)
- `CLAIM_INTERVAL()`: Tiempo de espera entre reclamaciones (24 horas)
- `lastClaimed(address user)`: Última vez que un usuario reclamó tokens

**Eventos:**
- `Transfer`: Emitido en cada transferencia
- `Claimed`: Emitido cuando se reclaman tokens del faucet

### 🧱 ShiftWall Contract

Dirección en Sepolia: `0xcb2D4C1912a160A4097D9C4F988C7a8D1233c58c`

Muro descentralizado donde los usuarios pueden publicar mensajes pagando con tokens SHIFT.

**Funciones Principales:**
- `postMessage(string content)`: Publica un mensaje (costo: 1 SHIFT)
- `getMessage(uint256 index)`: Obtiene un mensaje específico
- `getMessageCount()`: Retorna el número total de mensajes
- `postCost()`: Retorna el costo de publicar un mensaje
- `shiftToken()`: Dirección del token SHIFT usado

**Eventos:**
- `MessagePosted`: Emitido cuando se publica un mensaje (sender, content, timestamp)

**Flujo de Interacción:**
1. Usuario aprueba que ShiftWall gaste sus tokens: `approve(ShiftWall, amount)`
2. Usuario publica mensaje: `postMessage("Hola mundo 🌍")`
3. El contrato transfiere 1 SHIFT del usuario y guarda el mensaje
4. El mensaje queda visible públicamente en la blockchain

## 🏗️ Estructura del Proyecto

```
src/
├── app/
│   ├── layout.tsx          # Layout principal con metadata
│   ├── page.tsx            # Página principal con routing público/privado
│   └── globals.css         # Estilos globales + Glass Morphism
├── components/
│   ├── AnimatedBackground.tsx  # Fondo animado con gradientes
│   ├── Hero.tsx                # Página de bienvenida
│   ├── WalletConnect.tsx       # Conexión de wallet
│   ├── Balance.tsx             # Mostrar balance
│   ├── ClaimButton.tsx         # Botón para reclamar tokens
│   ├── TransferForm.tsx        # Formulario de transferencia
│   ├── Wall.tsx                # Muro público de mensajes
│   └── PostMessageForm.tsx     # Formulario para publicar mensajes
├── lib/
│   ├── ethers.ts          # Utilidades de ethers.js
│   ├── contract.ts        # Funciones del contrato ShiftERC20
│   └── wall.ts            # Funciones del contrato ShiftWall
├── constants/
│   ├── contract.ts        # Constantes de ambos contratos
│   ├── abi.json          # ABI del ShiftERC20
│   └── wall-abi.json     # ABI del ShiftWall
└── types/
    └── index.ts          # Tipos TypeScript (WallMessage, etc.)
```

## 🔧 Funcionalidades Implementadas

### 1. Conexión de Wallet
- Detección automática de MetaMask
- Cambio automático a Sepolia Testnet
- Manejo de cambios de cuenta y red
- Indicadores visuales de estado de conexión

### 2. Balance de Tokens
- Consulta en tiempo real del balance
- Información detallada del token (nombre, símbolo, decimales)
- Botón de actualización manual
- Formato amigable de números

### 3. Faucet de Tokens
- Verificación de elegibilidad para reclamar
- Countdown en tiempo real hasta la próxima reclamación
- Feedback de transacciones con enlaces a Etherscan
- Manejo de errores específicos del contrato

### 4. Transferencias
- Validación de direcciones Ethereum
- Validación de cantidades
- Prevención de auto-transferencias
- Feedback detallado de transacciones

## 🌐 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en el dashboard de Vercel
3. Despliega automáticamente

### Otros Proveedores

El proyecto es compatible con cualquier proveedor que soporte Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

## 🔍 Testing

Para probar la aplicación necesitas:

1. **MetaMask instalado** en tu navegador
2. **ETH de Sepolia** para gas (puedes obtenerlo de faucets como:
   - [Sepolia Faucet](https://sepoliafaucet.com/)
   - [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
3. **Contrato desplegado** en Sepolia Testnet

## 📚 Recursos Adicionales

- [Documentación de ethers.js](https://docs.ethers.org/v6/)
- [Documentación de Next.js](https://nextjs.org/docs)
- [Sepolia Testnet Explorer](https://sepolia.etherscan.io/)
- [MetaMask Documentation](https://docs.metamask.io/)

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🎓 Objetivos de Aprendizaje

Este proyecto te ayuda a aprender:

- ✅ Desarrollo de tokens ERC-20 personalizados
- ✅ Integración de smart contracts con frontend Web3
- ✅ Manejo de transacciones y eventos en Ethereum
- ✅ Uso de ethers.js para interacciones blockchain
- ✅ Desarrollo de DApps modernas con Next.js
- ✅ Manejo de estados de wallet y red
- ✅ UX/UI para aplicaciones Web3

---

**¡Disfruta construyendo en Web3 gracias! 🚀**
