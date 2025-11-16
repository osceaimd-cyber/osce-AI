
import { GoogleGenAI } from "@google/genai";
import type { ChatMessage, Scenario } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateInitialCase = async (scenario: Scenario): Promise<{ initialVignette: string; secretDiagnosis: string }> => {
  const now = new Date();
  const day = now.getDate();
  const seconds = now.getSeconds();

  const dayDigits = String(day).split('').map(Number);
  const secondsDigits = String(seconds).split('').map(Number);
  
  const digitSumExpression = [...dayDigits, ...secondsDigits].join(' + ');
  const sumResult = dayDigits.reduce((a, b) => a + b, 0) + secondsDigits.reduce((a, b) => a + b, 0);

  const prompt = `
    You are the system core for "OSCE AI v9 - M.O.R.T.E.". Your task is to execute the "Processo de Seleção Aleatória de Caso (PSAC)" silently and generate the initial patient encounter.

    The user has chosen the following scenario: "${scenario}".

    Follow these steps EXACTLY:
    1. Internally, create a numbered list of 15-20 diverse and relevant diagnoses for the "${scenario}" setting. Include common, rare, severe, and benign cases. Do NOT show this list in your output.
    2. The current timestamp for randomization is: day of month = ${day}, seconds = ${seconds}.
    3. Calculate the randomization factor by summing the digits: (${digitSumExpression}) = ${sumResult}.
    4. Select the diagnosis from your internal list at the index corresponding to the randomization factor (${sumResult}). If the sum is greater than your list size, use the modulo operator (sum % list_size). This is the "Secret Diagnosis".
    5. Based ONLY on this Secret Diagnosis, create the initial patient presentation vignette. This should include Ectoscopy, Vital Signs, and the main complaint. The presentation must be realistic and consistent with the Secret Diagnosis, but should NOT reveal it directly.

    Your output MUST be a JSON object with this exact structure, with no extra text or markdown formatting:
    {
      "secretDiagnosis": "The diagnosis you selected in step 4",
      "initialVignette": "The patient presentation vignette you created in step 5."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const text = response.text.trim().replace(/```json|```/g, '');
    const data = JSON.parse(text);

    if (!data.secretDiagnosis || !data.initialVignette) {
      throw new Error("Invalid response structure from Gemini API.");
    }

    return data;
  } catch (error) {
    console.error("Error generating initial case:", error);
    throw new Error("Failed to generate initial case. Please try again.");
  }
};

const formatChatHistoryForPrompt = (chatHistory: ChatMessage[]) => {
    return chatHistory.map(msg => `**${msg.role === 'user' ? 'Student' : 'Simulation'}**: ${msg.content}`).join('\n');
};

export const getNextTurn = async (chatHistory: ChatMessage[], secretDiagnosis: string): Promise<string> => {
    const userMessage = chatHistory[chatHistory.length - 1].content;
    
    if (userMessage.toLowerCase().includes('ajuda') || userMessage.toLowerCase().includes('help')) {
        return "Aguardando sua conduta.";
    }

    const prompt = `
        You are "OSCE AI v9 - M.O.R.T.E.", an implacable medical simulation AI. You are currently running a simulation.

        **SECRET DIAGNOSIS (DO NOT REVEAL TO THE USER):** ${secretDiagnosis}

        **RULES:**
        1. Your persona is that of an interface to the simulation. You are not a tutor.
        2. NEVER offer help, hints, or guidance. If the user asks for help, your ONLY response is "Aguardando sua conduta."
        3. Realistically evolve the patient's condition based on the user's actions (or inaction) and the secret diagnosis.
        4. Track time realistically. Mention the time elapsed after a block of actions (e.g., "15 minutos se passaram.").
        5. The patient can deteriorate, improve, or even die if the user's actions are incorrect or delayed.
        6. Provide only the results of the user's requests (e.g., lab results, physical exam findings). Do not interpret them for the user.
        7. All realism modifiers are active. Introduce limited resources or communication challenges if appropriate.

        **Simulation History:**
        ${formatChatHistoryForPrompt(chatHistory.slice(0, -1))}

        **User's latest action:**
        "${userMessage}"

        **Your Task:**
        Provide the simulation's response to the user's latest action, adhering strictly to the rules and the secret diagnosis. Your response should be direct and concise.
    `;

    try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-pro',
          contents: prompt
        });
        return response.text;
    } catch (error) {
        console.error("Error getting next turn:", error);
        return "Ocorreu um erro no sistema. Por favor, descreva sua última ação novamente.";
    }
};


export const generateDebriefing = async (chatHistory: ChatMessage[], secretDiagnosis: string, scenario: Scenario): Promise<string> => {
    const prompt = `
        You are the debriefing module for "OSCE AI v9 - M.O.R.T.E.". The simulation has concluded. Your task is to generate a comprehensive "Relatório de Performance" based on the entire simulation log.

        **SECRET DIAGNOSIS (The correct diagnosis):** ${secretDiagnosis}
        **SCENARIO:** ${scenario}

        **Full Simulation Transcript:**
        ${formatChatHistoryForPrompt(chatHistory)}

        **Your Task:**
        Generate a detailed report in Markdown format. The report MUST contain the following sections in this exact order:

        ### 1. Diagnóstico Correto e Fisiopatologia
        State the correct diagnosis and briefly explain its pathophysiology.

        ### 2. Análise da Linha do Tempo
        Provide a chronological list of key events and decisions from the transcript. For each key point, provide a critical analysis of the student's action or inaction.

        ${scenario === 'UBS' ? `
        ### 3. Relatório de Consequência Futura
        Describe the likely long-term outcome for the patient based on the student's management, as this was a UBS case.
        ` : ''}
        
        ### 4. Pérola do Preceptor Baseada em Evidências
        Identify the single most critical decision point in the simulation. Provide the ideal, evidence-based recommendation for that situation. You MUST cite a specific, high-quality source from the following list: Diretrizes de Sociedades (SBC, AHA, ESC, etc.), Protocolos do Ministério da Saúde/SUS/PCDT, Revisões Cochrane, JAMA, AAFP, UpToDate, Manuais MSD, ou livros-texto como "Evidence-Based Physical Diagnosis". Format the citation clearly (e.g., "Fonte: Diretriz de Insuficiência Cardíaca da SBC, 2023").

        ### 5. Análise de Vieses Cognitivos e Raciocínio Clínico
        Analyze the student's reasoning process throughout the case. Identify any potential cognitive biases (e.g., anchoring, premature closure) that may have occurred. Point out any missed opportunities to broaden the differential diagnosis, even if the final diagnosis was correct.

        ### 6. Análise Crítica Final (Refinamento da Conduta)
        Review the entire case for points of refinement that separate a good conduct from an excellent one. This includes mentioning omitted physical exam maneuvers, overlooked lab tests that are part of a gold-standard workup, or subtle differential diagnoses that were not considered. The goal is to elevate the student's clinical practice from correct to optimal.
    `;

     try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-pro',
          contents: prompt
        });
        return response.text;
    } catch (error) {
        console.error("Error generating debriefing:", error);
        return "### Erro ao gerar o relatório\nNão foi possível gerar o debriefing. Por favor, tente reiniciar a simulação.";
    }
}
