// Custom tooltip for stacked bar chart
export const renderStackBarTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    fill: string;
    color: string;
  }>;
  label?: string | number;
}) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div
      style={{
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        padding: '10px',
        borderRadius: '4px',
      }}
    >
      <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>{label}</p>
      {payload.toReversed().map((entry, index: number) => (
        <p
          key={index}
          style={{
            margin: '4px 0',
            color: entry.fill,
            display: 'flex',
            justifyContent: 'space-between',
            gap: '20px',
          }}
        >
          <span>{entry.name}:</span>
          <span style={{ fontWeight: 'bold' }}>
            ${Math.abs(entry.value).toFixed(2)}
          </span>
        </p>
      ))}
    </div>
  );
};
