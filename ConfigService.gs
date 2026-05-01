/**
 * @fileoverview Gerencia as configurações de status do SlideStatus.
 * CRUD completo de status com validação e persistência via PropertiesService.
 */

const DEFAULT_STATUSES = [
  { id: 'default-001', name: 'A Fazer',            emoji: '🔲', color: '#6B7280', order: 1, active: true, isDefault: true, category: 'pending'     },
  { id: 'default-002', name: 'Aguardando Insumos', emoji: '⏳', color: '#F59E0B', order: 2, active: true, isDefault: true, category: 'pending'     },
  { id: 'default-003', name: 'Em Progresso',       emoji: '🔄', color: '#3B82F6', order: 3, active: true, isDefault: true, category: 'in_progress' },
  { id: 'default-004', name: 'Em Revisão',         emoji: '👀', color: '#8B5CF6', order: 4, active: true, isDefault: true, category: 'in_progress' },
  { id: 'default-005', name: 'Aprovado',           emoji: '✅', color: '#10B981', order: 5, active: true, isDefault: true, category: 'done'        },
  { id: 'default-006', name: 'Finalizado',         emoji: '🎯', color: '#1A56DB', order: 6, active: true, isDefault: true, category: 'done'        }
];

// ─── Leitura ──────────────────────────────────────────────────────────────────

/**
 * @description Retorna todos os status do deck (ativos e inativos).
 * @returns {Array} Array de objetos de status ou array vazio.
 */
function getStatuses() {
  return getData('statuses') || [];
}

/**
 * @description Retorna apenas os status ativos, ordenados por `order`.
 * @returns {Array} Array de status com active: true.
 */
function getActiveStatuses() {
  return getStatuses()
    .filter(function(s) { return s.active; })
    .sort(function(a, b) { return a.order - b.order; });
}

/**
 * @description Busca um status pelo ID (inclui inativos, para preservar referências no histórico).
 * @param {string} statusId UUID do status.
 * @returns {Object|null} Objeto do status ou null se não encontrado.
 */
function getStatusById(statusId) {
  return getStatuses().find(function(s) { return s.id === statusId; }) || null;
}

// ─── Inicialização ────────────────────────────────────────────────────────────

/**
 * @description Cria os 6 status padrão somente se não existirem dados no PropertiesService.
 * Executado uma única vez por deck (na primeira abertura).
 */
function initDefaultStatuses() {
  if (getData('statuses') !== null) return;
  setData('statuses', DEFAULT_STATUSES);
  setData('config', {
    version: '1.0',
    installedAt: new Date().toISOString(),
    installedBy: _getCurrentUserEmail()
  });
}

// ─── Escrita ──────────────────────────────────────────────────────────────────

/**
 * @description Cria um novo status customizado e salva no PropertiesService.
 * @param {string} name Nome do status (max 30 chars, único).
 * @param {string} emoji Emoji do status (1 caractere).
 * @param {string} color Cor em hex (#RRGGBB).
 * @param {number} order Posição na lista.
 * @param {string} category Categoria: 'done' | 'in_progress' | 'pending'.
 * @returns {Object} Objeto do status criado.
 * @throws {Error} Se validação falhar.
 */
function createStatus(name, emoji, color, order, category) {
  _validateStatusName(name, null);
  _validateEmoji(emoji);
  _validateColor(color);
  _validateCategory(category);

  const statuses = getStatuses();
  const newStatus = {
    id: generateUuid(),
    name: name.trim(),
    emoji: emoji,
    color: color,
    order: order || statuses.length + 1,
    active: true,
    isDefault: false,
    category: category
  };

  statuses.push(newStatus);
  if (!setData('statuses', statuses)) throw new Error('Falha ao salvar status.');
  _invalidateSync();
  return newStatus;
}

/**
 * @description Atualiza campos de um status existente.
 * @param {string} statusId UUID do status a atualizar.
 * @param {Object} fields Campos a atualizar: name, emoji, color, order, category.
 * @returns {Object} Status atualizado.
 * @throws {Error} Se status não encontrado ou validação falhar.
 */
function updateStatus(statusId, fields) {
  const statuses = getStatuses();
  const index = statuses.findIndex(function(s) { return s.id === statusId; });
  if (index === -1) throw new Error('Status não encontrado: ' + statusId);

  if (fields.name !== undefined)     _validateStatusName(fields.name, statusId);
  if (fields.emoji !== undefined)    _validateEmoji(fields.emoji);
  if (fields.color !== undefined)    _validateColor(fields.color);
  if (fields.category !== undefined) _validateCategory(fields.category);

  Object.assign(statuses[index], fields);
  if (!setData('statuses', statuses)) throw new Error('Falha ao salvar status.');
  _invalidateSync();
  return statuses[index];
}

/**
 * @description Alterna o estado ativo/inativo de um status.
 * @param {string} statusId UUID do status.
 * @returns {Object} Status com o campo `active` invertido.
 * @throws {Error} Se status não encontrado.
 */
function toggleStatus(statusId) {
  const statuses = getStatuses();
  const index = statuses.findIndex(function(s) { return s.id === statusId; });
  if (index === -1) throw new Error('Status não encontrado: ' + statusId);

  statuses[index].active = !statuses[index].active;
  if (!setData('statuses', statuses)) throw new Error('Falha ao salvar status.');
  _invalidateSync();
  return statuses[index];
}

// ─── Validações privadas ──────────────────────────────────────────────────────

function _validateStatusName(name, excludeId) {
  if (!name || name.trim().length === 0) throw new Error('O nome do status não pode ser vazio.');
  if (name.trim().length > 30) throw new Error('O nome do status deve ter no máximo 30 caracteres.');
  const duplicate = getStatuses().find(function(s) {
    return s.name === name.trim() && s.id !== excludeId;
  });
  if (duplicate) throw new Error('Já existe um status com o nome "' + name.trim() + '".');
}

function _validateEmoji(emoji) {
  if (!emoji || [...emoji].length !== 1) throw new Error('O emoji deve ter exatamente 1 caractere.');
}

function _validateColor(color) {
  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) throw new Error('Cor inválida. Use o formato #RRGGBB.');
}

function _validateCategory(category) {
  const valid = ['done', 'in_progress', 'pending'];
  if (!valid.includes(category)) throw new Error('Categoria inválida. Use: done, in_progress ou pending.');
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function _getCurrentUserEmail() {
  try {
    return Session.getActiveUser().getEmail() || 'desconhecido';
  } catch (e) {
    return 'desconhecido';
  }
}

function _invalidateSync() {
  if (typeof setLastUpdateTimestamp === 'function') setLastUpdateTimestamp();
}
