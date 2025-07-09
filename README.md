# 🧙‍♂️ Tibia Tracker Frontend (React)

Este é o **frontend React** do projeto **Tibia Tracker**, uma aplicação que exibe o ranking, ganhos diários e histórico de jogadores do servidor [Rexis - Souls of Elysium](https://rexis.soerpg.com). Ele consome dados da API FastAPI hospedada no Railway.

## 🚀 Funcionalidades

- 📊 Exibe o ranking atual dos Top 20 players.
- 🔼 Mostra os **ganhos de experiência e níveis** do dia.
- 📈 Geração de gráficos (Recharts) de evolução e ganhos diários.
- 🧾 Histórico detalhado de um player específico (últimos 14 dias).
- 🔄 Scraping manual (com botão de "Atualizar Dados").
- 🌐 Autoatualização a cada 20 minutos.

## 📦 Tecnologias Usadas

- **React** (com hooks)
- **Tailwind CSS** (interface moderna)
- **Recharts** (gráficos interativos)
- **Fetch API** (para comunicação com backend FastAPI)

## 📁 Estrutura do Projeto

```bash
TibiaTracker.jsx         # Componente principal
App.js / main.jsx        # Ponto de entrada (esperado)
.env                     # Pode conter URL da API (opcional)
```

## 🔗 Endpoints Consumidos

O componente consome dados da seguinte API hospedada no Railway:

```
https://powergamer-backend-production.up.railway.app
```

### Exemplos de endpoints:

- `/players/current` → Ranking atual
- `/players/daily-gains` → Ganhos do dia
- `/stats/top-gainers?days=7` → Farmers da semana
- `/players/<name>/history` → Histórico do jogador
- `/scrape/manual` → Scraping manual

## ▶️ Como rodar localmente

```bash
npm install         # Instala dependências
npm start           # Inicia em http://localhost:3000
```

Certifique-se de que o backend FastAPI esteja online (Railway ou local).

## 🛠️ Requisitos

- Node.js 18+
- Navegador moderno
- Backend rodando ou acessível

## 📌 Observações

- Os dados são coletados automaticamente todos os dias às **00:01** pelo backend.
- Você pode forçar a coleta clicando em "**Atualizar Dados**".
- As tabs exibem diferentes seções: ranking, ganhos, farmers e histórico.

## 📄 Licença

Disponível sob a licença MIT. Veja o arquivo [LICENSE](../LICENSE) para mais detalhes.
