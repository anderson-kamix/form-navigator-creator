
import { QuestionWithSection } from '../../form-viewer/utils/sectionUtils';
import { Response } from '../../form-viewer/useFormViewerState';
import { Form } from '@/types/form';
import { toast } from '@/hooks/use-toast';

/**
 * Exports responses to a CSV file
 */
export const exportResponsesToCSV = (
  form: Form, 
  responses: Response[], 
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
