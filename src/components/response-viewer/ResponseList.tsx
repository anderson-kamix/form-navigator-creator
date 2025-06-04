
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';
import { QuestionWithSection } from '../form-viewer/utils/sectionUtils';
import ResponseCard from './ResponseCard';

// Interface local para as respostas
interface FormResponseData {
  id: string;
  submittedAt: Date;
  answers: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  formId: string;
  attachments: Record<string, string>;
}

interface ResponseListProps {
  responses: FormResponseData[];
  questions: QuestionWithSection[];
  onEdit: (response: FormResponseData) => void;
  onDelete: (response: FormResponseData) => void;
}

const ResponseList: React.FC<ResponseListProps> = ({
  responses,
  questions,
  onEdit,
  onDelete
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedResponses, setExpandedResponses] = useState<Set<string>>(new Set());
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);

  // Filtrar respostas baseado no termo de busca
  const filteredResponses = useMemo(() => {
    if (!searchTerm) return responses;
    
    return responses.filter(response => {
      // Buscar nos valores das respostas
      const answersText = Object.values(response.answers).join(' ').toLowerCase();
      return answersText.includes(searchTerm.toLowerCase());
    });
  }, [responses, searchTerm]);

  // Calcular paginação
  const totalPages = Math.ceil(filteredResponses.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentResponses = filteredResponses.slice(startIndex, endIndex);

  const handleToggleExpand = (responseId: string) => {
    const newExpanded = new Set(expandedResponses);
    if (newExpanded.has(responseId)) {
      newExpanded.delete(responseId);
    } else {
      newExpanded.add(responseId);
    }
    setExpandedResponses(newExpanded);
  };

  const handleResponseSelect = (responseId: string) => {
    setSelectedResponse(responseId);
    handleToggleExpand(responseId);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="flex gap-6">
      {/* Lista principal de respostas */}
      <div className="flex-1 space-y-4">
        {/* Filtros e busca */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Respostas do Formulário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar nas respostas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(parseInt(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 por página</SelectItem>
                  <SelectItem value="10">10 por página</SelectItem>
                  <SelectItem value="25">25 por página</SelectItem>
                  <SelectItem value="50">50 por página</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Informações de paginação */}
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>
                Mostrando {startIndex + 1} - {Math.min(endIndex, filteredResponses.length)} de {filteredResponses.length} respostas
              </span>
              {filteredResponses.length !== responses.length && (
                <span className="text-blue-600">
                  {filteredResponses.length} resultados filtrados de {responses.length} total
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lista de respostas */}
        <div className="space-y-3">
          {currentResponses.map((response, index) => (
            <ResponseCard
              key={response.id}
              response={response}
              index={startIndex + index}
              questions={questions}
              onEdit={onEdit}
              onDelete={onDelete}
              isExpanded={expandedResponses.has(response.id)}
              onToggleExpand={() => handleToggleExpand(response.id)}
            />
          ))}
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <Card>
            <CardContent className="py-4">
              <div className="flex justify-center items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(pageNumber)}
                        className="w-8"
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Próximo
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Navegação lateral */}
      {responses.length > 10 && (
        <div className="w-80">
          <Card className="sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Navegação Rápida
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
              {responses.map((response, index) => {
                const answerCount = Object.keys(response.answers).length;
                const isSelected = selectedResponse === response.id;
                
                return (
                  <div
                    key={response.id}
                    className={`p-2 rounded-md cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-100 border border-blue-300' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleResponseSelect(response.id)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Resposta #{index + 1}</span>
                      <span className="text-xs text-gray-500">{answerCount} respostas</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(response.submittedAt).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ResponseList;
