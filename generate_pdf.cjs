const { jsPDF } = require("jspdf");
const fs = require("fs");
const path = require("path");

const doc = new jsPDF();
const pageWidth = doc.internal.pageSize.getWidth();
const margin = 10;
const maxLineWidth = pageWidth - margin * 2;

function addTitle(text) {
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(text, margin, doc.autoTableHtmlElement ? doc.autoTableHtmlElement.y + 10 : 20);
}

function addSection(title, content) {
    const startY = doc.lastAutoTableSetting ? doc.lastAutoTableSetting.startY + 10 : (doc.previousAutoTable ? doc.previousAutoTable.finalY + 10 : 30);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin, doc.yPos || 30);
    doc.yPos += 7;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(content, maxLineWidth);
    
    lines.forEach(line => {
        if (doc.yPos > 280) {
            doc.addPage();
            doc.yPos = 20;
        }
        doc.text(line, margin, doc.yPos);
        doc.yPos += 5;
    });
    doc.yPos += 5;
}

doc.yPos = 20;

// Content
const title = "CONFIGURAÇÃO DE DEPLOY - FSL SOLUTION (HOSTINGER + GITHUB)";
const intro = "Este documento contém as configurações necessárias para automatizar o deploy do projeto React/Vite na Hostinger usando GitHub Actions, corrigindo o erro de tela branca.";

const secretsText = "1. Configurar Segredos no GitHub:\n- VITE_SUPABASE_URL: https://qzjzlpilmptoojuguqas.supabase.co\n- VITE_SUPABASE_ANON_KEY: (Sua chave do arquivo .env)";

const actionsWorkflow = fs.readFileSync(path.join(__dirname, ".github/workflows/deploy.yml"), "utf8");

const hostingerText = "2. Configuração na Hostinger:\n- Repositório: Link do seu GitHub\n- Ramo (Branch): deploy\n- Diretório: / (Raiz)";

doc.setFontSize(16);
doc.setFont("helvetica", "bold");
doc.text(title, margin, doc.yPos);
doc.yPos += 10;

doc.setFontSize(10);
doc.setFont("helvetica", "normal");
doc.text(doc.splitTextToSize(intro, maxLineWidth), margin, doc.yPos);
doc.yPos += 15;

addSection("Passo 1: Segredos do GitHub", secretsText);
addSection("Passo 2: Configuração Hostinger", hostingerText);
addSection("Código da Automação (.github/workflows/deploy.yml)", actionsWorkflow);

const pdfPath = path.join(__dirname, "Configuracao_Deploy_Hostinger.pdf");
const buffer = doc.output("arraybuffer");
fs.writeFileSync(pdfPath, Buffer.from(buffer));

console.log(`PDF gerado com sucesso em: ${pdfPath}`);
