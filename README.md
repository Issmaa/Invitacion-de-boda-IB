# Invitación Digital — Ismael & Brenda

Invitación de boda single-page mobile-first con diseño "Everlasting Flora".

## Inicio Rápido

Abre `index.html` directamente en un navegador. No se necesita servidor ni build step.

## Estructura

```
boda/
├── index.html          # Página principal
├── css/
│   ├── styles.css      # Design system, layout, secciones
│   ├── animations.css  # Scroll reveals, micro-interacciones
│   └── responsive.css  # Breakpoints mobile-first
├── js/
│   ├── main.js         # Smooth scroll
│   ├── countdown.js    # Timer en vivo (target: 20 Jun 2026)
│   ├── rsvp.js         # Buscador de invitados + Google Sheets
│   └── animations.js   # Intersection Observer reveals
└── assets/
    ├── icons/          # SVGs decorativos (inline en HTML)
    └── img/            # Reemplazar con fotos reales
```

## RSVP — Buscador de Invitados

El flujo de confirmación funciona en 3 pasos:

1. **Buscar**: El invitado ingresa su nombre y presiona "Buscar"
2. **Seleccionar**: Se muestran los resultados coincidentes con sus acompañantes asignados
3. **Confirmar/Rechazar**: Confirma asistencia para todo el grupo o rechaza con mensaje opcional

### Modo demo

Sin configurar la URL de Google Sheets, el RSVP funciona en modo demo con datos de ejemplo. Busca `"Ismael"` o `"Ismael"` para ver el flujo.

### Conectar con Google Sheets

#### Paso 1: Crear la hoja de cálculo

Crear una Google Sheet con la siguiente estructura:

| Columna A | Columna B | Columna C | Columna D | Columna E | Columna F | Columna G | Columna H |
|-----------|-----------|-----------|-----------|-----------|-----------|-----------|-----------|
| Nombre | Acompañante1 | Acompañante2 | Acompañante3 | Mesa | Confirmado | Mensaje | FechaConfirmacion |
| Ismael López | Brenda Martínez | Carlos López | | 5 | | | |
| Ismael Hernández | Brenda Pérez | | | 1 | | | |

- **Columna A**: Nombre del invitado titular (se usa para la búsqueda)
- **Columnas B-D**: Acompañantes asignados (pueden estar vacíos)
- **Columna E**: Número de mesa
- **Columna F**: Confirmado — vacío = pendiente, `SI` = confirmado, `NO` = rechazado
- **Columna G**: Mensaje (se llena cuando rechazan con mensaje)
- **Columna H**: Fecha de confirmación (timestamp)

#### Paso 2: Crear Google Apps Script

1. En la hoja → **Extensiones** → **Apps Script**
2. Reemplazar el contenido con:

```javascript
function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var action = e.parameter.action;

  if (action === 'search') {
    return handleSearch(e.parameter.query, sheet);
  }

  return ContentService.createTextOutput(JSON.stringify({ error: 'Acción no válida' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);

  if (data.action === 'confirm' || data.action === 'decline') {
    return handleConfirm(data, sheet);
  }

  return ContentService.createTextOutput(JSON.stringify({ error: 'Acción no válida' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleSearch(query, sheet) {
  var rows = sheet.getDataRange().getValues();
  var results = [];
  var searchLower = query.toLowerCase().trim();

  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    var nombre = String(row[0]).trim();
    var match = false;

    // Buscar en el nombre del titular
    if (nombre.toLowerCase().indexOf(searchLower) !== -1) {
      match = true;
    }

    // Buscar también en los acompañantes (columnas B, C, D)
    if (!match) {
      for (var k = 1; k <= 3; k++) {
        if (row[k] && String(row[k]).trim() && String(row[k]).trim().toLowerCase().indexOf(searchLower) !== -1) {
          match = true;
          break;
        }
      }
    }

    if (match) {
      var acompanantes = [];
      for (var j = 1; j <= 3; j++) {
        if (row[j] && String(row[j]).trim()) {
          acompanantes.push(String(row[j]).trim());
        }
      }

      results.push({
        id: i + 1,
        nombre: nombre,
        acompanantes: acompanantes,
        mesa: row[4] ? String(row[4]).trim() : '',
        confirmado: row[5] ? String(row[5]).trim() : ''
      });
    }
  }

  return ContentService.createTextOutput(JSON.stringify({ results: results }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleConfirm(data, sheet) {
  var row = data.id;
  sheet.getRange(row, 6).setValue(data.confirmado);
  sheet.getRange(row, 7).setValue(data.mensaje || '');
  sheet.getRange(row, 8).setValue(data.fechaConfirmacion || new Date().toISOString());

  return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Guardar → **Implementar** → **Nueva implementación**
   - Tipo: **Aplicación web**
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier persona**
4. Copiar la URL generada

#### Paso 3: Conectar la invitación

En `js/rsvp.js`, línea 3, reemplazar:

```javascript
var GOOGLE_SCRIPT_URL = '';
```

con:

```javascript
var GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/TU_ID_AQUI/exec';
```

## Personalización

### Nombres y fecha
Edita directamente en `index.html`:
- Nombres en la sección Hero (`.hero__name`)
- Fecha en Save the Date y Hero subtítulo
- Countdown target en `js/countdown.js` línea 5

### Venues (lugares)
Busca los nombres placeholder en el HTML y reemplaza:
- Nombre del lugar
- Dirección
- Hora
- URL de Google Maps en los enlaces `href`

### Mesa de Regalos
Busca `<section class="section gifts">` en el HTML. Contiene los enlaces a la mesa de regalos (Liverpool y Amazon). Reemplaza el `href` de cada enlace con la URL de tus mesas de regalos.

### Dress code
- Colores: edita los `style="--swatch-color: ..."` en `.dress-code__swatch`
- Texto descriptivo en `.dress-code__note`

### Guías para invitados
Las 4 tarjetas en `.guidelines__grid` son editables.

### Paleta de colores
Las CSS variables están en `css/styles.css` dentro de `:root`:
```css
--navy: #1b2a41;
--sage: #7d8a6e;
--cream: #fbf9f4;
--gold: #c9a96e;
```

### Imágenes
Reemplaza las URLs de Unsplash en `<img src="...">` con tus propias fotos.

### QR Code
Reemplaza el SVG placeholder en la sección Snap & Share con un QR code real apuntando a tu Google Drive compartido.

## Despliegue

### GitHub Pages
1. Crear repo en GitHub → subir archivos
2. Settings → Pages → Source: `main` → `/root`
3. Tu invitación estará en `https://tuusuario.github.io/boda/`

### Netlify
Arrastra la carpeta `boda/` a [app.netlify.com](https://app.netlify.com)

### Abrir localmente
Simplemente abre `index.html` en cualquier navegador.

## Compatibilidad

- Chrome, Safari, Firefox, Edge (últimos 2 años)
- iOS Safari y Chrome para Android
- Contrastes WCAG AA, touch targets 44px+
- `prefers-reduced-motion`: animaciones desactivadas