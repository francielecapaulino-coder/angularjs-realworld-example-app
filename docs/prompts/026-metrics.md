# Prompt — Slice 026: Métricas com Prometheus/Micrometer

## Contexto
Implementar métricas Prometheus no backend Spring Boot com Micrometer, conectando ao Docker Compose existente.

## Objetivo
Adicionar observabilidade de métricas ao backend com:
- Contadores customizados por HTTP request
- Integração Prometheus para coleta
- Validação end-to-end da stack de métricas

## Escopo Detalhado

### Backend Changes
- Adicionar dependências `spring-boot-starter-actuator` e `micrometer-registry-prometheus`
- Configurar endpoints Actuator em `/actuator/prometheus`
- Implementar `MetricsConfig` com interceptor Spring MVC
- Criar endpoints de teste em `HealthController`
- Configurar `SecurityConfig` para permitir endpoints públicos

### Infrastructure Changes  
- Adicionar serviço Prometheus ao `docker-compose.yml`
- Criar `prometheus.yml` com configuração de scrape
- Atualizar `Dockerfile` da API para incluir curl (health check)
- Configurar health check usando endpoint Actuator

### Validação
- Subir stack completa com Docker Compose
- Verificar métricas expostas em `/actuator/prometheus`
- Fazer requisições HTTP e validar contador incrementando
- Confirmar Prometheus fazendo scrape e exibindo métricas

## Dependencies
- Slice 025 (containerização) completa
- Build do backend funcionando
- Docker Compose operacional

## Critical Success Factors
- Métricas disponíveis em endpoint Actuator
- Incremento de contadores por requisição real
- Prometheus UI funcional e fazendo scrape
- Stack completa healthy

## DoD
- ✅ Backend expõe `/actuator/prometheus`
- ✅ Contadores funcionam com requests reais  
- ✅ Prometheus coleta e exibe métricas
- ✅ Docker Compose subindo todos serviços
- ✅ Evidências capturadas e validadas
- ✅ Issue #37 fechada com `Closes #37`