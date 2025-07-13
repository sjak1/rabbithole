"use client";
import { useEffect } from 'react';
import { useStore } from '@/store/store';
import { useUser } from '@clerk/nextjs';

export function StoreInitializer() {
    const { loadUser } = useStore();
    const { isSignedIn } = useUser();

    useEffect(() => {
        useStore.persist.rehydrate();
    }, []);

    useEffect(() => {
        if (isSignedIn) {
            loadUser();
        }
    }, [isSignedIn, loadUser]);

    return null;
} 