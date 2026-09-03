/**
 * SPIKE / THROWAWAY — banco de pruebas para matchLayout.
 *
 * Dos variantes de la misma landing. La "b" mueve elementos de sitio como lo
 * haría un cambio de CSS real: hero a dos columnas, rejillas con otro número
 * de columnas, secciones invertidas.
 */
const FEATURES = [
  { title: 'In-browser', body: 'Runs inside the real runtime, no cloud containers involved.' },
  { title: 'Deterministic', body: 'Request mocking pins the page state before every capture.' },
  { title: 'No dependencies', body: 'Native canvas APIs only, nothing extra to install.' },
  { title: 'Git friendly', body: 'Text snapshots you can actually review in a pull request.' },
  { title: 'Fast feedback', body: 'Results while you are still writing the component.' },
  { title: 'CI ready', body: 'The exact same run, headless, through twd-cli.' },
];

const QUOTES = [
  { body: 'We caught three layout regressions in the first week.', who: 'Frontend lead' },
  { body: 'Finally a visual check that does not need a SaaS account.', who: 'Platform engineer' },
  { body: 'The snapshots read like code in review.', who: 'Staff engineer' },
];

const FOOTER = [
  { title: 'Product', links: ['Overview', 'Pricing', 'Changelog'] },
  { title: 'Docs', links: ['Getting started', 'API', 'Examples'] },
  { title: 'Community', links: ['GitHub', 'Discord', 'Blog'] },
  { title: 'Company', links: ['About', 'Careers', 'Contact'] },
];

export default function Landing({ variant = 'a' }: { variant?: 'a' | 'b' }) {
  const isB = variant === 'b';

  return (
    <div data-testid="landing" className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-bold tracking-tight">TWD</span>
          <nav className="hidden gap-8 text-sm text-slate-600 md:flex">
            <span>Product</span>
            <span>Docs</span>
            <span>Pricing</span>
            <span>Blog</span>
          </nav>
          <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
            Get started
          </button>
        </div>
      </header>

      {/* CAMBIO 1: el hero pasa de una columna centrada a dos columnas */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div
          className={
            isB
              ? 'mx-auto grid max-w-6xl grid-cols-2 items-center gap-12 px-6 py-20'
              : 'mx-auto max-w-3xl px-6 py-24 text-center'
          }
        >
          <div className={isB ? 'text-left' : ''}>
            <p className="text-sm font-medium text-slate-500">Visual testing, in the browser</p>
            <h1 className="mt-4 text-5xl font-bold leading-tight tracking-tight">
              Test while you develop
            </h1>
            <p className="mt-5 text-lg text-slate-600">
              Catch layout regressions in the real runtime, before they ever reach a pull request.
              No cloud containers, no screenshots in git.
            </p>
            <div className={`mt-8 flex gap-3 ${isB ? 'justify-start' : 'justify-center'}`}>
              <button className="rounded-md bg-slate-900 px-6 py-3 text-sm font-medium text-white">
                Read the docs
              </button>
              <button className="rounded-md border border-slate-300 px-6 py-3 text-sm font-medium">
                See examples
              </button>
            </div>
          </div>
          {isB && <div className="h-64 rounded-lg border border-slate-200 bg-white" />}
        </div>
      </section>

      <section className="border-b border-slate-200">
        <div className="mx-auto grid max-w-6xl grid-cols-4 gap-6 px-6 py-10 text-center">
          {[
            ['64', 'bits per snapshot'],
            ['0', 'runtime dependencies'],
            ['~2ms', 'per capture'],
            ['100%', 'in the browser'],
          ].map(([value, label]) => (
            <div key={label}>
              <p className="text-3xl font-bold">{value}</p>
              <p className="mt-1 text-sm text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CAMBIO 2: la rejilla de features pasa de 3 a 2 columnas */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-bold tracking-tight">Why layout snapshots</h2>
        <p className="mt-3 max-w-2xl text-slate-600">
          DOM assertions already cover your content. What they cannot see is the geometry.
        </p>
        <div className={`mt-10 grid gap-6 ${isB ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {FEATURES.map((feature) => (
            <div key={feature.title} className="rounded-lg border border-slate-200 p-6">
              <p className="font-semibold">{feature.title}</p>
              <p className="mt-2 text-sm text-slate-600">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CAMBIO 3: la sección de texto e imagen se invierte */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div
          className={`mx-auto grid max-w-6xl grid-cols-2 items-center gap-16 px-6 py-20 ${
            isB ? 'flex-row-reverse [direction:rtl]' : ''
          }`}
        >
          <div className={isB ? '[direction:ltr]' : ''}>
            <h2 className="text-3xl font-bold tracking-tight">Deterministic by design</h2>
            <p className="mt-4 text-slate-600">
              Request mocking pins the page state before the capture, so the same code always
              produces the same snapshot. No flaky pixels, no retries.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-slate-600">
              <li>Overflowing containers</li>
              <li>Collapsed flex rows</li>
              <li>Wrapped buttons</li>
              <li>Disappearing sections</li>
            </ul>
          </div>
          <div className="h-72 rounded-lg border border-slate-200 bg-white" />
        </div>
      </section>

      {/* CAMBIO 4: los testimonios pasan de 3 a 2 columnas */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className={`grid gap-6 ${isB ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {QUOTES.map((quote) => (
            <figure key={quote.who} className="rounded-lg border border-slate-200 p-6">
              <blockquote className="text-sm text-slate-700">“{quote.body}”</blockquote>
              <figcaption className="mt-4 text-xs text-slate-500">{quote.who}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-900 text-white">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Start testing while you develop</h2>
          <button className="mt-8 rounded-md bg-white px-6 py-3 text-sm font-medium text-slate-900">
            npm install twd-js
          </button>
        </div>
      </section>

      {/* CAMBIO 5: el footer pasa de 4 a 3 columnas */}
      <footer className="mx-auto max-w-6xl px-6 py-12">
        <div className={`grid gap-8 ${isB ? 'grid-cols-3' : 'grid-cols-4'}`}>
          {(isB ? FOOTER.slice(0, 3) : FOOTER).map((column) => (
            <div key={column.title}>
              <p className="text-sm font-semibold">{column.title}</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-500">
                {column.links.map((link) => (
                  <li key={link}>{link}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-10 border-t border-slate-200 pt-6 text-xs text-slate-400">© TWD</p>
      </footer>
    </div>
  );
}
