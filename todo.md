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
