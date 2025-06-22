# Na Chapa

Sistema de gerenciamento de pedidos para lanchonetes com atendimento via balcão e WhatsApp, integração com IA, cardápio dinâmico, impressão térmica e controle de vendas.

## Pré-requisitos
- Node.js (>= 18.x)
- PostgreSQL (>= 14.x)
- Git

## Instalação
1. Clone o repositório: `git clone https://github.com/seu-usuario/na-chapa.git`
2. Instale as dependências: `npm run install:all`
3. Configure o banco de dados no arquivo `backend/.env`
4. Execute as migrações do Prisma: `cd backend && npx prisma migrate dev`
5. Inicie o backend: `npm run start:backend`

## Estrutura
- `backend/`: Servidor Node.js com Express e Prisma.
- `frontend/`: Interface React com Tailwind CSS.
- `ai/`: Lógica de IA para atendimento via WhatsApp.
- `image-generator/`: Geração de imagens do cardápio.
- `printer/`: Integração com impressora térmica.
- `electron/`: Empacotamento como aplicativo desktop.