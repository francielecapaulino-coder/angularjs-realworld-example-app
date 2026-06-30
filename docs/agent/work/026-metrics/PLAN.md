# PLAN — Slice 026: Métricas com Prometheus/Micrometer

## Objetivo
Implementar métricas Prometheus no backend Spring Boot com Micrometer, incluindo contadores por endpoint e integração com Prometheus no Docker Compose.

## Escopo
- Adicionar dependências Spring Actuator e Micrometer Prometheus
- Configurar endpoints de métricas em `/actuator/prometheus`
- Implementar contadores customizados por HTTP request
- Adicionar Prometheus ao stack Docker Compose
- Configurar scrape das métricas do backend

## Critérios de Aceite
✅ Backend expõe métricas em `/actuator/prometheus`
✅ Contador incrementa a cada chamada de endpoint
✅ Prometheus no compose faz scrape das métricas  
✅ Evidência capturada: chamada -> contador visível no Prometheus

## Dependencies
- Slice 025 (containerização)
- Backend Spring Boot operacional

## Arquitetura
- Spring Actuator para expor métricas
- Micrometer como registry para Prometheus
- Interceptor Spring MVC para contar requests HTTP
- Prometheus como coletor e armazenador
- Docker Compose para orquestração

## Work Items
1. Configurar dependências no build.gradle
2. Configurar Actuator no application.properties
3. Implementar MetricsConfig com interceptor HTTP
4. Criar HealthController com endpoints de teste
5. Configurar SecurityConfig para permitir endpoints
6. Adicionar Prometheus ao docker-compose.yml
7. Criar prometheus.yml com configuração de scrape
8. Atualizar Dockerfile da API para incluir curl
9. Testar e validar funcionamento

## Testes
- Build do backend com novas dependências
- Subir stack com Docker Compose
- Verificar `/actuator/prometheus` disponível
- Fazer requisições HTTP test endpoints
- Confirmar contadores incrementando
- Validar Prometheus UI acessível em :9090

## DoD
- Build + testes do backend passam
- Docker Compose sobe com Prometheus
- Métricas visíveis e funcionando
- Documentação atualizada
- Issue #37 fechada