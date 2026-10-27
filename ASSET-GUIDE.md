# Stella Wen — portfolio content and assets

## Existing foundation

This project is static HTML/CSS/JavaScript, not React. The approved interactive Hero remains in place. Its character artwork, badge, single right-hand lanyard, tilt and flip behavior are reused; only copy has changed. The original navy/electric blue/yellow tokens, angled marquee, asymmetric card grid, navy Creative Lab and oversized contact treatment remain.

- Open `index.html` for the complete portfolio.
- `hero-concepts/stella-interactive/index.html` remains the previous isolated Hero study.
- Main content and media configuration: `portfolio-data.js`.
- New site styles: `portfolio.css`; existing styles remain in `styles.css` and `hero-home.css`.
- Main interaction logic: `script.js`; approved badge interaction: `hero-home.js`.
- Bilingual EN / 中文 switching: `i18n.js`. The selected language is saved in the browser.
- Prior homepage files: `backups/pre-marketing-content/`.

## Contact

Configured public email: `stellaaa0817@gmail.com`; phone / WhatsApp: `+86 15979799955`; WeChat: `wx20010817`.
No LinkedIn profile has been invented. Add an actual URL to `profile.linkedin` when available.

The contact section uses a left-aligned contact list. Email, phone and WhatsApp open their native actions; WeChat copies the ID. All website typography is capped at weight 450.

## Generated editorial covers

Five local WebP assets were made using built-in image generation. Each prompt is saved alongside its asset. These are decorative project covers, never portfolio evidence.

| Asset | Composition | Dimensions |
| --- | --- | --- |
| `assets/website-3d-cover.webp` | Glass browser windows and chrome frames | 1536 × 1024 |
| `assets/seo-3d-cover.webp` | Cobalt growth bars and chrome magnifier | 1536 × 1024 |
| `assets/content-3d-cover.webp` | Floating video frames and chrome play sculpture | 1774 × 887 |
| `assets/advertising-3d-cover.webp` | Blank promotional cards, coral spheres and chrome arrows | 1536 × 1024 |
| `assets/workflow-3d-cover.webp` | Interconnected chrome rings and translucent nodes | 1536 × 1024 |

The approved Hero cartoon scene and badge avatars are reused. The About polaroid displays the user-supplied professional portrait at `assets/stella-professional-photo.png`. The previous generated pixel-art portrait remains at `assets/stella-professional-pixel.webp` as an unused design variant.

## Replace actual work

Edit a project's `actualMedia` or `evidence` in `portfolio-data.js`. Put local files under `assets/work/`, or use an HTTPS media URL. No layout changes are needed.

```js
{
  title: 'Homepage',
  mediaType: 'image', // image or video
  source: 'assets/work/sinoalta-homepage.webp',
  thumbnail: '', // optional video poster
  description: 'Actual website screenshot, captured in October 2026.',
  status: 'ready' // pending is hidden / shown as a clearly labelled pending slot
}
```

Use a direct MP4/WebM URL for `mediaType: 'video'`; the page uses native video controls. An ordinary YouTube page URL is not a direct media source. Creative work supports `platform`, `contentType`, and `evidenceLink`. The existing filters are All, Video Content, Social Media Posts, Ad Creatives and Brand Materials.

### Materials still needed

1. Website: actual homepage, product and solutions screenshots (3).
2. SEO: Search Queries, Pages Performance and Indexing Status screenshots from Google Search Console (3).
3. Content: Product Introduction Video, Short-form Video, Ad Video, Brand Story, Product Feature Short Video, Promotional Post (6).
4. Advertising: original advertising creative, video and Meta Ads Manager report (3).
5. Workflow: content planning, editing timeline, website development and data analysis screenshots (4).

There are 19 replaceable original-media/evidence slots. Missing assets do not produce broken images or fake play buttons.

### Verified results

`results` defaults to an empty array. A result renders only with `status: 'verified'` and a nonempty source. Add verified figures with period and context:

```js
results: [{ label: 'Metric label', value: 'Evidence-backed value', period: 'Reporting period', status: 'verified', source: 'assets/work/actual-report.webp' }]
```

No clicks, impressions, CTR, ranking, advertising costs, leads, revenue or testimonials have been fabricated. In particular, RMB 0.80 and the screenshot's Google Search Console numbers have not been published as verified results.

## Icon sources

The tools section is intentionally limited to Codex, Meta, YouTube, Facebook, TikTok, CapCut, Canva, Dreamina (即梦), and Google Search Console. Dreamina is shown at 50% proficiency; the other displayed levels are 70–80%. Common brand marks are from [Simple Icons](https://github.com/simple-icons/simple-icons) (version 11.15.0), with CapCut's icon from its [official website](https://www.capcut.com/) and Codex from [SVGL](https://github.com/pheralb/svgl). Dreamina uses the user's selected logo image. Google Search Console is a vector recreation based on the user's reference. Interface icons are from [Phosphor](https://github.com/phosphor-icons/core). Library license files are under `assets/icons/`.

## Checks

Run `node --check script.js` and `node --check portfolio-data.js`.

The meaningful DOM behavior checks in `scripts/check-portfolio.cjs` require jsdom (development only):

```sh
STELLA_JSDOM=/path/to/node_modules/jsdom node scripts/check-portfolio.cjs
```

They exercise all five detail views, creative filtering, mobile navigation state, contact URL and local media references. They do not verify rendered layout or native hover animation. See `design-qa.md` for the current visual verification limit.
