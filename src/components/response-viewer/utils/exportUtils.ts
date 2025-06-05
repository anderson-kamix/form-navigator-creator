
import { QuestionWithSection } from '../../form-viewer/utils/sectionUtils';
import { Form } from '@/types/form';
import { toast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

// Interface para as respostas com todas as propriedades necessárias
interface FormResponseData {
  id: string;
  submittedAt: Date;
  answers: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  formId: string;
  attachments: Record<string, string>;
}

/**
 * Exports responses to a CSV file
 */
export const exportResponsesToCSV = (
  form: Form, 
  responses: FormResponseData[], 
  questions: QuestionWithSection[]
): void => {
  if (!form || responses.length === 0) return;
    
  // Criar cabeçalhos CSV com todas as perguntas
  const questionTitles = questions.map(q => q.title);
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Data,";
  csvContent += questionTitles.join(",");
  csvContent += "\n";
    
  // Adicionar cada resposta ao CSV
  responses.forEach(response => {
    const date = new Date(response.submittedAt).toLocaleDateString();
    csvContent += `"${date}",`;
      
    // Adicionar respostas para cada pergunta
    questions.forEach(question => {
      const answer = response.answers[question.id];
      let formattedAnswer = "";
        
      if (Array.isArray(answer)) {
        formattedAnswer = `"${answer.join('; ')}"`;
      } else if (answer !== undefined && answer !== null) {
        formattedAnswer = `"${String(answer).replace(/"/g, '""')}"`;
      }
        
      csvContent += formattedAnswer + ",";
    });
      
    csvContent = csvContent.slice(0, -1); // remover última vírgula
    csvContent += "\n";
  });
    
  // Download do arquivo CSV
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${form.title}_respostas.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  toast({
    title: "CSV Exportado",
    description: "As respostas foram exportadas com sucesso.",
  });
};

/**
 * Exports responses to an Excel file with dynamic structure
 */
export const exportResponsesToExcel = (
  form: Form, 
  responses: FormResponseData[], 
  questions: QuestionWithSection[]
): void => {
  if (!form || responses.length === 0) {
    toast({
      title: "Aviso",
      description: "Não há respostas para exportar.",
      variant: "destructive",
    });
    return;
  }

  try {
    // Criar nova planilha
    const workbook = XLSX.utils.book_new();
    
    // Preparar dados para a planilha principal
    const worksheetData: any[][] = [];
    
    // Cabeçalho da planilha
    const headers = [
      'ID da Resposta',
      'Data de Envio',
      'Endereço IP',
      'User Agent',
      ...questions.map(q => q.title)
    ];
    worksheetData.push(headers);
    
    // Adicionar dados das respostas
    responses.forEach(response => {
      const row = [
        response.id,
        new Date(response.submittedAt).toLocaleString('pt-BR'),
        response.ipAddress || 'N/A',
        response.userAgent || 'N/A'
      ];
      
      // Adicionar resposta para cada pergunta
      questions.forEach(question => {
        const answer = response.answers[question.id];
        let formattedAnswer = '';
        
        if (Array.isArray(answer)) {
          formattedAnswer = answer.join('; ');
        } else if (answer !== undefined && answer !== null) {
          formattedAnswer = String(answer);
        } else {
          formattedAnswer = '';
        }
        
        row.push(formattedAnswer);
      });
      
      worksheetData.push(row);
    });
    
    // Criar planilha principal
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Ajustar largura das colunas
    const colWidths = headers.map((header, index) => {
      if (index === 0) return { wch: 20 }; // ID da Resposta
      if (index === 1) return { wch: 20 }; // Data
      if (index === 2) return { wch: 15 }; // IP
      if (index === 3) return { wch: 30 }; // User Agent
      
      // Para perguntas, calcular largura baseada no conteúdo
      const maxLength = Math.max(
        header.length,
        ...worksheetData.slice(1).map(row => String(row[index] || '').length)
      );
      return { wch: Math.min(Math.max(maxLength, 15), 50) };
    });
    
    worksheet['!cols'] = colWidths;
    
    // Adicionar planilha ao workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Respostas');
    
    // Criar planilha de resumo do formulário
    const summaryData: any[][] = [
      ['Informações do Formulário'],
      ['Título', form.title],
      ['Descrição', form.description || 'N/A'],
      ['Total de Respostas', responses.length],
      ['Data de Criação', new Date(form.createdAt).toLocaleString('pt-BR')],
      ['Última Atualização', new Date(form.updatedAt).toLocaleString('pt-BR')],
      [''],
      ['Estrutura das Perguntas'],
      ['ID da Pergunta', 'Título', 'Tipo', 'Obrigatória', 'Permite Anexos'],
      ...questions.map(q => [
        q.id,
        q.title,
        q.type,
        q.required ? 'Sim' : 'Não',
        q.allowAttachments ? 'Sim' : 'Não'
      ])
    ];
    
    const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Estilizar planilha de resumo
    summaryWorksheet['!cols'] = [
      { wch: 20 },
      { wch: 40 },
      { wch: 15 },
      { wch: 12 },
      { wch: 15 }
    ];
    
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Resumo');
    
    // Criar planilha de estatísticas básicas
    const statsData: any[][] = [
      ['Estatísticas das Respostas'],
      [''],
      ['Pergunta', 'Total de Respostas', 'Taxa de Resposta (%)'],
    ];
    
    questions.forEach(question => {
      const answeredCount = responses.filter(r => {
        const answer = r.answers[question.id];
        return answer !== undefined && answer !== null && answer !== '';
      }).length;
      
      const responseRate = responses.length > 0 ? ((answeredCount / responses.length) * 100).toFixed(1) : '0';
      
      statsData.push([
        question.title,
        answeredCount,
        `${responseRate}%`
      ]);
    });
    
    const statsWorksheet = XLSX.utils.aoa_to_sheet(statsData);
    statsWorksheet['!cols'] = [
      { wch: 40 },
      { wch: 20 },
      { wch: 20 }
    ];
    
    XLSX.utils.book_append_sheet(workbook, statsWorksheet, 'Estatísticas');
    
    // Gerar e baixar arquivo
    const fileName = `${form.title.replace(/[^a-zA-Z0-9]/g, '_')}_respostas_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    toast({
      title: "Excel Exportado",
      description: `Arquivo ${fileName} foi baixado com sucesso.`,
    });
    
  } catch (error) {
    console.error('Erro ao exportar Excel:', error);
    toast({
      title: "Erro na Exportação",
      description: "Ocorreu um erro ao gerar o arquivo Excel.",
      variant: "destructive",
    });
  }
};
