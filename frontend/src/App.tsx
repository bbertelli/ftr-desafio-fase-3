import "./App.css"

function App() {
  const palette = [
    { label: "brand-dark", color: "var(--brand-dark)" },
    { label: "brand-base", color: "var(--brand-base)" },
    { label: "brand-light", color: "var(--brand-light)" },
    { label: "gray-900", color: "var(--gray-900)" },
    { label: "gray-500", color: "var(--gray-500)" },
    { label: "gray-200", color: "var(--gray-200)" },
    { label: "danger", color: "var(--danger)" },
    { label: "success", color: "var(--success)" },
    { label: "blue-base", color: "var(--blue-base)" },
    { label: "purple-base", color: "var(--purple-base)" },
    { label: "pink-base", color: "var(--pink-base)" },
    { label: "orange-base", color: "var(--orange-base)" },
    { label: "yellow-base", color: "var(--yellow-base)" },
    { label: "green-base", color: "var(--green-base)" },
  ]

  return (
    <main className="app">
      <h1 className="section-title">Financy UI Foundation</h1>

      <section className="card">
        <p className="subtitle">Global tokens loaded from Style Guide</p>
        <div className="swatches">
          {palette.map((item) => (
            <div className="swatch" key={item.label}>
              <div
                className="swatch-color"
                style={{ backgroundColor: item.color }}
              />
              <span className="swatch-label">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <p className="subtitle">Next step</p>
        <p>Build reusable UI components based on the Figma kit.</p>
      </section>
    </main>
  )
}

export default App
