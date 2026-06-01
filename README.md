# Score BCRA

Aplicación 100% frontend (React + React Router en modo hash/CSR) para consultar la API pública de la Central de Deudores del BCRA y calcular un score crediticio orientativo.

## Características

- Consulta directa desde el navegador a:
  - `/centraldedeudores/v1.0/Deudas/{Identificacion}`
  - `/centraldedeudores/v1.0/Deudas/Historicas/{Identificacion}`
  - `/centraldedeudores/v1.0/Deudas/ChequesRechazados/{Identificacion}`
- Algoritmo transparente con factores de antigüedad, estabilidad, utilización, historial de pagos, edad estimada, ingresos estimados, estrés financiero, entidades financieras y situación crediticia.
- UI responsive con caso demo para presentar sin cargar un CUIT real.
- Deployable como sitio estático porque usa `HashRouter` y no necesita backend propio.

## Uso local

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

El resultado queda en `dist/` y puede subirse a cualquier hosting estático.

## Aviso

El score es orientativo, no reemplaza políticas crediticias formales y depende tanto de la disponibilidad de la API del BCRA como de los supuestos ingresados por el usuario.
