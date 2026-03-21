import { NextResponse } from 'next/server';

export const runtime = 'edge';

// 本来なら環境変数 (process.env.GAS_URL) に設定しますが、
// 今回は動作確認のため一時的にここに記載するか、デプロイ時に修正してください。
const GAS_DEPLOY_URL = 'https://script.google.com/macros/s/AKfycbxdNGkUlxXtgPEYallZz4ow3naWfWGNX2YUPesCa92ua5ZrrOIfit_BoXdkn2ssNkHq/exec';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const action = body.action;

        if (!action) {
            return NextResponse.json({ ok: false, message: "Action missing" }, { status: 400 });
        }

        // GETリクエストでプロキシする (GASのdoGetを叩く)
        // GAS側でエラーが起きないようURLSearchParamsを使用
        const searchParams = new URLSearchParams();
        searchParams.append('action', action);

        // 他のパラメータも付与
        Object.keys(body).forEach(key => {
            if (key !== 'action' && body[key] !== undefined && body[key] !== null) {
                searchParams.append(key, String(body[key]));
            }
        });

        const targetUrl = `${GAS_DEPLOY_URL}?${searchParams.toString()}`;

        const gasResponse = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!gasResponse.ok) {
            return NextResponse.json({ ok: false, message: `GAS HTTP Error: ${gasResponse.status}` });
        }

        const data = await gasResponse.json();
        return NextResponse.json(data);

    } catch (error: any) {
        return NextResponse.json({ ok: false, message: `Next.js API Error: ${error.message}` });
    }
}
