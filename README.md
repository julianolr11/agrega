# Agrega Desktop (Electron + Vite)

## Rodar em desenvolvimento

```bash
npm install
npm run dev
```

## Build desktop

```bash
npm run build
```

## Parear com o mobile via QR

1. Abra o app desktop e clique no ícone de QR no topo ao lado de Configurações.
2. No app mobile, toque em "Escanear QR" e leia o código.
3. Confirme que o PIN exibido no desktop é o mesmo lido no mobile.
4. Os links, categorias e lembretes são mesclados (desktop → mobile). Mantemos IDs existentes e unimos itens diferentes.
