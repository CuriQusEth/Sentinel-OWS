# 🛡️ Risk-Aware Auto-Trading Sentinel

**OWS Hackathon 2026** projesi  
**Track 2: Agent Spend Governance & Identity** (Güvenlik + Policy Enforcement odaklı)

Bir AI agent’ın **private key’e asla dokunmadan** gerçek blockchain işlemler yapmasını sağlayan, risk odaklı otomatik trading sentinel’ı.

### ✨ Özellikler

- **Tam OWS Uyumlu**: Private key encrypted vault’ta kalır, agent sadece transaction **request** gönderir.
- **Gerçek Zamanlı Risk Analizi**: Ani pump, liquidity drop, rug-pull sinyalleri, volume mismatch gibi 7+ risk faktörüyle skor hesaplar (0-100).
- **Policy-Driven Güvenlik**: OWS Policy Engine ile spending limit, chain restriction ve token allowlist otomatik uygulanır.
- **Risk Toleransı Modları**: LOW / MEDIUM / HIGH — kullanıcı tercihiyle otomatik davranış değişir.
- **Şeffaf Loglama**: Her döngüde detaylı analiz + OWS transaction request gösterimi.
- **Küçük ve Güvenli**: Hackathon için max 0.5–2 USDC’lik test işlemleri.

### 🎯 Hackathon Track Uyumu

Bu proje özellikle **Track 2 – Agent Spend Governance & Identity** için tasarlandı:
- Güçlü policy enforcement
- Risk-aware karar mekanizması
- Audit edilebilir işlem logları
- Agent’ın harcamalarını kısıtlayan scoped key kullanımı

Ayrıca **Track 4 – Multi-Agent Systems** ile kolayca genişletilebilir (örneğin yield scout agent ile koordinasyon).

### 🚀 Hızlı Başlangıç

#### 1. Gereksinimler
- Node.js 18+ (tercihen 20 veya 22)
- `ows` CLI + `@open-wallet-standard/core` SDK

#### 2. Kurulum

```bash
# OWS CLI + SDK kurulumu
npm install -g @open-wallet-standard/core

# Wallet oluştur
ows wallet create --name sentinel-wallet

# Scoped API key oluştur (güvenlik için çok önemli)
ows key create --wallet sentinel-wallet \
               --name sentinel-agent-key \
               --spend-limit 10usdc \
               --chain base \
               --expiry 24h
