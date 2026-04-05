'use client'

import { useEffect, useState } from "react";

const STATUS_COLORS = {
  Critical: { bg: "#e8344a", glow: "rgba(232,52,74,0.5)" },
  Severe: { bg: "#ff6600", glow: "rgba(255,102,0,0.5)" },
  Moderate: { bg: "#ffd700", glow: "rgba(255,215,0,0.4)" },
  Stable: { bg: "#00cc66", glow: "rgba(0,204,102,0.4)" },
};

function getBarColor(value) {
  if (value < 25) return "#e8344a";
  if (value < 45) return "#ff6600";
  if (value < 65) return "#ffd700";
  return "#00cc66";
}

const S = `
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=Source+Code+Pro:wght@400;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
:root{--bg:#08090e;--sf:#10111b;--bd:rgba(255,255,255,0.07);--ac:#f5a623;--red:#e8344a;--tx:#dde0f0;--mu:#52547a;--gr:#00cc66;--bl:#4488ff;}
.app{min-height:100vh;background:var(--bg);color:var(--tx);font-family:'Source Code Pro',monospace;overflow-x:hidden;}
.scanlines{position:fixed;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.07) 2px,rgba(0,0,0,0.07) 4px);pointer-events:none;z-index:100;}
header{border-bottom:1px solid var(--bd);padding:13px 22px;display:flex;align-items:center;justify-content:space-between;background:rgba(8,9,14,0.95);position:sticky;top:0;z-index:50;backdrop-filter:blur(12px);}
.logo-icon{width:32px;height:32px;background:var(--red);border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;animation:pi 2.5s infinite;}
@keyframes pi{0%,100%{box-shadow:0 0 0 0 rgba(232,52,74,.4);}50%{box-shadow:0 0 0 8px rgba(232,52,74,0);}}
.logo-text{font-family:'Oswald',sans-serif;font-size:18px;font-weight:700;letter-spacing:2px;}
.logo-sub{font-size:9px;color:var(--ac);letter-spacing:3px;text-transform:uppercase;margin-top:1px;}
.hdr-l{display:flex;align-items:center;gap:12px;}
.hdr-r{display:flex;align-items:center;gap:16px;}
.live-b{display:flex;align-items:center;gap:5px;font-size:9px;letter-spacing:2px;color:var(--gr);}
.live-dot{width:6px;height:6px;border-radius:50%;background:var(--gr);animation:blink 1.2s infinite;}
@keyframes blink{0%,100%{opacity:1;}50%{opacity:.2;}}
.time-d{font-size:10px;color:var(--mu);}
.rbtn{background:rgba(245,166,35,.1);border:1px solid rgba(245,166,35,.3);color:var(--ac);font-family:'Source Code Pro',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;padding:5px 12px;border-radius:3px;cursor:pointer;transition:all .2s;}
.rbtn:hover{background:rgba(245,166,35,.2);}
.rbtn:disabled{opacity:.5;cursor:default;}
.main{padding:18px 22px;max-width:1420px;margin:0 auto;}
.crisis-banner{background:linear-gradient(90deg,rgba(232,52,74,.18),rgba(232,52,74,.04));border:1px solid rgba(232,52,74,.35);border-left:3px solid var(--red);border-radius:4px;padding:10px 16px;margin-bottom:18px;font-size:11px;color:#ffb0bb;line-height:1.6;animation:fb 3s infinite;}
@keyframes fb{0%,100%{border-left-color:var(--red);}50%{border-left-color:transparent;}}
.ct{font-family:'Oswald',sans-serif;font-size:13px;font-weight:700;color:var(--red);letter-spacing:1px;margin-bottom:3px;}
.kpi-row{display:grid;grid-template-columns:repeat(5,1fr);gap:13px;margin-bottom:18px;}
.kc{background:var(--sf);border:1px solid var(--bd);border-radius:6px;padding:15px 16px;position:relative;overflow:hidden;}
.kc::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;}
.kc.red::before{background:var(--red);}
.kc.orange::before{background:#ff6600;}
.kc.yellow::before{background:#ffd700;}
.kc.green::before{background:var(--gr);}
.kc.blue::before{background:var(--bl);}
.kl{font-size:9px;letter-spacing:2px;color:var(--mu);text-transform:uppercase;margin-bottom:7px;}
.kv{font-family:'Oswald',sans-serif;font-size:26px;font-weight:700;line-height:1;margin-bottom:3px;}
.kc.red .kv{color:var(--red);}
.kc.orange .kv{color:#ff6600;}
.kc.yellow .kv{color:#ffd700;}
.kc.green .kv{color:var(--gr);}
.kc.blue .kv{color:var(--bl);}
.ks{font-size:9px;color:var(--mu);}
.kch{font-size:8px;margin-top:3px;color:var(--red);}
.rtag{font-size:8px;padding:1px 5px;border-radius:2px;background:rgba(0,204,102,.1);color:var(--gr);border:1px solid rgba(0,204,102,.2);letter-spacing:1px;position:absolute;top:9px;right:9px;}
.cg{display:grid;grid-template-columns:1fr 330px;gap:16px;margin-bottom:16px;}
.panel{background:var(--sf);border:1px solid var(--bd);border-radius:6px;overflow:hidden;}
.ph{padding:11px 16px;border-bottom:1px solid var(--bd);display:flex;align-items:center;justify-content:space-between;}
.pt{font-family:'Oswald',sans-serif;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:var(--ac);}
.pb{font-size:9px;padding:2px 7px;border-radius:2px;background:rgba(245,166,35,.1);color:var(--ac);border:1px solid rgba(245,166,35,.2);letter-spacing:1px;}
.stag{font-size:8px;color:var(--mu);}
table{width:100%;border-collapse:collapse;}
th{font-size:8px;letter-spacing:2px;color:var(--mu);text-transform:uppercase;text-align:left;padding:9px 13px;border-bottom:1px solid var(--bd);background:rgba(0,0,0,.2);}
tr.cr{cursor:pointer;border-bottom:1px solid var(--bd);transition:background .15s;}
tr.cr:hover{background:rgba(255,255,255,.02);}
tr.cr.sel{background:rgba(245,166,35,.04);border-left:2px solid var(--ac);}
td{padding:10px 13px;font-size:11px;}
.cn{font-family:'Oswald',sans-serif;font-size:14px;font-weight:600;}
.crg{font-size:9px;color:var(--mu);}
.sp{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:2px;font-size:9px;font-weight:600;letter-spacing:1px;text-transform:uppercase;}
.ab{width:65px;height:5px;background:rgba(255,255,255,.07);border-radius:3px;overflow:hidden;}
.af{height:100%;border-radius:3px;}
.bmt{font-size:8px;padding:1px 5px;border-radius:2px;background:rgba(232,52,74,.1);color:#ff9aaa;border:1px solid rgba(232,52,74,.2);}
.rc{display:flex;flex-direction:column;gap:13px;}
.pl{padding:13px 16px;}
.fi{display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--bd);}
.fi:last-child{border-bottom:none;}
.fn{font-size:10px;color:var(--mu);}
.fp{font-family:'Oswald',sans-serif;font-size:19px;font-weight:600;color:var(--ac);}
.fu{font-size:9px;color:var(--mu);margin-left:2px;}
.fc{font-size:9px;color:var(--red);margin-left:5px;}
.mc{padding:13px 16px;}
.cbs{display:flex;align-items:flex-end;gap:5px;height:65px;}
.cbw{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;height:100%;justify-content:flex-end;}
.cb{width:100%;border-radius:2px 2px 0 0;}
.cd{font-size:8px;color:var(--mu);}
.aif{padding:13px 16px;}
.ail{display:flex;align-items:center;gap:7px;font-size:10px;color:var(--mu);padding:10px 0;}
.aisp{width:11px;height:11px;border:2px solid var(--bd);border-top-color:var(--ac);border-radius:50%;animation:spin .8s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
.aii{margin-bottom:11px;padding-bottom:11px;border-bottom:1px solid var(--bd);}
.aii:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0;}
.aiit{font-size:11px;color:var(--tx);line-height:1.4;margin-bottom:3px;}
.aiim{font-size:9px;color:var(--mu);letter-spacing:1px;}
.aibg{display:inline-block;font-size:8px;padding:1px 5px;border-radius:2px;margin-right:4px;letter-spacing:1px;font-weight:600;}
.aibg.crisis{background:rgba(232,52,74,.15);color:#ff9aaa;border:1px solid rgba(232,52,74,.2);}
.aibg.supply{background:rgba(255,102,0,.12);color:#ffa060;border:1px solid rgba(255,102,0,.2);}
.aibg.price{background:rgba(245,166,35,.12);color:var(--ac);border:1px solid rgba(245,166,35,.2);}
.aibg.policy{background:rgba(68,136,255,.12);color:#88aaff;border:1px solid rgba(68,136,255,.2);}
.feed-note{font-size:9px;color:var(--mu);padding-top:8px;}
.feed-error{font-size:10px;color:#ff9aaa;padding:8px 0;}
.br{display:grid;grid-template-columns:1fr 1fr;gap:16px;padding-bottom:52px;}
.dp{padding:16px 18px;}
.dtt{font-family:'Oswald',sans-serif;font-size:19px;font-weight:700;margin-bottom:13px;display:flex;align-items:center;gap:9px;}
.dg{display:grid;grid-template-columns:1fr 1fr;gap:9px;}
.ds{background:rgba(0,0,0,.3);border:1px solid var(--bd);border-radius:4px;padding:9px 11px;}
.dsl{font-size:8px;letter-spacing:2px;color:var(--mu);text-transform:uppercase;margin-bottom:4px;}
.dsv{font-family:'Oswald',sans-serif;font-size:19px;font-weight:600;}
.pbl{display:flex;justify-content:space-between;font-size:9px;color:var(--mu);margin-bottom:4px;letter-spacing:1px;}
.pbb{height:6px;background:rgba(255,255,255,.05);border-radius:4px;overflow:hidden;margin-bottom:9px;}
.pbf{height:100%;border-radius:4px;transition:width .6s ease;}
.spr{display:flex;align-items:center;justify-content:center;height:160px;color:var(--mu);font-size:11px;letter-spacing:2px;flex-direction:column;gap:7px;}
.sb{padding:16px 18px;}
.cn2{font-size:9px;color:var(--mu);line-height:1.7;margin-top:14px;padding-top:14px;border-top:1px solid var(--bd);}
.ticker{overflow:hidden;border-top:1px solid var(--bd);padding:7px 22px;background:rgba(0,0,0,.4);display:flex;align-items:center;gap:13px;font-size:9px;color:var(--mu);letter-spacing:1px;position:fixed;bottom:0;left:0;right:0;z-index:40;}
.tkl{color:var(--ac);font-weight:600;flex-shrink:0;}
.tks{flex:1;overflow:hidden;white-space:nowrap;}
.tki{display:inline-block;animation:tm 38s linear infinite;}
@keyframes tm{0%{transform:translateX(100%);}100%{transform:translateX(-100%);}}
@media(max-width:900px){.kpi-row{grid-template-columns:repeat(2,1fr);}.cg{grid-template-columns:1fr;}.br{grid-template-columns:1fr;}}
`;

function StatusPill({ status }) {
  const colors = STATUS_COLORS[status];

  return (
    <span
      className="sp"
      style={{
        background: `${colors.bg}18`,
        color: colors.bg,
        border: `1px solid ${colors.bg}45`,
        boxShadow: `0 0 6px ${colors.glow}`,
      }}
    >
      ● {status}
    </span>
  );
}

function KPICard({ label, value, sub, color, change, isReal }) {
  return (
    <div className={`kc ${color}`}>
      {isReal && <span className="rtag">LIVE</span>}
      <div className="kl">{label}</div>
      <div className="kv">{value}</div>
      {change && <div className="kch">{change}</div>}
      <div className="ks">{sub}</div>
    </div>
  );
}

function AICrisisFeed({ items, loading, error, sourceLabel }) {
  return (
    <div className="aif">
      {loading && (
        <div className="ail">
          <div className="aisp" />
          Fetching dashboard feed...
        </div>
      )}
      {!loading && error && <div className="feed-error">{error}</div>}
      {items.map((item, index) => (
        <div key={`${item.headline}-${index}`} className="aii">
          <div className="aiit">
            <span className={`aibg ${item.tag}`}>{(item.tag || "news").toUpperCase()}</span>
            {item.headline}
          </div>
          <div style={{ fontSize: 10, color: "#9090b0", lineHeight: 1.4, marginBottom: 3 }}>
            {item.detail}
          </div>
          <div className="aiim">{item.time}</div>
        </div>
      ))}
      {!loading && sourceLabel && <div className="feed-note">Feed source: {sourceLabel}</div>}
    </div>
  );
}

function LoadingShell() {
  return (
    <div className="spr">
      <div className="aisp" />
      Loading dashboard data
    </div>
  );
}

export default function Petro() {
  const [dashboard, setDashboard] = useState(null);
  const [selected, setSelected] = useState(null);
  const [time, setTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  async function loadDashboard(isRefresh = false) {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setLoadError(null);

    try {
      const response = await fetch("/api/petro", { cache: "no-store" });

      if (!response.ok) {
        throw new Error(`Dashboard API failed with status ${response.status}`);
      }

      const data = await response.json();
      setDashboard(data);
      setSelected((current) => {
        if (current === null) return null;
        return current < data.cities.length ? current : null;
      });
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const prices = dashboard?.prices;
  const cities = dashboard?.cities ?? [];
  const stats = dashboard?.stats;
  const selectedCity = selected !== null ? cities[selected] : null;
  const feedItems = dashboard?.feed?.items ?? [];
  const feedError = dashboard?.feed?.error ?? null;
  const feedSource = dashboard?.feed?.sourceLabel;
  const priceSource = prices?.source ?? "External source";
  const brentSource = dashboard?.brent?.source ?? "External source";
  const brentPeriod = dashboard?.brent?.period;
  const priceStatusText = prices?.live ? "LIVE" : "FALLBACK";
  const brentStatusText = dashboard?.brent?.live ? "LIVE" : "FALLBACK";

  return (
    <>
      <style>{S}</style>
      <div className="app">
        <div className="scanlines" />

        <header>
          <div className="hdr-l">
            <div className="logo-icon">⛽</div>
            <div>
              <div className="logo-text">PETRO-WATCH</div>
              <div className="logo-sub">Pakistan Fuel Crisis Monitor</div>
            </div>
          </div>
          <div className="hdr-r">
            <div className="live-b">
              <div className="live-dot" />
              LIVE
            </div>
            <div className="time-d">
              {time.toLocaleTimeString("en-PK", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}{" "}
              · PKT
            </div>
            <button className="rbtn" onClick={() => loadDashboard(true)} disabled={refreshing || loading}>
              {refreshing ? "UPDATING..." : "↻ REFRESH"}
            </button>
          </div>
        </header>

        <div className="main">
          {loadError && !dashboard && <div className="feed-error">{loadError}</div>}

          <div className="crisis-banner">
            <div className="ct">⚠ STRAIT OF HORMUZ CRISIS — ACTIVE</div>
            US-Israel strikes on Iran (Feb 28, 2026) caused Iran to block the Strait of Hormuz,
            removing ~20% of global oil supply. Pakistan raised petrol to{" "}
            <strong>₨{prices?.petrolRON92 ?? "--"}/L</strong> and diesel to{" "}
            <strong>₨{prices?.diesel ?? "--"}/L</strong> on April 3 — the largest single-day hike in
            Pakistan&apos;s history (+₨137.24 and +₨184.49 respectively). Brent crude:{" "}
            <strong>${dashboard?.brentCrude ?? "--"}/bbl</strong>. Pakistan retail source:{" "}
            <strong>{priceSource}</strong>. Brent source: <strong>{brentSource}</strong>.
          </div>

          {dashboard ? (
            <>
              <div className="kpi-row">
                <KPICard
                  label="Petrol RON-92"
                  value={`₨${prices.petrolRON92}`}
                  sub={`${priceSource} · ${priceStatusText}`}
                  color="red"
                  change={`+₨${(prices.petrolRON92 - prices.previousPetrol).toFixed(2)} Apr 3`}
                  isReal
                />
                <KPICard
                  label="Diesel HSD"
                  value={`₨${prices.diesel}`}
                  sub={`${priceSource} · ${priceStatusText}`}
                  color="orange"
                  change={`+₨${(prices.diesel - prices.previousDiesel).toFixed(2)} Apr 3`}
                  isReal
                />
                <KPICard
                  label="Brent Crude"
                  value={`$${dashboard.brentCrude}`}
                  sub={`${brentSource}${brentPeriod ? ` · ${brentPeriod}` : ""} · ${brentStatusText}`}
                  color="yellow"
                  change={dashboard?.brent?.releaseDate ? `Release ${dashboard.brent.releaseDate}` : null}
                  isReal
                />
                <KPICard
                  label="Avg Availability"
                  value={`${stats.avgAvailability}%`}
                  sub="Est. across 8 cities"
                  color={stats.avgAvailability < 40 ? "red" : "green"}
                />
                <KPICard
                  label="Cities in Crisis"
                  value={stats.citiesInCrisis}
                  sub={`${stats.critical} critical · ${stats.severe} severe`}
                  color="orange"
                />
              </div>

              <div className="cg">
                <div className="panel">
                  <div className="ph">
                    <span className="pt">City Status Matrix</span>
                    <span className="stag">Live prices via /api/petro</span>
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>City / Region</th>
                        <th>Status</th>
                        <th>Availability</th>
                        <th>Queue</th>
                        <th>Pumps</th>
                        <th>Petrol/L</th>
                        <th>Restock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cities.map((city, index) => (
                        <tr
                          key={city.name}
                          className={`cr ${selected === index ? "sel" : ""}`}
                          onClick={() => setSelected(selected === index ? null : index)}
                        >
                          <td>
                            <div className="cn">{city.name}</div>
                            <div className="crg">
                              {city.region}
                              {city.isPort ? " · PORT" : ""}
                            </div>
                          </td>
                          <td>
                            <StatusPill status={city.status} />
                          </td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <div className="ab">
                                <div
                                  className="af"
                                  style={{
                                    width: `${city.availabilityScore}%`,
                                    background: getBarColor(city.availabilityScore),
                                  }}
                                />
                              </div>
                              <span style={{ fontSize: 10, color: getBarColor(city.availabilityScore) }}>
                                {city.availabilityScore}%
                              </span>
                            </div>
                          </td>
                          <td style={{ fontFamily: "'Oswald',sans-serif", fontSize: 14 }}>
                            {city.queueLength}
                          </td>
                          <td style={{ fontSize: 10, color: "#777" }}>{city.pumpsFunctional}</td>
                          <td>
                            <span
                              style={{
                                fontFamily: "'Oswald',sans-serif",
                                fontSize: 13,
                                color: city.blackMarket ? "#ff9aaa" : "var(--ac)",
                              }}
                            >
                              ₨{city.priceRON92}
                            </span>
                            {city.blackMarket && (
                              <span className="bmt" style={{ marginLeft: 4 }}>
                                BLK
                              </span>
                            )}
                          </td>
                          <td style={{ fontSize: 10, color: "var(--mu)" }}>{city.lastRestocked}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="rc">
                  <div className="panel">
                    <div className="ph">
                      <span className="pt">OGRA Official Rates</span>
                      <span className="pb">{prices.lastUpdated || "LIVE"}</span>
                    </div>
                    <div className="pl">
                      {[
                        { name: "Petrol (RON-92)", price: prices.petrolRON92, prev: prices.previousPetrol },
                        { name: "Diesel (HSD)", price: prices.diesel, prev: prices.previousDiesel },
                        { name: "Kerosene", price: prices.kerosene, prev: null },
                        { name: "Hi-Octane (est)", price: prices.petrolRON95, prev: null },
                        { name: "CNG (approx)", price: prices.cng, prev: null },
                      ].map((fuel) => (
                        <div key={fuel.name} className="fi">
                          <span className="fn">{fuel.name}</span>
                          <span>
                            <span className="fp">₨{fuel.price}</span>
                            <span className="fu">/L</span>
                            {fuel.prev && <span className="fc">↑{(fuel.price - fuel.prev).toFixed(2)}</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="panel">
                    <div className="ph">
                      <span className="pt">7-Day Availability</span>
                    </div>
                    <div className="mc">
                      <div className="cbs">
                        {stats.days.map((day, index) => (
                          <div key={day} className="cbw">
                            <div
                              className="cb"
                              style={{
                                height: `${stats.histAvail[index]}%`,
                                background: getBarColor(stats.histAvail[index]),
                                opacity: 0.8,
                              }}
                            />
                            <span className="cd">{day}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ fontSize: 9, color: "var(--mu)", marginTop: 7, letterSpacing: "1px" }}>
                        DECLINING SINCE HORMUZ CLOSURE
                      </div>
                    </div>
                  </div>

                  <div className="panel" style={{ flex: 1 }}>
                    <div className="ph">
                      <span className="pt">API Crisis Feed</span>
                      <span className="pb">{feedSource || "Server Feed"}</span>
                    </div>
                    <AICrisisFeed
                      items={feedItems}
                      loading={loading && !dashboard}
                      error={feedError}
                      sourceLabel={feedSource}
                    />
                  </div>
                </div>
              </div>

              <div className="br">
                <div className="panel">
                  <div className="ph">
                    <span className="pt">City Deep Dive</span>
                    {selectedCity && <span className="pb">{selectedCity.name.toUpperCase()}</span>}
                  </div>
                  {!selectedCity ? (
                    <div className="spr">
                      <span style={{ fontSize: 20 }}>↑</span>
                      Tap a city row above
                    </div>
                  ) : (
                    <div className="dp">
                      <div className="dtt">
                        {selectedCity.name}
                        <StatusPill status={selectedCity.status} />
                        {selectedCity.isPort && (
                          <span
                            style={{
                              fontSize: 9,
                              color: "var(--bl)",
                              border: "1px solid rgba(68,136,255,.3)",
                              padding: "2px 6px",
                              borderRadius: 2,
                            }}
                          >
                            PORT
                          </span>
                        )}
                      </div>
                      <div className="dg">
                        <div className="ds">
                          <div className="dsl">Petrol/L</div>
                          <div
                            className="dsv"
                            style={{ color: selectedCity.blackMarket ? "#ff9aaa" : "var(--ac)", fontSize: 17 }}
                          >
                            ₨{selectedCity.priceRON92}
                            {selectedCity.blackMarket && <span style={{ fontSize: 9, marginLeft: 4 }}>BLK MKT</span>}
                          </div>
                        </div>
                        <div className="ds">
                          <div className="dsl">Queue</div>
                          <div className="dsv" style={{ color: "#ff6600" }}>
                            {selectedCity.queueLength} veh
                          </div>
                        </div>
                        <div className="ds">
                          <div className="dsl">Active Pumps</div>
                          <div className="dsv" style={{ color: "#999", fontSize: 15 }}>
                            {selectedCity.pumpsFunctional}
                          </div>
                        </div>
                        <div className="ds">
                          <div className="dsl">Last Restock</div>
                          <div className="dsv" style={{ color: "var(--mu)", fontSize: 14 }}>
                            {selectedCity.lastRestocked}
                          </div>
                        </div>
                      </div>
                      <div style={{ marginTop: 14 }}>
                        {[
                          {
                            label: "AVAILABILITY",
                            val: selectedCity.availabilityScore,
                            color: getBarColor(selectedCity.availabilityScore),
                          },
                          { label: "SUPPLY CHAIN", val: selectedCity.supplyChain, color: "#4488ff" },
                          { label: "STORAGE LEVEL", val: selectedCity.storageLevel, color: "#aa44ff" },
                        ].map((bar) => (
                          <div key={bar.label}>
                            <div className="pbl">
                              <span>{bar.label}</span>
                              <span style={{ color: bar.color }}>{bar.val}%</span>
                            </div>
                            <div className="pbb">
                              <div className="pbf" style={{ width: `${bar.val}%`, background: bar.color }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="panel">
                  <div className="ph">
                    <span className="pt">Crisis Overview</span>
                  </div>
                  <div className="sb">
                    {["Critical", "Severe", "Moderate", "Stable"].map((status) => {
                      const count = cities.filter((city) => city.status === status).length;
                      const pct = Math.round((count / cities.length) * 100);
                      const color = STATUS_COLORS[status].bg;

                      return (
                        <div key={status} style={{ marginBottom: 13 }}>
                          <div className="pbl">
                            <span style={{ color }}>● {status.toUpperCase()}</span>
                            <span>
                              {count} {count === 1 ? "city" : "cities"} ({pct}%)
                            </span>
                          </div>
                          <div className="pbb">
                            <div className="pbf" style={{ width: `${pct}%`, background: color, opacity: 0.8 }} />
                          </div>
                        </div>
                      );
                    })}
                    <div className="cn2">
                      <strong style={{ color: "var(--ac)" }}>Data sources</strong>
                      <br />
                      • Dashboard API: <code>/api/petro</code>
                      <br />
                      • Pakistan fuel prices: {priceSource}
                      <br />
                      • Brent crude: {brentSource}
                      <br />
                      • City availability &amp; queues: server-side modelled estimates
                      <br />
                      • Crisis feed: server-side AI feed with fallback items
                      <br />
                      <br />
                      <strong style={{ color: "#ff9aaa" }}>Active subsidies (Apr 3):</strong> Motorcyclists
                      ₨100/L off up to 20L/mo. Intercity buses &amp; trucks also receiving targeted diesel
                      relief.
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <LoadingShell />
          )}
        </div>

        {dashboard && (
          <div className="ticker">
            <span className="tkl">⚡ LIVE</span>
            <div className="tks">
              <span className="tki">
                &nbsp;&nbsp;▸ PETROL: ₨{prices.petrolRON92}/L ({priceStatusText}) &nbsp;▸ DIESEL: ₨
                {prices.diesel}/L &nbsp;▸ KEROSENE: ₨{prices.kerosene}/L &nbsp;▸ BRENT: $
                {dashboard.brentCrude}/bbl &nbsp;▸ API: /api/petro &nbsp;▸ PRICE SOURCE: {priceSource}
                &nbsp;▸ BRENT SOURCE: {brentSource} &nbsp;▸ MOTORCYCLE SUBSIDY: ₨100/L OFF ≤20L/MO
                &nbsp;▸ LARGEST HIKE IN PAKISTAN HISTORY: +₨137.24/L PETROL &nbsp;
                {cities.map((city) => (
                  <span key={city.name}>
                    &nbsp;▸ {city.name.toUpperCase()}:{" "}
                    <span style={{ color: STATUS_COLORS[city.status].bg }}>
                      {city.status.toUpperCase()}
                    </span>{" "}
                    ({city.availabilityScore}% avail) &nbsp;
                  </span>
                ))}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
