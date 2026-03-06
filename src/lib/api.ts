export async function fetchGasApi(action: string, payload: Record<string, any> = {}) {
    try {
        const res = await fetch('/api/gas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action, ...payload }),
        });
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        return await res.json();
    } catch (err) {
        console.error('GAS API Fetch Error:', err);
        return { ok: false, message: '通信エラーが発生しました' };
    }
}

export function setSessionToken(token: string) {
    if (typeof window !== 'undefined') {
        localStorage.setItem('session_token', token);
    }
}

export function getSessionToken(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('session_token');
    }
    return null;
}

export function removeSessionToken() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('session_token');
    }
}
