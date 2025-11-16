
import React from 'react';
import type { Scenario } from '../types';

interface ScenarioSelectorProps {
  onSelect: (scenario: Scenario) => void;
  isLoading: boolean;
}

const scenarios: { name: Scenario; description: string }[] = [
  { name: 'UBS', description: 'Unidade Básica de Saúde' },
  { name: 'UPA 24h', description: 'Unidade de Pronto Atendimento' },
  { name: 'CTI', description: 'Centro de Terapia Intensiva' },
  { name: 'SAMU / Corpo de Bombeiros', description: 'Atendimento Pré-Hospitalar' },
];

const ScenarioButton: React.FC<{ scenario: { name: Scenario; description: string }; onClick: () => void; disabled: boolean }> = ({ scenario, onClick, disabled }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full text-left p-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:border-blue-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-wait"
    >
      <h3 className="text-lg font-bold text-blue-400">{scenario.name}</h3>
      <p className="text-sm text-gray-400">{scenario.description}</p>
    </button>
);


const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({ onSelect, isLoading }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-200">
          OSCE AI <span className="text-blue-500">v9</span> - M.O.R.T.E.
        </h1>
        <p className="mt-2 text-md text-gray-400">
          Módulo de Operação Realística e Treinamento de Experiência
        </p>

        <div className="mt-8 p-6 bg-gray-800/50 border border-gray-700 rounded-lg text-left">
            <p className="text-gray-300">Olá, sou o OSCE AI v9 - M.O.R.T.E. - Módulo de Operação Realística e Treinamento de Experiência. Sua simulação de plantão começa agora. As consequências de suas ações serão diretas e realistas. Escolha o local do seu plantão hoje:</p>
        </div>

        {isLoading ? (
             <div className="mt-8 flex flex-col items-center justify-center text-gray-400">
                <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-4">Gerando caso clínico ultra-realista... Aguarde.</p>
             </div>
        ) : (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {scenarios.map((scenario) => (
                <ScenarioButton 
                    key={scenario.name} 
                    scenario={scenario} 
                    onClick={() => onSelect(scenario.name)}
                    disabled={isLoading}
                />
            ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default ScenarioSelector;
