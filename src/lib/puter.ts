export interface PuterUser {
    id: string;
    username: string;
    email?: string;
}

export interface PuterAuth {
    signIn: () => Promise<any>;
    signOut: () => void;
    isSignedIn: () => boolean;
    getUser: () => Promise<PuterUser>;
}

export interface PuterFS {
    write: (path: string, content: string | Blob) => Promise<any>;
    read: (path: string) => Promise<Blob>;
    mkdir: (path: string) => Promise<any>;
    readdir: (path: string) => Promise<any[]>;
    delete: (path: string) => Promise<any>;
    stat: (path: string) => Promise<any>;
}

export interface PuterAI {
    chat: (prompt: string | any[], options?: { model?: string; stream?: boolean }) => Promise<any>;
    txt2img: (prompt: string, testMode?: boolean) => Promise<HTMLImageElement>;
}

export interface Puter {
    ai: PuterAI;
    fs: PuterFS;
    auth: PuterAuth;
    print: (msg: string) => void;
}

export const getPuter = (): Puter | null => {
    if (typeof window !== 'undefined' && (window as any).puter) {
        return (window as any).puter as Puter;
    }
    return null;
};
