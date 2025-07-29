import { useState } from 'react';

import { BarProps } from 'recharts';

import { PieData } from '../types';

export function useDrillDown() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handlePieClick = (data: PieData) => {
    setSelectedCategory(data.key);
    setIsModalVisible(true);
  };

  const handleBarClick: BarProps['onClick'] = (event) => {
    // Extract the category key from the bar chart data
    if (event && event.payload && event.payload.key) {
      handlePieClick(event.payload as PieData);
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedCategory(null);
  };

  return {
    selectedCategory,
    isModalVisible,
    handlePieClick,
    handleBarClick,
    closeModal,
  };
}
