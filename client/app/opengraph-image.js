import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "52px 58px",
          background:
            "radial-gradient(circle at top left, #1f2438 0%, #0d111c 45%, #07090f 100%)",
          color: "#f2f5ff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#e8344a",
              color: "#fff",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            P
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ fontSize: 20, letterSpacing: 4, textTransform: "uppercase", color: "#f5a623" }}>
              Pakistan Fuel Crisis Monitor
            </div>
            <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.05 }}>
              Petro Watch
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            maxWidth: 920,
          }}
        >
          <div style={{ fontSize: 66, fontWeight: 800, lineHeight: 1.02 }}>
            Live fuel prices, Brent crude, and city availability.
          </div>
          <div style={{ fontSize: 28, color: "#bac4e0", lineHeight: 1.35 }}>
            Shareable dashboard for Pakistan petrol and diesel tracking with crisis context and operational signals.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 18,
          }}
        >
          {[
            { label: "Pakistan Prices", value: "Live" },
            { label: "Brent Crude", value: "Tracked" },
            { label: "City Status", value: "Modeled" },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                padding: "16px 20px",
                borderRadius: 18,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div style={{ fontSize: 16, color: "#9aa5c6", textTransform: "uppercase", letterSpacing: 2 }}>
                {item.label}
              </div>
              <div style={{ fontSize: 30, fontWeight: 700 }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
