# Coffee Lin Loyalty Portal - TODO

## Verilənlər Bazı
- [x] Müştəri cədvəlinin yaradılması (telefon, ad, PassKit member ID, tier, bonus balansı)
- [x] Bonus əməliyyatları cədvəlinin yaradılması (əməliyyat növü, məbləğ, tarix)
- [x] Database migration-ların icra edilməsi

## PassKit İnteqrasiyası
- [x] PassKit Python SDK-nın quraşdırılması
- [ ] PassKit API credentials-ların konfiqurasiyası
- [x] Member məlumatlarını almaq üçün API funksiyaları
- [x] Bonus əlavə etmək üçün API funksiyaları
- [x] Tier yüksəltmək üçün API funksiyaları

## Autentifikasiya Sistemi
- [x] Telefon nömrəsi ilə giriş ekranı
- [ ] SMS doğrulama sistemi (əgər lazımsa)
- [x] Session idarəetməsi
- [ ] İşçi/Admin rolları

## Müştəri Dashboard
- [x] Bonus balansı göstərilməsi
- [x] Tier statusu göstərilməsi (Gümüş/Qızıl/Platin)
- [x] Üzəv məlumatları (ad, telefon, qeydiyyat tarixi)
- [x] QR kod generator (müştəri kafedə göstərir)
- [ ] Mobil responsive dizayn

## Bonus Tarixçəsi
- [ ] Bütün əməliyyatların siyahısı
- [ ] Vaxt damğaları
- [ ] Əməliyyat növləri (əlavə edildi, istifadə edildi)
- [ ] Filtr və axtarış funksiyaları

## Admin Panel (İşçilər)
- [x] QR kod skan interfeysi
- [x] Müştəri axtarışı (telefon nömrəsi ilə)
- [x] Bonus əlavə etmə formu
- [x] Cashback hesablama (5% - 1 bonus = 10 qəpik)
- [x] Əməliyyat təsdiqi

## Avtomatik Sistemlər
- [x] Tier yüksəliş sistemi (100 xal → Gümüş→Qızıl, 200 xal → Qızıl→Platin)
- [ ] PassKit ilə real-vaxt sinxronizasiya
- [x] Bonus hesablama məntiqi

## UI/UX
- [x] Azərbaycan dili interfeysi
- [x] Mobil-first responsive dizayn
- [x] Rəng palitrasının seçilməsi
- [x] İkonlar və vizual elementlər
- [ ] Loading state-ləri
- [ ] Error handling və bildirişlər

## Test və Deploy
- [ ] Vitest testlərinin yazılması
- [ ] Mobil cihazlarda test
- [ ] PassKit inteqrasiyasının test edilməsi
- [ ] İlk checkpoint yaradılması


## PassKit Bonus Kartı İnteqrasiyası
- [ ] PassKit API credentials əldə edilməsi
- [ ] PassKit Member ID və QR kod strukturunun öyrənilməsi
- [ ] Müştəri yaradarkən PassKit-ə sinxronizasiya
- [ ] QR kod oxunduqda PassKit-dən müştəri məlumatlarının alınması
- [ ] Bonus əlavə edildikdə PassKit-ə sinxronizasiya
- [ ] Tier yüksəldilməsi zamanı PassKit-ə sinxronizasiya
- [ ] PassKit credentials konfiqurasiyası təlimatı


## PassKit İnteqrasiyası və QR Kod Oxuma
- [ ] PassKit API helper funksiyalarının backend-ə əlavə edilməsi
- [ ] QR kod oxuma komponenti yaradılması (react-qr-reader)
- [ ] Admin panelində QR skan interfeysi
- [ ] Müştəri yaradılması zamanı PassKit Member yaradılması
- [ ] Bonus əlavə edildikdə PassKit-ə sinxronizasiya
- [ ] Tier yüksəldilməsi zamanı PassKit-ə sinxronizasiya
- [ ] QR koddan Member ID çıxarma funksiyası
- [ ] PassKit-dən müştəri məlumatlarını alma
- [ ] Kamera icazəsi və error handling
- [ ] Test və debugging

## Bug Fixes
- [x] routers.ts faylındakı TypeScript xətalarını düzəltmək

## Naviqasiya və İstifadəçi Təcrübəsi
- [x] Login səhifəsinə admin və kassir linkləri əlavə etmək
- [x] Dashboard-a admin panel düyməsi əlavə etmək
- [x] Admin panelində avtomatik 5% cashback hesablama (məbləğ daxil edildikdə)
- [x] Bonus əlavə edildikdə müştəri kartında dərhal görünməsi

## PIN Kod Autentifikasiya Sistemi
- [x] Admin və kassir üçün PIN kod giriş səhifəsi yaratmaq
- [x] Backend-də PIN kod yoxlama funksiyaları əlavə etmək
- [x] ADMIN_PIN və CASHIER_PIN environment dəyişənləri konfiqurasiya etmək
- [x] Session management əlavə etmək (PIN daxil edildəkdən sonra)
- [x] PIN dəyişdirmə təlimatı hazırlamaq

## Bonus İdarəetmə Funksiyaları
- [x] Admin panelində bonus azaltma funksiyası əlavə etmək
- [x] Bonus əlavə/azaltma zamanı real-vaxt yeniləmə
- [x] Əməliyyat tarixçəsində "azaldıldı" növü göstərmək
- [x] Admin panelində PIN autentifikasiya yoxlaması
