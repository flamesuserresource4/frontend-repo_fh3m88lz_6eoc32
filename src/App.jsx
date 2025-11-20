import Spline from '@splinetool/react-spline'

function App() {
  const openChromeExtensions = () => {
    window.open('chrome://extensions', '_blank')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero with Spline cover */}
      <section className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
        <div className="absolute inset-0">
          <Spline scene="https://prod.spline.design/g5OaHmrKTDxRI7Ig/scene.splinecode" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-slate-950/40 to-slate-950" />
        <div className="relative z-10 h-full max-w-6xl mx-auto px-6 flex items-end pb-10">
          <div>
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
              Coffee Scout
            </h1>
            <p className="mt-3 text-slate-300 max-w-xl">
              A minimalist Chrome extension that suggests the best nearby coffee spots, tuned to your mood and environment — time, weather, and vibe.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="/extension/popup.html"
                className="inline-flex items-center px-4 py-2 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-400 transition"
              >
                Preview Popup
              </a>
              <a
                href="/extension/manifest.json"
                className="inline-flex items-center px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-900 transition"
              >
                View Files
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <div className="text-xs uppercase tracking-widest text-blue-300/80">01</div>
          <h3 className="mt-2 text-lg font-semibold">Choose your mood</h3>
          <p className="mt-2 text-slate-300">Focused, chill, social, creative, or energetic — your vibe guides the recommendations.</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <div className="text-xs uppercase tracking-widest text-blue-300/80">02</div>
          <h3 className="mt-2 text-lg font-semibold">Context-aware</h3>
          <p className="mt-2 text-slate-300">Considers weather and time of day to surface spots that fit the moment, with privacy-first design.</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <div className="text-xs uppercase tracking-widest text-blue-300/80">03</div>
          <h3 className="mt-2 text-lg font-semibold">One-tap directions</h3>
          <p className="mt-2 text-slate-300">Open results in Google Maps instantly and get moving.</p>
        </div>
      </section>

      {/* Install guidance */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-semibold">Add the extension to Chrome</h2>
          <ol className="mt-4 space-y-3 text-slate-300 list-decimal list-inside">
            <li>Download the extension files from the links above (manifest and popup are under the /extension path).</li>
            <li>Open Chrome and go to chrome://extensions, enable Developer mode.</li>
            <li>Click “Load unpacked” and select the extension folder you downloaded.</li>
            <li>Pin “Coffee Scout” and click the icon to try it. Allow location access when prompted.</li>
          </ol>
          <div className="mt-6 flex gap-3">
            <button onClick={openChromeExtensions} className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition">Open chrome://extensions</button>
            <a href="/extension" className="px-4 py-2 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-400 transition">Open extension folder</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-slate-500">
        Built with a minimalist, privacy-forward approach. No tracking — your data stays on your device.
      </footer>
    </div>
  )
}

export default App
