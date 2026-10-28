// Tradução dos erros do servidor para mensagens ao usuário. Os códigos vêm das funções SQL.

const MENSAGENS: Record<string, string> = {
  sem_permissao: 'Sua função não permite esta ação.',
  ja_decidido: 'Este cadastro já foi decidido por outra pessoa da liderança.',
  motivo_obrigatorio: 'Informe o motivo.',
  justificativa_obrigatoria: 'Informe a justificativa.',
  proprio_vinculo: 'Você não pode decidir o seu próprio cadastro.',
  propria_funcao: 'Ninguém altera a própria função. Peça a outro administrador.',
  validade_invalida: 'Escolha uma validade entre 1 e 90 dias.',
  convite_invalido: 'Este convite não é mais válido.',
  ja_registrada: 'Você já registrou presença nesta atividade.',
  prazo_encerrado: 'O prazo de envio desta atividade terminou.',
  registro_ainda_nao_abriu: 'O registro abre ao fim da atividade.',
  atividade_cancelada: 'Esta atividade foi cancelada.',
  foto_nao_enviada: 'A foto não chegou ao servidor. Tente enviar de novo.',
  foto_invalida: 'Não foi possível vincular a foto. Tente enviar de novo.',
  proprio_registro: 'Você não pode validar o seu próprio registro. Outra pessoa da liderança fará isso.',
}

export function mensagemDeErro(erro: unknown): string {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return 'Sem conexão com a internet. Confira e tente de novo.'
  }
  const texto =
    erro && typeof erro === 'object' && 'message' in erro && typeof erro.message === 'string' ? erro.message : ''
  for (const [codigo, mensagem] of Object.entries(MENSAGENS)) {
    if (texto.includes(codigo)) return mensagem
  }
  if (/duplicate key|23505/.test(texto)) return 'Este registro já existe.'
  if (/fetch|network/i.test(texto)) return 'Não foi possível falar com o servidor. Tente de novo.'
  return 'Algo deu errado. Tente de novo em instantes.'
}
