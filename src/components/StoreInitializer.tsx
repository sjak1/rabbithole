"use client";
import { useEffect } from 'react';
import { useStore } from '@/store/store';
import { useUser, useAuth } from '@clerk/nextjs';

export function StoreInitializer() {
    const { getToken } = useAuth();
    const { loadUser } = useStore();
    const { isSignedIn } = useUser();

    useEffect(() => {
        useStore.persist.rehydrate();
    }, []);

    useEffect(() => {
        const loadUserWithToken = async () => {
            if (!isSignedIn) return;
            const token = await getToken();
            if (!token) return;
            await loadUser(token);
        };
        loadUserWithToken();
    }, [isSignedIn, loadUser, getToken]);

    return null;
} 