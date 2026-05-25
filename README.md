# INFINITI MKT

Herramienta privada de Marketing Digital lista para Vercel. Incluye dashboard, estudio creativo, planificador de campanas, calendario editorial, brand kit, analitica y estratega IA.

## Migracion a Vercel

El sitio ya no depende del backend de Heroku. El frontend llama rutas relativas:

- `POST /api/chat`
- `POST /api/image`
- `GET /api/health`

Estas rutas viven en `api/` y se despliegan como Serverless Functions de Vercel.

## Desarrollo local

```bash
npm install
npm run dev
```

Para probar tambien las funciones `/api` en local, usa Vercel CLI:

```bash
npx vercel dev
```

## Variables de entorno

Configura estas variables en Vercel:

```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5-mini
OPENAI_IMAGE_MODEL=gpt-image-1
```

Sin `OPENAI_API_KEY`, las funciones responden en modo demo para que la interfaz siga siendo revisable.

## Login

El login se mantiene desconectado de proveedores externos. Solo crea una sesion local en el navegador y no valida credenciales contra un servidor. Para uso publico con gasto real de IA, activa proteccion de deployment en Vercel o conecta autenticacion cuando sea momento.
