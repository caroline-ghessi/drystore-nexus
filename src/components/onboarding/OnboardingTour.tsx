import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, MessageCircle, BookOpen, Megaphone, Users, ArrowRight, ArrowLeft } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

interface OnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingTour({ onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Bem-vindo à Drystore!',
      description: 'Sua central de comunicação corporativa. Aqui você encontra tudo que precisa para se manter conectado com a equipe.',
      icon: <Users className="w-8 h-8 text-primary" />,
      completed: completedSteps.includes('welcome')
    },
    {
      id: 'chat',
      title: 'Chat e Mensagens',
      description: 'Converse com colegas, participe de canais e mantenha-se atualizado com as discussões da empresa.',
      icon: <MessageCircle className="w-8 h-8 text-primary" />,
      completed: completedSteps.includes('chat')
    },
    {
      id: 'announcements',
      title: 'Comunicados Corporativos',
      description: 'Receba comunicados importantes da empresa, leia anúncios e fique por dentro das novidades.',
      icon: <Megaphone className="w-8 h-8 text-primary" />,
      completed: completedSteps.includes('announcements')
    },
    {
      id: 'knowledge',
      title: 'Base de Conhecimento',
      description: 'Acesse políticas, procedimentos, manuais e toda a documentação corporativa em um só lugar.',
      icon: <BookOpen className="w-8 h-8 text-primary" />,
      completed: completedSteps.includes('knowledge')
    }
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    const stepId = currentStepData.id;
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl mx-auto shadow-large">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <img src="/src/assets/drystore-logo.png" alt="Drystore" className="h-12 w-auto" />
          </div>
          <CardTitle className="text-2xl font-bold">Tour pela Plataforma</CardTitle>
          <CardDescription>
            Conheça as principais funcionalidades da sua central de comunicação
          </CardDescription>
          <div className="mt-4">
            <Progress value={progress} className="w-full" />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>Passo {currentStep + 1} de {steps.length}</span>
              <span>{Math.round(progress)}% concluído</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              {currentStepData.icon}
            </div>
            <h3 className="text-xl font-semibold">{currentStepData.title}</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {currentStepData.description}
            </p>
          </div>

          {/* Preview das funcionalidades */}
          <div className="grid grid-cols-4 gap-2 mt-6">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`p-3 rounded-lg text-center transition-all ${
                  index === currentStep 
                    ? 'bg-primary/10 border-2 border-primary' 
                    : completedSteps.includes(step.id)
                    ? 'bg-success/10 border border-success'
                    : 'bg-muted border border-border'
                }`}
              >
                <div className="flex justify-center mb-2">
                  {completedSteps.includes(step.id) ? (
                    <CheckCircle className="w-6 h-6 text-success" />
                  ) : (
                    React.cloneElement(step.icon as React.ReactElement, {
                      className: `w-6 h-6 ${index === currentStep ? 'text-primary' : 'text-muted-foreground'}`
                    })
                  )}
                </div>
                <p className="text-xs font-medium">{step.title.split(' ')[0]}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-6 border-t">
            <Button
              variant="outline"
              onClick={onSkip}
              className="text-muted-foreground"
            >
              Pular Tour
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>

              <Button
                onClick={handleNext}
                className="bg-gradient-primary"
              >
                {currentStep === steps.length - 1 ? 'Finalizar' : 'Próximo'}
                {currentStep < steps.length - 1 && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}