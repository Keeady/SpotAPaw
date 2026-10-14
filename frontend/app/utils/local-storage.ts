export const saveStorageItem = async (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.log(`Failed to save storage item: ${key} - ${error}`);
  }
};

export const getStorageItem = async (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.log(`Failed to get storage item: ${key} - ${error}`);
  }
};