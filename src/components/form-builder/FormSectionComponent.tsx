
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { FormSection, Question } from '@/types/form';
import QuestionItem from './QuestionItem';

interface FormSectionComponentProps {
  section: FormSection;
  updateSection: (sectionId: string, updates: Partial<FormSection>) => void;
  removeSection: (sectionId: string) => void;
  toggleSection: (sectionId: string) => void;
  addQuestion: (sectionId: string) => void;
  updateQuestion: (sectionId: string, questionId: string, updates: Partial<Question>) => void;
  removeQuestion: (sectionId: string, questionId: string) => void;
}

const FormSectionComponent: React.FC<FormSectionComponentProps> = ({ 
  section, 
  updateSection, 
  removeSection, 
  toggleSection, 
  addQuestion, 
  updateQuestion, 
  removeQuestion 
}) => {
  return (
    <Card key={section.id} className="p-6 border-l-4 border-l-blue-500">
      {/* Section Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-0 h-8 w-8"
              onClick={() => toggleSection(section.id)}
            >
              {section.isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </Button>
            <h3 className="text-lg font-medium">
              <Input
                value={section.title}
                onChange={(e) => updateSection(section.id, { title: e.target.value })}
                placeholder="Título da Seção"
                className="text-lg font-semibold border-0 p-0 h-auto focus-visible:ring-0 bg-transparent"
              />
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeSection(section.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        <div className="pl-10 pr-8 mt-2">
          <Textarea
            value={section.description || ''}
            onChange={(e) => updateSection(section.id, { description: e.target.value })}
            placeholder="Descrição da seção (opcional)"
            className="min-h-8 resize-none mt-1 text-sm"
          />
        </div>
      </div>

      <Collapsible open={section.isOpen} onOpenChange={(isOpen) => updateSection(section.id, { isOpen })}>
        <CollapsibleContent>
          {/* Questions */}
          <div className="space-y-4 mb-4 pl-8">
            {section.questions.map((question, index) => (
              <QuestionItem
                key={question.id}
                question={question}
                index={index}
                sectionId={section.id}
                onUpdate={updateQuestion}
                onRemove={removeQuestion}
              />
            ))}
          </div>

          {/* Add Question Button */}
          <div className="mt-4 pl-8">
            <Button
              variant="outline"
              onClick={() => addQuestion(section.id)}
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Questão
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default FormSectionComponent;
