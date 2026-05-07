import { db } from '../firebase.js';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

const COLLECTION = 'bugs';
const bugsRef = collection(db, COLLECTION);

function fromSnap(snap) {
  if (!snap || !snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    ...data,
    createdAt: data.createdAt?.toDate?.().toISOString() ?? data.createdAt ?? null,
    updatedAt: data.updatedAt?.toDate?.().toISOString() ?? data.updatedAt ?? null,
  };
}

export const bugRepository = {
  async getAll() {
    const q = query(bugsRef, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => fromSnap(d));
  },

  async getById(id) {
    const ref = doc(db, COLLECTION, id);
    const snap = await getDoc(ref);
    return fromSnap(snap);
  },

  async add(bug) {
    const payload = {
      ...bug,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    delete payload.id;
    const ref = await addDoc(bugsRef, payload);
    const snap = await getDoc(ref);
    return fromSnap(snap);
  },

  async update(id, updates) {
    const ref = doc(db, COLLECTION, id);
    const payload = { ...updates, updatedAt: serverTimestamp() };
    delete payload.id;
    await updateDoc(ref, payload);
    const snap = await getDoc(ref);
    return fromSnap(snap);
  },

  async delete(id) {
    await deleteDoc(doc(db, COLLECTION, id));
  },
};