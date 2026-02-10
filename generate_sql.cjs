const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'src', 'data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

let sql = "INSERT INTO portfolio (title, category, image_url, description, is_active) VALUES \n";
const values = [];

files.forEach(file => {
  const filePath = path.join(dataDir, file);
  const stats = fs.statSync(filePath);
  
  if (stats.size < 100) return; // Skip invalid/empty files

  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const title = content.title || file.replace('.json', '');
    
    // Find first image URL in the content
    let imageUrl = 'https://via.placeholder.com/800x600?text=No+Image';
    const contentString = JSON.stringify(content);
    const imgRegex = /https:\/\/[^"']+\.(?:png|jpg|jpeg|gif|webp|svg)/i;
    const match = contentString.match(imgRegex);
    if (match) {
      imageUrl = match[0].replace(/\\\//g, '/'); // Unescape forward slashes
    }

    const description = "Template de Página de Vendas Elementor";
    const category = "Modelos de Página";
    const projectUrl = `/demo/${encodeURIComponent(file)}`; // Relative URL for our new demo page
    
    // Escape single quotes for SQL
    const safeTitle = title.replace(/'/g, "''");
    const safeDescription = description.replace(/'/g, "''");
    const safeCategory = category.replace(/'/g, "''");

    values.push(`('${safeTitle}', '${safeCategory}', '${imageUrl}', '${projectUrl}', '${safeDescription}', true)`);
  } catch (e) {
    console.error(`Error parsing ${file}:`, e.message);
  }
});

if (values.length > 0) {
  const deleteSql = "DELETE FROM portfolio WHERE category = 'Modelos de Página';\n";
  const finalSql = deleteSql + "INSERT INTO portfolio (title, category, image_url, project_url, description, is_active) VALUES \n" + values.join(",\n") + ";";
  fs.writeFileSync('templates.sql', finalSql, 'utf8');
  console.log('✅ SQL generated in templates.sql');
} else {
  console.log("-- No valid templates found");
}
