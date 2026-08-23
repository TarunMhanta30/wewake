/**
 * A numbered section card. The mono eyebrow gives the tools a running
 * order, so the page reads as one instrument rather than a pile of
 * unrelated widgets.
 */
export default function Panel({ index, eyebrow, title, description, children }) {
  return (
    <section className="wk-card wk-rise">
      <p className="wk-eyebrow">
        {index} · {eyebrow}
      </p>
      <h2 className="wk-h mt-2">{title}</h2>
      {description && <p className="wk-desc mt-2">{description}</p>}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  )
}
