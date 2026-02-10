import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Project, Profile, Service } from './supabase';

interface ContractData {
  project: Project & { service: Service };
  client: Profile;
  type: 'service' | 'maintenance';
}

const FSL_INFO = {
  name: 'FSL Solution',
  cnpj: '00.000.000/0001-00', // Placeholder
  address: 'Rua das Inovações, 1000 - São Paulo, SP',
  email: 'contato@fslsolution.com.br',
  phone: '+55 (11) 99999-9999'
};

const getServiceDescription = (serviceName: string) => {
  const name = serviceName.toLowerCase();
  if (name.includes('tráfego') || name.includes('ads')) {
    return 'Gerenciamento de Campanhas (Google/Facebook Ads), análise e otimização diária, relatórios de performance e estratégias de remarketing.';
  }
  if (name.includes('seo')) {
    return 'Otimização completa de SEO técnico, gestão de conteúdo e palavras-chave, link building e relatórios mensais de desempenho.';
  }
  if (name.includes('site')) {
    return 'Desenvolvimento de site profissional e responsivo, otimizado para SEO, integração com pagamentos e painel administrativo completo.';
  }
  if (name.includes('logo') || name.includes('identidade')) {
    return 'Criação de identidade visual única, múltiplas versões e formatos, manual de marca e revisões ilimitadas até aprovação.';
  }
  return 'Prestação de serviços digitais personalizados conforme escopo técnico definido entre as partes.';
};

export const generateContractPDF = async (data: ContractData) => {
  const { project, client, type } = data;
  const doc = new jsPDF();
  const isPortugal = client.country === 'Portugal';
  const currency = isPortugal ? '€' : 'R$';
  const dateStr = new Date().toLocaleDateString(isPortugal ? 'pt-PT' : 'pt-BR');
  const serviceDetail = getServiceDescription(project.service.name);

  // --- Header Match Image ---
  try {
    doc.addImage('/logo.png', 'PNG', 15, 12, 28, 12);
  } catch (e) { /* ignore */ }

  doc.setFontSize(18);
  doc.setTextColor(30, 64, 175);
  doc.setFont('helvetica', 'bold');
  doc.text('FSL SOLUTION', 115, 20, { align: 'center' });
  
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.setFont('helvetica', 'normal');
  doc.text('INTELIGÊNCIA EM DESENVOLVIMENTO DIGITAL', 115, 26, { align: 'center' });
  
  doc.setDrawColor(200);
  doc.line(15, 35, 195, 35);

  // --- Title ---
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  const title = type === 'service' 
    ? 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS DIGITAIS' 
    : 'CONTRATO DE MANUTENÇÃO E SUPORTE TÉCNICO';
  doc.text(title, 105, 48, { align: 'center' });

  // --- 1. AS PARTES (Two Columns Like Image) ---
  let currentY = 62;
  doc.setFontSize(10);
  doc.text('1. AS PARTES', 15, currentY);
  
  doc.setFontSize(8);
  const clientID = isPortugal ? `NIF: ${client.nif || '---'}` : `CPF/CNPJ: ${client.cpf_cnpj || '---'}`;
  
  // Left Column
  doc.setFont('helvetica', 'bold');
  doc.text(`CONTRATANTE: ${client.full_name}`, 15, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`${clientID}`, 15, currentY + 10);
  doc.text(`Endereço: ${client.address || '---'}, ${client.city || '---'}`, 15, currentY + 14);
  doc.text(`E-mail: ${client.email || '---'} | Telefone: ${client.phone || '---'}`, 15, currentY + 18);

  // Right Column
  doc.setFont('helvetica', 'bold');
  doc.text(`CONTRATADA: ${FSL_INFO.name}`, 105, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`CNPJ: ${FSL_INFO.cnpj}`, 105, currentY + 10);
  doc.text(`Endereço: ${FSL_INFO.address}`, 105, currentY + 14);
  doc.text(`E-mail: ${FSL_INFO.email} | Telefone: ${FSL_INFO.phone}`, 105, currentY + 18);

  // --- 2. Objective ---
  currentY = 90;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('2. OBJETIVO E ESCOPO', 15, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const objective = type === 'service'
    ? `O presente contrato tem como objetivo a prestação de serviços de ${project.service.name} pela FSL Solution à contratante. Detalhamento: ${serviceDetail}`
    : `O presente contrato visa a manutenção e suporte do serviço de ${project.service.name}. Detalhamento: ${serviceDetail}`;
  
  const splitObjective = doc.splitTextToSize(objective, 180);
  doc.text(splitObjective, 15, currentY + 6);
  currentY += 10 + (splitObjective.length * 4);

  // --- 3. Payment ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('3. VALORES E FORMA DE PAGAMENTO', 15, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const totalValStr = project.total_value ? `${currency} ${project.total_value.toLocaleString(isPortugal ? 'pt-PT' : 'pt-BR', { minimumFractionDigits: 2 })}` : '---';
  
  let pLines = [];
  if (type === 'service') {
    pLines = [
      `Valor Total: ${totalValStr}`,
      `• 30% (${currency} ${(project.total_value! * 0.3).toLocaleString()}) no início do projeto (data de assinatura).`,
      `• 30% (${currency} ${(project.total_value! * 0.3).toLocaleString()}) no meio do projeto (após aprovação de etapas intermediárias).`,
      `• 40% (${currency} ${(project.total_value! * 0.4).toLocaleString()}) na entrega final e homologação.`
    ];
  } else {
    pLines = [`Valor Mensal: ${totalValStr}. Pagamento recorrente até o dia 05 de cada mês.`];
  }
  doc.text(pLines, 15, currentY + 6);
  currentY += 8 + (pLines.length * 4);

  // --- 4. Technical Costs ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('4. CUSTOS DE INFRAESTRUTURA E TERCEIROS', 15, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const infraTxt = "Os custos de hospedagem, servidores, APIs, frameworks ou qualquer outra ferramenta de implementação de terceiros serão custeados exclusivamente pela CONTRATANTE. A CONTRATADA não se responsabiliza por taxas de serviços externos que não integrem o valor do desenvolvimento em si.";
  const splitInfra = doc.splitTextToSize(infraTxt, 180);
  doc.text(splitInfra, 15, currentY + 6);
  currentY += 10 + (splitInfra.length * 4);

  // --- 5. Responsibilities ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('5. RESPONSABILIDADES', 15, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const respT = `A FSL Solution compromete-se a desenvolver o projeto conforme o escopo técnico acordado. A CONTRATANTE compromete-se a fornecer os materiais e acessos necessários para o bom andamento do cronograma.`;
  const splitResp = doc.splitTextToSize(respT, 180);
  doc.text(splitResp, 15, currentY + 6);
  currentY += 10 + (splitResp.length * 4);

  // --- 6. Jurisdição ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('6. FORO E LEGISLAÇÃO', 15, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const foro = isPortugal 
    ? "Este contrato é regido pelas leis portuguesas. As partes elegem o foro da comarca da sede da CONTRATADA para dirimir eventuais dúvidas."
    : "Este contrato é regido pelas leis brasileiras. As partes elegem o foro de São Paulo/SP para dirimir eventuais dúvidas.";
  doc.text(foro, 15, currentY + 6);
  currentY += 35;

  // --- Signature Area (Matched to Image) ---
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Gerado em: ${dateStr}`, 105, currentY, { align: 'center' });
  currentY += 25;

  doc.setDrawColor(150);
  doc.line(15, currentY, 95, currentY);
  doc.line(115, currentY, 195, currentY);
  
  doc.setFontSize(10);
  doc.text('CONTRATANTE', 55, currentY + 6, { align: 'center' });
  doc.text('CONTRATADA (FSL SOLUTION)', 155, currentY + 6, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setTextColor(180);
  doc.setFont('helvetica', 'normal');
  doc.text('Assinatura Digital via Hash de Autenticação - FSL System', 105, currentY + 25, { align: 'center' });

  // Save/Download
  const fileName = `Contrato_FSL_${client.full_name.replace(/\s+/g, '_')}_${type}.pdf`;
  doc.save(fileName);
  
  return { blob: doc.output('blob'), fileName };
};
