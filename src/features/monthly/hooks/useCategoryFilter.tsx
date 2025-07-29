import { Category } from '@/features/category/types';

import { useEffect, useState } from 'react';

import { Card, Checkbox, Divider } from 'antd';

/**
 * Provides functionality for filtering and managing the visibility of categories in a user interface.
 *
 * @function useCategoryFilter
 * @param {Category[]} categories - The array of category objects to be managed.
 * @param {Map<string, Category>} categoryMap - A map where category keys are associated with their respective category objects.
 * @param {string[]} originalSortedCategoryKeys - An array of category keys in their original sorted order.
 * @returns {Object} An object containing:
 *  - `visibleCategories` (Set<string>): A set of currently visible category keys.
 *  - `renderCategoriesFilter` (Function): A function that renders the category filter UI component.
 */
export const useCategoryFilter = (
  categories: Category[],
  categoryMap: Map<string, Category>,
  originalSortedCategoryKeys: string[]
) => {
  // Store which categories are visible.
  const [visibleCategories, setVisibleCategories] = useState<Set<string>>(
    new Set(categories.map((c) => c.key))
  );

  // Track if user has explicitly made selections
  const hasExplicitSelections = visibleCategories.size > 0;

  // Update visibleCategories when categories are loaded.
  useEffect(() => {
    setVisibleCategories(new Set(categories.map((c) => c.key)));
  }, [categories]);

  // Handle category toggle
  const handleCategoryToggle = (categoryKey: string, checked: boolean) => {
    const newVisibleCategories = new Set(visibleCategories);
    if (checked) {
      newVisibleCategories.add(categoryKey);
    } else {
      newVisibleCategories.delete(categoryKey);
    }
    setVisibleCategories(newVisibleCategories);
  };

  // Handle select all/none
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setVisibleCategories(new Set(categories.map((c) => c.key)));
    } else {
      setVisibleCategories(new Set());
    }
  };

  const renderCategoriesFilter = () => {
    return (
      <Card title="Category Visibility">
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            alignItems: 'center',
          }}
        >
          <Checkbox
            checked={
              !hasExplicitSelections ||
              visibleCategories.size === originalSortedCategoryKeys.length
            }
            indeterminate={
              hasExplicitSelections &&
              visibleCategories.size > 0 &&
              visibleCategories.size < originalSortedCategoryKeys.length
            }
            onChange={(e) => handleSelectAll(e.target.checked)}
          >
            Select All
          </Checkbox>
          <Divider type="vertical" />
          {originalSortedCategoryKeys.toReversed().map((categoryKey) => {
            const category = categoryMap.get(categoryKey);
            // If user hasn't made explicit selections, all categories are visible
            // If user has made selections, only selected categories are visible
            const isVisible =
              !hasExplicitSelections || visibleCategories.has(categoryKey);

            return (
              <Checkbox
                key={categoryKey}
                checked={isVisible}
                onChange={(e) =>
                  handleCategoryToggle(categoryKey, e.target.checked)
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      backgroundColor: category?.color || '#ccc',
                      borderRadius: '2px',
                    }}
                  />
                  {category?.name || 'Unknown'}
                </div>
              </Checkbox>
            );
          })}
        </div>
      </Card>
    );
  };

  return {
    visibleCategories,
    renderCategoriesFilter,
  };
};
