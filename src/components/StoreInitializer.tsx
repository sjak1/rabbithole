"use client";
import { useEffect } from 'react';
import { useStore } from '@/store/store';

export function StoreInitializer() {
    useEffect(() => {
        useStore.persist.rehydrate();
    }, []);

    return null;
} 