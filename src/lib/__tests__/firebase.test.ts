import { describe, it, expect, vi } from 'vitest';

// Mock Firebase modules before importing firebase.ts
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn((config) => ({ name: '[DEFAULT]', options: config })),
  getApps: vi.fn(() => []),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn((app) => ({ app, name: 'auth' })),
}));

// Mock config module
vi.mock('../../config/env', () => ({
  config: {
    firebase: {
      apiKey: 'test-api-key',
      authDomain: 'test-auth-domain.firebaseapp.com',
      projectId: 'test-project-id',
      storageBucket: 'test-storage-bucket.appspot.com',
      messagingSenderId: '123456789',
      appId: '1:123456789:web:testappid',
      measurementId: 'G-TESTID',
    },
    isDevelopment: true,
    isProduction: false,
  },
}));

describe('firebase initialization', () => {
  it('exports firebaseApp instance', async () => {
    const { firebaseApp } = await import('../firebase');
    expect(firebaseApp).toBeDefined();
    expect(firebaseApp.name).toBe('[DEFAULT]');
  });

  it('exports auth instance', async () => {
    const { auth } = await import('../firebase');
    expect(auth).toBeDefined();
    expect(auth.name).toBe('auth');
  });
});
