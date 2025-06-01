/**
 * Service Worker for Anua vs VT Beauty Comparison
 * 日本一ウェブデザイナー監修
 * PWA対応 & オフライン機能
 */

const CACHE_NAME = 'beauty-comparison-v2.0.0';
const STATIC_CACHE = 'static-v2.0.0';
const DYNAMIC_CACHE = 'dynamic-v2.0.0';
const OFFLINE_PAGE = './offline.html';

// キャッシュするリソース
const STATIC_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './assets/css/style.css',
    './assets/js/script.js',
    './assets/images/icon-192.png',
    './assets/images/icon-512.png',
    './assets/images/favicon.ico',
    // 外部リソース
    'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css'
];

// 動的にキャッシュするパターン
const CACHE_PATTERNS = [
    /^https:\/\/fonts\.googleapis\.com\//,
    /^https:\/\/fonts\.gstatic\.com\//,
    /^https:\/\/cdnjs\.cloudflare\.com\//
];

// キャッシュしないパターン
const NO_CACHE_PATTERNS = [
    /^https:\/\/www\.google-analytics\.com\//,
    /^https:\/\/analytics\.google\.com\//,
    /\/api\//,
    /\?.*$/  // クエリパラメータ付きURL
];

/**
 * Service Worker インストール
 */
self.addEventListener('install', event => {
    console.log('🔧 Service Worker installing...');
    
    event.waitUntil(
        Promise.all([
            // 静的アセットをキャッシュ
            caches.open(STATIC_CACHE).then(cache => {
                console.log('📦 Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            }),
            
            // 即座にアクティベート
            self.skipWaiting()
        ])
    );
});

/**
 * Service Worker アクティベート
 */
self.addEventListener('activate', event => {
    console.log('🚀 Service Worker activating...');
    
    event.waitUntil(
        Promise.all([
            // 古いキャッシュを削除
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('🗑️ Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            
            // 全てのクライアントを制御
            self.clients.claim()
        ])
    );
});

/**
 * フェッチイベント - メインのキャッシュ戦略
 */
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // キャッシュしないパターンのチェック
    if (shouldNotCache(request)) {
        return;
    }
    
    // ナビゲーションリクエスト（ページ）
    if (request.mode === 'navigate') {
        event.respondWith(handleNavigationRequest(request));
        return;
    }
    
    // 静的アセット
    if (isStaticAsset(request)) {
        event.respondWith(handleStaticAsset(request));
        return;
    }
    
    // 外部リソース
    if (isExternalResource(request)) {
        event.respondWith(handleExternalResource(request));
        return;
    }
    
    // その他のリクエスト
    event.respondWith(handleOtherRequests(request));
});

/**
 * ナビゲーションリクエストの処理
 * Network First with Cache Fallback
 */
async function handleNavigationRequest(request) {
    try {
        // ネットワークを最初に試行
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // 成功した場合はキャッシュに保存
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }
        
        throw new Error('Network response not ok');
    } catch (error) {
        console.log('🌐 Network failed, trying cache:', request.url);
        
        // キャッシュから取得を試行
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // オフラインページを返す
        const offlinePage = await caches.match('./');
        if (offlinePage) {
            return offlinePage;
        }
        
        // 最終的にエラーレスポンスを返す
        return new Response(
            createOfflineHTML(),
            {
                status: 200,
                statusText: 'OK',
                headers: { 'Content-Type': 'text/html' }
            }
        );
    }
}

/**
 * 静的アセットの処理
 * Cache First with Network Fallback
 */
async function handleStaticAsset(request) {
    try {
        // キャッシュを最初に確認
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // キャッシュにない場合はネットワークから取得
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('📦 Static asset failed:', request.url);
        
        // フォールバック画像やCSS（必要に応じて）
        if (request.destination === 'image') {
            return new Response(
                createFallbackSVG(),
                {
                    headers: { 'Content-Type': 'image/svg+xml' }
                }
            );
        }
        
        throw error;
    }
}

/**
 * 外部リソースの処理
 * Stale While Revalidate
 */
async function handleExternalResource(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    // バックグラウンドでネットワークから更新
    const networkPromise = fetch(request).then(response => {
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    }).catch(() => {
        // ネットワークエラーは無視
    });
    
    // キャッシュがあればすぐに返す
    if (cachedResponse) {
        return cachedResponse;
    }
    
    // キャッシュがない場合はネットワークを待つ
    return await networkPromise;
}

/**
 * その他のリクエストの処理
 * Network First
 */
async function handleOtherRequests(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        throw error;
    }
}

/**
 * ユーティリティ関数
 */
function shouldNotCache(request) {
    return NO_CACHE_PATTERNS.some(pattern => pattern.test(request.url));
}

function isStaticAsset(request) {
    return request.destination === 'script' ||
           request.destination === 'style' ||
           request.destination === 'image' ||
           request.destination === 'font' ||
           request.url.includes('/assets/');
}

function isExternalResource(request) {
    return CACHE_PATTERNS.some(pattern => pattern.test(request.url));
}

/**
 * オフライン用HTMLの生成
 */
function createOfflineHTML() {
    return `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>オフライン - 美容液比較ガイド</title>
        <style>
            :root {
                --primary-color: #4a90e2;
                --gray-800: #1e293b;
                --white: #ffffff;
                --light-bg: #f8fafc;
            }
            
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, var(--light-bg) 0%, #e3f2fd 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                color: var(--gray-800);
            }
            
            .offline-container {
                background: var(--white);
                padding: 40px 30px;
                border-radius: 20px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                text-align: center;
                max-width: 400px;
                width: 100%;
            }
            
            .offline-icon {
                font-size: 4rem;
                color: var(--primary-color);
                margin-bottom: 20px;
            }
            
            .offline-title {
                font-size: 1.5rem;
                font-weight: 700;
                margin-bottom: 15px;
                color: var(--gray-800);
            }
            
            .offline-message {
                font-size: 1rem;
                line-height: 1.6;
                margin-bottom: 25px;
                opacity: 0.8;
            }
            
            .retry-btn {
                background: var(--primary-color);
                color: var(--white);
                border: none;
                padding: 12px 24px;
                border-radius: 25px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .retry-btn:hover {
                background: #357abd;
                transform: translateY(-2px);
            }
            
            .features-list {
                margin-top: 30px;
                text-align: left;
            }
            
            .features-list h4 {
                margin-bottom: 15px;
                color: var(--gray-800);
            }
            
            .features-list ul {
                list-style: none;
                padding: 0;
            }
            
            .features-list li {
                padding: 5px 0;
                padding-left: 20px;
                position: relative;
                font-size: 0.9rem;
            }
            
            .features-list li::before {
                content: '✓';
                position: absolute;
                left: 0;
                color: var(--primary-color);
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="offline-container">
            <div class="offline-icon">📱</div>
            <h1 class="offline-title">オフラインモード</h1>
            <p class="offline-message">
                インターネット接続が利用できません。<br>
                このページはオフラインでも一部機能をご利用いただけます。
            </p>
            <button class="retry-btn" onclick="window.location.reload()">
                再接続を試す
            </button>
            
            <div class="features-list">
                <h4>オフラインで利用可能：</h4>
                <ul>
                    <li>製品比較情報の閲覧</li>
                    <li>成分詳細の確認</li>
                    <li>推奨結果の表示</li>
                    <li>使用方法の確認</li>
                </ul>
            </div>
        </div>
        
        <script>
            // オンライン復帰時の自動リロード
            window.addEventListener('online', function() {
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            });
            
            // PWA機能の確認
            if ('serviceWorker' in navigator) {
                console.log('Service Worker available in offline mode');
            }
        </script>
    </body>
    </html>
    `;
}

/**
 * フォールバック用SVG画像の生成
 */
function createFallbackSVG() {
    return `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#4a90e2;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#7b68ee;stop-opacity:1" />
            </linearGradient>
        </defs>
        <rect width="200" height="200" fill="url(#grad)" rx="20"/>
        <text x="100" y="100" font-family="Arial, sans-serif" font-size="16" 
              fill="white" text-anchor="middle" dy=".3em">
            画像を読み込み中...
        </text>
        <circle cx="100" cy="130" r="20" fill="none" stroke="white" stroke-width="2">
            <animate attributeName="stroke-dasharray" 
                     values="0 125;31.25 93.75;62.5 62.5;93.75 31.25;125 0" 
                     dur="2s" repeatCount="indefinite"/>
        </circle>
    </svg>
    `;
}

/**
 * メッセージイベント（アプリからの通信）
 */
self.addEventListener('message', event => {
    const { type, payload } = event.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'GET_VERSION':
            event.ports[0].postMessage({
                version: CACHE_NAME,
                timestamp: new Date().toISOString()
            });
            break;
            
        case 'CLEAR_CACHE':
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            }).then(() => {
                event.ports[0].postMessage({ success: true });
            });
            break;
            
        case 'PREFETCH_URLS':
            if (payload && payload.urls) {
                prefetchUrls(payload.urls);
            }
            break;
    }
});

/**
 * URLの事前キャッシュ
 */
async function prefetchUrls(urls) {
    const cache = await caches.open(DYNAMIC_CACHE);
    
    const prefetchPromises = urls.map(async (url) => {
        try {
            const response = await fetch(url);
            if (response.ok) {
                await cache.put(url, response);
                console.log('✅ Prefetched:', url);
            }
        } catch (error) {
            console.log('❌ Prefetch failed:', url);
        }
    });
    
    await Promise.allSettled(prefetchPromises);
}

/**
 * バックグラウンド同期（将来の機能拡張用）
 */
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    console.log('🔄 Background sync triggered');
    
    // 例：分析データの送信、キャッシュの更新など
    try {
        // バックグラウンドで実行したい処理
        await updateCriticalResources();
    } catch (error) {
        console.log('Background sync failed:', error);
    }
}

async function updateCriticalResources() {
    const criticalUrls = [
        './',
        './assets/css/style.css',
        './assets/js/script.js'
    ];
    
    await prefetchUrls(criticalUrls);
}

/**
 * プッシュ通知（将来の機能拡張用）
 */
self.addEventListener('push', event => {
    if (!event.data) return;
    
    const options = {
        body: event.data.text(),
        icon: './assets/images/icon-192.png',
        badge: './assets/images/badge-72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: '詳細を見る',
                icon: './assets/images/checkmark.png'
            },
            {
                action: 'close',
                title: '閉じる',
                icon: './assets/images/xmark.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('美容液比較ガイド', options)
    );
});

/**
 * 通知クリック処理
 */
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('./#comparison')
        );
    }
});

/**
 * エラーハンドリング
 */
self.addEventListener('error', event => {
    console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
    console.error('Service Worker unhandled rejection:', event.reason);
});

/**
 * Service Worker更新チェック
 */
self.addEventListener('updatefound', () => {
    console.log('🔄 Service Worker update found');
});

// デバッグ情報（開発時のみ）
console.log('🏆 Service Worker loaded - Beauty Comparison PWA v2.0.0');
console.log('📦 Cache strategy: Network First for navigation, Cache First for assets');
console.log('🌐 Offline support: Enabled');
console.log('📱 PWA features: Install prompt, Background sync, Push notifications');
