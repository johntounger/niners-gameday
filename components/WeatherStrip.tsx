'use client';

import { useEffect, useState } from 'react';

interface Forecast {
  tempF: number;
  windMph: number;
  code: number;
}

// Levi's Stadium coordinates.
const LAT = 37.4032;
const LNG = -121.9698;

export default function WeatherStrip({ kickoffIso }: { kickoffIso: string }) {
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [loading, setLoading] = useState(false);

  const daysOut = Math.ceil(
    (new Date(kickoffIso).getTime() - Date.now()) / 86_400_000
  );

  useEffect(() => {
    if (daysOut > 14 || daysOut < -1) return; // Open-Meteo gives ~16 days
    let cancelled = false;
    setLoading(true);
    const date = kickoffIso.slice(0, 10); // YYYY-MM-DD (UTC date works as a daily key)
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', String(LAT));
    url.searchParams.set('longitude', String(LNG));
    url.searchParams.set('hourly', 'temperature_2m,weathercode,windspeed_10m');
    url.searchParams.set('temperature_unit', 'fahrenheit');
    url.searchParams.set('windspeed_unit', 'mph');
    url.searchParams.set('timezone', 'America/Los_Angeles');
    url.searchParams.set('start_date', date);
    url.searchParams.set('end_date', date);

    fetch(url.toString())
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        const times: string[] = json?.hourly?.time ?? [];
        const temps: number[] = json?.hourly?.temperature_2m ?? [];
        const codes: number[] = json?.hourly?.weathercode ?? [];
        const winds: number[] = json?.hourly?.windspeed_10m ?? [];
        if (times.length === 0) return;

        // Pick the hour closest to kickoff.
        const kickoffMs = new Date(kickoffIso).getTime();
        let bestIdx = 0;
        let bestDelta = Infinity;
        for (let i = 0; i < times.length; i++) {
          const t = new Date(times[i] + ':00').getTime();
          const delta = Math.abs(t - kickoffMs);
          if (delta < bestDelta) {
            bestDelta = delta;
            bestIdx = i;
          }
        }

        setForecast({
          tempF: Math.round(temps[bestIdx]),
          code: codes[bestIdx] ?? 0,
          windMph: Math.round(winds[bestIdx] ?? 0),
        });
      })
      .catch(() => {
        /* silent fail — strip just won't show */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [kickoffIso, daysOut]);

  if (daysOut > 14) {
    return (
      <div
        className="-mx-5 mt-3.5 px-5 py-3 flex items-center justify-between text-[13px] relative z-[1]"
        style={{ background: 'rgba(0,0,0,0.2)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-[18px]">🌤️</span>
          <span>Weather forecast available ~14 days out</span>
        </div>
        <span className="text-[11px] opacity-70">{daysOut}d away</span>
      </div>
    );
  }

  if (!forecast) {
    return (
      <div
        className="-mx-5 mt-3.5 px-5 py-3 flex items-center justify-between text-[13px] relative z-[1]"
        style={{ background: 'rgba(0,0,0,0.2)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-[18px]">⛅</span>
          <span>{loading ? 'Loading forecast…' : 'Forecast unavailable'}</span>
        </div>
      </div>
    );
  }

  const { emoji, text } = describeCode(forecast.code);
  const wind = forecast.windMph;
  const windText = wind < 8 ? 'Light wind' : wind < 18 ? `${wind} mph wind` : `Windy · ${wind} mph`;

  return (
    <div
      className="-mx-5 mt-3.5 px-5 py-3 flex items-center justify-between text-[13px] relative z-[1]"
      style={{ background: 'rgba(0,0,0,0.2)' }}
    >
      <div className="flex items-center gap-2">
        <span className="text-[18px]">{emoji}</span>
        <span>
          <b>{forecast.tempF}°F</b> · {text} · {windText}
        </span>
      </div>
      <span className="text-[11px] opacity-70">~{Math.max(daysOut, 0)} days out</span>
    </div>
  );
}

// WMO weather interpretation codes -> emoji + label (compact).
function describeCode(code: number): { emoji: string; text: string } {
  if (code === 0) return { emoji: '☀️', text: 'Sunny' };
  if (code === 1) return { emoji: '🌤️', text: 'Mostly sunny' };
  if (code === 2) return { emoji: '⛅', text: 'Partly cloudy' };
  if (code === 3) return { emoji: '☁️', text: 'Cloudy' };
  if (code === 45 || code === 48) return { emoji: '🌫️', text: 'Foggy' };
  if (code >= 51 && code <= 57) return { emoji: '🌦️', text: 'Drizzle' };
  if (code >= 61 && code <= 67) return { emoji: '🌧️', text: 'Rain' };
  if (code >= 71 && code <= 77) return { emoji: '🌨️', text: 'Snow' };
  if (code >= 80 && code <= 82) return { emoji: '🌧️', text: 'Showers' };
  if (code >= 95) return { emoji: '⛈️', text: 'Thunderstorms' };
  return { emoji: '🌤️', text: 'Mixed' };
}
