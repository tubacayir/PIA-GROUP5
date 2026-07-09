import { useState } from "react";

import turkeyCities from "../../assets/tr-cities.json";

export interface CityCountDatum {
  name: string;
  count: number;
}

interface TurkeyCitiesMapCardProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  data: CityCountDatum[];
}

type Position = [number, number];
type Polygon = Position[][];
type MultiPolygon = Polygon[];

interface TurkeyCityFeature {
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: Polygon | MultiPolygon;
  };
  properties: {
    name: string;
    number: number;
  };
}

interface TurkeyCitiesGeoJson {
  features: TurkeyCityFeature[];
}

const MAP_WIDTH = 900;
const MAP_HEIGHT = 430;
const MAP_PADDING = 24;

const geoJson = turkeyCities as unknown as TurkeyCitiesGeoJson;
const bounds = getBounds(geoJson.features);

function featurePolygons(feature: TurkeyCityFeature): MultiPolygon {
  return feature.geometry.type === "Polygon" ? [feature.geometry.coordinates as Polygon] : feature.geometry.coordinates as MultiPolygon;
}

function normalizeCityName(name: string) {
  return name
    .replace("İ", "I")
    .replace("ı", "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("en-US");
}

function getBounds(features: TurkeyCityFeature[]) {
  let minLon = Infinity;
  let maxLon = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  features.forEach((feature) => {
    featurePolygons(feature).forEach((polygon) => {
      polygon.forEach((ring) => {
        ring.forEach(([lon, lat]) => {
          minLon = Math.min(minLon, lon);
          maxLon = Math.max(maxLon, lon);
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
        });
      });
    });
  });

  return { minLon, maxLon, minLat, maxLat };
}

function project([lon, lat]: Position) {
  const x = MAP_PADDING + ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * (MAP_WIDTH - MAP_PADDING * 2);
  const y = MAP_PADDING + ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * (MAP_HEIGHT - MAP_PADDING * 2);

  return [x, y] as const;
}

function ringToPath(ring: Position[]) {
  return ring
    .map((position, index) => {
      const [x, y] = project(position);
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function featureToPath(feature: TurkeyCityFeature) {
  return featurePolygons(feature)
    .map((polygon) => polygon.map((ring) => `${ringToPath(ring)} Z`).join(" "))
    .join(" ");
}

export default function TurkeyCitiesMapCard({ eyebrow, title, subtitle, data }: TurkeyCitiesMapCardProps) {
  const countsByCity = new Map(data.map((item) => [normalizeCityName(item.name), item.count]));
  const sortedCities = [...data].sort((first, second) => second.count - first.count);
  const maxCount = Math.max(...data.map((item) => item.count), 1);
  const [selectedCity, setSelectedCity] = useState<CityCountDatum | null>(sortedCities[0] ?? null);

  const selectCity = (cityName: string) => {
    const count = countsByCity.get(normalizeCityName(cityName)) ?? 0;
    setSelectedCity({ name: cityName, count });
  };

  return (
    <section className="analytics-card flex h-full flex-col">
      <div className="chart-card-header">
        <div>
          <p className="chart-card-eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="mt-5 grid flex-1 gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="flex items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-4">
          <svg
            viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
            role="img"
            aria-label="Türkiye il haritası"
            className="w-full"
            style={{ aspectRatio: `${MAP_WIDTH} / ${MAP_HEIGHT}` }}
          >
            <defs>
              <filter id="provinceShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#0f172a" floodOpacity="0.08" />
              </filter>
            </defs>

            <g filter="url(#provinceShadow)">
              {geoJson.features.map((feature) => {
                const count = countsByCity.get(normalizeCityName(feature.properties.name)) ?? 0;
                const intensity = count / maxCount;
                const isSelected = selectedCity && normalizeCityName(selectedCity.name) === normalizeCityName(feature.properties.name);
                const fill = count > 0 ? `rgba(22, 163, 74, ${0.22 + intensity * 0.62})` : "#e2e8f0";

                return (
                  <path
                    key={feature.properties.number}
                    d={featureToPath(feature)}
                    fill={fill}
                    stroke={isSelected ? "#0f766e" : "#ffffff"}
                    strokeWidth={isSelected ? 2.4 : 1.1}
                    className="cursor-pointer transition hover:fill-emerald-400 focus:outline-none"
                    role="button"
                    tabIndex={0}
                    aria-label={`${feature.properties.name}: ${count.toLocaleString("tr-TR")} customers`}
                    onClick={() => selectCity(feature.properties.name)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        selectCity(feature.properties.name);
                      }
                    }}
                  >
                    <title>{`${feature.properties.name}: ${count.toLocaleString("tr-TR")} customers`}</title>
                  </path>
                );
              })}
            </g>
          </svg>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Selected city</p>
          <div className="mt-3 rounded-xl bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-800">{selectedCity?.name ?? "Select a city"}</p>
            <p className="mt-2 text-3xl font-bold text-emerald-950">
              {(selectedCity?.count ?? 0).toLocaleString("tr-TR")}
            </p>
            <p className="mt-1 text-xs text-emerald-700">customers</p>
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">Top city ranking</p>
          <div className="mt-3 space-y-3">
            {sortedCities.slice(0, 6).map((city, index) => (
              <button
                key={city.name}
                type="button"
                onClick={() => setSelectedCity(city)}
                className="flex w-full items-center justify-between gap-3 rounded-xl px-2 py-1.5 text-left transition hover:bg-slate-50"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-xs font-bold text-emerald-700">
                    {index + 1}
                  </span>
                  <span className="truncate text-sm font-semibold text-slate-800">{city.name}</span>
                </span>
                <span className="text-sm font-bold text-slate-950">{city.count.toLocaleString("tr-TR")}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
