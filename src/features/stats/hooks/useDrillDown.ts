import { useState } from 'react';

import { BarProps } from 'recharts';

import { PieData } from '../types';

export function useDrillDown() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const openModalForCategory = (categoryKey: string) => {
    setSelectedCategory(categoryKey);
    setIsModalVisible(true);
  };

  const handlePieClick = (data: PieData) => {
    openModalForCategory(data.key);
  };

  const handleBarClick: BarProps['onClick'] = (event) => {
    // Extract the category key from the bar chart data
    if (event && event.payload && event.payload.key) {
      openModalForCategory((event.payload as PieData).key);
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
    openModalForCategory,
    closeModal,
  };
}
