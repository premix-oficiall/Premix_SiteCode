# Backend PremiX - Gestão de Gestores

Este projeto implementa um backend para a gestão de gestores da plataforma PremiX, utilizando Node.js, Express e MongoDB Atlas. A estrutura segue o padrão MVC (Model-View-Controller).

## Estrutura do Projeto

```
backend/
├── src/
│   ├── controllers/
│   │   └── GestorController.js
│   ├── models/
│   │   └── Gestor.js
│   └── routes/
│       └── GestorRoutes.js
├── .env
├── package.json
├── package-lock.json
└── server.js
```

## Pré-requisitos

- Node.js (versão 14 ou superior)
- npm (gerenciador de pacotes do Node.js)
- Uma conta no MongoDB Atlas e um cluster configurado.

## Configuração

1.  **Clone o repositório (ou crie os arquivos conforme instruído):**

    ```bash
    # Se você clonou o projeto
    git clone <URL_DO_SEU_REPOSITORIO>
    cd backend
    ```

    ```bash
    # Se você está criando os arquivos manualmente, navegue até a pasta `backend`
    cd backend
    ```

2.  **Instale as dependências:**

    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**

    Crie um arquivo `.env` na raiz do diretório `backend` com o seguinte conteúdo:

    ```
    MONGO_URI=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/dbPremix?retryWrites=true&w=majority
    PORT=3000
    ```

    -   Substitua `<username>`, `<password>` e `<cluster-name>` pela sua string de conexão do MongoDB Atlas. Você pode encontrar esta string no painel do MongoDB Atlas, na seção `Database Deployments` -> `Connect` -> `Connect your application`.

## Como Rodar a Aplicação

Para iniciar o servidor, execute o seguinte comando na raiz do diretório `backend`:

```bash
nodemon server.js # Se tiver nodemon instalado
# OU
node server.js
```

O servidor será iniciado na porta especificada no arquivo `.env` (padrão: 3000).

## Endpoints da API

A API de gestores está disponível sob o prefixo `/api/gestores`.

### Gestores

-   **`POST /api/gestores`**
    -   **Descrição:** Registra um novo gestor.
    -   **Corpo da Requisição (JSON):**
        ```json
        {
          "usuario": "nome_de_usuario",
          "email": "email@example.com",
          "senha": "senhaSegura123",
          "cpf": "123.456.789-00"
        }
        ```
    -   **Respostas:**
        -   `201 Created`: Gestor registrado com sucesso.
        -   `400 Bad Request`: Usuário, e-mail ou CPF já cadastrado.
        -   `500 Internal Server Error`: Erro ao registrar gestor.

-   **`GET /api/gestores`**
    -   **Descrição:** Retorna todos os gestores cadastrados (sem a senha).
    -   **Respostas:**
        -   `200 OK`: Lista de gestores.
        -   `500 Internal Server Error`: Erro ao buscar gestores.

-   **`GET /api/gestores/:id`**
    -   **Descrição:** Retorna um gestor específico pelo ID (sem a senha).
    -   **Parâmetros:** `id` (ID do gestor no MongoDB).
    -   **Respostas:**
        -   `200 OK`: Gestor encontrado.
        -   `404 Not Found`: Gestor não encontrado.
        -   `500 Internal Server Error`: Erro ao buscar gestor.

-   **`PUT /api/gestores/:id`**
    -   **Descrição:** Atualiza as informações de um gestor existente.
    -   **Parâmetros:** `id` (ID do gestor no MongoDB).
    -   **Corpo da Requisição (JSON):**
        ```json
        {
          "usuario": "novo_nome_de_usuario",
          "email": "novo_email@example.com",
          "cpf": "098.765.432-10",
          "esta": true,       // Opcional
          "ativo": false      // Opcional
        }
        ```
    -   **Respostas:**
        -   `200 OK`: Gestor atualizado com sucesso.
        -   `400 Bad Request`: Nome de usuário, e-mail ou CPF já em uso por outro gestor.
        -   `404 Not Found`: Gestor não encontrado.
        -   `500 Internal Server Error`: Erro ao atualizar gestor.

-   **`DELETE /api/gestores/:id`**
    -   **Descrição:** Deleta um gestor pelo ID.
    -   **Parâmetros:** `id` (ID do gestor no MongoDB).
    -   **Respostas:**
        -   `200 OK`: Gestor deletado com sucesso.
        -   `404 Not Found`: Gestor não encontrado.
        -   `500 Internal Server Error`: Erro ao deletar gestor.

## Exemplo de Dados (conforme imagem fornecida)

```json
{
  "_id": "68dc542ce95ac7f930552888",
  "usuario": "van2",
  "senha": "12", // No banco de dados, esta senha estará hasheada
  "esta": false,
  "ativo": true,
  "cpf": "123456789", // Formato esperado: "000.000.000-00"
  "email": "evandro@gmail.com",
  "dataCriacao": "2025-09-30T12:00:00.000Z" // Exemplo de data de criação
}
```

**Observação:** A senha `"12"` no exemplo da imagem é apenas ilustrativa. No código, a senha será automaticamente hasheada antes de ser salva no banco de dados para segurança.
