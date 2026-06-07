# Omni-Commerce — NestJS Microservices

E-ticaret sisteminin tüm servislerini kapsayan NestJS tabanlı mikroservis mimarisi. Servisler arası iletişim Apache Kafka üzerinden event-driven olarak gerçekleşir; sipariş akışı Choreography Saga deseniyle yönetilir.

---

## Mimari

```
┌─────────────────────────────────────────────────────────────┐
│                        Client / Postman                     │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP
                    ┌────────▼────────┐
                    │   API Gateway   │  :3000
                    │  JWT · Swagger  │
                    │  Rate Limiting  │
                    └────┬──────┬─────┘
             HTTP proxy  │      │  HTTP proxy
          ┌──────────────▼──┐ ┌─▼──────────────┐
          │ Product Service │ │  Order Service  │
          │     :3001       │ │     :3002       │
          │  Redis Cache    │ │   Saga State    │
          └──────┬──────────┘ └────────┬────────┘
                 │                     │
                 └──────────┬──────────┘
                            │ Kafka Topics
                   ┌────────▼────────┐
                   │ Payment Service │  :3003
                   │ Circuit Breaker │
                   └─────────────────┘
```

### Servisler

| Servis              | Port | Veritabanı              | Açıklama                                    |
| ------------------- | ---- | ----------------------- | ------------------------------------------- |
| **api-gateway**     | 3000 | auth_db (PostgreSQL)    | JWT auth, Swagger, rate limiting, API proxy |
| **product-service** | 3001 | product_db (PostgreSQL) | Ürün CRUD, Redis cache-aside, stok yönetimi |
| **order-service**   | 3002 | order_db (PostgreSQL)   | Sipariş oluşturma, Saga orkestratörü        |
| **payment-service** | 3003 | payment_db (PostgreSQL) | Ödeme işlemi, Circuit Breaker (opossum)     |

---

## Saga Akışı (Choreography)

Kullanıcı sipariş oluşturduğunda aşağıdaki Kafka event zinciri tetiklenir:

```
POST /api/orders
  → stock.check.requested
    → stock.check.result (yeterli stok?)
      ✓ → stock.deduct.requested → payment.requested
            → payment.result
              ✓ → stock.deduct.result → order.completed
              ✗ → payment.refund.requested → order.failed
      ✗ → order.failed
```

---

## Teknoloji Yığını

| Kategori        | Teknoloji                                   |
| --------------- | ------------------------------------------- |
| Framework       | NestJS 11 (TypeScript)                      |
| Message Broker  | Apache Kafka (Confluent 7.6)                |
| Veritabanı      | PostgreSQL 16 (Database per Service)        |
| Cache           | Redis 7                                     |
| Auth            | JWT, bcrypt, Passport.js                    |
| Circuit Breaker | opossum                                     |
| Tracing         | OpenTelemetry → Jaeger                      |
| Metrics         | Prometheus + Grafana                        |
| Logging         | Winston + ECS JSON → Elasticsearch + Kibana |
| Container       | Docker Compose + Kubernetes                 |
| API Docs        | Swagger (OpenAPI 3)                         |

---

## Çalıştırma

### Gereksinimler

- Docker Desktop

### Servisleri Başlat

```bash
# Tüm servisleri build edip ayağa kaldır
docker compose up -d --build

# Observability stack (Prometheus, Grafana, Jaeger, ELK)
docker compose -f docker-compose.observability.yml up -d
```

### Sağlık Kontrolü

```bash
curl http://localhost:3000/api/health   # API Gateway   → DB check
curl http://localhost:3001/api/health   # Product       → DB + Redis check
curl http://localhost:3002/api/health   # Order         → DB check
curl http://localhost:3003/api/health   # Payment       → DB check
```

---

## API Endpointleri

### Authentication

```bash
# Kayıt
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!","name":"Test User"}'

# Giriş → accessToken döner
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!"}'
```

### Products

| Method | Path              | Auth | Açıklama                            |
| ------ | ----------------- | ---- | ----------------------------------- |
| POST   | /api/products     | JWT  | Ürün oluştur                        |
| GET    | /api/products     | —    | Tüm ürünleri listele (Redis cached) |
| GET    | /api/products/:id | —    | Ürün detayı                         |
| PATCH  | /api/products/:id | JWT  | Ürün güncelle                       |
| DELETE | /api/products/:id | JWT  | Ürün sil                            |

### Orders

| Method | Path                        | Auth | Açıklama                                                                                       |
| ------ | --------------------------- | ---- | ---------------------------------------------------------------------------------------------- |
| POST   | /api/orders                 | JWT  | Sipariş oluştur (Saga başlatır)                                                                |
| GET    | /api/orders                 | JWT  | Kendi siparişlerini listele                                                                    |
| GET    | /api/orders/:id             | JWT  | Sipariş + Saga durumu                                                                          |
| POST   | /api/orders/demo/force-fail | JWT  | **Saga Compensation Demo** — ödeme geçer, stok düşümü hata verir → ödeme iade → sipariş FAILED |

---

## Swagger UI

```
http://localhost:3000/api/docs
```

---

## Observability

| Araç       | URL                    | Kullanıcı/Şifre |
| ---------- | ---------------------- | --------------- |
| Prometheus | http://localhost:9090  | —               |
| Grafana    | http://localhost:3100  | admin / admin   |
| Jaeger     | http://localhost:16686 | —               |
| Kibana     | http://localhost:5601  | —               |

Her servis /api/metrics endpoint üzerinden Prometheus formatında metrik sunar.

---

## Kubernetes

```bash
# Altyapı
kubectl apply -f k8s/kafka.yaml
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/postgres-auth.yaml
kubectl apply -f k8s/postgres-product.yaml
kubectl apply -f k8s/postgres-order.yaml
kubectl apply -f k8s/postgres-payment.yaml

# Servisler
kubectl apply -f k8s/api-gateway.yaml
kubectl apply -f k8s/product-service.yaml
kubectl apply -f k8s/order-service.yaml
kubectl apply -f k8s/payment-service.yaml
```

```

```
