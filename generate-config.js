const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const configPath = path.join(__dirname, 'js', 'config.js');

let url = process.env.GOOGLE_SCRIPT_URL || '';

// Si no hay variable de entorno en process.env (por ejemplo en local), leemos del .env
if (!url && fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GOOGLE_SCRIPT_URL=(.*)/);
    if (match) {
        // Remover comillas si existen
        url = match[1].replace(/^["'](.*)["']$/, '$1').trim();
    }
}

const configContent = `// Archivo generado automáticamente a partir de .env\nexport const GOOGLE_SCRIPT_URL = "${url}";\n`;
fs.writeFileSync(configPath, configContent);
console.log('✅ js/config.js generado correctamente desde .env');
