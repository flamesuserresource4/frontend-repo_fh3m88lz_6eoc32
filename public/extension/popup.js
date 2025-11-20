const MOODS = [
  { key: 'focused', label: 'Focused' },
  { key: 'chill', label: 'Chill' },
  { key: 'social', label: 'Social' },
  { key: 'creative', label: 'Creative' },
  { key: 'energetic', label: 'Energetic' }
]

const STORAGE_KEY = 'coffee_scout_state_v1'

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}
function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch {}
}

function geoLocate() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000 }
    )
  })
}

async function getWeather(lat, lon) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m`
    const res = await fetch(url)
    const data = await res.json()
    return data?.current || null
  } catch { return null }
}

function deriveContext(mood, weather) {
  const hour = new Date().getHours()
  const timeOfDay = hour < 11 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
  const isRain = (weather?.precipitation ?? 0) > 0.1
  const isHot = (weather?.apparent_temperature ?? 20) > 28
  const wind = weather?.wind_speed_10m ?? 0
  return { timeOfDay, isRain, isHot, wind, mood }
}

function buildQuery({ lat, lon }, ctx) {
  // Overpass query for cafes near location, weighting by opening_hours / outdoor seating if mood or weather suggests
  const radius = 1200
  let filters = 'node[amenity=cafe]'
  if (ctx.mood === 'social') filters += '[outdoor_seating=yes]'
  const around = `around:${radius},${lat},${lon}`
  const query = `[out:json][timeout:10];(${filters}(${around});way[amenity=cafe](${around}););out center 20;`;
  return 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query)
}

function scorePlace(p, ctx) {
  let score = 0
  const name = p.tags?.name || 'Cafe'
  if (/coffee|roast|brew|bean/i.test(name)) score += 2
  if (ctx.mood === 'focused') score += p.tags?.wifi === 'yes' ? 3 : 0
  if (ctx.mood === 'chill') score += p.tags?.outdoor_seating === 'yes' ? 2 : 0
  if (ctx.mood === 'social') score += p.tags?.outdoor_seating === 'yes' ? 2 : 0
  if (ctx.mood === 'creative') score += p.tags?."craft" ? 1 : 0
  if (ctx.isRain) score += p.tags?.indoor_seating === 'yes' ? 2 : 0
  if (ctx.isHot) score += p.tags?.air_conditioning === 'yes' ? 2 : 0
  return score
}

function renderMoodChips(activeMood) {
  const wrap = document.getElementById('mood-chips')
  wrap.innerHTML = ''
  MOODS.forEach(m => {
    const el = document.createElement('button')
    el.className = 'chip' + (activeMood === m.key ? ' active' : '')
    el.textContent = m.label
    el.onclick = () => {
      const s = loadState(); s.mood = m.key; saveState(s); init()
    }
    wrap.appendChild(el)
  })
}

function renderHeadline(ctx) {
  const headline = document.getElementById('headline')
  const context = document.getElementById('context')
  const pieces = []
  pieces.push(ctx.timeOfDay)
  if (ctx.isRain) pieces.push('rainy')
  if (ctx.isHot) pieces.push('hot')
  headline.textContent = `Best ${ctx.mood} coffee spots nearby`
  context.textContent = pieces.length ? `It looks like a ${pieces.join(' and ')} day` : 'Tailored to your vibe and weather'
}

function renderResults(places, coords, ctx) {
  const list = document.getElementById('results')
  list.innerHTML = ''
  places.forEach(p => {
    const name = p.tags?.name || 'Coffee place'
    const dist = p._distance ? `${Math.round(p._distance)} m` : ''
    const item = document.createElement('div')
    item.className = 'place'
    item.innerHTML = `
      <div class="avatar">☕</div>
      <div class="meta">
        <p class="name">${name}</p>
        <p class="desc">${p.tags?.cuisine || 'cafe'} ${dist}</p>
        <div class="badges">
          ${ctx.mood === 'focused' ? '<span class="badge">Calm</span>' : ''}
          ${ctx.mood === 'social' ? '<span class="badge">Outdoor</span>' : ''}
          ${ctx.mood === 'chill' ? '<span class="badge">Cozy</span>' : ''}
        </div>
      </div>
    `
    item.onclick = () => openInMaps(p, coords)
    list.appendChild(item)
  })
}

function openInMaps(p, coords){
  const lat = p.lat || p.center?.lat || coords.lat
  const lon = p.lon || p.center?.lon || coords.lon
  const q = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`
  window.open(q, '_blank')
}

function setOpenMapsLink(coords){
  const a = document.getElementById('open-maps')
  const q = `https://www.google.com/maps/search/coffee/@${coords.lat},${coords.lon},16z`
  a.href = q
}

function distance(a,b){
  const R=6371000;const dLat=(b.lat-a.lat)*Math.PI/180;const dLon=(b.lon-a.lon)*Math.PI/180;const la1=a.lat*Math.PI/180;const la2=b.lat*Math.PI/180;const x=Math.sin(dLat/2)**2+Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.sqrt(x));
}

async function searchPlaces(coords, ctx){
  const url = buildQuery(coords, ctx)
  const res = await fetch(url)
  const data = await res.json()
  const elements = data.elements || []
  elements.forEach(e => e._distance = distance(coords, { lat: e.lat || e.center?.lat, lon: e.lon || e.center?.lon }))
  elements.sort((a,b)=> (b._score||0)-(a._score||0) || a._distance-b._distance)
  elements.forEach(e => e._score = scorePlace(e, ctx))
  return elements.slice(0, 10)
}

async function init(){
  const state = loadState()
  const mood = state.mood || 'focused'
  renderMoodChips(mood)

  const coords = await geoLocate() || { lat: 37.7749, lon: -122.4194 }
  const weather = await getWeather(coords.lat, coords.lon)
  const ctx = deriveContext(mood, weather)
  renderHeadline(ctx)
  setOpenMapsLink(coords)

  const places = await searchPlaces(coords, ctx)
  renderResults(places, coords, ctx)
}

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('refresh').addEventListener('click', init)
  init()
})
