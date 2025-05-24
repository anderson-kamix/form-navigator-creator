
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Check, Lock, ChevronRight } from 'lucide-react';
import { FormSection } from '@/types/form';
import { ProgressBar } from './FormNavigation';

interface SectionNavigationProps {
  sections: FormSection[];
  currentSection: number;
  isSectionComplete: (sectionIndex: number) => boolean;
  isSectionAccessible: (sectionIndex: number) => boolean;
  onSelectSection: (sectionIndex: number) => void;
  overallProgress: number;
}

export const SectionNavigation: React.FC<SectionNavigationProps> = ({
  sections,
  currentSection,
  isSectionComplete,
  isSectionAccessible,
  onSelectSection,
  overallProgress
}) => {
  // For mobile view, use accordion
  const renderMobileNavigation = () => {
    return (
      <div className="mb-8 md:hidden">
        <Accordion type="single" collapsible className="w-full" defaultValue="section">
          <AccordionItem value="section">
            <AccordionTrigger className="text-base font-medium">
              {sections[currentSection]?.title || "Seção"} ({currentSection + 1}/{sections.length})
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-2">
                {sections.map((section, index) => {
                  const isComplete = isSectionComplete(index);
                  const isAccessible = isSectionAccessible(index);
                  const isCurrent = index === currentSection;
                  
                  return (
                    <button
                      key={section.id}
                      onClick={() => isAccessible && onSelectSection(index)}
                      disabled={!isAccessible}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition ${
                        isCurrent
                          ? 'bg-blue-100 text-blue-700'
                          : isComplete
                          ? 'bg-green-50 text-green-700'
                          : isAccessible
                          ? 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                          : 'bg-slate-50 text-slate-400 opacity-70 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className={`font-medium ${isCurrent ? 'text-blue-700' : ''}`}>
                          {index + 1}. {section.title}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        {isComplete && <Check className="w-4 h-4 text-green-600 mr-1" />}
                        {!isAccessible && <Lock className="w-4 h-4 text-slate-400" />}
                        {isAccessible && !isComplete && !isCurrent && (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        {/* Progress bar showing overall progress */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-slate-600 mb-1">
            <span>Progresso geral</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  // For desktop view, use tabs
  const renderDesktopNavigation = () => {
    return (
      <div className="mb-8 hidden md:block">
        <Tabs 
          defaultValue={currentSection.toString()}
          value={currentSection.toString()}
          className="w-full"
          onValueChange={(value) => onSelectSection(parseInt(value))}
        >
          <div className="border-b mb-4 pb-2">
            <TabsList className="w-full h-auto flex overflow-x-auto p-0 bg-transparent">
              {sections.map((section, index) => {
                const isComplete = isSectionComplete(index);
                const isAccessible = isSectionAccessible(index);
                const isCurrent = index === currentSection;
                
                return (
                  <TabsTrigger
                    key={section.id}
                    value={index.toString()}
                    disabled={!isAccessible}
                    className={`flex-1 py-3 px-4 ${
                      isCurrent
                        ? 'data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 font-medium'
                        : isComplete
                        ? 'text-green-700'
                        : ''
                    } ${!isAccessible ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <span>{index + 1}. {section.title}</span>
                      {isComplete && <Check className="w-4 h-4 text-green-600" />}
                      {!isAccessible && <Lock className="w-4 h-4" />}
                    </div>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
          
          {/* Progress bar showing overall progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-slate-600 mb-1">
              <span>Progresso geral</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </Tabs>
      </div>
    );
  };

  return (
    <div className="mb-6">
      {renderMobileNavigation()}
      {renderDesktopNavigation()}
    </div>
  );
};
