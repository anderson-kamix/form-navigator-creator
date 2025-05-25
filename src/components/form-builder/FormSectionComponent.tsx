
import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Plus, Trash2, GripVertical } from 'lucide-react';
import { FormSection, Question } from '@/types/form';
import QuestionItem from './QuestionItem';

interface FormSectionComponentProps {
  section: FormSection;
  allSections: FormSection[];
  updateSection: (sectionId: string, updates: Partial<FormSection>) => void;
  removeSection: (sectionId: string) => void;
  toggleSection: (sectionId: string) => void;
  addQuestion: (sectionId: string) => void;
  updateQuestion: (sectionId: string, questionId: string, updates: Partial<Question>) => void;
  removeQuestion: (sectionId: string, questionId: string) => void;
}

const FormSectionComponent: React.FC<FormSectionComponentProps> = ({
  section,
  allSections,
  updateSection,
  removeSection,
  toggleSection,
  addQuestion,
  updateQuestion,
  removeQuestion
}) => {
  // Flatten all questions from all sections for conditional logic
  const allQuestions = allSections.flatMap(s => s.questions);

  return (
    <Card className="overflow-hidden">
      <Collapsible open={section.isOpen} onOpenChange={() => toggleSection(section.id)}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-6 bg-slate-50 hover:bg-slate-100 cursor-pointer">
            <div className="flex items-center space-x-3">
              <GripVertical className="w-5 h-5 text-slate-400" />
              <div>
                <h3 className="font-semibold text-slate-800">
                  {section.title || 'Nova seção'}
                </h3>
                <p className="text-sm text-slate-600">
                  {section.questions.length} pergunta(s)
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  removeSection(section.id);
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              {section.isOpen ? (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="p-6 space-y-6">
            {/* Section Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Título da Seção</Label>
                <Input
                  value={section.title}
                  onChange={(e) => updateSection(section.id, { title: e.target.value })}
                  placeholder="Nome da seção"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Descrição (opcional)</Label>
                <Textarea
                  value={section.description || ''}
                  onChange={(e) => updateSection(section.id, { description: e.target.value })}
                  placeholder="Descrição da seção"
                  className="mt-1"
                  rows={2}
                />
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-slate-700">Perguntas</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addQuestion(section.id)}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Pergunta
                </Button>
              </div>

              {section.questions.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p>Nenhuma pergunta adicionada ainda.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addQuestion(section.id)}
                    className="mt-2"
                  >
                    Adicionar primeira pergunta
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {section.questions.map((question, index) => (
                    <QuestionItem
                      key={question.id}
                      question={question}
                      index={index}
                      sectionId={section.id}
                      allQuestions={allQuestions}
                      allSections={allSections}
                      onUpdate={updateQuestion}
                      onRemove={removeQuestion}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default FormSectionComponent;
