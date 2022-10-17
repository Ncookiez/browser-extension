export const Storage = {
  async clear() {
    await chrome.storage.local.clear();
  },
  async set(key: string, value: unknown) {
    await chrome.storage.local.set({ [key]: value });
  },
  async get(key: string) {
    const result = await chrome.storage.local.get(key);
    return result[key];
  },
  async remove(key: string) {
    await chrome.storage.local.remove(key);
  },
};