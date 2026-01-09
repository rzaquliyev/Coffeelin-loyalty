# PIN Kod Konfiqurasiyası

Bu sənəd admin və kassir panelləri üçün PIN kodların necə konfiqurasiya ediləcəyini izah edir.

## PIN Kodların Əlavə Edilməsi

### 1. Manus Platformasında

1. **Manus-da layihənizi açın**
2. Sağ tərəfdəki **Management UI** panelini açın
3. **Settings → Secrets** bölməsinə gedin
4. Aşağıdakı PIN kodları əlavə edin:

```
ADMIN_PIN=1234
CASHIER_PIN=5678
```

> **Qeyd:** İlkin PIN kodlar 1234 (admin) və 5678 (kassir) olaraq təyin edilib. Təhlükəsizlik üçün bunları dəyişdirin!

### 2. Lokal Development Üçün

Əgər lokal olaraq development edirsinizsə, `.env` faylı yaradın:

```bash
# .env
ADMIN_PIN=1234
CASHIER_PIN=5678
```

## PIN Kodların Dəyişdirilməsi

### Manus Platformasında

1. **Settings → Secrets** bölməsinə gedin
2. `ADMIN_PIN` və ya `CASHIER_PIN` dəyişənini tapın
3. **Edit** düyməsinə basın
4. Yeni PIN kodu daxil edin (4 rəqəm)
5. **Save** düyməsinə basın

### Təhlükəsizlik Tövsiyələri

- ✅ PIN kodları 4 rəqəmdən ibarət olmalıdır
- ✅ Sadə PIN kodlardan istifadə etməyin (1111, 1234, 0000)
- ✅ Hər rol üçün fərqli PIN kodlar istifadə edin
- ✅ PIN kodları müntəzəm olaraq dəyişdirin (hər 3 ayda bir)
- ✅ PIN kodları heç kimə verməyin
- ❌ PIN kodları kodda hardcode etməyin
- ❌ PIN kodları git-ə commit etməyin

## Session İdarəetməsi

- PIN kod daxil edildikdən sonra **8 saat** ərzində aktiv qalır
- 8 saatdan sonra yenidən PIN kod tələb olunur
- Brauzeri bağlasanız, yenidən PIN kod daxil etməlisiniz

## Problemlərin Həlli

### "PIN kod tələb olunur" xətası

1. PIN kodun düzgün daxil edildiyindən əmin olun
2. Environment dəyişənlərinin Manus-da konfiqurasiya edildiyindən əmin olun
3. Serveri yenidən başladın

### PIN kod işləmir

1. Manus Settings → Secrets bölməsində PIN kodların mövcud olduğunu yoxlayın
2. PIN kodun 4 rəqəmdən ibarət olduğunu yoxlayın
3. Brauzerin cache-ni təmizləyin və yenidən cəhd edin

## Texniki Detallar

### Backend

PIN kodlar `server/routers.ts` faylında `auth.verifyPin` proseduru ilə yoxlanılır:

```typescript
verifyPin: publicProcedure
  .input(z.object({
    pin: z.string().length(4),
    role: z.enum(["admin", "cashier"]),
  }))
  .mutation(({ input }) => {
    const adminPin = process.env.ADMIN_PIN || "1234";
    const cashierPin = process.env.CASHIER_PIN || "5678";
    // ...
  })
```

### Frontend

PIN autentifikasiya `client/src/pages/AdminLogin.tsx` komponentində idarə olunur.

Session məlumatları `localStorage`-də saxlanılır:
- `adminAuth` / `cashierAuth`: "true" (autentifikasiya olunub)
- `adminAuthTime` / `cashierAuthTime`: Timestamp (session vaxtı)

## Əlaqə

Əgər hər hansı problem yaranarsa və ya köməyə ehtiyacınız varsa, texniki dəstək komandası ilə əlaqə saxlayın.
