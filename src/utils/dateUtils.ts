/**
 * Formats a date string into a user-friendly format
 * @param dateString - ISO date string or Date object
 * @returns Formatted date string (e.g., "2 hours ago", "Yesterday", "Jan 15, 2024")
 */
export const formatRelativeDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return 'Never';

  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    // Less than 1 minute
    if (diffInSeconds < 60) {
      return 'Just now';
    }

    // Less than 1 hour
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }

    // Less than 24 hours
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }

    // Yesterday
    if (diffInDays === 1) {
      return 'Yesterday';
    }

    // Less than 7 days
    if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    }

    // Less than 30 days
    if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    }

    // Less than 365 days
    if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    }

    // More than 365 days - show full date
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Formats a date string into a standard format
 * @param dateString - ISO date string or Date object
 * @returns Formatted date string (e.g., "Jan 15, 2024 at 3:45 PM")
 */
export const formatFullDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return 'Never';

  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};