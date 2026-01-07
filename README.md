# Coffee Lin Loyalty Portal ☕

Coffee Lin kafesi üçün mobil-əsaslı bonus proqramı portalı. Müştərilər telefonla daxil olub bonuslarını izləyə bilər, işçilər isə QR kod skan edərək bonus əlavə edə bilər.

## 🎯 Xüsusiyyətlər

### Müştəri Paneli
- **Telefon nömrəsi ilə giriş** - Sadə və sürətli autentifikasiya
- **Bonus balansı** - Real-vaxt bonus balansı göstərilməsi
- **Tier statusu** - Silver, Gold, Platinum tier sistemləri
- **QR kod** - Kafedə göstərmək üçün şəxsi QR kod
- **Əməliyyat tarixçəsi** - Bütün bonus əməliyyatlarının siyahısı

### Admin Paneli
- **Müştəri axtarışı** - Telefon nömrəsi ilə sürətli axtarış
- **QR kod skan** - Kamera ilə müştəri QR kodunu oxuma
- **Bonus əlavə etmə** - 5% cashback avtomatik hesablama
- **Müştəri siyahısı** - Bütün müştərilərin idarə edilməsi
- **Əməliyyat izləmə** - Bütün bonus əməliyyatlarının monitoru

### Avtomatik Sistemlər
- **Tier yüksəliş** - 100 xal → Gold, 200 xal → Platinum
- **5% Cashback** - 1 bonus = 10 qəpik (100 AZN = 50 bonus)
- **PassKit inteqrasiyası** - Apple Wallet və Google Pay dəstəyi

## 🚀 Qurulum

### Tələblər
- Node.js 18+ və pnpm
- MySQL/TiDB verilənlər bazı
- PassKit hesabı (optional)

### 1. Layihəni Klonlayın
```bash
git clone https://github.com/rzaquliyev/Coffeelin-loyalty.git
cd Coffeelin-loyalty
```

### 2. Dependencies Quraşdırın
```bash
pnpm install
```

### 3. Environment Variables Konfiqurasiya Edin
Manus Dashboard-da (https://coffeelinloyalty-bonus.manus.space) **Settings → Secrets** bölməsindən aşağıdakı credentials-ları əlavə edin:

| Secret Key | Təsvir |
|------------|--------|
| `DATABASE_URL` | MySQL/TiDB connection string |
| `PASSKIT_API_KEY` | PassKit API açarı (optional) |
| `PASSKIT_API_SECRET` | PassKit API sirri (optional) |
| `PASSKIT_PROGRAM_ID` | PassKit program UUID (optional) |

### 4. Database Migration
```bash
pnpm db:push
```

### 5. Test Məlumatları Əlavə Edin (Optional)
```bash
node scripts/seed-test-data.mjs
```

### 6. Development Server Başladın
```bash
pnpm dev
```

Server `http://localhost:3000` ünvanında işə düşəcək.

## 📱 İstifadə

### Müştəri Girişi
1. https://coffeelinloyalty-bonus.manus.space/ səhifəsini açın
2. Telefon nömrənizi daxil edin (+994 XX XXX XX XX)
3. "Daxil ol" düyməsini sıxın
4. Dashboard-da bonus balansınızı və QR kodunuzu görəcəksiniz

### Admin Paneli
1. https://coffeelinloyalty-bonus.manus.space/admin səhifəsini açın
2. Manus hesabınızla giriş edin (admin roluna sahib olmalısınız)
3. Müştəri axtarın (telefon nömrəsi və ya QR skan)
4. Xərclənən məbləği daxil edin
5. Avtomatik hesablanan bonus əlavə edin

### Bonus Hesablama
- **5% Cashback:** 100 AZN xərcləmə = 50 bonus
- **1 Bonus = 10 Qəpik:** 50 bonus = 5 AZN dəyərində

### Tier Sistemi
| Tier | Minimum Bonus | Üstünlüklər |
|------|---------------|-------------|
| **Silver** | 0-99 | Standart bonuslar |
| **Gold** | 100-199 | Əlavə endirimlər |
| **Platinum** | 200+ | Premium xidmətlər |

## 🔧 Texnologi Yığını

### Frontend
- **React 19** - UI framework
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - UI komponentləri
- **tRPC** - Type-safe API
- **react-qr-code** - QR kod generatoru
- **react-qr-reader** - QR kod oxuyucu

### Backend
- **Node.js + Express** - Server
- **tRPC** - API layer
- **Drizzle ORM** - Database ORM
- **MySQL/TiDB** - Verilənlər bazı
- **PassKit REST API** - Wallet inteqrasiyası

### DevOps
- **Manus Platform** - Hosting və deployment
- **GitHub** - Version control
- **Vitest** - Unit testing

## 🧪 Test

### Unit Testləri İcra Edin
```bash
pnpm test
```

11 test mövcuddur:
- Müştəri yaratma
- Telefon nömrəsi ilə axtarış
- Bonus əlavə etmə
- Tier yüksəliş məntiqi
- 5% cashback hesablama

### Testlərin Nəticəsi
```
✓ server/loyalty.test.ts (11)
  ✓ Customer Operations (3)
    ✓ should create a new customer
    ✓ should find customer by phone number
    ✓ should return null for non-existent customer
  ✓ Transaction Operations (3)
    ✓ should add bonus to customer
    ✓ should create transaction record
    ✓ should update customer bonus balance
  ✓ Tier System (3)
    ✓ should upgrade to Gold at 100 points
    ✓ should upgrade to Platinum at 200 points
    ✓ should stay at current tier if not enough points
  ✓ Cashback Calculation (2)
    ✓ should calculate 5% cashback correctly
    ✓ should round cashback to nearest integer

Test Files  1 passed (1)
Tests  11 passed (11)
```

## 📚 PassKit İnteqrasiyası

PassKit inteqrasiyası müştərilərin Apple Wallet və Google Pay-də bonus kartlarını saxlamalarına imkan verir.

### Qurulum
1. [PASSKIT_SETUP.md](./PASSKIT_SETUP.md) faylını oxuyun
2. PassKit Dashboard-dan API credentials əldə edin
3. Manus Dashboard-da secrets əlavə edin
4. Serveri yenidən başladın

### Funksiyalar
- Yeni müştəri yaradıldıqda avtomatik Wallet kartı yaradılması
- Bonus əlavə edildikdə Wallet kartının yenilənməsi
- Tier yüksəldikdə Wallet kartının güncəllənməsi
- QR kod ilə müştəri axtarışı

## 🚢 Deployment

### Manus Platform (Tövsiyə Olunan)
1. Manus Dashboard-da checkpoint yaradın
2. **"Publish"** düyməsini sıxın
3. Sayt avtomatik olaraq deploy olunacaq
4. Custom domain bağlaya bilərsiniz (Settings → Domains)

### Manual Deployment
```bash
# Production build
pnpm build

# Start production server
pnpm start
```

## 📊 Database Schema

### customers
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| name | TEXT | Müştəri adı |
| phoneNumber | VARCHAR(20) | Telefon nömrəsi (unique) |
| bonusBalance | INT | Bonus balansı |
| tier | ENUM | silver, gold, platinum |
| passkitMemberId | VARCHAR(255) | PassKit Member ID |
| createdAt | TIMESTAMP | Yaradılma tarixi |
| updatedAt | TIMESTAMP | Yenilənmə tarixi |

### transactions
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| customerId | INT | Foreign key (customers.id) |
| amount | INT | Bonus məbləği |
| type | ENUM | earned, spent |
| spentAmount | TEXT | Xərclənən məbləğ |
| note | TEXT | Qeyd |
| createdAt | TIMESTAMP | Əməliyyat tarixi |

## 🤝 Töhfə Vermək

1. Fork edin
2. Feature branch yaradın (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📝 Lisenziya

MIT License - [LICENSE](./LICENSE) faylına baxın.

## 📞 Dəstək

- **GitHub Issues:** https://github.com/rzaquliyev/Coffeelin-loyalty/issues
- **Email:** support@coffeelin.az
- **Manus Support:** https://help.manus.im

## 🙏 Təşəkkürlər

- [Manus Platform](https://manus.im) - Hosting və deployment
- [PassKit](https://passkit.com) - Wallet inteqrasiyası
- [shadcn/ui](https://ui.shadcn.com) - UI komponentləri

---

**Hazırladı:** Manus AI  
**Versiya:** 2.0.0  
**Son Yenilənmə:** 2025-01-07
