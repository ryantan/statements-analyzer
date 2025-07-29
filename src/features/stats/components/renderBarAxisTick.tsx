import { YAxisProps } from 'recharts';

/**
 * A custom rendering function for bar axis ticks in a chart.
 * Truncates the tick label text to a maximum of 16 characters and appends an ellipsis
 * ("...") if the label exceeds this length.
 *
 * @param {Object} props - The properties passed to the axis tick render function.
 * @param {number} props.x - The x-axis position of the tick.
 * @param {number} props.y - The y-axis position of the tick.
 * @param {Object} props.payload - The data payload for the tick.
 * @param {string|number|null} props.payload.value - The label text or value to be displayed.
 * @returns The React component representing the axis tick label.
 */
export const renderBarAxisTick: YAxisProps['tick'] = (props: {
  x: number;
  y: number;
  payload: { value: string | number | null };
}) => {
  const { x, y, payload } = props;
  let label: string = `${payload?.value}` || '';
  if (label.length > 16) {
    label = label.slice(0, 14) + '...';
  }
  return (
    <text x={x} y={y} fill="#666" textAnchor="end" dominantBaseline="central">
      {label}
    </text>
  );
};

/**
 * A custom render function for bar chart axis ticks that supports word wrapping
 * for longer labels. It breaks long labels into multiple lines, ensuring each
 * line does not exceed a specified character limit.
 *
 * @param {Object} props - The properties passed to the axis tick renderer.
 * @param {number} props.x - The x-coordinate of the tick.
 * @param {number} props.y - The y-coordinate of the tick.
 * @param {Object} props.payload - The data payload for the tick.
 * @param {string|number|null} props.payload.value - The label text or value to be displayed.
 * @returns A text element or a group of text elements representing
 *   the rendered tick label, with longer labels wrapped into multiple lines.
 */
const renderBarAxisTickWrapped: YAxisProps['tick'] = (props: {
  x: number;
  y: number;
  payload: { value: string | number | null };
}) => {
  const { x, y, payload } = props;
  const label: string = `${payload?.value}` || '';
  if (label.length <= 16) {
    return (
      <text x={x} y={y} fill="#666" textAnchor="end" dominantBaseline="central">
        {label}
      </text>
    );
  }

  const lines: string[] = [];
  const words = label.split(' ');
  let currentLine = '';

  words.forEach((word) => {
    if ((currentLine + ' ' + word).length <= 16) {
      currentLine = currentLine ? `${currentLine} ${word}` : word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });
  if (currentLine) lines.push(currentLine);

  return (
    <g>
      {lines.map((line, i) => (
        <text
          key={i}
          x={x}
          y={y - 7 + i * 12}
          fill="#666"
          textAnchor="end"
          dominantBaseline="central"
          style={{ fontSize: '12px' }}
        >
          {line}
        </text>
      ))}
    </g>
  );
};
