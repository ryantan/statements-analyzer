import { Category } from '@/features/category/types';

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

  return {
    categories,
    setCategories,
    loadFromLocalStorage,
  };
};
