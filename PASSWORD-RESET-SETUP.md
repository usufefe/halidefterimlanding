# Şifre Sıfırlama Kurulumu

Bu doküman, halidefterim.com web sitesi üzerinden şifre sıfırlama işleminin nasıl çalışacağını açıklar.

## 1. Supabase Dashboard Ayarları

### 1.1 Redirect URL Ekleme

1. [Supabase Dashboard](https://supabase.com/dashboard) > Authentication > URL Configuration
2. "Redirect URLs" bölümüne şu URL'leri ekleyin:
   - `https://halidefterim.com/**`
   - `https://www.halidefterim.com/**`

### 1.2 E-posta Şablonu Güncelleme

1. [Supabase Dashboard](https://supabase.com/dashboard) > Authentication > Email Templates
2. "Reset Password" şablonunu seçin
3. **Subject:** `Şifre Sıfırlama - Halı Defterim`
4. **Body:** `email-templates/reset-password-email.html` dosyasındaki HTML'i yapıştırın

**ÖNEMLİ:** E-posta şablonunda `{{ .Token }}` OTP kodu olarak görünür. Bu 6 haneli kod, web sitesindeki OTP ekranında kullanılır.

## 2. Dosya Yapısı

```
halidefterimlanding/
├── reset-password.html          # Ana şifre sıfırlama sayfası
├── email-templates/
│   └── reset-password-email.html # E-posta şablonu (Dashboard'a yapıştırılacak)
```

## 3. Akış

### Mobil Uygulamadan Şifre Sıfırlama:
1. Kullanıcı "Şifremi Unuttum" butonuna tıklar
2. E-posta adresini girer
3. Supabase şifre sıfırlama e-postası gönderir
4. E-postadaki link `https://halidefterim.com/reset-password.html` adresine yönlendirir
5. Kullanıcı web sitesinde:
   - Ya OTP kodunu girer
   - Ya da e-postadaki linke tıklayarak direkt şifre değiştirme ekranına gelir
6. Yeni şifresini belirler
7. "Uygulamaya Dön" butonu ile mobil uygulamaya geri döner

### URL Parametreleri:
- `?token_hash=xxx&type=recovery` - Direkt link tıklama (token doğrulama)
- `#access_token=xxx&refresh_token=xxx&type=recovery` - Oturum ile yönlendirme
- `?email=xxx` - OTP girişi için e-posta parametresi

## 4. Güvenlik

- OTP kodları 60 dakika geçerlidir
- Şifre en az 6 karakter olmalıdır
- Şifre değişikliğinden sonra kullanıcı otomatik çıkış yapar
- Tüm işlemler HTTPS üzerinden yapılır

## 5. Test

Şifre sıfırlama akışını test etmek için:

1. Mobil uygulamada giriş ekranına gidin
2. "Şifremi Unuttum" butonuna tıklayın
3. E-posta adresinizi girin
4. E-postanızı kontrol edin
5. Linke tıklayın veya kodu girin
6. Yeni şifrenizi belirleyin

## 6. Troubleshooting

### "Geçersiz Bağlantı" Hatası
- Link süresi dolmuş olabilir (60 dakika)
- URL parametreleri eksik olabilir
- Yeni bir şifre sıfırlama isteği gönderin

### OTP Kodu Çalışmıyor
- Kodun 60 dakika içinde girildiğinden emin olun
- Doğru e-posta adresiyle istek gönderildiğinden emin olun
- Kodu doğru girdiğinizden emin olun (6 hane)

### E-posta Gelmiyor
- Spam klasörünü kontrol edin
- Supabase SMTP ayarlarını kontrol edin
- Rate limit'e takılmış olabilirsiniz (birkaç dakika bekleyin)
