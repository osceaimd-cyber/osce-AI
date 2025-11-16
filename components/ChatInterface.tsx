
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, Scenario } from '../types';
import SendIcon from './icons/SendIcon';
import RestartIcon from './icons/RestartIcon';

interface ChatInterfaceProps {
  initialMessage: string;
  scenario: Scenario;
  secretDiagnosis: string;
  onConclude: (history: ChatMessage[]) => void;
  onRestart: () => void;
  getNextTurn: (history: ChatMessage[], secretDiagnosis: string) => Promise<string>;
}

const LoadingIndicator = () => (
    <div className="flex items-center space-x-2">
        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
    </div>
);


const ChatInterface: React.FC<ChatInterfaceProps> = ({
  initialMessage,
  scenario,
  secretDiagnosis,
  onConclude,
  onRestart,
  getNextTurn,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'model', content: initialMessage }]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userInput }];
    setMessages(newMessages);
    setUserInput('');
    setIsLoading(true);

    try {
      const modelResponse = await getNextTurn(newMessages, secretDiagnosis);
      setMessages((prev) => [...prev, { role: 'model', content: modelResponse }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'model', content: 'Ocorreu um erro de comunicação com o sistema. Tente novamente.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-800 text-gray-200">
      <header className="bg-gray-900 p-4 shadow-md flex justify-between items-center border-b border-gray-700">
        <div>
            <h1 className="text-xl font-bold">OSCE AI: Simulação em Andamento</h1>
            <p className="text-sm text-blue-400">{scenario}</p>
        </div>
        <div>
            <button 
              onClick={onRestart}
              className="mr-4 p-2 rounded-full hover:bg-gray-700 transition-colors"
              title="Reiniciar Simulação"
            >
              <RestartIcon className="w-6 h-6 text-gray-400" />
            </button>
            <button
              onClick={() => onConclude(messages)}
              disabled={messages.length < 3}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              Concluir Caso
            </button>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xl p-4 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="max-w-xl p-4 rounded-2xl bg-gray-700 text-gray-200 rounded-bl-none">
                <LoadingIndicator />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </main>

      <footer className="bg-gray-900 p-4 border-t border-gray-700">
        <form onSubmit={handleSubmit} className="flex items-center space-x-4 max-w-4xl mx-auto">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Digite sua conduta ou solicitação..."
            className="flex-1 p-3 bg-gray-700 text-gray-200 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !userInput.trim()}
            className="p-3 bg-blue-600 rounded-full text-white hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-70 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
          >
            <SendIcon className="w-6 h-6" />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ChatInterface;