// Before: hard-coded values that ignore the theme and the color mode.
export function PlanCardBefore() {
  return (
    <div
      style={{
        padding: 18,
        marginBottom: 20,
        border: '1px solid #e5e7eb',
        borderRadius: 10,
        background: '#ffffff',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
      }}
    >
      <h3 style={{ margin: '0 0 6px', fontSize: 18, color: '#111827' }}>
        Pro plan
      </h3>
      <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>
        For teams that ship every week.
      </p>
      <a href="/upgrade" style={{ color: '#4f46e5', marginTop: 12 }}>
        Upgrade
      </a>
    </div>
  );
}
