
// lib/puter.ts

export interface PuterAI {
    chat: (prompt: string, options?: { model?: string }) => Promise<string>;
    txt2img: (prompt: string, testMode?: boolean) => Promise<HTMLImageElement>;
}

export interface PuterFS {
    write: (path: string, content: string | Blob) => Promise<any>;
    read: (path: string) => Promise<Blob>;
}

export interface Puter {
    ai: PuterAI;
    fs: PuterFS;
    print: (msg: string) => void;
}

export const getPuter = (): Puter | null => {
    if (typeof window !== 'undefined' && (window as any).puter) {
        return (window as any).puter as Puter;
    }
    return null;
};
