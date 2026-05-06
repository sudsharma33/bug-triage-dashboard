import { sampleBugs } from './sampleBugs.js';

const STORAGE_KEY = 'triageboard_bugs';

export const bugRepository = {
  getAll() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    // First load: seed with sample bugs
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleBugs));
    return sampleBugs;
  },

  save(bugs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bugs));
  },

  add(bug) {
    const bugs = this.getAll();
    const newBug = {
      ...bug,
      id: `bug-${String(bugs.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [...bugs, newBug];
    this.save(updated);
    return newBug;
  },

  update(id, updates) {
    const bugs = this.getAll();
    const updated = bugs.map(b =>
      b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
    );
    this.save(updated);
    return updated.find(b => b.id === id);
  },

  delete(id) {
    const bugs = this.getAll().filter(b => b.id !== id);
    this.save(bugs);
  },

  reset() {
    localStorage.removeItem(STORAGE_KEY);
  }
};