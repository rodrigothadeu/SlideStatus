/**
 * @fileoverview Gerencia a atribuição de status por slide.
 * Leitura e escrita do mapa de slides no PropertiesService.
 */

// ─── Leitura ──────────────────────────────────────────────────────────────────

/**
 * @description Retorna o status atual de um slide específico.
 * Fallback: status "A Fazer" se o slide não tiver status atribuído.
 * @param {string} slideId ID do slide na apresentação.
 * @returns {Object} Objeto com statusId, updatedAt, updatedBy e o objeto do status resolvido.
 */
function getSlideStatus(slideId) {
  const slides = getData('slides') || {};
  if (slides[slideId]) {
    const status = getStatusById(slides[slideId].statusId);
    return Object.assign({}, slides[slideId], { status: status || _getDefaultStatus() });
  }
  return { statusId: _getDefaultStatus().id, status: _getDefaultStatus(), updatedAt: null, updatedBy: null };
}

/**
 * @description Retorna o mapa completo de status de todos os slides do deck.
 * @returns {Object} Objeto { [slideId]: { statusId, updatedAt, updatedBy } }.
 */
function getAllSlideStatuses() {
  return getData('slides') || {};
}

// ─── Escrita ──────────────────────────────────────────────────────────────────

/**
 * @description Atribui um status a um slide e registra no histórico.
 * @param {string} slideId ID do slide na apresentação.
 * @param {string} statusId UUID do status a atribuir.
 * @returns {Object} { slideId, oldStatusId, newStatusId, updatedAt }.
 * @throws {Error} Se status inválido ou slideId inválido.
 */
function setSlideStatus(slideId, statusId) {
  _validateSlideId(slideId);

  const status = getStatusById(statusId);
  if (!status) throw new Error('Status não encontrado: ' + statusId);
  if (!status.active) throw new Error('O status "' + status.name + '" está inativo.');

  const slides = getData('slides') || {};
  const oldStatusId = slides[slideId] ? slides[slideId].statusId : null;

  const now = new Date().toISOString();
  const userEmail = _getCurrentUserEmailStatus();

  slides[slideId] = { statusId: statusId, updatedAt: now, updatedBy: userEmail };

  if (!setData('slides', slides)) throw new Error('Falha ao salvar o status do slide.');

  // Registrar histórico (disponível a partir do M4)
  if (typeof addHistoryEntry === 'function') {
    try { addHistoryEntry(slideId, oldStatusId, statusId); } catch (e) { console.warn('History error:', e.message); }
  }

  _invalidateSyncStatus();
  return { slideId: slideId, oldStatusId: oldStatusId, newStatusId: statusId, updatedAt: now };
}

// ─── Helpers privados ─────────────────────────────────────────────────────────

/**
 * @description Retorna o objeto do status padrão "A Fazer".
 * @returns {Object} Objeto do status "A Fazer".
 */
function _getDefaultStatus() {
  return getStatusById('default-001') || { id: 'default-001', name: 'A Fazer', emoji: '🔲', color: '#6B7280', category: 'pending' };
}

/**
 * @description Valida que o slideId existe na apresentação ativa.
 * Itera pelo array de slides em vez de usar getSlideById(), que pode
 * retornar null para slides que não estão selecionados ativamente.
 * @param {string} slideId ID do slide a validar.
 * @throws {Error} Se o slideId não existir no deck atual.
 */
function _validateSlideId(slideId) {
  const slides = SlidesApp.getActivePresentation().getSlides();
  const exists = slides.some(function(s) { return s.getObjectId() === slideId; });
  if (!exists) throw new Error('Slide inválido: ' + slideId);
}

function _getCurrentUserEmailStatus() {
  try {
    return Session.getActiveUser().getEmail() || 'desconhecido';
  } catch (e) {
    return 'desconhecido';
  }
}

function _invalidateSyncStatus() {
  if (typeof setLastUpdateTimestamp === 'function') setLastUpdateTimestamp();
}
