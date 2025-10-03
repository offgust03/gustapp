const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

export const sendToGoogleSheet = async (data: Record<string, any>): Promise<void> => {
  if (!SCRIPT_URL) {
    console.error('A URL do Google Apps Script não foi configurada nas variáveis de ambiente (VITE_GOOGLE_SCRIPT_URL).');
    throw new Error('A URL do script não está configurada. Verifique o arquivo sheetService.ts');
  }

  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      // Redirecionamentos são tratados pelo Apps Script, então precisamos seguir
      redirect: 'follow',
    });

    // O Apps Script pode não retornar um JSON em todos os casos de redirecionamento
    // então verificamos o tipo de conteúdo antes de tentar fazer o parse.
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        const result = await response.json();
        if (result.status !== 'success') {
            throw new Error(result.message || 'Erro desconhecido ao enviar para a planilha.');
        }
    } else if (!response.ok) {
        // Se não for JSON mas a resposta não for OK, algo deu errado.
        const textResponse = await response.text();
        throw new Error(`Erro na resposta do servidor: ${textResponse}`);
    }

  } catch (error) {
    console.error('Erro ao enviar dados para a Planilha Google:', error);
    if (error instanceof Error) {
        throw new Error(`Falha ao comunicar com a Planilha Google: ${error.message}`);
    }
    throw new Error('Ocorreu um erro desconhecido ao enviar os dados.');
  }
};