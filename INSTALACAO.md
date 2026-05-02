# Instalação e Distribuição — SlideStatus

## Comparativo das modalidades

| Modalidade | Precisa de admin? | Precisa do Marketplace? | Indicada para |
|------------|:-----------------:|:-----------------------:|---------------|
| 1. Individual e manual | Não | Não | Desenvolvedor, teste pessoal |
| 2. Time via link privado | Não | Sim (Não Listado) | Times específicos sem admin de domínio |
| 3. Marketplace público | Não | Sim (Público) | Distribuição ampla para qualquer usuário |
| 4. Marketplace não listado | Não | Sim (Não Listado) | Grupo seleto com link direto |
| 5. Toda a organização | **Sim** | Sim | Empresa inteira via admin do domínio |

---

## 1. Instalação individual e manual

Indicada para o desenvolvedor ou para qualquer pessoa que queira instalar diretamente a partir do código-fonte, sem passar pelo Marketplace.

### Pré-requisitos
- Node.js instalado na máquina
- Conta Google (mesma do projeto GAS)

### Passo a passo

**1. Clone o repositório**
```bash
git clone https://github.com/rodrigothadeu/SlideStatus.git
cd SlideStatus
```

**2. Instale o clasp e autentique**
```bash
npm install -g @google/clasp
clasp login
```
Uma janela do browser abrirá para autorização. Use a conta `rodrigo.thadeu02@gmail.com`.

**3. Crie um novo projeto GAS** (somente na primeira vez)
```bash
clasp create --title "SlideStatus" --type standalone
```
Isso gera um novo `.clasp.json` com o `scriptId` do projeto criado.

**4. Envie o código para o GAS**
```bash
clasp push
```

**5. Abra o editor e crie uma implantação de teste**
```bash
clasp open
```
- No editor GAS: **Implantar → Testar implantações**
- Copie a **URL de instalação** exibida

**6. Instale no Google Slides**
- Abra qualquer Google Slides
- Menu: **Extensões → Complementos → Obter complementos**
- Cole a URL de instalação na barra de busca → **Instalar**
- Autorize as permissões solicitadas

**7. Use o add-on**
- Recarregue o Google Slides
- **Extensões → SlideStatus → Abrir** (ou use o ícone no painel lateral direito)

---

## 2. Instalação para o time (link privado)

Modalidade recomendada para distribuir a um grupo específico de pessoas **sem precisar de acesso de administrador** ao domínio. O add-on é publicado como Não Listado no Marketplace: fica oculto em buscas públicas e apenas quem receber o link consegue instalar.

### Pré-requisitos
- Código publicado (execute os passos 1 a 4 da Modalidade 1)
- Conta Google Cloud (gratuita em [console.cloud.google.com](https://console.cloud.google.com))
- Ícone PNG 128×128 px em URL pública (instruções abaixo)

### Passo a passo

**1. Crie e hospede o ícone**

O ícone precisa estar em uma URL HTTPS pública. A forma mais simples usando o Google Drive:
- Crie um PNG 128×128 px (Canva, Figma ou qualquer editor de imagem)
- Faça upload no **Google Drive**
- Clique com botão direito → **Compartilhar** → **Qualquer pessoa com o link** → **Visualizador** → **Concluído**
- Copie o ID do arquivo a partir da URL: `https://drive.google.com/file/d/**ID_DO_ARQUIVO**/view`
- URL pública do ícone: `https://drive.google.com/uc?export=view&id=ID_DO_ARQUIVO`

**2. Atualize o ícone no manifesto**

No arquivo `appsscript.json`, substitua o placeholder pela URL real:
```json
"logoUrl": "https://drive.google.com/uc?export=view&id=SEU_ID_AQUI"
```

Envie a atualização:
```bash
clasp push
```

**3. Crie o projeto no Google Cloud Console**
- Acesse [console.cloud.google.com](https://console.cloud.google.com)
- Clique em **Selecionar projeto → Novo projeto**
- Nome: `SlideStatus` → **Criar**
- Anote o **ID do projeto** gerado (aparece no painel inicial)

**4. Vincule o Cloud Project ao projeto GAS**
- No editor GAS (`clasp open`): clique no ícone de engrenagem **⚙ Configurações do projeto**
- Seção **Google Cloud Platform → Mudar projeto**
- Cole o **ID do Cloud Project** → **Definir projeto**

**5. Ative a API do Marketplace**
- No Cloud Console: menu lateral **APIs e serviços → Biblioteca**
- Busque por `Google Workspace Marketplace SDK`
- Clique no resultado → **Ativar**

**6. Configure a tela de consentimento OAuth**
- No Cloud Console: **APIs e serviços → Tela de consentimento OAuth**
- Tipo de usuário: **Externo** → **Criar**
- Preencha:
  - Nome do app: `SlideStatus`
  - E-mail de suporte do usuário: seu e-mail
  - Informações de contato do desenvolvedor: seu e-mail
- **Salvar e continuar** (deixe os escopos e usuários de teste em branco por ora)
- **Salvar e continuar** até chegar em **Voltar ao painel**

**7. Configure o Marketplace SDK**
- No Cloud Console: **APIs e serviços → Google Workspace Marketplace SDK → Gerenciar**
- Aba **Configuração do aplicativo**:
  - Nome do aplicativo: `SlideStatus`
  - Descrição breve: `Gestão de status por slide para equipes`
  - Ícone do aplicativo: faça upload do PNG 128×128
  - **Visibilidade do aplicativo: Não listado**
  - Categorias: `Gerenciamento de trabalho`
  - Escopos OAuth: adicione `https://www.googleapis.com/auth/presentations` e `https://www.googleapis.com/auth/script.container.ui`
  - URL de política de privacidade: crie uma página simples (Google Sites, Notion público etc.) e cole a URL
- **Salvar rascunho**

**8. Crie a implantação de produção no GAS**
- No editor GAS: **Implantar → Nova implantação**
- Clique na engrenagem ⚙ ao lado de "Tipo" → **Complemento do Google Workspace**
- Descrição da versão: `v1.0`
- Clique em **Implantar**
- Copie o **ID da implantação** exibido (string longa)

**9. Vincule a implantação ao Marketplace**
- De volta no Marketplace SDK → **Configuração do aplicativo**
- Campo **ID do script**: cole o ID da implantação copiado no passo anterior
- Clique em **Publicar**
- Status muda para **Publicado (Não listado)**
- Copie o **link de instalação** exibido (formato `https://workspace.google.com/marketplace/app/...`)

**10. Distribua o link para o time**
- Envie o link de instalação por e-mail, Slack ou qualquer canal do time
- Cada membro: clica no link → **Instalar** → aceita as permissões → pronto
- O add-on passa a funcionar automaticamente em **todos os Google Slides** da pessoa, sem precisar ativar por arquivo

---

## 3. Marketplace público

Indicado quando o add-on deve estar disponível para **qualquer pessoa pesquisar e instalar** diretamente no Google Workspace Marketplace.

### Diferenças em relação ao Não Listado

| | Não Listado | Público |
|-|:-----------:|:-------:|
| Aparece em buscas no Marketplace | ❌ | ✅ |
| Requer link direto para instalar | ✅ | ❌ |
| Requer revisão do Google | ✅ | ✅ |
| Política de privacidade obrigatória | ✅ | ✅ |
| Screenshots obrigatórias | Recomendado | ✅ |

### Passo a passo

Execute **todos os passos da Modalidade 2** (itens 1 a 9), com as seguintes diferenças:

**No passo 7 (Configuração do aplicativo):**
- **Visibilidade do aplicativo: Público** (em vez de Não listado)
- Adicione uma **descrição completa** detalhando as funcionalidades (exibida no Marketplace para visitantes)
- Adicione pelo menos **2 screenshots** da sidebar em uso (PNG ou JPG, resolução mínima 1280×800)
- A **URL da política de privacidade** é obrigatória e precisa ser uma página web pública e estável

**Na publicação:**
- Clique em **Publicar** → o add-on entra na fila de revisão manual do Google
- Tempo estimado: **3 a 7 dias úteis** para a primeira publicação
- Você receberá um e-mail de aprovação ou com solicitações de ajuste
- Após aprovação, o add-on aparece nos resultados de busca do Marketplace

**Política de privacidade — conteúdo mínimo necessário:**
- Quais dados são acessados: e-mail do usuário (para registro no histórico)
- Onde ficam armazenados: no próprio documento Google Slides (DocumentProperties), sem envio a servidores externos
- Como são usados: exclusivamente para exibição do histórico de alterações dentro do add-on
- Contato para exclusão de dados: seu e-mail

---

## 4. Marketplace não listado

O Marketplace Não Listado é a opção descrita em detalhes na **Modalidade 2**. Esta seção resume suas características principais.

**O que é:**
O add-on é publicado no Google Workspace Marketplace com visibilidade restrita. Não aparece em nenhuma busca pública — só é acessível por quem tiver o link direto de instalação.

**Quando usar:**
- Times internos onde nem todos os membros do domínio devem ter acesso
- Parceiros ou clientes específicos
- Quando não há acesso de admin ao domínio corporativo
- Quando a distribuição precisa ser controlada pelo desenvolvedor

**Como funciona para o usuário final:**
1. Recebe o link de instalação
2. Clica no link → Marketplace abre com a página do add-on
3. Clica em **Instalar** → autoriza as permissões
4. Add-on está disponível em todos os Slides da conta

**Resultado da revisão do Google:**
O Google realiza uma revisão técnica antes de publicar (geralmente 1 a 3 dias úteis para Não Listado). A revisão verifica se o manifesto, os escopos OAuth e as funcionalidades declaradas são consistentes — não é uma revisão de negócios.

---

## 5. Toda a organização (domain-wide)

Indicado quando **todos os usuários de um domínio Google Workspace corporativo** devem receber o add-on instalado automaticamente, sem precisar clicar em instalar.

### Pré-requisitos
- Add-on publicado no Marketplace (complete a **Modalidade 2 ou 3** primeiro)
- Acesso de **Administrador** ao Google Workspace Admin Console do domínio corporativo

### Passo a passo

**1. Publique o add-on no Marketplace**
Complete a Modalidade 2 (Não Listado) ou Modalidade 3 (Público) antes de continuar.

**2. Acesse o Admin Console**
- Acesse [admin.google.com](https://admin.google.com) com a conta de administrador do domínio
- Menu lateral: **Aplicativos → Google Workspace Marketplace apps**

**3. Adicione o SlideStatus à lista de permissões**
- Clique em **+ Adicionar app à lista de permissões do domínio**
- Selecione **Por URL do Marketplace** → cole o link de instalação do add-on
- Ou clique em **Pesquisar no Marketplace** e busque por `SlideStatus` (somente se for Público)

**4. Configure o escopo de instalação**
Escolha quem vai receber o add-on:
- **Toda a organização**: instala para todos os usuários do domínio
- **Unidade organizacional específica**: instala apenas para o departamento selecionado (ex: somente o time de design ou marketing)
- **Grupos**: instala para um Google Group específico

**5. Defina o tipo de instalação**
- **Permitir que os usuários instalem e executem**: o add-on fica disponível para instalar, mas cada pessoa precisa instalar manualmente
- **Instalar para todos os usuários automaticamente**: todos já recebem o add-on instalado sem nenhuma ação — recomendado para rollout completo

**6. Confirme e aguarde a propagação**
- Clique em **Concluir** → **Aceitar** nas permissões solicitadas
- A instalação em massa pode levar até **24 horas** para propagar para todos os usuários do domínio
- Usuários verão o add-on disponível no próximo acesso ao Google Slides

### Observação
Esta é a única modalidade que requer acesso de administrador ao domínio. Se o admin do domínio não puder ou não quiser fazer essa configuração, utilize a **Modalidade 2 (link privado)** — que oferece controle seletivo de quem instala sem depender de nenhum administrador.
