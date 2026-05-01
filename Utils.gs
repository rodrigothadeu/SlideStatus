/**
 * @fileoverview Wrappers para PropertiesService (DocumentProperties) e CacheService (DocumentCache).
 * Todas as funções tratam erros internamente e retornam valores de fallback seguros.
 */

const PROPERTIES_PREFIX = 'slidestatus_';

// ─── PropertiesService ────────────────────────────────────────────────────────

/**
 * @description Lê e desserializa um valor do DocumentProperties.
 * @param {string} key Chave sem o prefixo (ex: "statuses", "slides").
 * @returns {*} Valor desserializado ou null em caso de ausência ou erro.
 */
function getData(key) {
  try {
    const raw = PropertiesService.getDocumentProperties().getProperty(PROPERTIES_PREFIX + key);
    if (raw === null) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('getData error [' + key + ']:', e.message);
    return null;
  }
}

/**
 * @description Serializa e salva um valor no DocumentProperties.
 * @param {string} key Chave sem o prefixo.
 * @param {*} value Valor serializável para JSON.
 * @returns {boolean} true em sucesso, false em erro.
 */
function setData(key, value) {
  try {
    PropertiesService.getDocumentProperties().setProperty(PROPERTIES_PREFIX + key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error('setData error [' + key + ']:', e.message);
    return false;
  }
}

/**
 * @description Remove uma chave do DocumentProperties.
 * @param {string} key Chave sem o prefixo.
 * @returns {boolean} true em sucesso, false em erro.
 */
function clearData(key) {
  try {
    PropertiesService.getDocumentProperties().deleteProperty(PROPERTIES_PREFIX + key);
    return true;
  } catch (e) {
    console.error('clearData error [' + key + ']:', e.message);
    return false;
  }
}

// ─── CacheService ─────────────────────────────────────────────────────────────

/**
 * @description Lê e desserializa um valor do DocumentCache.
 * @param {string} key Chave sem o prefixo.
 * @returns {*} Valor desserializado, ou null em cache miss ou erro.
 */
function getCached(key) {
  try {
    const raw = CacheService.getDocumentCache().get(PROPERTIES_PREFIX + key);
    if (raw === null) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

/**
 * @description Serializa e salva um valor no DocumentCache.
 * @param {string} key Chave sem o prefixo.
 * @param {*} value Valor serializável para JSON.
 * @param {number} ttl Tempo de vida em segundos (máximo 21600).
 * @returns {boolean} true em sucesso, false em erro.
 */
function setCached(key, value, ttl) {
  try {
    CacheService.getDocumentCache().put(PROPERTIES_PREFIX + key, JSON.stringify(value), ttl);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * @description Remove uma chave do DocumentCache.
 * @param {string} key Chave sem o prefixo.
 */
function clearCached(key) {
  try {
    CacheService.getDocumentCache().remove(PROPERTIES_PREFIX + key);
  } catch (e) {
    // Falha silenciosa — cache é melhor-esforço
  }
}

// ─── Utilitários ──────────────────────────────────────────────────────────────

/**
 * @description Gera um UUID v4 via Utilities do GAS.
 * @returns {string} UUID v4 no formato xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.
 */
function generateUuid() {
  return Utilities.getUuid();
}
