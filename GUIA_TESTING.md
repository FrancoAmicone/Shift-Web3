# 🧪 Guía de Testing - Verificación de Cambios

## ✅ Checklist de Pruebas

### Test 1: Carga Inicial
**Objetivo**: Verificar que no se abre MetaMask al cargar la página

1. **Cerrar sesión** (si estás conectado) haciendo clic en "Desconectar"
2. **Recargar la página** (F5 o Cmd+R)
3. **Verificar**:
   - ✅ La página carga normalmente
   - ✅ NO se abre MetaMask automáticamente
   - ✅ Se muestra el Hero con el botón "Conectar MetaMask"

**Resultado esperado**: ✅ Navegación libre sin interrupciones

---

### Test 2: Restauración de Conexión Previa
**Objetivo**: Verificar que restaura la conexión sin abrir MetaMask

1. **Conectar la wallet** (hacer clic en "Conectar MetaMask")
2. **Aprobar** la conexión en MetaMask
3. **Recargar la página** (F5 o Cmd+R)
4. **Verificar**:
   - ✅ La conexión se restaura automáticamente
   - ✅ NO se abre MetaMask
   - ✅ Aparece la interfaz conectada con tu dirección

**Resultado esperado**: ✅ Conexión restaurada silenciosamente

---

### Test 3: Conexión Nueva
**Objetivo**: Verificar el flujo de conexión desde cero

1. **Borrar localStorage** (Consola → `localStorage.clear()`)
2. **Recargar la página**
3. **Hacer clic** en "Conectar MetaMask"
4. **Verificar**:
   - ✅ Se abre MetaMask (solo ahora)
   - ✅ Puedes aprobar o rechazar
   - ✅ Si apruebas, se conecta correctamente

**Resultado esperado**: ✅ Control total del usuario

---

### Test 4: Red Incorrecta
**Objetivo**: Verificar el comportamiento en red incorrecta

1. **Cambiar MetaMask a otra red** (ej: Mainnet)
2. **Conectar la wallet**
3. **Verificar**:
   - ⚠️ Aparece aviso amarillo "Red incorrecta"
   - 🔘 Aparece botón "Cambiar a Sepolia"
   - ✅ NO se abre MetaMask automáticamente
   - ✅ Puedes usar la app (aunque se recomienda cambiar)

**Resultado esperado**: ✅ Aviso claro sin acciones automáticas

---

### Test 5: Cambio Manual de Red
**Objetivo**: Verificar que el cambio de red NO recarga la página

1. **Conectar con red incorrecta** (como en Test 4)
2. **Hacer clic** en "Cambiar a Sepolia"
3. **Aprobar** el cambio en MetaMask
4. **Verificar**:
   - ✅ La página NO se recarga
   - ✅ El aviso amarillo desaparece
   - ✅ Aparece aviso verde "Conectado a Sepolia Testnet"
   - ✅ Los datos se actualizan automáticamente

**Resultado esperado**: ✅ Cambio fluido sin recarga

---

### Test 6: Cambio de Red desde MetaMask
**Objetivo**: Verificar que la UI reacciona a cambios externos

1. **Conectar con Sepolia**
2. **Desde MetaMask**, cambiar a otra red (ej: Mainnet)
3. **Verificar**:
   - ✅ La página NO se recarga
   - ⚠️ Aparece aviso amarillo automáticamente
   - ✅ Los componentes se actualizan

4. **Desde MetaMask**, volver a Sepolia
5. **Verificar**:
   - ✅ La página NO se recarga
   - ✅ El aviso amarillo desaparece
   - ✅ Aparece aviso verde

**Resultado esperado**: ✅ UI reactiva sin recargas

---

### Test 7: Rechazo de Cambio de Red
**Objetivo**: Verificar el manejo de rechazo del usuario

1. **Conectar con red incorrecta**
2. **Hacer clic** en "Cambiar a Sepolia"
3. **Rechazar** el cambio en MetaMask
4. **Verificar**:
   - ✅ La página NO se recarga
   - ✅ Se mantiene el aviso amarillo
   - ✅ Puedes intentarlo de nuevo
   - ✅ No aparecen errores molestos

**Resultado esperado**: ✅ Manejo elegante del rechazo

---

### Test 8: Recargas Múltiples
**Objetivo**: Verificar que NO hay loops infinitos

1. **Conectar la wallet**
2. **Cambiar de red varias veces**
3. **Recargar la página múltiples veces**
4. **Verificar**:
   - ✅ Cada recarga es controlada (F5 manual)
   - ✅ NO hay recargas automáticas
   - ✅ NO hay loops infinitos
   - ✅ El comportamiento es consistente

**Resultado esperado**: ✅ Sin recargas automáticas

---

### Test 9: Desconexión
**Objetivo**: Verificar que la desconexión limpia el estado

1. **Conectar la wallet**
2. **Hacer clic** en "Desconectar"
3. **Verificar**:
   - ✅ Vuelve al Hero
   - ✅ Se limpia el localStorage
   - ✅ Puedes conectar de nuevo sin problemas

4. **Recargar la página**
5. **Verificar**:
   - ✅ NO se restaura la conexión
   - ✅ Aparece el Hero

**Resultado esperado**: ✅ Desconexión completa

---

## 🎯 Criterios de Éxito

Para considerar que los cambios funcionan correctamente, TODAS estas afirmaciones deben ser verdaderas:

- [ ] ✅ La página NUNCA se recarga automáticamente
- [ ] ✅ MetaMask solo se abre cuando el usuario hace clic en botones
- [ ] ✅ Puedo navegar en el home sin interrupciones
- [ ] ✅ Los cambios de red se manejan sin recargar la página
- [ ] ✅ Los avisos de red aparecen/desaparecen correctamente
- [ ] ✅ NO hay loops infinitos de recarga
- [ ] ✅ La conexión previa se restaura correctamente
- [ ] ✅ Puedo rechazar acciones sin problemas
- [ ] ✅ La desconexión limpia todo correctamente

## 🐛 Si Encuentras Problemas

### Problema: La página sigue recargándose
**Solución**: 
1. Verificar que los cambios se aplicaron correctamente
2. Revisar la consola del navegador para errores
3. Limpiar caché y localStorage

### Problema: MetaMask se abre solo
**Solución**:
1. Verificar que no hay extensiones de navegador interfiriendo
2. Revisar la consola para ver qué está disparando la apertura
3. Asegurar que no hay otros scripts de Web3

### Problema: Los avisos de red no aparecen
**Solución**:
1. Verificar que estás conectado
2. Revisar la consola para errores de red
3. Asegurar que MetaMask está funcionando correctamente

## 📊 Consola del Navegador

Durante las pruebas, deberías ver estos logs en la consola:

```
✅ Logs Normales:
- "Chain changed, refreshing data..."
- "Network changed in WalletConnect"
- "Already on Sepolia network"

⚠️ Logs de Usuario:
- "User rejected network switch" (si rechazas el cambio)
- "Conexión rechazada por el usuario" (si rechazas la conexión)

❌ NO deberías ver:
- Errores repetitivos
- Mensajes de recarga infinita
- Stack traces grandes
```

## 🎉 Resultado Esperado

Después de completar todos los tests, deberías tener:

1. ✅ Una aplicación que NO se recarga automáticamente
2. ✅ Control total sobre cuándo abrir MetaMask
3. ✅ Navegación fluida en el home
4. ✅ Cambios de red sin interrupciones
5. ✅ Mejor experiencia de usuario

---

**¡Buena suerte con las pruebas!** 🚀

Si todo funciona según lo esperado, estás listo para desplegar a producción.

