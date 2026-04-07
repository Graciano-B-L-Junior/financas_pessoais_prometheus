# Finanças Pessoais

Projeto fullstack para gerenciar finanças pessoais com Django/DRF no backend e React no frontend.
O objetivo final é aprender a monitorar a aplicação com Prometheus e exibir métricas no Grafana.

## Estrutura
- `backend/`: projeto Django e API REST
- `frontend/`: aplicação React com páginas de apresentação, login e dashboard
- `prometheus/`: configuração de scraping para métricas Django
- `grafana/`: espaço para dashboards Grafana e documentação

## Instruções de desenvolvimento

### Backend
1. Crie um ambiente virtual Python:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```
2. Instale dependências:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. Rode migrações:
   ```bash
   python backend/manage.py migrate
   ```
4. Crie um superusuário (opcional):
   ```bash
   python backend/manage.py createsuperuser
   ```
5. Inicie o servidor:
   ```bash
   python backend/manage.py runserver
   ```

### Frontend
1. Navegue para a pasta frontend:
   ```bash
   cd frontend
   ```
2. Instale dependências:
   ```bash
   npm install
   ```
3. Inicie a aplicação:
   ```bash
   npm run dev
   ```
4. Abra o navegador em `http://localhost:3000`

### Prometheus
1. Inicie o Prometheus com a configuração em `prometheus/prometheus.yml`.
2. A aplicação Django expõe métricas em `http://127.0.0.1:8000/metrics/`.

### Grafana
- Use o Grafana local para criar dashboards conectando ao Prometheus.
- O projeto não inclui containers por enquanto; o monitoramento é feito localmente.
