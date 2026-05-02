/**
 * @fileoverview Entry point do Add-on SlideStatus (Editor Add-on para Google Slides).
 */

// ─── Triggers ─────────────────────────────────────────────────────────────────

/**
 * @description Trigger simples executado ao abrir o Google Slides.
 * Adiciona o menu do Add-on na barra de menus do Slides.
 * @param {Object} e Evento do GAS.
 */
function onOpen(e) {
  _createMenus();
}

/**
 * @description Cria os menus do Add-on na barra de menus do Slides.
 * Chamado por onOpen (Editor Add-on) e onFileScopeGranted (Workspace Add-on).
 */
function _createMenus() {
  const ui = SlidesApp.getUi();
  ui.createAddonMenu()
    .addItem('🚀 Abrir SlideStatus', 'openSidebar')
    .addSeparator()
    .addItem('🔄 Atualizar Dados', 'openSidebar')
    .addToUi();
  ui.createMenu('🚦 SlideStatus')
    .addItem('🚀 Abrir Painel Lateral', 'openSidebar')
    .addSeparator()
    .addItem('🔄 Sincronizar Agora', 'openSidebar')
    .addToUi();
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

/**
 * @description Inicializa os dados do deck e abre a sidebar do SlideStatus.
 */
function openSidebar() {
  initDefaultStatuses();
  const html = HtmlService.createHtmlOutputFromFile('Sidebar')
    .setTitle('SlideStatus')
    .setWidth(300);
  SlidesApp.getUi().showSidebar(html);
}


// ─── Funções públicas chamadas pelo frontend via google.script.run ─────────────

/**
 * @description Retorna o estado inicial completo do deck para carregar a sidebar.
 * Agrega slides, status ativos e mapa de status por slide em uma única chamada.
 * @returns {Object} { slides, statuses, slideStatuses }
 */
function getInitialState() {
  const presentation = SlidesApp.getActivePresentation();
  const rawSlides = presentation.getSlides();

  const slides = rawSlides.map(function(slide, index) {
    return { id: slide.getObjectId(), pageNumber: index + 1 };
  });

  return {
    slides: slides,
    statuses: getActiveStatuses(),
    slideStatuses: getAllSlideStatuses()
  };
}

/**
 * @description Proxy público para setSlideStatus — chamado pelo frontend.
 * @param {string} slideId ID do slide.
 * @param {string} statusId UUID do status.
 * @returns {Object} Resultado de setSlideStatus.
 */
function updateSlideStatus(slideId, statusId) {
  return setSlideStatus(slideId, statusId);
}

/**
 * @description Retorna o histórico e dados de um slide específico em uma única chamada.
 * Evita múltiplas chamadas google.script.run para carregar o painel de histórico.
 * @param {string} slideId ID do slide.
 * @returns {Object} { slideId, pageNumber, history }
 */
function getSlideDetail(slideId) {
  const slides = SlidesApp.getActivePresentation().getSlides();
  const index  = slides.findIndex(function(s) { return s.getObjectId() === slideId; });
  return {
    slideId:    slideId,
    pageNumber: index + 1,
    history:    getSlideHistory(slideId)
  };
}

/**
 * @description Retorna a versão do Add-on.
 * @returns {string} Versão do Add-on.
 */
function getVersion() {
  return '1.0.0';
}

// ─── Workspace Add-on — painel de ícones do Google Slides ────────────────────

/**
 * @description Trigger chamado quando o usuário concede acesso ao arquivo via Workspace Add-on.
 * Recria os menus para que apareçam mesmo quando instalado pelo Marketplace.
 * @param {Object} e Evento do GAS.
 */
function onFileScopeGranted(e) {
  _createMenus();
}

/**
 * @description Retorna o card exibido no painel lateral direito do Google Slides.
 * Ativado pelo clique no ícone do SlideStatus no painel de ícones do Slides.
 * @param {Object} e Evento do GAS.
 * @returns {Card}
 */
function onSlidesHomepage(e) {
  return CardService.newCardBuilder()
    .setName('SlideStatus')
    .addSection(
      CardService.newCardSection()
        .addWidget(
          CardService.newTextButton()
            .setText('Abrir SlideStatus')
            .setOnClickAction(
              CardService.newAction().setFunctionName('openSidebarAction')
            )
        )
    )
    .build();
}

/**
 * @description Action handler que abre a sidebar principal via botão no card.
 * @returns {ActionResponse}
 */
function openSidebarAction(e) {
  openSidebar();
  return CardService.newActionResponseBuilder().build();
}

// ─── RF-010: Viabilidade de emoji sobre miniatura nativa ─────────────────────

// VIABILITY: INVIÁVEL
// A barra lateral de miniaturas do Google Slides é renderizada pelo aplicativo
// nativo (DOM do browser gerenciado pelo Google) e não é acessível via
// SlidesApp API nem via HtmlService. Não existe método para sobrepor elementos
// nas thumbnails sem modificar o conteúdo real do slide.
// Alternativa implementada: indicador visual exclusivamente na sidebar do Add-on.
