// ============================================
// GOOGLE APPS SCRIPT — Invitación Gustavo & Nancy
// ============================================
// INSTRUCCIONES:
// 1. Abre tu Google Sheet
// 2. Ve a Extensiones → Apps Script
// 3. REEMPLAZA TODO el contenido con este código
// 4. Guarda (Ctrl+S)
// 5. Ve a Implementar → Nueva implementación
//    - Tipo: Aplicación web
//    - Ejecutar como: Yo
//    - Quién tiene acceso: Cualquier persona
// 6. Copia la URL generada y ponla en js/rsvp.js línea 4
// ============================================

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

// ============================================
// NORMALIZACIÓN — Quita acentos y pasa a minúsculas
// ============================================
function normalize(str) {
  if (!str) return '';
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// ============================================
// LEVENSHTEIN DISTANCE — Distancia de edición entre dos strings
// ============================================
function levenshtein(a, b) {
  var m = a.length;
  var n = b.length;
  var d = [];
  for (var i = 0; i <= m; i++) { d[i] = [i]; }
  for (var j = 0; j <= n; j++) { d[0][j] = j; }
  for (var i = 1; i <= m; i++) {
    for (var j = 1; j <= n; j++) {
      var cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
    }
  }
  return d[m][n];
}

// ============================================
// BÚSQUEDA FUZZY — Coincidencia parcial + tolerancia a typos
// ============================================
function fuzzyMatch(query, text) {
  var q = normalize(query);
  var t = normalize(text);
  if (!q || !t) return false;

  // Coincidencia parcial exacta (sin acentos)
  if (t.indexOf(q) !== -1) return true;

  // Buscar por palabra con tolerancia a errores
  var words = t.split(/\s+/);
  var maxDist = Math.max(1, Math.floor(q.length / 3));

  for (var i = 0; i < words.length; i++) {
    if (levenshtein(q, words[i]) <= maxDist) return true;
  }

  return false;
}

// ============================================
// BÚSQUEDA — Busca en titular Y acompañantes
// ============================================
function handleSearch(query, sheet) {
  var rows = sheet.getDataRange().getValues();
  var results = [];

  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    var nombre = String(row[0]).trim();

    // Ignorar filas vacías
    if (!nombre) continue;

    // Buscar en el nombre del titular (columna A)
    if (fuzzyMatch(query, nombre)) {
      var limiteAcompanantes = row[1] !== '' ? parseInt(row[1], 10) : 0;
      if (isNaN(limiteAcompanantes)) limiteAcompanantes = 0;

      // Soporte robusto para casillas de verificación (booleano true/false), texto "TRUE" o "SI"
      var confirmadoStr = '';
      var cellConfirmado = row[3];
      if (cellConfirmado === true || String(cellConfirmado).toUpperCase() === 'TRUE' || String(cellConfirmado).toUpperCase() === 'SI') {
        confirmadoStr = 'SI';
      } else if (cellConfirmado === false || String(cellConfirmado).toUpperCase() === 'FALSE' || String(cellConfirmado).toUpperCase() === 'NO') {
        confirmadoStr = 'NO';
      }

      results.push({
        id: i + 1,
        nombre: nombre,
        limiteAcompanantes: limiteAcompanantes,
        mesa: row[2] ? String(row[2]).trim() : '',
        confirmado: confirmadoStr,
        acompanantesConfirmados: row[4] !== '' ? parseInt(row[4], 10) : 0
      });
    }
  }

  return ContentService.createTextOutput(JSON.stringify({ results: results }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// CONFIRMACIÓN / RECHAZO
// ============================================
function handleConfirm(data, sheet) {
  var row = data.id;
  
  if (data.action === 'confirm') {
    // Si la columna D es una casilla de verificación (checkbox), escribir true la marcará
    sheet.getRange(row, 4).setValue(true); // Columna D: Confirmado
    sheet.getRange(row, 5).setValue(data.acompanantesConfirmados || 0); // Columna E: Acompañantes Confirmados
  } else if (data.action === 'decline') {
    // Escribir false desmarcará la casilla de verificación
    sheet.getRange(row, 4).setValue(false); // Columna D: Confirmado
    sheet.getRange(row, 5).setValue(0); // Columna E: Acompañantes Confirmados
  }
  
  sheet.getRange(row, 6).setValue(data.mensaje || ''); // Columna F: Mensaje
  sheet.getRange(row, 7).setValue(data.fechaConfirmacion || new Date().toISOString()); // Columna G: Fecha

  return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}