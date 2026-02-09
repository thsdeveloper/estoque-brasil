# Estoque Brasil - Mobile

App mobile para operadores de inventario, otimizado para Zebra MC2200 (tela 4").

## Stack

- Expo SDK 54, React Native 0.81.5, TypeScript
- Scanner: HID keyboard input via TextInput
- Dark theme para uso em galpao

## Pre-requisitos

- Node.js 20+
- Android SDK (no WSL2, usar o SDK do Windows)
- Device conectado via ADB

### WSL2 + Windows Android SDK

```bash
# Configurar SDK path
export ANDROID_HOME=/mnt/c/Users/thspe/AppData/Local/Android/Sdk

# Conectar device via usbipd (PowerShell Admin no Windows)
usbipd list
usbipd bind --busid <BUSID>
usbipd attach --wsl --busid <BUSID>

# Verificar device
adb devices
```

## Build

### Release otimizado (producao / device)

```bash
ANDROID_HOME=/mnt/c/Users/thspe/AppData/Local/Android/Sdk npx expo run:android --variant release
```

Gera APK em `android/app/build/outputs/apk/release/app-release.apk` (~35MB).

Otimizacoes habilitadas em `android/gradle.properties`:
- `reactNativeArchitectures=armeabi-v7a,arm64-v8a` (apenas ARM, sem x86)
- `android.enableMinifyInReleaseBuilds=true` (R8 minification)
- `android.enableShrinkResourcesInReleaseBuilds=true` (remove resources nao usados)

### Debug (desenvolvimento)

```bash
ANDROID_HOME=/mnt/c/Users/thspe/AppData/Local/Android/Sdk npx expo run:android
```

Gera APK debug (~65MB) com hot reload via Metro bundler.

### Instalar manualmente

```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

## Estrutura

```
src/
  components/    # Componentes reutilizaveis (MenuCard, LoadingOverlay, etc)
  config/        # Theme, constantes
  contexts/      # AuthContext, InventarioContext
  hooks/         # useBarcodeScanner, useContagem, useSound
  navigation/    # React Navigation native-stack
  screens/       # HomeScreen, CountingScreen, etc
  services/      # API services (axios)
  types/         # TypeScript types
```
