export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f0f13",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
        gap: "24px",
        padding: "40px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "8px",
        }}
      >
        <span style={{ fontSize: "48px" }}>🗺️</span>
        <h1
          style={{
            fontSize: "48px",
            fontWeight: 800,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: 0,
          }}
        >
          CivicSync AI
        </h1>
      </div>
      <p
        style={{
          fontSize: "20px",
          color: "rgba(255,255,255,0.6)",
          textAlign: "center",
          maxWidth: "480px",
          margin: 0,
        }}
      >
        Backend is live. Frontend coming soon.
      </p>
      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          justifyContent: "center",
          marginTop: "16px",
        }}
      >
        {[
          { label: "API: Triage", path: "/api/triage", method: "POST" },
          { label: "API: Reports", path: "/api/reports", method: "GET" },
          { label: "API: Map", path: "/api/reports/map", method: "GET" },
          { label: "API: Stats", path: "/api/stats", method: "GET" },
          { label: "API: Departments", path: "/api/departments", method: "GET" },
        ].map((ep) => (
          <a
            key={ep.path}
            href={ep.method === "GET" ? ep.path : undefined}
            style={{
              padding: "10px 18px",
              borderRadius: "12px",
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.4)",
              color: "#a5b4fc",
              textDecoration: "none",
              fontSize: "13px",
              fontFamily: "monospace",
              cursor: ep.method === "GET" ? "pointer" : "default",
            }}
          >
            <span
              style={{
                fontSize: "10px",
                background: ep.method === "POST" ? "#ef4444" : "#22c55e",
                color: "#fff",
                padding: "2px 6px",
                borderRadius: "4px",
                marginRight: "8px",
              }}
            >
              {ep.method}
            </span>
            {ep.path}
          </a>
        ))}
      </div>
      <div
        style={{
          marginTop: "24px",
          padding: "20px 32px",
          borderRadius: "16px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          textAlign: "center",
        }}
      >
        <p style={{ margin: 0, color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
          Admin dashboard →{" "}
          <a href="/admin/login" style={{ color: "#818cf8" }}>
            /admin/login
          </a>
        </p>
      </div>
    </main>
  );
}
