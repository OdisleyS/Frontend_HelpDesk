# HelpDesk - Sistema de Gerenciamento de Chamados

Um sistema completo de help desk para gerenciamento de chamados de suporte técnico, desenvolvido com Next.js, TypeScript e Tailwind CSS.

## Visão Geral

Este projeto é um sistema de gerenciamento de chamados de suporte técnico que oferece funcionalidades específicas para três tipos de usuários:

- **Clientes**: Podem abrir, acompanhar e cancelar chamados
- **Técnicos**: Podem assumir, atualizar e resolver chamados
- **Gestores**: Podem gerenciar usuários, categorias, departamentos e visualizar estatísticas

## 🚀 Funcionalidades

### Para Clientes

- Cadastro e autenticação com conta Google
- Abertura de novos chamados com definição de categoria, prioridade e departamento
- Visualização e edição de chamados existentes
- Sistema de notificações para atualizações de chamados
- Gerenciamento de perfil pessoal

### Para Técnicos

- Visualização de chamados disponíveis
- Gerenciamento de chamados atribuídos
- Atualização de status e prioridade de chamados
- Sistema de comentários para comunicação com clientes
- Estatísticas pessoais de desempenho

### Para Gestores

- Dashboard com métricas e indicadores de desempenho
- Relatórios e estatísticas de chamados
- Gerenciamento de usuários (técnicos e clientes)
- Configuração de categorias e departamentos
- Definição de SLAs por categoria e prioridade

## 🛠️ Tecnologias Utilizadas

- **Frontend**:
  - Next.js 14
  - TypeScript
  - Tailwind CSS
  - Recharts (para gráficos)
  - JWT para autenticação

- **Componentes**:
  - Design System próprio com componentes reutilizáveis
  - Sistema de rotas dinâmicas com Next.js

## 🔧 Configuração e Instalação

### Pré-requisitos

- Node.js 18 ou superior
- NPM ou Yarn

### Instalação

1. Clone o repositório
   ```bash
   git clone https://github.com/seu-usuario/helpdesk-frontend.git
   cd helpdesk-frontend
   ```

2. Instale as dependências
   ```bash
   npm install
   # ou
   yarn install
   ```

3. Configure as variáveis de ambiente
   Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```

4. Inicie o servidor de desenvolvimento
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

5. Acesse `http://localhost:3000` no seu navegador

### Build para produção

```bash
npm run build
npm start
# ou
yarn build
yarn start
```

## 🧪 Testes

O projeto utiliza Jest e React Testing Library para testes unitários e de integração.

```bash
# Executar todos os testes
npm test

# Executar testes com watch mode
npm run test:watch

# Verificar cobertura de testes
npm run test:coverage
```

## 📂 Estrutura do Projeto

```
/src
  /app                    # Rotas e páginas com App Router do Next.js
    /(auth)               # Rotas de autenticação (login, registro)
    /cliente              # Rotas específicas para clientes
    /tecnico              # Rotas específicas para técnicos
    /gestor               # Rotas específicas para gestores
  /components             # Componentes React reutilizáveis
    /auth                 # Componentes de autenticação
    /cliente              # Componentes específicos para clientes
    /dashboard            # Componentes de dashboard
    /gestor               # Componentes específicos para gestores
    /statistics           # Componentes para visualização de estatísticas
    /tecnico              # Componentes específicos para técnicos
    /ui                   # Componentes de UI genéricos (botões, cards, etc.)
  /context                # Contextos React (AuthContext, etc.)
  /lib                    # Funções utilitárias e serviços
    /api                  # Serviços de API e integração com backend
  /tests                  # Testes unitários e de integração
  /types                  # Definições de tipos TypeScript
```

## 🔐 Autenticação e Autorização

O sistema utiliza autenticação baseada em JWT (JSON Web Tokens):

1. Os usuários se registram/fazem login com email e senha
2. O backend retorna um token JWT
3. O token é armazenado no localStorage e usado para autenticar requisições subsequentes
4. Um middleware verifica se o usuário está autenticado e tem permissão para acessar determinadas rotas

## 📈 Dashboard e Estatísticas

O sistema oferece um dashboard completo para gestores com:

- Contagem de chamados por status
- Gráficos de distribuição por prioridade e categoria
- Tempo médio de resolução por categoria
- Desempenho de técnicos
- Conformidade com SLA

## 🔄 Fluxo do Chamado

1. Cliente abre um chamado
2. O sistema atribui um SLA com base na categoria e prioridade
3. Técnico assume o chamado
4. Técnico atualiza o status conforme o andamento
5. Técnico resolve o chamado ou solicita mais informações
6. Cliente recebe notificações sobre mudanças de status
7. Chamado é fechado após resolução

## 🌐 Integração com Backend

O frontend se comunica com uma API RESTful desenvolvida em Java + Spring Boot. O arquivo `src/lib/api.ts` contém todas as funções para interação com o backend.

