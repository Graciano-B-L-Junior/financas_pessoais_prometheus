# Grafana

Use o Grafana para criar painéis com dados coletados pelo Prometheus.

1. Instale e execute Grafana localmente.
2. Adicione uma fonte de dados Prometheus apontando para `http://127.0.0.1:9090`.
3. Crie um dashboard novo usando métricas expostas em `http://127.0.0.1:8000/metrics/`.

Métricas úteis:
- `django_http_requests_before_processing_total`
- `django_http_requests_latency_seconds_sum`
- `django_http_requests_latency_seconds_count`
- `django_http_requests_exceptions_total`
