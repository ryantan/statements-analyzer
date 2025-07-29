import { BarProps } from 'recharts';

/**
 * Renders the label for a bar in a bar chart, on the right side of the bar.
 *
 * @param {object} props - Properties for customizing the label.
 * @param {number} props.x - The x-coordinate of the bar.
 * @param {number} props.y - The y-coordinate of the bar.
 * @param {number} props.width - The width of the bar.
 * @param {number} props.height - The height of the bar.
 * @param {number|string} props.value - The value represented by the bar.
 * @returns {JSX.Element} A text element rendering the label, positioned near the end of the bar.
 */
export const renderBarLabel: BarProps['label'] = (props: {
  x: number;
  y: number;
  width: number;
  height: number;
  value: number | string;
}) => {
  const { x, y, width, height, value } = props;

  const textStyles = {
    fill: '#FFF',
    stroke: '#333',
    strokeWidth: 3,
    dominantBaseline: 'central',
    paintOrder: 'stroke',
  };

  if (width > window.innerWidth / 2) {
    return (
      <text
        x={x + width - 10}
        y={y + height / 2}
        textAnchor="end"
        {...textStyles}
      >
        ${value}
      </text>
    );
  }

  const offsetX = width + 10; // Adjust offset based on width
  return (
    <text
      x={x + offsetX}
      y={y + height / 2}
      fill="#666"
      textAnchor="left"
      dominantBaseline="central"
    >
      ${value}
    </text>
  );
};
