# SmartWallet Agent

OWS (Open Wallet Standard) tabanlı AI agent uygulaması. İçerik beğenilince otomatik mikro-ödeme gönderir, haftalık harcama limiti aşılınca işlemi bloke eder.

## Özellikler

- 💳 **Mikro-ödeme**: İçerik beğenilince OWS üzerinden $0.01 USDC otomatik transfer
- 🔒 **Haftalık limit**: $50 limitine ulaşınca tüm ödemeler otomatik bloke
- 📊 **Canlı log**: İşlem geçmişi ve harcama durumu gerçek zamanlı güncellenir
- 🌐 **OWS Entegrasyonu**: Gerçek API çağrısı, API çalışmazsa demo moda geçer

## Kurulum

### 1. Bağımlılıkları yükle

```bash
npm install
```

### 2. Ortam değişkenlerini ayarla

```bash
cp .env.example .env.local
# .env.local dosyasını düzenle
```

`.env.local` içeriği:
```
OWS_TOKEN=ows_key_...
OWS_WALLET_ADDRESS=0x...
NEXT_PUBLIC_WEEKLY_LIMIT=50
NEXT_PUBLIC_TIP_AMOUNT=0.01
```

> ⚠️ `.env.local` dosyasını **asla** Git'e commit etme.

### 3. Geliştirme sunucusunu başlat

```bash
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışır.

## Proje Yapısı

```
smartwallet/
├── app/
│   ├── api/
│   │   ├── like/route.ts          # POST — mikro-ödeme işlemi
│   │   └── transactions/route.ts  # GET  — işlem geçmişi
│   ├── components/
│   │   ├── ContentCard.tsx        # Beğeni butonu olan içerik kartı
│   │   ├── SpendingHeader.tsx     # Haftalık bütçe progress bar
│   │   └── TransactionLog.tsx     # Canlı işlem listesi
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                   # Ana sayfa
├── lib/
│   ├── content.ts                 # Mock içerik verileri
│   ├── ows.ts                     # OWS API entegrasyonu (server-only)
│   └── store.ts                   # In-memory state (harcama + log)
├── .env.example
├── .env.local                     # 🔒 GİT'E EKLEME
└── .gitignore
```

## API Endpointleri

### `POST /api/like`

İçerik beğenildiğinde $0.01 USDC ödemesi başlatır.

**Body:**
```json
{
  "contentId": "content_001",
  "contentTitle": "Article Title",
  "creatorAddress": "0x..."
}
```

**Yanıtlar:**
- `200` — Ödeme başarılı, `txHash` döner
- `403` — Haftalık limit aşıldı
- `400` — Eksik parametre
- `502` — OWS API hatası

### `GET /api/transactions`

Tüm işlem geçmişini ve haftalık harcama durumunu döner.

```json
{
  "transactions": [...],
  "weeklyTotal": 0.05,
  "limit": 50,
  "remaining": 49.95
}
```

## Güvenlik Notları

- `OWS_TOKEN` sadece server-side API route'larında kullanılır, client'a hiç iletilmez
- Private key hiçbir yerde saklanmaz — OWS token ile işlem imzalanır
- `.env.local` `.gitignore`'a eklidir

## OWS Entegrasyonu

`lib/ows.ts` dosyası:
1. `https://api.openwallet.sh/v1/sign` endpointine `Authorization: Bearer {TOKEN}` header'ı ile POST atar
2. API erişilemezse (timeout, network hatası) otomatik olarak mock response döner
3. Mock işlemler UI'da `[mock]` etiketi ile gösterilir
