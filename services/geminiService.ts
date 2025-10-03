import { GoogleGenAI } from "@google/genai";
console.log("DEBUG: Chave de API do Gemini carregada:", import.meta.env.VITE_GEMINI_API_KEY);

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
  throw new Error("VITE_GEMINI_API_KEY is not set or is a placeholder. Please add it to your .env.local file and rebuild the project.");
}
const ai = new GoogleGenAI(apiKey);

const objectiveInstructions: { [key in RewriteTarget]: string } = {
    'record': `
      **Objetivo:** Registro em Prontuário Médico.
      **Tom:** O tom deve ser profissional, técnico, claro e objetivo, adequado para registros médicos oficiais. Use terminologia apropriada e mantenha uma estrutura impessoal e formal.
    `,
    'patient': `
      **Objetivo:** Comunicação com Paciente/Cuidador.
      **Tom:** O tom deve ser empático, acolhedor e simplificado. Evite jargões médicos complexos e use uma linguagem que um leigo possa entender facilmente. O objetivo é orientar e informar de forma clara e humana.
    `,
};

export async function rewriteText(text: string, target: RewriteTarget): Promise<string> {
  const selectedInstruction = objectiveInstructions[target];
  
  const prompt = `
    Você é um assistente de IA especializado em saúde, treinado para reescrever anotações de visitas domiciliares.
    Sua tarefa é transformar o texto a seguir, que pode conter linguagem informal, abreviações e relatos subjetivos, em um texto adequado para o objetivo especificado.

    ${selectedInstruction}

    **Diretrizes Gerais Estritas:**
    1.  **Objetividade vs. Empatia:** Se o objetivo for 'Prontuário', foque nos fatos. Se for 'Paciente', equilibre a informação com uma abordagem acolhedora.
    2.  **Clareza e Concisão:** Organize as informações de forma lógica. Seja direto e evite redundâncias.
    3.  **Correção:** Corrija erros gramaticais e de ortografia.
    4.  **Fidelidade ao Original:** NÃO adicione, invente ou infira informações que não estejam explicitamente presentes no texto original. Apenas reformule o que foi fornecido.

    **Exemplo para 'Prontuário':**
    *   **Texto Original:** "fui na casa da dona maria hoje, ela tava reclamando de dor nas perna, disse que tá doendo muito pra andar. a casa tava meio bagunçada. falei pra ela tomar o remedio direitinho."
    *   **Texto Reescrito:** "Realizada visita domiciliar à paciente Maria. Paciente refere algia em membros inferiores, com intensificação da dor durante a deambulação. Observado ambiente domiciliar com necessidade de organização. Reforçada orientação sobre a importância da adesão ao tratamento medicamentoso prescrito."

    **Exemplo para 'Paciente':**
    *   **Texto Original:** "fui na casa da dona maria hoje, ela tava reclamando de dor nas perna, disse que tá doendo muito pra andar. a casa tava meio bagunçada. falei pra ela tomar o remedio direitinho."
    *   **Texto Reescrito:** "Olá, Dona Maria! Durante nossa visita hoje, conversamos sobre a dor nas suas pernas, que piora quando a senhora caminha. É muito importante que a senhora continue tomando seus remédios todos os dias, conforme orientado, para ajudar a aliviar esse desconforto. Cuide-se bem!"

    ---
    **Texto original para reescrever:**
    \`\`\`
    ${text}
    \`\`\`
    ---

    **Texto reescrito (para '${target === 'record' ? 'Prontuário' : 'Paciente'}'):**
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    if (response && response.text) {
        return response.text.trim();
    } else {
        throw new Error("A resposta da API estava vazia ou em formato inesperado.");
    }
  } catch (error) {
    console.error("Erro ao chamar a API Gemini:", error);
    throw new Error("Falha na comunicação com o serviço de IA.");
  }
}

export async function populateTemplate(
  sourceText: string,
  templateContent: string,
  sourceImage: { mimeType: string; data: string } | null
): Promise<string> {
  const prompt = `
    Você é um assistente de IA especialista em preenchimento de modelos.
    Sua tarefa é analisar o conteúdo fonte fornecido (que pode incluir uma imagem e/ou texto) e usar as informações contidas nele para preencher o "Modelo de Texto", substituindo todas as ocorrências de 'XXXXXX' pelos dados corretos de forma contextual.
    Se uma imagem for fornecida, extraia as informações dela. O texto fornecido é um contexto adicional para ajudar na extração.
    Retorne apenas o texto do modelo completamente preenchido, sem adicionar formatação extra ou explicações.

    **Exemplo (com texto):**
    *   **Texto Fonte:** "Cliente: Maria Clara, Produto: Consulta Pediátrica, Data: 25/12/2024"
    *   **Modelo de Texto:** "Lembrete de agendamento para XXXXXX. Sua XXXXXX está confirmada para XXXXXX."
    *   **Resultado Esperado:** "Lembrete de agendamento para Maria Clara. Sua Consulta Pediátrica está confirmada para 25/12/2024."
    
    ---
    **Texto Fonte Adicional (Contexto):**
    \`\`\`
    ${sourceText || 'Nenhum texto de contexto fornecido.'}
    \`\`\`
    ---
    **Modelo de Texto para Preencher:**
    \`\`\`
    ${templateContent}
    \`\`\`
    ---
    **Texto Preenchido:**
  `;

  const textPart = { text: prompt };
  const parts: any[] = [];

  if (sourceImage) {
    parts.push({
      inlineData: {
        mimeType: sourceImage.mimeType,
        data: sourceImage.data,
      },
    });
  }
  parts.push(textPart);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: parts },
    });

    if (response && response.text) {
      return response.text.trim();
    } else {
      throw new Error("A resposta da API estava vazia ou em formato inesperado.");
    }
  } catch (error) {
    console.error("Erro ao chamar a API Gemini para preenchimento:", error);
    throw new Error("Falha ao preencher o modelo com o serviço de IA.");
  }
}