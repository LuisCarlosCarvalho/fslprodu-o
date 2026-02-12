import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TrafficAnalysisReport } from '../types';

/**
 * SEO Report Generator Service
 * Fornece exportação de PDF premium para o módulo de Inteligência SEO.
 */
export const SEOReportService = {
  async generatePremiumPDF(report: TrafficAnalysisReport) {
    const doc = new jsPDF();
    const dateStr = new Date(report.created_at).toLocaleDateString('pt-BR');
    
    // Configurações de Cores Premium (FSL Brand)
    const BRAND_BLUE: [number, number, number] = [30, 64, 175]; // #1e40af
    
    // --- PÁGINA 1: CAPA & SUMÁRIO ---
    
    // Header Branding
    try {
      doc.addImage('/logo.png', 'PNG', 15, 12, 28, 12);
    } catch (e) { /* ignore */ }
    
    doc.setFontSize(22);
    doc.setTextColor(BRAND_BLUE[0], BRAND_BLUE[1], BRAND_BLUE[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('INTELIGÊNCIA SEO PREMIUM', 115, 25, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.setFont('helvetica', 'normal');
    doc.text('ESTRATÉGIA BASEADA EM DADOS | FSL SOLUTION', 115, 30, { align: 'center' });
    
    doc.setDrawColor(200);
    doc.line(15, 38, 195, 38);

    // Domínio Analisado
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text(`Relatório Estratégico: ${report.main_domain}`, 15, 55);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`País: ${report.country} | Período: ${report.time_range} | Gerado em: ${dateStr}`, 15, 62);

    // --- SEÇÃO: OPPORTUNITY SCORE (Visual) ---
    doc.setFillColor(249, 250, 251); // Gray-50
    doc.roundedRect(15, 75, 180, 40, 3, 3, 'F');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(BRAND_BLUE[0], BRAND_BLUE[1], BRAND_BLUE[2]);
    doc.text('TRAFFIC OPPORTUNITY SCORE', 25, 88);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text('Potencial de crescimento identificado pelo algoritmo FSL', 25, 93);

    // Círculo/Barra de Score
    const score = report.opportunity_score || 0;
    const scoreColor = score >= 70 ? [16, 185, 129] : score >= 40 ? [245, 158, 11] : [239, 68, 68];
    
    doc.setFillColor(229, 231, 235); // Gray-200 (Background bar)
    doc.rect(25, 102, 100, 4, 'F');
    
    doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.rect(25, 102, score * 1.0, 4, 'F');
    
    doc.setFontSize(32);
    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.setFont('helvetica', 'black');
    doc.text(`${score}`, 160, 105, { align: 'center' });

    // --- SEÇÃO: MÉTRICAS CHAVE ---
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text('DESEMPENHO ATUAL', 15, 130);
    
    const metricData = [
      ['Métrica', 'Valor Atual', 'Status/Trend'],
      ['Visitas Totais', report.report_data.main.visits.toLocaleString(), `${report.report_data.main.growth}%`],
      ['Taxa de Rejeição', `${report.report_data.main.bounce_rate}%`, 'Estável'],
      ['Duração Média', `${Math.floor(report.report_data.main.avg_duration / 60)} min`, 'Saudável'],
      ['Crescimento SEO', `${report.report_data.main.growth}%`, 'Em Evolução']
    ];

    autoTable(doc, {
      head: [metricData[0]],
      body: metricData.slice(1),
      startY: 135,
      theme: 'striped',
      headStyles: { fillColor: BRAND_BLUE },
      styles: { fontSize: 9 }
    });

    // --- SEÇÃO: COMPARAÇÃO COMPETITIVA ---
    const finalY = (doc as any).lastAutoTable.cursor.y;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('INTELIGÊNCIA COMPETITIVA (GAPS)', 15, finalY + 15);

    const competitiveData = report.insights.intelligence.map(ins => [
      ins.domain,
      ins.advantage,
      ins.gap,
      ins.opportunity
    ]);

    autoTable(doc, {
      head: [['Competidor', 'Vantagem', 'Seu Gap', 'Oportunidade']],
      body: competitiveData,
      startY: finalY + 20,
      theme: 'grid',
      headStyles: { fillColor: [55, 65, 81] }, // Slate-700
      styles: { fontSize: 8 }
    });

    // --- RECOMENDAÇÕES (Nova Página) ---
    doc.addPage();
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(BRAND_BLUE[0], BRAND_BLUE[1], BRAND_BLUE[2]);
    doc.text('DIRETRIZES ESTRATÉGICAS RECOMENDADAS', 15, 30);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50);
    
    let currentY = 45;
    report.insights.recommendations.forEach((rec, idx) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${idx + 1}.`, 15, currentY);
      doc.setFont('helvetica', 'normal');
      const splitText = doc.splitTextToSize(rec, 170);
      doc.text(splitText, 22, currentY);
      currentY += (splitText.length * 6) + 5;
    });

    // Footer All Pages
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(180);
        doc.text(`Documento Confidencial - FSL Solution Intelligence | Página ${i} de ${pageCount}`, 105, 285, { align: 'center' });
    }

    // Save
    const fileName = `Relatorio_SEO_FSL_${report.main_domain.replace(/\./g, '_')}.pdf`;
    doc.save(fileName);
    
    return { fileName };
  }
};
