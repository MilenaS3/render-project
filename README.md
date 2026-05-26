# CRUD de Produtos

Aplicação web simples para gerenciar um catálogo de produtos. Backend em **Node.js + Express** servindo uma API REST e uma interface gráfica estática em HTML. Persistência **em memória** (sem banco de dados — os dados são reiniciados a cada restart do servidor).

Projeto criado para fins didáticos: demonstra os conceitos de API REST, CRUD, containerização com Docker e deploy em PaaS (Render).

---

## Sumário

- [Stack](#stack)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Como rodar](#como-rodar)
  - [1. Local com Node.js](#1-local-com-nodejs)
  - [2. Local com Docker Compose](#2-local-com-docker-compose)
  - [3. Local com Docker (sem compose)](#3-local-com-docker-sem-compose)
- [API](#api)
- [Interface gráfica](#interface-gráfica)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Deploy no Render](#deploy-no-render)
- [Limitações conhecidas](#limitações-conhecidas)
- [Troubleshooting](#troubleshooting)

---

## Stack

- **Runtime**: Node.js 18 (Alpine no container)
- **Framework**: Express 4.x
- **Persistência**: array em memória (volátil)
- **Frontend**: HTML estático (servido pelo Express via `express.static`)
- **Container**: Docker / Docker Compose
- **Deploy**: Render (via Dockerfile)

---

## Estrutura do projeto

```
render-project/
├── public/
│   └── index.html         # interface gráfica do CRUD
├── server.js              # servidor Express + rotas da API
├── package.json           # dependências e scripts
├── Dockerfile             # build da imagem de produção
├── docker-compose.yml     # orquestração para dev local
├── .dockerignore          # arquivos ignorados no build da imagem
└── .gitignore             # arquivos ignorados pelo git
```

---

## Como rodar

### Pré-requisitos

- **Node.js 18+** e **npm** (para opção 1)
- **Docker 24+** e **Docker Compose v2** (para opções 2 e 3)

### 1. Local com Node.js

```bash
# instalar dependências
npm install

# subir o servidor
npm start
```

Acesse `http://localhost:3000`.

### 2. Local com Docker Compose

Forma recomendada — sobe a imagem buildada do `Dockerfile` em segundo plano:

```bash
# build + sobe em background
docker compose up --build -d

# acompanhar logs
docker compose logs -f app

# parar e remover container/rede
docker compose down
```

Acesse `http://localhost:3000`.

### 3. Local com Docker (sem compose)

```bash
docker build -t crud-produtos .
docker run --rm -p 3000:3000 --name crud-produtos crud-produtos
```

---

## API

Base URL: `http://localhost:3000`

| Método | Rota              | Descrição                  | Status sucesso |
|--------|-------------------|----------------------------|----------------|
| GET    | `/produtos`       | Lista todos os produtos    | `200`          |
| GET    | `/produtos/:id`   | Busca produto por ID       | `200` / `404`  |
| POST   | `/produtos`       | Cria um novo produto       | `201`          |
| PUT    | `/produtos/:id`   | Atualiza produto existente | `200` / `404`  |
| DELETE | `/produtos/:id`   | Remove produto             | `204` / `404`  |

### Modelo `Produto`

```json
{
  "id": "1",
  "name": "Laptop Gamer",
  "price": 4500.00
}
```

- `id` (string): gerado pelo servidor (timestamp em ms via `Date.now()`).
- `name` (string): obrigatório no POST.
- `price` (number): obrigatório no POST.

### Exemplos com `curl`

```bash
# listar
curl http://localhost:3000/produtos

# criar
curl -X POST http://localhost:3000/produtos \
  -H 'Content-Type: application/json' \
  -d '{"name":"Teclado Mecânico","price":350.00}'

# buscar por id
curl http://localhost:3000/produtos/1

# atualizar (parcial — só os campos enviados são alterados)
curl -X PUT http://localhost:3000/produtos/1 \
  -H 'Content-Type: application/json' \
  -d '{"price":4200.00}'

# remover
curl -X DELETE http://localhost:3000/produtos/1
```

### Códigos de erro

- `400 Bad Request` — POST sem `name` ou `price`.
- `404 Not Found` — `id` inexistente em GET/PUT/DELETE.

---

## Interface gráfica

Página única em [public/index.html](public/index.html), servida pelo `express.static`. Permite criar, listar, editar e remover produtos consumindo a própria API REST acima via `fetch`.

Acesse a raiz `http://localhost:3000/` no navegador.

> Qualquer rota não-API recai no `index.html` (fallback SPA-like via `app.get('*', ...)`).

---

## Variáveis de ambiente

| Variável | Padrão | Descrição                              |
|----------|--------|----------------------------------------|
| `PORT`   | `3000` | Porta TCP em que o servidor escuta.    |

No `docker-compose.yml`, `PORT` é setado explicitamente para `3000`.

---

## Deploy no Render

O Render detecta o `Dockerfile` automaticamente e faz o build/deploy da imagem.

Configuração no painel do Render:

- **Environment**: `Docker`
- **Branch**: `main`
- **Health Check Path**: `/produtos` (opcional)
- **Port**: o Render injeta `PORT` automaticamente — o `server.js` já respeita via `process.env.PORT`.

> O `docker-compose.yml` **não é usado pelo Render** — serve apenas para desenvolvimento local. O Render só consome o `Dockerfile`.

---

## Limitações conhecidas

- **Persistência volátil**: ao reiniciar o servidor (ou rebuild do container), todos os produtos criados são perdidos. Restam apenas os 2 itens do seed inicial em [server.js](server.js).
- **Sem autenticação**: qualquer cliente pode criar/editar/deletar.
- **Sem validação avançada**: aceita `price` negativo, `name` vazio (`""`), etc.
- **IDs feios**: novos produtos recebem `id` baseado em `Date.now()` (ex.: `1779721825268`). É único, mas longo. Trocar por contador ou UUID é trivial.
- **Sem testes automatizados**.
- **Sem paginação** no `GET /produtos` — devolve a lista inteira.

Esses são pontos de evolução naturais — bons exercícios para próximas iterações.

---

## Troubleshooting

### `Error: Cannot find module 'express'`

`node_modules` corrompido ou ausente. Reinstale:

```bash
rm -rf node_modules package-lock.json
npm install
```

### `address already in use` ao subir o compose

A porta `3000` está ocupada. Causas comuns:

1. Container órfão de uma tentativa anterior:
   ```bash
   docker compose down --remove-orphans
   ```
2. Processo `node` rodando no host (talvez de um `npm start` esquecido):
   ```bash
   pkill -f 'node server.js'
   ```
3. Outra aplicação ouvindo na 3000:
   ```bash
   ss -tlnp | grep :3000
   ```

### Container sobe mas página não abre

Confira se o container está realmente em execução:

```bash
docker compose ps
docker compose logs app
```
