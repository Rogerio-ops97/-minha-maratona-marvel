import fs from 'node:fs/promises';

globalThis.window = {};
await import('../data.js');
for (let i = 0; i < 200 && !window.MARVEL_ITEMS; i++) await new Promise(r => setTimeout(r, 50));
if (!window.MARVEL_ITEMS) throw new Error('Não foi possível carregar a base MARVEL_ITEMS.');

const token = process.env.TMDB_TOKEN;
if (!token) throw new Error('Defina o secret TMDB_TOKEN no repositório.');
const items = window.MARVEL_ITEMS;
const out = {};
const headers = { Authorization: `Bearer ${token}`, accept: 'application/json' };
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function api(path) {
  const r = await fetch(`https://api.themoviedb.org/3${path}`, { headers });
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  return r.json();
}

for (let index = 0; index < items.length; index++) {
  const item = items[index];
  const media = item.media === 'tv' ? 'tv' : 'movie';
  const yearParam = media === 'movie' ? 'year' : 'first_air_date_year';
  const year = Number(item.year) > 1900 ? `&${yearParam}=${item.year}` : '';
  try {
    const search = await api(`/search/${media}?query=${encodeURIComponent(item.query || item.title)}&language=pt-BR&include_adult=false${year}`);
    let hit = search.results?.[0];
    if (!hit && year) {
      const retry = await api(`/search/${media}?query=${encodeURIComponent(item.query || item.title)}&language=pt-BR&include_adult=false`);
      hit = retry.results?.[0];
    }
    if (!hit) { console.log(`Não encontrado: ${item.title}`); continue; }
    const detail = await api(`/${media}/${hit.id}?language=pt-BR&append_to_response=videos,credits,images&include_image_language=pt,en,null`);
    const videos = detail.videos?.results || [];
    const trailer = videos.find(v => v.site === 'YouTube' && v.type === 'Trailer' && v.official) || videos.find(v => v.site === 'YouTube' && v.type === 'Trailer') || videos.find(v => v.site === 'YouTube');
    const crew = detail.credits?.crew || [];
    const directors = crew.filter(p => ['Director','Series Director'].includes(p.job)).slice(0,3).map(p => p.name);
    out[item.id] = {
      tmdbId: hit.id,
      media,
      poster: detail.poster_path || hit.poster_path || null,
      backdrop: detail.backdrop_path || hit.backdrop_path || null,
      overview: detail.overview || hit.overview || item.synopsis || '',
      vote: detail.vote_average || hit.vote_average || null,
      voteCount: detail.vote_count || hit.vote_count || null,
      trailer: trailer?.key || null,
      genres: (detail.genres || []).map(g => g.name),
      cast: (detail.credits?.cast || []).slice(0,8).map(p => ({ name: p.name, character: p.character, profile: p.profile_path })),
      directors,
      homepage: detail.homepage || null,
      updatedAt: new Date().toISOString()
    };
    console.log(`${index + 1}/${items.length}: ${item.title}`);
    await sleep(80);
  } catch (error) {
    console.error(`Falha em ${item.title}:`, error.message);
  }
}

await fs.writeFile('tmdb-data.json', JSON.stringify(out, null, 2));
console.log(`Gerado tmdb-data.json com ${Object.keys(out).length} títulos.`);
