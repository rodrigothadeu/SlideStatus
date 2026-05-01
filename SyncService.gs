/**
 * @fileoverview Serviço de sincronização e estado do SlideStatus.
 * M3: getProgressStats — cálculo de progresso do deck.
 * M5: getFullState, getLastUpdateTimestamp, setLastUpdateTimestamp — polling entre colaboradores.
 */

const SYNC_CACHE_KEY   = 'fullstate';
const SYNC_CACHE_TTL   = 25; // segundos
const LAST_UPDATE_KEY  = 'last_update';

// ─── Progresso (M3) ───────────────────────────────────────────────────────────

/**
 * @description Calcula o percentual de slides por categoria de status.
 * @returns {Object|null} { done, in_progress, pending (cada um: {count, percent}), total }
 *   Retorna null se a apresentação não tiver slides.
 */
function getProgressStats() {
  const allSlides = SlidesApp.getActivePresentation().getSlides();
  const total = allSlides.length;
  if (total === 0) return null;

  const slideStatuses = getAllSlideStatuses();
  const statuses      = getStatuses();

  const counts = { done: 0, in_progress: 0, pending: 0 };

  allSlides.forEach(function(slide) {
    const slideId  = slide.getObjectId();
    const entry    = slideStatuses[slideId];
    const statusId = entry ? entry.statusId : 'default-001';
    const status   = statuses.find(function(s) { return s.id === statusId; });
    const category = (status && status.category) ? status.category : 'pending';
    counts[category] = (counts[category] || 0) + 1;
  });

  // Arredondar dois primeiros e deduzir o terceiro para garantir soma = 100
  const pDone = Math.round(counts.done / total * 100);
  const pIP   = Math.round(counts.in_progress / total * 100);
  const pPend = 100 - pDone - pIP;

  return {
    done:        { count: counts.done,        percent: pDone  },
    in_progress: { count: counts.in_progress, percent: pIP    },
    pending:     { count: counts.pending,     percent: pPend  },
    total: total
  };
}

// ─── Timestamp de última atualização (M5) ─────────────────────────────────────

/**
 * @description Retorna o timestamp da última escrita de qualquer colaborador.
 * @returns {string|null} ISO 8601 ou null se ainda não existir.
 */
function getLastUpdateTimestamp() {
  return getData(LAST_UPDATE_KEY);
}

/**
 * @description Registra o momento da última escrita e invalida o cache do estado completo.
 */
function setLastUpdateTimestamp() {
  setData(LAST_UPDATE_KEY, new Date().toISOString());
  clearCached(SYNC_CACHE_KEY);
}

// ─── Estado completo (M5) ─────────────────────────────────────────────────────

/**
 * @description Retorna o estado completo do deck com cache de 25s.
 * Usado pelo polling do frontend para detectar mudanças de outros colaboradores.
 * @returns {Object} { slides, statuses, slideStatuses, lastUpdated, timestamp }
 */
function getFullState() {
  const cached = getCached(SYNC_CACHE_KEY);
  if (cached) return cached;

  const presentation = SlidesApp.getActivePresentation();
  const slides = presentation.getSlides().map(function(slide, index) {
    return { id: slide.getObjectId(), pageNumber: index + 1 };
  });

  const state = {
    slides:        slides,
    statuses:      getActiveStatuses(),
    slideStatuses: getAllSlideStatuses(),
    lastUpdated:   getLastUpdateTimestamp(),
    timestamp:     new Date().toISOString()
  };

  setCached(SYNC_CACHE_KEY, state, SYNC_CACHE_TTL);
  return state;
}
