import { useState } from 'react';
import { PieData } from '../types';

export function useDrillDown() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handlePieClick = (data: PieData) => {
    setSelectedCategory(data.key);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedCategory(null);
  };

  return {
    selectedCategory,
    isModalVisible,
    handlePieClick,
    closeModal,
  };
} 