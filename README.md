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

| Variable | Default | Nə üçün |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://yuzuch.dev` | Canonical URL-lər, `sitemap.xml`, Open Graph |

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

- **Autentifikasiya server tərəfindən yoxlanılmır.** Şifrələr PBKDF2 (100k
  iterasiya, SHA-256) ilə heşlənir, lakin bütün yoxlama client-də getdiyi üçün
  `localStorage`-ı birbaşa dəyişməklə keçilə bilər.
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
