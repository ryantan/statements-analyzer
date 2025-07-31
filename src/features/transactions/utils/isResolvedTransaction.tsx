/**
 * Tries to determine if a transaction item is a resolved transaction.
 *
 * Used to guard against saving resolved transactions into storage.
 *
 * @param transaction
 */
export const isResolvedTransaction = (transaction: Record<string, unknown>) => {
  if (transaction.resolvedCategoryKey) {
    return true;
  }
  if (transaction.resolvedDate) {
    return true;
  }
  if (transaction.isResolved) {
    return true;
  }

  return false;
};
