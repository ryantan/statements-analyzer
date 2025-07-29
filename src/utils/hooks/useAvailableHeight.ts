import { useMemo } from 'react';

import useMeasure from 'react-use-measure';

export const useAvailableHeight = ({
  defaultInitialHeight = 544,
  tableHeaderHeight = 56,
  additionalOffset = 124,
  minHeight = 300,
}: {
  defaultInitialHeight?: number;
  tableHeaderHeight?: number;
  additionalOffset?: number;
  minHeight?: number;
}) => {
  const [containerRef, containerBounds] = useMeasure();

  // Calculate available height for the table
  const availableHeight = useMemo(() => {
    if (containerBounds.height === 0) return defaultInitialHeight; // Default fallback

    const windowHeight = window.innerHeight;
    const containerTop = containerBounds.top;

    // Calculate the space available for the table
    const available =
      windowHeight - containerTop - tableHeaderHeight - additionalOffset;
    // Ensure there's a minimum height.
    return Math.max(available, minHeight);
  }, [containerBounds]);

  return { availableHeight, containerRef };
};
