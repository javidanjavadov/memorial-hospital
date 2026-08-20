# Memorial Hospital

Bakıdakı Memorial Hospital üçün sayt — onlayn qəbul, həkim kataloqu, filial və
xidmət məlumatları. Next.js 16 (App Router), React 19, Tailwind CSS 4.

## Getting started

```bash
npm install
npm run dev
```

http://localhost:3000

## Scripts

| Script | Nə edir |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Built saytı işə salır |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run check` | typecheck + lint + build (CI ilə eyni) |

## Environment

`.env.example` faylını `.env.local` adı ilə kopyalayın və doldurun.

| Variable | Default | Nə üçün |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://yuzuch.dev` | Canonical URL-lər, `sitemap.xml`, Open Graph |
| `AUTH_SECRET` | — | Sessiya cookie-sinin imzalanması (`npx auth secret`) |
| `AUTH_GOOGLE_ID` | — | Google OAuth Client ID (boş buraxsanız Google düyməsi gizlənir) |
| `AUTH_GOOGLE_SECRET` | — | Google OAuth Client Secret — **heç vaxt commit etməyin** |
| `AUTH_URL` | — | Yalnız production-da: `https://yuzuch.dev` |

### Google ilə giriş

Google Cloud Console → **Google Auth Platform**:

1. **App Information** — ad və dəstək emaili.
2. **Audience** — `External` (pasiyentlər təşkilatınızın Workspace hesabları deyil).
   Testing rejimində yalnız əlavə etdiyiniz test istifadəçiləri giriş edə bilir.
3. **Contact Information** — bildirişlər üçün email.
4. **Clients → Create client → Web application**:

```
Authorized JavaScript origins
  http://localhost:3000
  https://yuzuch.dev

Authorized redirect URIs      (hərfi-hərfinə uyğun olmalıdır)
  http://localhost:3000/api/auth/callback/google
  https://yuzuch.dev/api/auth/callback/google
```

Alınan Client ID və Secret-i `.env.local` faylına yazın. Netlify-da isə
Site settings → Environment variables bölməsinə əlavə edin.

Ən çox rast gəlinən xəta `redirect_uri_mismatch` olur — bu, yuxarıdakı redirect
URI-nin tam üst-üstə düşmədiyini bildirir (protokol, port və `/api/auth/...`
yolu daxil olmaqla).

## Structure

```
src/
  app/            App Router route-ları (+ sitemap / robots / manifest)
  components/     UI və layout komponentləri
  components/ui/  Baza primitivləri (Button, Input, Field, Card …)
  data/           Həkim, şöbə, filial və xidmət məlumatları
  lib/            Auth store, validasiya sxemləri, kriptoqrafiya, sayt konfiqi
```

Bütün məlumatlar `src/data/index.ts` faylındadır. Həkimlərin filialı
`branchId` sahəsi ilə bağlanır — bu id mütləq `branches` siyahısındakı bir id ilə
üst-üstə düşməlidir; development rejimində uyğunsuzluq halında build xəta verir.

## Accessibility

- Bütün form sahələri `<Field>` komponenti vasitəsilə label-a bağlanır.
- `prefers-reduced-motion` tam dəstəklənir: animasiyalar söndürülür, məzmun
  həmişə görünür qalır.
- JavaScript söndürülübsə, scroll-animasiyalı bölmələr gizli qalmır.

## Known limitations

**Autentifikasiya server tərəflidir.** Giriş yalnız Google ilə mümkündür:
sessiya `AUTH_SECRET` ilə imzalanmış JWT-dir və httpOnly cookie ilə saxlanılır —
brauzer onu nə oxuya, nə də dəyişə bilər. Pasiyent məlumatları (ad, soyad, ata
adı, cins, doğum tarixi, FIN, telefon) yalnız `POST /api/profile` vasitəsilə,
serverdə yoxlanıldıqdan sonra sessiyaya yazılır. `middleware.ts` həm girişi, həm
də profilin tamamlanmasını sorğu səviyyəsində tələb edir.

Əvvəlki email/şifrə girişi ləğv edilib. O, şifrəni brauzerdə `localStorage`-dakı
heş ilə müqayisə edirdi, yəni devtools ilə istənilən pasiyent kimi daxil olmaq
mümkün idi.

Qalan məhdudiyyətlər:

- **Baza yoxdur.** Sessiya cookie-dədir; server tərəfli ləğvetmə (revocation)
  yoxdur və profil cookie ilə birlikdə (7 gün) yaşayır. Cookie silinərsə,
  məlumatlar yenidən doldurulmalıdır.
- **Sifarişlər və qəbullar heç kimə göndərilmir** — yalnız brauzerdə saxlanılır.
  Formalar bunu açıq şəkildə bildirir.
- **Analiz nəticələri** laboratoriya sistemindədir; sayt onlara çıxış əldə etmir.
- **Onlayn ödəniş yoxdur.**
- **Əlaqə forması** `mailto:` istifadə edir.

Real pasiyent məlumatları ilə istifadədən əvvəl lazımdır: şifrələnmiş baza,
sifarişləri qəbul edən server endpoint-i, audit jurnalı və sessiyaların server
tərəfdən ləğvi.

## Deployment

Canonical domen: **https://yuzuch.dev** (`src/lib/site.ts`). Netlify deploy-preview
üçün `process.env.URL` avtomatik istifadə olunur; başqa domen lazımdırsa
`NEXT_PUBLIC_SITE_URL` təyin edin.


Netlify (`netlify.toml`, `@netlify/plugin-nextjs`). Node 20 pinlənib.
Təhlükəsizlik başlıqları (CSP, HSTS, `X-Frame-Options` …) `next.config.ts`
faylındadır.
