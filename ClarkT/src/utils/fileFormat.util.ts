export const formatFileSize = (bytes: number): string => {
    if (bytes >= 1024 ** 2) {
      return `${(bytes / (1024 ** 2)).toFixed(2)} MB`;
    } else if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    } else {
      return `${bytes} B`;
    }
  };
  