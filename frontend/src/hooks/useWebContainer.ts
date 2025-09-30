import { useEffect, useState, useRef } from "react";
import { WebContainer } from '@webcontainer/api';

let cachedInstance: WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;

async function bootOnce(): Promise<WebContainer> {
    if (cachedInstance) return cachedInstance;
    if (bootPromise) return bootPromise;
    bootPromise = WebContainer.boot().then((inst) => {
        cachedInstance = inst;
        bootPromise = null;
        return inst;
    });
    return bootPromise;
}

export function useWebContainer() {
    const [webcontainer, setWebcontainer] = useState<WebContainer>();
    const initializedRef = useRef(false);

    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;
        let mounted = true;
        bootOnce().then((inst) => {
            if (mounted) setWebcontainer(inst);
        });
        return () => {
            mounted = false;
        };
    }, [])

    return webcontainer;
}