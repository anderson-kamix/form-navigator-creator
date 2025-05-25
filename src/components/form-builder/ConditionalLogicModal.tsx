
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { ConditionalLogic, Question, FormSection } from '@/types/form';

interface ConditionalLogicModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentQuestion: Question;
  allQuestions: Question[];
  allSections: FormSection[];
  onSave: (logic: ConditionalLogic[]) => void;
}

const ConditionalLogicModal: React.FC<ConditionalLogicModalProps> = ({
  isOpen,
  onClose,
  currentQuestion,
  allQuestions,
  allSections,
  onSave
}) => {
  const [logicRules, setLogicRules] = useState<ConditionalLogic[]>(
    currentQuestion.conditionalLogic || []
  );

  const addRule = () => {
    const newRule: ConditionalLogic = {
      id: Date.now().toString(),
      sourceQuestionId: '',
      condition: 'equals',
      value: '',
      action: 'show'
    };
    setLogicRules([...logicRules, newRule]);
  };

  const updateRule = (index: number, updates: Partial<ConditionalLogic>) => {
    const updatedRules = [...logicRules];
    updatedRules[index] = { ...updatedRules[index], ...updates };
    setLogicRules(updatedRules);
  };

  const removeRule = (index: number) => {
    setLogicRules(logicRules.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(logicRules);
    onClose();
  };

  const getQuestionTitle = (questionId: string) => {
    const question = allQuestions.find(q => q.id === questionId);
    return question ? question.title || 'Pergunta sem título' : '';
  };

  const getSectionTitle = (sectionId: string) => {
    const section = allSections.find(s => s.id === sectionId);
    return section ? section.title || 'Seção sem título' : '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lógica Condicional</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">
              Configurando lógica para: {currentQuestion.title || 'Pergunta sem título'}
            </h3>
            <p className="text-sm text-blue-700">
              Defina regras para mostrar/ocultar esta pergunta ou redirecionar o usuário baseado nas respostas anteriores.
            </p>
          </div>

          {logicRules.map((rule, index) => (
            <div key={rule.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-medium">Regra {index + 1}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRule(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>SE a resposta da pergunta</Label>
                  <Select
                    value={rule.sourceQuestionId}
                    onValueChange={(value) => updateRule(index, { sourceQuestionId: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione uma pergunta" />
                    </SelectTrigger>
                    <SelectContent>
                      {allQuestions
                        .filter(q => q.id !== currentQuestion.id)
                        .map((question) => (
                          <SelectItem key={question.id} value={question.id}>
                            {question.title || 'Pergunta sem título'}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Condição</Label>
                  <Select
                    value={rule.condition}
                    onValueChange={(value) => updateRule(index, { condition: value as any })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">é igual a</SelectItem>
                      <SelectItem value="not_equals">não é igual a</SelectItem>
                      <SelectItem value="contains">contém</SelectItem>
                      <SelectItem value="not_contains">não contém</SelectItem>
                      <SelectItem value="greater_than">é maior que</SelectItem>
                      <SelectItem value="less_than">é menor que</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Valor</Label>
                  <Input
                    value={rule.value}
                    onChange={(e) => updateRule(index, { value: e.target.value })}
                    placeholder="Digite o valor"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Então</Label>
                  <Select
                    value={rule.action}
                    onValueChange={(value) => updateRule(index, { action: value as any })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="show">Mostrar esta pergunta</SelectItem>
                      <SelectItem value="hide">Ocultar esta pergunta</SelectItem>
                      <SelectItem value="jump_to">Pular para pergunta</SelectItem>
                      <SelectItem value="required">Tornar obrigatória</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {rule.action === 'jump_to' && (
                  <div className="md:col-span-2">
                    <Label>Pular para a pergunta</Label>
                    <Select
                      value={rule.targetQuestionId || ''}
                      onValueChange={(value) => updateRule(index, { targetQuestionId: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecione uma pergunta" />
                      </SelectTrigger>
                      <SelectContent>
                        {allQuestions
                          .filter(q => q.id !== currentQuestion.id)
                          .map((question) => (
                            <SelectItem key={question.id} value={question.id}>
                              {question.title || 'Pergunta sem título'}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={addRule}
            className="w-full border-dashed"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Nova Regra
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar Lógica
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConditionalLogicModal;
