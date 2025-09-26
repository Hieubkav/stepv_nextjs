'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useConvex, useMutation, useQuery } from 'convex/react';
import { api } from '@dohy/backend/convex/_generated/api';
import type { Id } from '@dohy/backend/convex/_generated/dataModel';

type StudentAccount = {
  _id: Id<'students'>;
  account: string;
  fullName: string;
  email?: string;
  phone?: string;
  notes?: string;
  tags?: string[];
  order: number;
  active: boolean;
  createdAt: number;
  updatedAt: number;
};

type StudentSession = {
  student: StudentAccount;
  issuedAt: number;
};

type AuthStatus = 'idle' | 'loading' | 'authenticated';

type StudentAuthContextValue = {
  student: StudentAccount | null;
  status: AuthStatus;
  error?: string;
  login: (input: { account: string; password: string }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  refresh: () => void;
};

const StudentAuthContext = createContext<StudentAuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'learner.student.session';

const safeParseSession = (raw: string | null): StudentSession | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StudentSession;
    if (parsed && parsed.student && typeof parsed.student._id === 'string') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};

const readStoredSession = (): StudentSession | null => {
  if (typeof window === 'undefined') return null;
  return safeParseSession(window.localStorage.getItem(STORAGE_KEY));
};

const writeStoredSession = (session: StudentSession | null) => {
  if (typeof window === 'undefined') return;
  if (!session) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
};

type InternalState = {
  student: StudentAccount | null;
  status: AuthStatus;
  error?: string;
  hydrated: boolean;
};

export function StudentAuthProvider({ children }: { children: React.ReactNode }) {
  const convex = useConvex();
  const authenticate = useMutation(api.students.authenticateStudent);
  const [state, setState] = useState<InternalState>({
    student: null,
    status: 'idle',
    hydrated: false,
  });

  useEffect(() => {
    const stored = readStoredSession();
    if (stored?.student) {
      setState({
        student: stored.student,
        status: stored.student.active ? 'authenticated' : 'idle',
        error: undefined,
        hydrated: true,
      });
    } else {
      setState((prev) => ({ ...prev, hydrated: true }));
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      const stored = safeParseSession(event.newValue);
      if (stored?.student) {
        setState({
          student: stored.student,
          status: stored.student.active ? 'authenticated' : 'idle',
          error: undefined,
          hydrated: true,
        });
      } else {
        setState((prev) => ({
          student: null,
          status: 'idle',
          error: undefined,
          hydrated: prev.hydrated,
        }));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const logout = useCallback(() => {
    writeStoredSession(null);
    setState((prev) => ({
      student: null,
      status: 'idle',
      error: undefined,
      hydrated: prev.hydrated,
    }));
  }, []);

  const handleProfileUpdate = useCallback((profile: StudentAccount) => {
    setState((prev) => {
      if (!prev.student || prev.student._id !== profile._id) {
        return prev;
      }
      return {
        ...prev,
        student: profile,
        status: 'authenticated',
        error: undefined,
      };
    });
    writeStoredSession({ student: profile, issuedAt: Date.now() });
  }, []);

  const login = useCallback(
    async ({ account, password }: { account: string; password: string }) => {
      const trimmedAccount = account.trim();
      const trimmedPassword = password.trim();
      if (!trimmedAccount || !trimmedPassword) {
        const error = 'Vui long nhap day du tai khoan va mat khau';
        setState((prev) => ({ ...prev, status: 'idle', error }));
        writeStoredSession(null);
        return { ok: false, error };
      }

      setState((prev) => ({ ...prev, status: 'loading', error: undefined }));

      try {
        const student = (await authenticate({
          account: trimmedAccount,
          password: trimmedPassword,
        })) as StudentAccount | null;

        if (!student) {
          const error = 'Thong tin dang nhap khong hop le';
          setState((prev) => ({ ...prev, status: 'idle', error, student: null }));
          writeStoredSession(null);
          return { ok: false, error };
        }

        const session: StudentSession = { student, issuedAt: Date.now() };
        writeStoredSession(session);
        setState({
          student,
          status: 'authenticated',
          error: undefined,
          hydrated: true,
        });
        return { ok: true };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Khong the dang nhap thoi diem nay';
        setState((prev) => ({ ...prev, status: 'idle', error: message, student: null }));
        writeStoredSession(null);
        return { ok: false, error: message };
      }
    },
    [authenticate],
  );

  const refresh = useCallback(async () => {
    const stored = readStoredSession();
    if (!stored?.student) {
      logout();
      return;
    }

    setState((prev) => ({
      student: stored.student,
      status: 'loading',
      error: undefined,
      hydrated: true,
    }));

    try {
      const profile = (await convex.query(api.students.getStudentProfile, {
        id: stored.student._id,
      })) as StudentAccount | null;
      if (!profile || !profile.active) {
        logout();
        return;
      }
      writeStoredSession({ student: profile, issuedAt: Date.now() });
      setState({
        student: profile,
        status: 'authenticated',
        error: undefined,
        hydrated: true,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Khong the dong bo tai khoan hoc vien';
      setState((prev) => ({
        ...prev,
        status: prev.student ? 'authenticated' : 'idle',
        error: message,
      }));
    }
  }, [convex, logout]);

  const value = useMemo<StudentAuthContextValue>(
    () => ({
      student: state.student,
      status: state.hydrated ? state.status : 'loading',
      error: state.error,
      login,
      logout,
      refresh,
    }),
    [state.student, state.status, state.error, state.hydrated, login, logout, refresh],
  );

  const studentId = state.hydrated && state.student ? state.student._id : null;

  return (
    <StudentAuthContext.Provider value={value}>
      <StudentProfileWatcher
        studentId={studentId}
        onResolved={handleProfileUpdate}
        onInactive={logout}
      />
      {children}
    </StudentAuthContext.Provider>
  );
}

type StudentProfileWatcherProps = {
  studentId: Id<'students'> | null;
  onResolved: (profile: StudentAccount) => void;
  onInactive: () => void;
};

function StudentProfileWatcher({ studentId, onResolved, onInactive }: StudentProfileWatcherProps) {
  const profile = useQuery(
    api.students.getStudentProfile,
    studentId ? ({ id: studentId } as { id: Id<'students'> }) : ('skip' as any),
  ) as StudentAccount | null | undefined;

  useEffect(() => {
    if (!studentId) return;
    if (profile === undefined) return;
    if (!profile || !profile.active) {
      onInactive();
      return;
    }
    onResolved(profile);
  }, [studentId, profile, onResolved, onInactive]);

  return null;
}

export function useStudentAuth(): StudentAuthContextValue {
  const context = useContext(StudentAuthContext);
  if (!context) {
    throw new Error('useStudentAuth phai duoc dung trong StudentAuthProvider');
  }
  return context;
}

