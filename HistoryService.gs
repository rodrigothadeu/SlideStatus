/**
 * @fileoverview Registro imutável de histórico de alterações de status por slide.
 * Cada slide tem sua própria chave no PropertiesService: slidestatus_history_[slideId].
 * Isso distribui o histórico e evita exceder o limite de 9KB por chave.
 */

const MAX_HISTORY_PER_SLIDE = 50; // [DEFINIR] — limite de entradas por slide

// ─── Escrita ──────────────────────────────────────────────────────────────────

/**
 * @description Registra uma alteração de status no histórico do slide.
 * Chamado automaticamente por StatusService.setSlideStatus após escrita bem-sucedida.
 * @param {string} slideId ID do slide.
 * @param {string|null} fromStatusId UUID do status anterior (null na primeira atribuição).
 * @param {string} toStatusId UUID do novo status.
 */
function addHistoryEntry(slideId, fromStatusId, toStatusId) {
  const key     = 'history_' + slideId;
  const history = getData(key) || [];
  history.unshift(_buildHistoryEntry(fromStatusId, toStatusId));
  _enforceRetentionPolicy(history);
  setData(key, history);
}

// ─── Leitura ──────────────────────────────────────────────────────────────────

/**
 * @description Retorna o histórico de um slide em ordem cronológica decrescente
 * com os status resolvidos (nome, emoji, cor) em vez de apenas os IDs.
 * @param {string} slideId ID do slide.
 * @returns {Array} Array de entradas de histórico resolvidas.
 */
function getSlideHistory(slideId) {
  const history  = getData('history_' + slideId) || [];
  const statuses = getStatuses();

  return history.map(function(entry) {
    return {
      fromStatus: entry.fromStatusId ? _resolveStatus(entry.fromStatusId, statuses) : null,
      toStatus:   _resolveStatus(entry.toStatusId, statuses),
      changedBy:  entry.changedBy,
      changedAt:  entry.changedAt
    };
  });
}

// ─── Helpers privados ─────────────────────────────────────────────────────────

/**
 * @description Monta o objeto de uma entrada de histórico.
 * Timestamp gerado no servidor para garantir integridade.
 * @param {string|null} fromStatusId
 * @param {string} toStatusId
 * @returns {Object} Entrada de histórico.
 */
function _buildHistoryEntry(fromStatusId, toStatusId) {
  return {
    fromStatusId: fromStatusId || null,
    toStatusId:   toStatusId,
    changedBy:    _getHistoryUserEmail(),
    changedAt:    new Date().toISOString()
  };
}

/**
 * @description Resolve um statusId para o objeto do status (com fallback para removidos).
 * Inclui status inativos (active: false) para preservar referências históricas.
 * @param {string} statusId
 * @param {Array} statuses Array completo de status.
 * @returns {Object} Objeto com id, name, emoji, color.
 */
function _resolveStatus(statusId, statuses) {
  const s = statuses.find(function(x) { return x.id === statusId; });
  return s
    ? { id: s.id, name: s.name, emoji: s.emoji, color: s.color }
    : { id: statusId, name: '[Status removido]', emoji: '?', color: '#a1a1aa' };
}

/**
 * @description Garante que o array de histórico não ultrapassa MAX_HISTORY_PER_SLIDE.
 * Remove as entradas mais antigas (final do array, já que o mais recente fica no início).
 * @param {Array} arr Array de histórico (mutado in-place).
 */
function _enforceRetentionPolicy(arr) {
  if (arr.length > MAX_HISTORY_PER_SLIDE) {
    arr.splice(MAX_HISTORY_PER_SLIDE);
  }
}

function _getHistoryUserEmail() {
  try {
    return Session.getActiveUser().getEmail() || 'desconhecido';
  } catch (e) {
    return 'desconhecido';
  }
}
