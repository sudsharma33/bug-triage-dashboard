import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, Auth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  addDoc,
  Firestore,
} from 'firebase/firestore';

export const TEST_EMAIL = process.env.TEST_USER_EMAIL ?? '';
export const TEST_PASSWORD = process.env.TEST_USER_PASSWORD ?? '';

const config = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

function ensureEnv(): void {
  const missing: string[] = [];
  for (const [k, v] of Object.entries({
    VITE_FIREBASE_API_KEY: config.apiKey,
    VITE_FIREBASE_PROJECT_ID: config.projectId,
    VITE_FIREBASE_AUTH_DOMAIN: config.authDomain,
    VITE_FIREBASE_APP_ID: config.appId,
    TEST_USER_EMAIL: TEST_EMAIL,
    TEST_USER_PASSWORD: TEST_PASSWORD,
  })) {
    if (!v) missing.push(k);
  }
  if (missing.length) {
    throw new Error(
      `Missing required env vars for tests: ${missing.join(', ')}.\n` +
      `Add them to .env.local (use the email/password you signed up with on the app).`
    );
  }
}

let cached: { app: FirebaseApp; auth: Auth; db: Firestore } | null = null;

async function getClient(): Promise<{ db: Firestore; auth: Auth }> {
  if (cached) return cached;
  ensureEnv();
  const app = initializeApp(config, `tests-${Date.now()}`);
  const auth = getAuth(app);
  const db = getFirestore(app);
  await signInWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
  cached = { app, auth, db };
  return cached;
}

/** Wipe every bug visible to the test user. */
export async function deleteAllBugs(): Promise<void> {
  const { db } = await getClient();
  const snap = await getDocs(collection(db, 'bugs'));
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
}

export interface FixtureBug {
  title: string;
  description?: string;
  severity?: 'Critical' | 'High' | 'Medium' | 'Low';
  priority?: 'P1' | 'P2' | 'P3' | 'P4';
  status?: 'Open' | 'In Progress' | 'Fixed' | 'Closed' | 'Reopened';
  module?: string;
  assignee?: string;
  reporter?: string;
}

/** Insert fixture bugs as the test user. */
export async function seedBugs(bugs: FixtureBug[]): Promise<void> {
  const { db, auth } = await getClient();
  const uid = auth.currentUser?.uid;
  // Insert sequentially so createdAt order is stable.
  for (const b of bugs) {
    await addDoc(collection(db, 'bugs'), {
      title: b.title,
      description: b.description ?? 'Seeded fixture',
      severity: b.severity ?? 'Medium',
      priority: b.priority ?? 'P2',
      status: b.status ?? 'Open',
      module: b.module ?? 'General',
      assignee: b.assignee ?? 'Unassigned',
      reporter: b.reporter ?? 'Test Suite',
      createdBy: uid ?? '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

export const STANDARD_FIXTURES: FixtureBug[] = [
  { title: 'Login button broken on Safari', severity: 'High',     priority: 'P1', status: 'Open',        module: 'Auth',     assignee: 'Priya' },
  { title: 'Cart total wrong with coupon',  severity: 'Critical', priority: 'P1', status: 'In Progress', module: 'Checkout', assignee: 'Rohan' },
  { title: 'Pagination off by one',         severity: 'Medium',   priority: 'P2', status: 'Open',        module: 'Search',   assignee: 'Unassigned' },
  { title: 'Typo: Sucessfully',             severity: 'Low',      priority: 'P3', status: 'Fixed',       module: 'Profile',  assignee: 'Rohan' },
  { title: 'Reset email not received',      severity: 'Critical', priority: 'P1', status: 'Closed',      module: 'Auth',     assignee: 'Priya' },
  { title: 'Charts hang on slow 3G',        severity: 'Medium',   priority: 'P2', status: 'Reopened',    module: 'Dashboard',assignee: 'Rohan' },
];
