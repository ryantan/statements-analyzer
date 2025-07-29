import { PieData } from '@/features/stats/types';

import { TooltipProps } from 'recharts';
import {
  NameType,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent';

/**
 * A custom tooltip renderer function for bar chart components.
 *
 * This function is used to display a tooltip with custom styling and content
 * when hovering over a bar chart. It renders information about the hovered data point,
 * such as a label, value, and transaction count, based on the incoming props.
 *
 * @param {Object} props - The properties passed to the tooltip render function.
 * @param {boolean} props.active - Indicates whether the tooltip should be visible.
 * @param {Array} props.payload - Contains the data information of the hovered chart element.
 * @param {string} props.label - The label of the data element being hovered over.
 * @returns {React.ReactNode} A styled tooltip element with details about the data, or an invisible tooltip if not active.
 */
export const renderBarTooltip: TooltipProps<ValueType, NameType>['content'] = (
  props
) => {
  const { active, payload, label } = props;
  const items = payload as { payload: PieData }[];
  const isVisible = active && items && items.length;
  if (!isVisible) {
    return (
      <div
        className="bar-chart-tooltip"
        style={{
          visibility: 'hidden',
          background: '#fff',
        }}
      ></div>
    );
  }

  const firstDataItem = items[0].payload;
  return (
    <div
      className="bar-chart-tooltip"
      style={{
        visibility: 'visible',
        background: '#fff',
        padding: 16,
      }}
    >
      <strong>{label}</strong>
      <p className="label">${firstDataItem.value}</p>
      <p className="intro">{firstDataItem.transactionsCount} Transactions</p>
    </div>
  );
};
