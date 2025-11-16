
import React, { useState, useCallback } from 'react';
import { SimulationState } from './types';
import type { Scenario, ChatMessage } from './types';
import ScenarioSelector from './components/ScenarioSelector';
import ChatInterface from './components/ChatInterface';
import DebriefingReport from './components/DebriefingReport';
import { generateInitialCase, getNextTurn, generateDebriefing } from './services/geminiService';

const App: React.FC = () => {
  const [simulationState, setSimulationState] = useState<SimulationState>(SimulationState.NOT_STARTED);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [secretDiagnosis, setSecretDiagnosis] = useState<string | null>(null);
  const [initialVignette, setInitialVignette] = useState<string | null>(null);
  const [debriefingReport, setDebriefingReport] = useState<string | null>(null);
  const [finalChatHistory, setFinalChatHistory] = useState<ChatMessage[]>([]);

  const handleScenarioSelect = useCallback(async (scenario: Scenario) => {
    setIsLoading(true);
    setError(null);
    try {
      const { initialVignette, secretDiagnosis } = await generateInitialCase(scenario);
      setCurrentScenario(scenario);
      setSecretDiagnosis(secretDiagnosis);
      setInitialVignette(initialVignette);
      setSimulationState(SimulationState.IN_PROGRESS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setSimulationState(SimulationState.NOT_STARTED);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleConclude = useCallback(async (history: ChatMessage[]) => {
    setIsLoading(true);
    setError(null);
    setSimulationState(SimulationState.DEBRIEFING);
    setFinalChatHistory(history); // Store history for the report
    try {
      if (currentScenario && secretDiagnosis) {
        const report = await generateDebriefing(history, secretDiagnosis, currentScenario);
        setDebriefingReport(report);
      } else {
        throw new Error("Missing simulation context for debriefing.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during debriefing.');
      setDebriefingReport("Falha ao gerar o relatório de performance. Por favor, tente iniciar uma nova simulação.");
    } finally {
      setIsLoading(false);
    }
  }, [currentScenario, secretDiagnosis]);

  const handleRestart = useCallback(() => {
    setSimulationState(SimulationState.NOT_STARTED);
    setIsLoading(false);
    setError(null);
    setCurrentScenario(null);
    setSecretDiagnosis(null);
    setInitialVignette(null);
    setDebriefingReport(null);
    setFinalChatHistory([]);
  }, []);

  const renderContent = () => {
    switch (simulationState) {
      case SimulationState.IN_PROGRESS:
        if (initialVignette && currentScenario && secretDiagnosis) {
          return (
            <ChatInterface
              initialMessage={initialVignette}
              scenario={currentScenario}
              secretDiagnosis={secretDiagnosis}
              onConclude={handleConclude}
              onRestart={handleRestart}
              getNextTurn={getNextTurn}
            />
          );
        }
        // Fallback or loading state for in-progress
        return <div>Loading Simulation...</div>;
      
      case SimulationState.DEBRIEFING:
         if (isLoading) {
             return (
                <div className="flex flex-col items-center justify-center min-h-screen text-gray-400">
                    <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-lg">Analisando performance e gerando relatório... Isso pode levar um momento.</p>
                </div>
             );
         }
        return <DebriefingReport report={debriefingReport || ''} onRestart={handleRestart} />;

      case SimulationState.NOT_STARTED:
      default:
        return (
            <div>
                 {error && <div className="bg-red-500 text-white p-4 text-center">{error}</div>}
                 <ScenarioSelector onSelect={handleScenarioSelect} isLoading={isLoading} />
            </div>
        );
    }
  };

  return <div className="h-screen w-screen">{renderContent()}</div>;
};

export default App;
