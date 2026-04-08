import React, { useState, useEffect } from 'react';
import { Joyride, type Step, STATUS } from 'react-joyride';

const OnboardingTour: React.FC = () => {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const hasCompletedTour = localStorage.getItem('simjuris_tour_completed');
    if (!hasCompletedTour) {
      setRun(true);
    }
  }, []);

  const steps: Step[] = [
    {
      target: 'body',
      placement: 'center',
      content: (
        <div className="text-left">
          <h3 className="text-lg font-bold text-[#2F4858] mb-2">Bem-vindo ao Elite! ⚖️</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Seja muito bem-vindo ao <b>SimJuris</b>! Este é o seu novo braço direito na gestão de prazos. 
            Preparamos este guia rápido para você dominar todas as ferramentas em menos de 2 minutos.
          </p>
        </div>
      ),
    },
    {
      target: '#sidebar-nav',
      placement: 'right',
      content: (
        <div className="text-left">
          <h3 className="text-lg font-bold text-[#2F4858] mb-2">Navegação Inteligente</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Aqui você acessa todos os módulos do sistema. Vamos conhecer os principais?
          </p>
        </div>
      ),
    },
    {
      target: '#nav-dashboard',
      placement: 'right',
      content: (
        <div className="text-left">
          <h3 className="text-lg font-bold text-[#2F4858] mb-2">Painel de Controle</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Este é o seu centro de comando. Aqui você acompanha o "pulso" do seu escritório: 
            quantas mensagens foram enviadas hoje e se o motor de envio está rodando perfeitamente.
          </p>
        </div>
      ),
    },
    {
      target: '#nav-crm',
      placement: 'right',
      content: (
        <div className="text-left">
          <h3 className="text-lg font-bold text-[#2F4858] mb-2">Gestão de Clientes</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Aqui você organiza os dados das pessoas que atenderá. O segredo é manter o 
            <b> WhatsApp</b> sempre atualizado para que as notificações cheguem com perfeição.
          </p>
        </div>
      ),
    },
    {
      target: '#nav-eventos',
      placement: 'right',
      content: (
        <div className="text-left">
          <h3 className="text-lg font-bold text-[#2F4858] mb-2">Pauta Geral</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            É aqui que a mágica acontece. Ao cadastrar uma audiência ou prazo, o sistema 
            agenda <b>lembretes inteligentes</b> automaticamente. Você nunca mais enviará um lembrete manual.
          </p>
        </div>
      ),
    },
    {
      target: '#nav-whatsapp',
      placement: 'right',
      content: (
        <div className="text-left">
          <h3 className="text-lg font-bold text-[#2F4858] mb-2">Conectando os Motores 📱</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Nesta aba, você conecta o celular do escritório via QR Code. 
            Uma vez conectado, os disparos passam a ser 100% automáticos.
          </p>
        </div>
      ),
    },
    {
      target: '#nav-testes',
      placement: 'right',
      content: (
        <div className="text-left">
          <h3 className="text-lg font-bold text-[#2F4858] mb-2">Laboratório de Testes</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Sente-se inseguro? Use o Laboratório para enviar simulações reais para o seu 
            próprio celular e veja exatamente o que o cliente receberá.
          </p>
        </div>
      ),
    },
    {
      target: '#profile-menu',
      placement: 'bottom',
      content: (
        <div className="text-left">
          <h3 className="text-lg font-bold text-[#2F4858] mb-2">Seu Escritório</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Personalize os dados do seu escritório aqui para que os clientes recebam 
             as rotas do Google Maps e o nome do seu escritório corretamente.
          </p>
        </div>
      ),
    },
  ];

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem('simjuris_tour_completed', 'true');
    }
  };

  const JoyrideComponent = Joyride as any;

  return (
    <JoyrideComponent
      steps={steps}
      run={run}
      continuous
      scrollToFirstStep
      showSkipButton
      callback={handleJoyrideCallback}
      locale={{
        back: 'Voltar',
        close: 'Fechar',
        last: 'Finalizar',
        next: 'Próximo',
        skip: 'Pular Tour',
      }}
      styles={{
        options: {
          arrowColor: '#fff',
          backgroundColor: '#fff',
          overlayColor: 'rgba(31, 54, 69, 0.6)',
          primaryColor: '#B69B74',
          textColor: '#2F4858',
          zIndex: 1000,
        },
        tooltipContainer: {
          textAlign: 'left',
          borderRadius: '1.5rem',
          padding: '10px',
        },
        buttonNext: {
          backgroundColor: '#B69B74',
          borderRadius: '12px',
          fontWeight: '900',
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          padding: '12px 20px',
          color: '#fff',
          outline: 'none',
        },
        buttonBack: {
          marginRight: 10,
          fontSize: '11px',
          fontWeight: 'bold',
          color: '#B69B74',
        },
        buttonSkip: {
          fontSize: '11px',
          fontWeight: 'bold',
          color: '#2F4858',
        },
      } as any}
    />
  );
};

export default OnboardingTour;
