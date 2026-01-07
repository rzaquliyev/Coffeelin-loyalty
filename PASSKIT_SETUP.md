# PassKit İnteqrasiya Təlimatı

Bu təlimat Coffee Lin Loyalty Portal-a PassKit API credentials-larını necə əlavə edəcəyinizi izah edir.

## 1. PassKit API Credentials Əldə Etmək

### Addım 1: PassKit Dashboard-a Daxil Olun
1. https://app.passkit.com adresinə daxil olun
2. Hesabınıza login edin

### Addım 2: API Credentials Yaradın
1. **Settings** → **API Keys** bölməsinə keçin
2. **"Create New API Key"** düyməsini sıxın
3. API Key və API Secret yaradılacaq
4. **ÖNEMLİ:** API Secret yalnız bir dəfə göstərilir, yadda saxlayın!

### Addım 3: Program ID-ni Tapın
1. **Programs** → **Membership Programs** bölməsinə keçin
2. "Coffee Lin Bonus" proqramını seçin
3. URL-də və ya program settings-də **Program ID** görünəcək
4. Format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` (UUID)

## 2. Manus Dashboard-da Secrets Əlavə Etmək

### Addım 1: Manus Dashboard-a Keçin
1. https://coffeelinloyalty-bonus.manus.space/ səhifəsini açın
2. Sağ yuxarıda **"Manage"** düyməsini sıxın
3. **Settings** → **Secrets** bölməsinə keçin

### Addım 2: PassKit Credentials Əlavə Edin

Aşağıdakı 4 secret əlavə edin:

| Secret Key | Dəyər | Təsvir |
|------------|-------|--------|
| `PASSKIT_API_KEY` | API Key (PassKit-dən) | PassKit API açarı |
| `PASSKIT_API_SECRET` | API Secret (PassKit-dən) | PassKit API sirri |
| `PASSKIT_PROGRAM_ID` | Program UUID (PassKit-dən) | Membership proqram ID-si |
| `PASSKIT_BASE_URL` | `https://api.pub1.passkit.io` | PassKit API URL-i (optional) |

### Addım 3: Serveri Yenidən Başladın
1. Secrets əlavə etdikdən sonra
2. Manus Dashboard-da **"Restart"** düyməsini sıxın
3. Və ya yeni checkpoint yaradıb publish edin

## 3. İnteqrasiyanın İşlədiyini Yoxlayın

### Test 1: Yeni Müştəri Yaradın
1. Admin panelə daxil olun: https://coffeelinloyalty-bonus.manus.space/admin
2. Yeni müştəri yaradın (ad, telefon)
3. PassKit-də avtomatik olaraq Member yaradılmalıdır

### Test 2: Bonus Əlavə Edin
1. Müştəriyə bonus əlavə edin
2. PassKit Wallet kartında bonus balansı yenilənməlidir

### Test 3: Tier Yüksəliş
1. Müştəriyə 100+ bonus əlavə edin
2. Tier avtomatik olaraq Silver → Gold-a keçməlidir
3. PassKit Wallet kartında tier yenilənməlidir

## 4. Problemlərin Həll Yolları

### Problem: "PassKit API credentials not configured"
**Həll:** Manus Dashboard → Settings → Secrets bölməsində credentials-ların düzgün əlavə edildiyini yoxlayın.

### Problem: "Invalid API Key"
**Həll:** PassKit Dashboard-da API Key-in aktiv olduğunu və düzgün kopyalandığını yoxlayın.

### Problem: "Program not found"
**Həll:** `PASSKIT_PROGRAM_ID` düzgün UUID formatında olduğunu yoxlayın.

### Problem: "Member creation failed"
**Həll:** 
1. PassKit Dashboard-da proqramın aktiv olduğunu yoxlayın
2. API Key-in "Create Member" icazəsi olduğunu yoxlayın
3. Server logs-ları yoxlayın (Manus Dashboard → Logs)

## 5. PassKit QR Kod Formatı

PassKit Wallet kartlarında QR kod aşağıdakı formatlardan birində ola bilər:

1. **Member ID (UUID):**
   ```
   xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   ```

2. **PassKit URL:**
   ```
   https://pub1.pskt.io/c/xxxxxxxx
   ```

3. **Custom Format:**
   ```json
   {
     "memberId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
     "phone": "+994501234567"
   }
   ```

Admin paneldə QR skan funksiyası bütün bu formatları dəstəkləyir.

## 6. Əlavə Məlumat

- **PassKit Documentation:** https://docs.passkit.io
- **PassKit Support:** support@passkit.com
- **Manus Support:** https://help.manus.im

---

**Uğurlar!** ☕
