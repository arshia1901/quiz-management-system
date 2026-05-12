const PREFIX = "examify_";

export function getFromStorage(key, fallback) {
  try {
    const value = localStorage.getItem(PREFIX + key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error("Error reading localStorage:", error);
    return fallback;
  }
}

export function saveToStorage(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (error) {
    console.error("Error saving localStorage:", error);
  }
}

export function removeFromStorage(key) {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch (error) {
    console.error("Error removing localStorage:", error);
  }
}

export function clearExamifyStorage() {
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error("Error clearing localStorage:", error);
  }
}