import { Category } from '@/features/categories/types';

import { useEffect, useState } from 'react';

export const useCategories = () => {
  const [categories, _setCategories] = useState<Category[]>([]);

  const setCategories = (categories: Category[]) => {
    _setCategories(categories);
    localStorage.setItem('categories', JSON.stringify(categories));
  };

  const loadFromLocalStorage = () => {
    const categories = localStorage.getItem('categories');
    if (categories) {
      setCategories(JSON.parse(categories));
    }
  };

  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  const categoryMap = new Map(categories.map((c) => [c.key, c]));

  return {
    categories,
    categoryMap,
    setCategories,
    loadFromLocalStorage,
  };
};
