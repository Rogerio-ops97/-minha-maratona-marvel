import fs from 'node:fs/promises';

globalThis.window = {};
await import('../data.js');
for (let i = 0; i < 200 && !window.MARVEL_ITEMS; i++) await new Promise(r => setTimeout(r, 50));
if (!window.MARVEL_ITEMS) throw new Error('Não foi possível carregar a base MARVEL_ITEMS.');

const token = process.env.TMDB_TOKEN;
if (!token) throw new Error('Defina o secret TMDB_TOKEN no repositório.');
const items = window.MARVEL_ITEMS;
const out = {};
const episodesOut = {};
const headers = { Authorization: `Bearer ${token}`, accept: 'application/json' };
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function api(path) {
  const r = await fetch(`https://api.themoviedb.org/3${path}`, { headers });
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  return r.json();
}

function seasonSelection(title) {
  const normalized = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();

  // Blocos cronológicos, por exemplo: T1E1-E7 ou S01E01-E07.
  const block = normalized.match(/(?:T|S)(\d+)E(\d+)\s*-\s*E(\d+)/i);
  if (block) {
    return [{
      seasonNumber: Number(block[1]),
      start: Number(block[2]),
      end: Number(block[3])
    }];
  }

  // Intervalos de temporadas, por exemplo: Temporadas 1-5 ou Seasons 1-5.
  const multiple = normalized.match(/(?:Temporadas?|Seasons?)\s*(\d+)\s*-\s*(\d+)/i);
  if (multiple) {
    const result = [];
    for (let season = Number(multiple[1]); season <= Number(multiple[2]); season++) {
      result.push({ seasonNumber: season });
    }
    return result;
  }

  // Temporada explícita, por exemplo: Temporada 2, Season 2, T2 ou S02.
  const single = normalized.match(/(?:Temporada|Season)\s*(\d+)/i)
    || normalized.match(/(?:^|[\s:()\-])(?:T|S)0*(\d+)(?=$|[\s:()\-])/i);
  if (single) return [{ seasonNumber: Number(single[1]) }];

  // Conteúdos seriados sem indicação de temporada continuam usando a temporada 1.
  return [{ seasonNumber: 1 }];
}

function cleanEpisode(ep) {
  return {
    tmdbEpisodeId: ep.id,
    episodeNumber: ep.episode_number,
    seasonNumber: ep.season_number,
    name: ep.name || `Episódio ${ep.episode_number}`,
    overview: ep.overview || '',
    runtime: ep.runtime || null,
    airDate: ep.air_date || null,
    still: ep.still_path || null,
    vote: ep.vote_average || null,
    voteCount: ep.vote_count || null
  };
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
    if (!hit) {
      console.log(`Não encontrado: ${item.title}`);
      continue;
    }

    const detail = await api(`/${media}/${hit.id}?language=pt-BR&append_to_response=videos,credits,images&include_image_language=pt,en,null`);
    const videos = detail.videos?.results || [];
    const trailer = videos.find(v => v.site === 'YouTube' && v.type === 'Trailer' && v.official)
      || videos.find(v => v.site === 'YouTube' && v.type === 'Trailer')
      || videos.find(v => v.site === 'YouTube');
    const crew = detail.credits?.crew || [];
    const directors = crew
      .filter(p => ['Director', 'Series Director'].includes(p.job))
      .slice(0, 3)
      .map(p => p.name);

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
      cast: (detail.credits?.cast || []).slice(0, 8).map(p => ({
        name: p.name,
        character: p.character,
        profile: p.profile_path
      })),
      directors,
      homepage: detail.homepage || null,
      updatedAt: new Date().toISOString()
    };

    if (media === 'tv') {
      const selected = seasonSelection(item.title);
      const seasons = [];

      for (const selection of selected) {
        try {
          const season = await api(`/tv/${hit.id}/season/${selection.seasonNumber}?language=pt-BR`);
          let episodes = (season.episodes || []).filter(ep => ep.episode_number > 0);

          if (selection.start) {
            episodes = episodes.filter(ep =>
              ep.episode_number >= selection.start && ep.episode_number <= selection.end
            );
          }

          seasons.push({
            tmdbSeasonId: season.id,
            seasonNumber: selection.seasonNumber,
            name: season.name || `Temporada ${selection.seasonNumber}`,
            overview: season.overview || '',
            poster: season.poster_path || null,
            airDate: season.air_date || null,
            episodeStart: selection.start || (episodes[0]?.episode_number ?? null),
            episodeEnd: selection.end || (episodes.at(-1)?.episode_number ?? null),
            episodes: episodes.map(cleanEpisode)
          });

          await sleep(70);
        } catch (seasonError) {
          console.error(`Falha na temporada ${selection.seasonNumber} de ${item.title}:`, seasonError.message);
        }
      }

      episodesOut[item.id] = {
        tmdbId: hit.id,
        title: detail.name || item.title,
        sourceTitle: item.title,
        requestedSeasons: selected,
        seasons,
        totalEpisodes: seasons.reduce((sum, season) => sum + season.episodes.length, 0),
        updatedAt: new Date().toISOString()
      };
    }

    console.log(`${index + 1}/${items.length}: ${item.title}`);
    await sleep(80);
  } catch (error) {
    console.error(`Falha em ${item.title}:`, error.message);
  }
}

await fs.writeFile('tmdb-data.json', JSON.stringify(out, null, 2));
await fs.writeFile('episodes-data.json', JSON.stringify(episodesOut, null, 2));
console.log(`Gerado tmdb-data.json com ${Object.keys(out).length} títulos.`);
console.log(`Gerado episodes-data.json com ${Object.keys(episodesOut).length} produções seriadas.`);
