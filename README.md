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

**Bu build-də backend yoxdur.** Qeydiyyat, giriş və qəbullar yalnız brauzerin
`localStorage` yaddaşında saxlanılır. Bunun praktiki nəticələri:

- **Google ilə giriş** server tərəfindən Auth.js ilə yoxlanılır və httpOnly
  sessiya cookie-si istifadə edir — bu yol təhlükəsizdir.
- **Email/şifrə ilə giriş** hələ də köhnə client-only yoldur: şifrələr PBKDF2
  (100k iterasiya, SHA-256) ilə heşlənsə də, yoxlama brauzerdə getdiyi üçün
  `localStorage`-ı dəyişməklə keçilə bilər. Bu yolun tamamilə Google (və ya
  server tərəfli email/şifrə) ilə əvəzlənməsi planlaşdırılır.
- **Qəbullar heç kimə göndərilmir.** Reqistratura onları görmür; forma bunu
  açıq şəkildə bildirir və heç bir SMS/email göndərildiyini iddia etmir.
- **Əlaqə forması** məlumatı serverə yox, istifadəçinin e-poçt proqramına
  ötürür (`mailto:`).
- Sağlamlıq məlumatları şifrələnməmiş formada cihazda qalır.

Real pasiyent məlumatları ilə istifadədən əvvəl bunlar mütləqdir: server tərəfli
autentifikasiya (httpOnly sessiya cookie-ləri), şifrələnmiş baza, qəbul
sorğularının serverdə saxlanması və audit jurnalı.

## Deployment

Canonical domen: **https://yuzuch.dev** (`src/lib/site.ts`). Netlify deploy-preview
üçün `process.env.URL` avtomatik istifadə olunur; başqa domen lazımdırsa
`NEXT_PUBLIC_SITE_URL` təyin edin.


Netlify (`netlify.toml`, `@netlify/plugin-nextjs`). Node 20 pinlənib.
Təhlükəsizlik başlıqları (CSP, HSTS, `X-Frame-Options` …) `next.config.ts`
faylındadır.
