// Tipos para as responses da API
interface DeleteSuccessResponse {
  message: string
  deletedId: string
}

interface DeleteErrorResponse {
  error: string
  details?: string
}

// Tipo para o resultado da função
interface DeleteResult {
  success: boolean
  message: string
  deletedId?: string
  error?: string
  details?: string
}

/**
 * Função para deletar um registro Inspect usando fetch nativo
 * @param id - ID do registro Inspect a ser deletado (CUID)
 * @returns Promise com o resultado da operação
 */
export async function handlerDelete(id: string): Promise<DeleteResult> {
  try {
    // Validação básica do ID
    if (!id || typeof id !== 'string' || id.trim() === '') {
      return {
        success: false,
        message: 'ID é obrigatório',
        error: 'INVALID_ID',
        details: 'O ID fornecido é inválido ou vazio'
      }
    }

    // Configuração da requisição com fetch
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 segundos

    const response = await fetch(`/api/v2/inspect/${id.trim()}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal, // Para timeout
    })

    // Limpar timeout se a requisição completar
    clearTimeout(timeoutId)

    // Parse da resposta
    let responseData: DeleteSuccessResponse | DeleteErrorResponse

    try {
      responseData = await response.json()
    } catch {
      // Se não conseguir fazer parse do JSON
      return {
        success: false,
        message: 'Resposta inválida do servidor',
        error: 'INVALID_RESPONSE',
        details: 'O servidor retornou uma resposta que não pode ser processada'
      }
    }

    // Verificar se a resposta foi bem-sucedida
    if (response.ok) {
      const successData = responseData as DeleteSuccessResponse
      return {
        success: true,
        message: successData.message,
        deletedId: successData.deletedId
      }
    }

    // Tratamento de erros HTTP
    const errorData = responseData as DeleteErrorResponse

    switch (response.status) {
      case 400:
        return {
          success: false,
          message: 'Dados inválidos',
          error: 'BAD_REQUEST',
          details: errorData?.details || errorData?.error || 'ID inválido'
        }

      case 404:
        return {
          success: false,
          message: 'Registro não encontrado',
          error: 'NOT_FOUND',
          details: errorData?.details || 'O registro Inspect não existe'
        }

      case 409:
        return {
          success: false,
          message: 'Não é possível deletar',
          error: 'CONFLICT',
          details: errorData?.details || 'Existem dependências que impedem a deleção'
        }

      case 500:
        return {
          success: false,
          message: 'Erro interno do servidor',
          error: 'SERVER_ERROR',
          details: errorData?.details || 'Erro inesperado no servidor'
        }

      default:
        return {
          success: false,
          message: 'Erro desconhecido',
          error: 'UNKNOWN_ERROR',
          details: `Status: ${response.status} - ${errorData?.error || 'Erro não identificado'}`
        }
    }

  } catch (error) {
    console.error('Erro ao deletar Inspect:', error)

    // Tratamento de diferentes tipos de erro
    if (error instanceof Error) {
      // Erro de AbortController (timeout)
      if (error.name === 'AbortError') {
        return {
          success: false,
          message: 'Timeout na requisição',
          error: 'TIMEOUT',
          details: 'A requisição demorou mais de 10 segundos para responder'
        }
      }

      // Erro de rede (fetch falhou)
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return {
          success: false,
          message: 'Erro de conexão',
          error: 'NETWORK_ERROR',
          details: 'Não foi possível conectar ao servidor. Verifique sua conexão.'
        }
      }

      return {
        success: false,
        message: 'Erro inesperado',
        error: 'UNEXPECTED_ERROR',
        details: error.message
      }
    }

    return {
      success: false,
      message: 'Erro desconhecido',
      error: 'UNKNOWN_ERROR',
      details: 'Erro não identificado durante a operação'
    }
  }
}

/*
// Exemplo de uso da função
export async function exemploUso() {
  const inspectId = 'clhd8f9g00000356m0z1x2y3z'
  
  const result = await handlerDelete(inspectId)
  
  if (result.success) {
    console.log('✅ Sucesso:', result.message)
    console.log('📋 ID deletado:', result.deletedId)
    
    // Aqui você pode atualizar o estado da aplicação
    // Por exemplo, remover o item da lista, mostrar notificação de sucesso, etc.
    
  } else {
    console.error('❌ Erro:', result.message)
    console.error('🔍 Detalhes:', result.details)
    
    // Aqui você pode tratar os diferentes tipos de erro
    switch (result.error) {
      case 'NOT_FOUND':
        // Mostrar mensagem que o registro não existe mais
        break
      case 'NETWORK_ERROR':
        // Mostrar mensagem de erro de conexão
        break
      case 'CONFLICT':
        // Mostrar mensagem sobre dependências
        break
      default:
        // Mostrar mensagem de erro genérica
        break
    }
  }
}
*/