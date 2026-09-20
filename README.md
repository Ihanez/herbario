# Herbarium

Una página interactiva de una sola página, con estética de herbario botánico antiguo: rosa, lirio y margarita como flores prensadas en SVG, un cazador de 7 estrellas ocultas y una pequeña sección secreta que se desbloquea al encontrarlas todas.

## Contenido

```
/
├── index.html
├── style.css
├── script.js
└── README.md
```

No hay backend, base de datos, variables de entorno ni dependencias externas más allá de Google Fonts (Cormorant Garamond, EB Garamond, Caveat). Todo el contenido visual (flores, estrellas, texturas) se genera con SVG y CSS puro.

## Despliegue en Vercel

1. Sube esta carpeta a un repositorio de GitHub.
2. En Vercel, elige **Import Project** y selecciona el repositorio.
3. Framework preset: **Other** (sitio estático, no requiere build command).
4. Pulsa **Deploy**.

No hace falta configurar nada más: Vercel servirá `index.html` directamente.

## Notas

- Respeta `prefers-reduced-motion`.
- Las interacciones con hover (flores, estrellas) también funcionan con toque en móvil.
- El sonido es opcional y discreto — se activa con el botón ♪ en la esquina superior derecha (usa la Web Audio API, sin archivos de audio externos).
- Las 7 estrellas se distribuyen aleatoriamente por zonas en cada carga de la página.
