<p align="center">
  <img src="Logo Horizontal.png" alt="SlideStatus Logo" height="80">
</p>

<p align="center">
  <a href="https://github.com/rodrigothadeu/SlideStatus/releases"><img src="https://img.shields.io/badge/version-v1.1.0-blue.svg" alt="Version"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License"></a>
  <a href="https://makeapullrequest.com"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome"></a>
  <a href="https://github.com/rodrigothadeu/SlideStatus/stargazers"><img src="https://img.shields.io/github/stars/rodrigothadeu/SlideStatus?style=social" alt="GitHub stars"></a>
</p>

Add-on para Google Slides que adiciona gestão de status de workflow por slide diretamente na sidebar. Cada slide recebe um status (A Fazer, Em Progresso, Aprovado etc.), com histórico de alterações, barra de progresso e sincronização em tempo real entre colaboradores do deck.

## Funcionalidades

- **Status por slide** — 6 status padrão; criar, editar e desativar status customizados com emoji, cor e categoria configuráveis
- **Barra de progresso** — visão consolidada do deck segmentada em Pendente, Em Progresso e Concluído
- **Histórico** — registro imutável de cada alteração: quem mudou, de qual status para qual e quando
- **Sincronização** — polling a cada 30 segundos; colaboradores veem as alterações uns dos outros sem recarregar
- **Painel de ícones** — ícone do SlideStatus no painel lateral direito do Google Slides (via Workspace Add-on)
- **Recolher sidebar** — botão para ocultar o conteúdo e usar apenas o espaço do header

## Tecnologia

100% Google Apps Script — sem backend externo, sem banco de dados, sem dependências npm em produção. Todos os dados persistem no `DocumentProperties` do próprio deck, compartilhado entre os colaboradores com acesso ao arquivo.

## Desenvolvimento

**Pré-requisito:** Node.js instalado (apenas para o clasp CLI).

```bash
npm install -g @google/clasp   # instala o clasp globalmente (uma vez)
clasp login                    # autenticação com conta Google (abre o browser)
clasp push                     # envia os arquivos para o projeto GAS
clasp open                     # abre o editor online do Apps Script
```

O projeto GAS está vinculado ao script ID definido em `.clasp.json`. Não há build, transpilação ou suite de testes local — toda a execução acontece nos servidores do Google via runtime V8.

## Estrutura do projeto

```
Code.gs            — entry point: onOpen, openSidebar, funções públicas chamadas pelo frontend
ConfigService.gs   — CRUD de status (criar, editar, ativar/desativar, validações)
StatusService.gs   — atribuição e leitura de status por slide, persistência
HistoryService.gs  — registro append-only de alterações por slide
SyncService.gs     — getFullState com cache, timestamp de sincronização
Utils.gs           — wrappers para PropertiesService e CacheService
Sidebar.html       — UI completa (HTML + CSS + JS vanilla, sem dependências externas)
appsscript.json    — manifesto: escopos OAuth, triggers, metadados do Workspace Add-on
```

## Modelo de dados

Tudo armazenado como JSON no `DocumentProperties` (prefixo `slidestatus_`, limite 9 KB/chave):

| Chave | Conteúdo |
|-------|----------|
| `slidestatus_statuses` | Array de status com id, nome, emoji, cor, ordem, categoria |
| `slidestatus_slides` | Mapa `slideId → { statusId, updatedAt, updatedBy }` |
| `slidestatus_history_[slideId]` | Array de entradas `{ fromStatusId, toStatusId, changedBy, changedAt }` |
| `slidestatus_last_update` | Timestamp ISO 8601 da última alteração (usado pelo polling) |

## Distribuição

Consulte [INSTALACAO.md](INSTALACAO.md) para os cinco modelos de instalação e distribuição:

1. Individual e manual (ambiente de desenvolvimento)
2. Time via link privado (Marketplace Não Listado)
3. Marketplace público
4. Marketplace não listado
5. Toda a organização (domain-wide via admin)

## Versão

`1.1.0`