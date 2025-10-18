# 🚀 Shift Token Web3

Un proyecto completo de blockchain que combina un token ERC-20 personalizado con un frontend interactivo en Next.js, permitiendo a los usuarios interactuar con el token SHIFT en Sepolia Testnet.

## 🎯 Características

- **Conexión de Wallet**: Conecta tu MetaMask y cambia automáticamente a Sepolia Testnet
- **Balance de Tokens**: Consulta tu balance de tokens SHIFT en tiempo real
- **Faucet de Tokens**: Reclama tokens gratuitos cada 24 horas
- **Transferencias**: Envía tokens a otras direcciones de Ethereum
- **Interfaz Moderna**: UI responsive construida con TailwindCSS
- **Feedback en Tiempo Real**: Seguimiento de transacciones con enlaces a Etherscan

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 15, TypeScript, React 19
- **Web3**: ethers.js v6
- **Estilos**: TailwindCSS v4
- **Blockchain**: Ethereum Sepolia Testnet
- **Smart Contract**: ERC-20 con funcionalidad de faucet

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
# Dirección de tu contrato desplegado en Sepolia
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...

# RPC URL para Sepolia (opcional)
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
```

### 3. Ejecutar el proyecto

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📋 Smart Contract

El contrato `ShiftERC20` incluye las siguientes funcionalidades:

### Funciones Principales

- `claim()`: Reclama tokens del faucet (una vez cada 24 horas)
- `transfer(address to, uint256 amount)`: Transfiere tokens
- `balanceOf(address account)`: Consulta balance de una dirección
- `FAUCET_AMOUNT()`: Cantidad de tokens por reclamación
- `CLAIM_INTERVAL()`: Tiempo de espera entre reclamaciones
- `lastClaimed(address user)`: Última vez que un usuario reclamó tokens

### Eventos

- `Transfer`: Emitido en cada transferencia
- `Claimed`: Emitido cuando se reclaman tokens del faucet

## 🏗️ Estructura del Proyecto

```
src/
├── app/
│   ├── layout.tsx          # Layout principal con metadata
│   ├── page.tsx            # Página principal
│   └── globals.css         # Estilos globales
├── components/
│   ├── WalletConnect.tsx   # Conexión de wallet
│   ├── Balance.tsx         # Mostrar balance
│   ├── ClaimButton.tsx     # Botón para reclamar tokens
│   └── TransferForm.tsx    # Formulario de transferencia
├── lib/
│   ├── ethers.ts          # Utilidades de ethers.js
│   └── contract.ts        # Funciones del contrato
├── constants/
│   ├── contract.ts        # Constantes del contrato
│   └── abi.json          # ABI del contrato
└── types/
    └── index.ts          # Tipos TypeScript
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
