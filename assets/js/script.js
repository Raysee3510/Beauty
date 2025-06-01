/**
 * Anua vs VT アゼライン酸美容液比較サイト
 * 日本一ウェブデザイナー監修
 * モバイルファースト JavaScript
 */
// DOM読み込み完了後に実行
document.addEventListener('DOMContentLoaded', function() {
    
    // ローディング画面の制御
    initLoadingScreen();
    
    // ナビゲーション機能
    initNavigation();
    
    // 製品切り替え機能
    initProductToggle();
    
    // アコーディオン機能
    initAccordion();
    
    // レビューカルーセル
    initReviewCarousel();
    
    // 推奨タブ切り替え
    initRecommendationTabs();
    
    // スクロール機能
    initScrollFeatures();
    
    // タッチジェスチャー
    initTouchGestures();
    
    // パフォーマンス最適化
    initPerformanceOptimizations();
    
    // PWA機能
    initPWA();
    
    // アナリティクス（オプション）
    initAnalytics();
});

/**
 * ローディング画面の制御
 */
function initLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    
    // 最小表示時間を設定（UX向上）
    const minLoadTime = 1500;
    const startTime = Date.now();
    
    window.addEventListener('load', function() {
        const loadTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadTime - loadTime);
        
        setTimeout(() => {
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 300);
            }
            
            // ページ表示アニメーション
            document.body.classList.add('loaded');
        }, remainingTime);
    });
}

/**
 * ナビゲーション機能
 */
function initNavigation() {
    const navTabs = document.querySelectorAll('.nav-tab');
    const sections = ['hero', 'comparison', 'recommendation', 'warning'];
    
    // ナビタブクリック処理
    navTabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetSection = this.dataset.section;
            const targetElement = document.getElementById(targetSection);
            
            if (targetElement) {
                // アクティブ状態更新
                updateActiveNavTab(this);
                
                // スムーススクロール
                smoothScrollTo(targetElement, 80); // ナビ高さ分オフセット
                
                // ハプティックフィードバック（対応デバイス）
                if (navigator.vibrate) {
                    navigator.vibrate(50);
                }
            }
        });
    });
    
    // スクロール時のナビ更新
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateNavigationOnScroll);
            ticking = true;
        }
    });
    
    function updateNavigationOnScroll() {
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    const activeTab = document.querySelector(`[data-section="${sectionId}"]`);
                    if (activeTab) {
                        updateActiveNavTab(activeTab);
                    }
                }
            }
        });
        
        ticking = false;
    }
    
    function updateActiveNavTab(activeTab) {
        navTabs.forEach(tab => tab.classList.remove('active'));
        activeTab.classList.add('active');
    }
}

/**
 * 製品切り替え機能（モバイル用）
 */
function initProductToggle() {
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    const anuaCard = document.getElementById('anua-card');
    const vtCard = document.getElementById('vt-card');
    
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const product = this.dataset.product;
            
            // ボタンのアクティブ状態更新
            toggleBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // カードの表示切り替え（アニメーション付き）
            if (product === 'anua') {
                showCard(anuaCard);
                hideCard(vtCard);
            } else {
                showCard(vtCard);
                hideCard(anuaCard);
            }
            
            // ハプティックフィードバック
            if (navigator.vibrate) {
                navigator.vibrate(30);
            }
        });
    });
    
    function showCard(card) {
        if (!card) return;
        
        card.style.transform = 'translateX(-100%)';
        card.classList.remove('hidden');
        
        requestAnimationFrame(() => {
            card.style.transition = 'transform 0.3s ease';
            card.style.transform = 'translateX(0)';
        });
    }
    
    function hideCard(card) {
        if (!card) return;
        
        card.style.transition = 'transform 0.3s ease';
        card.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            card.classList.add('hidden');
            card.style.transform = 'translateX(0)';
        }, 300);
    }
}

/**
 * アコーディオン機能
 */
function initAccordion() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const targetId = this.dataset.target;
            const target = document.getElementById(targetId);
            const toggle = this.querySelector('.accordion-toggle');
            
            if (target && toggle) {
                const isOpen = target.classList.contains('open');
                
                // アニメーション
                if (isOpen) {
                    // 閉じる
                    target.style.maxHeight = target.scrollHeight + 'px';
                    requestAnimationFrame(() => {
                        target.style.maxHeight = '0';
                        target.classList.remove('open');
                        toggle.style.transform = 'rotate(0deg)';
                    });
                } else {
                    // 開く
                    target.classList.add('open');
                    target.style.maxHeight = target.scrollHeight + 'px';
                    toggle.style.transform = 'rotate(180deg)';
                    
                    // アニメーション完了後にautoに設定
                    setTimeout(() => {
                        if (target.classList.contains('open')) {
                            target.style.maxHeight = 'none';
                        }
                    }, 300);
                }
                
                // ハプティックフィードバック
                if (navigator.vibrate) {
                    navigator.vibrate(25);
                }
            }
        });
    });
}

/**
 * レビューカルーセル機能
 */
function initReviewCarousel() {
    const carousels = ['anua-reviews', 'vt-reviews'];
    
    carousels.forEach(carouselId => {
        initSingleCarousel(carouselId);
    });
    
    function initSingleCarousel(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const items = container.querySelector('.review-items');
        const dots = container.querySelectorAll('.review-dot');
        let currentSlide = 0;
        let autoSlideInterval;
        
        // ドットクリック処理
        dots.forEach((dot, index) => {
            dot.addEventListener('click', function() {
                currentSlide = index;
                updateCarousel();
                resetAutoSlide();
                
                // ハプティックフィードバック
                if (navigator.vibrate) {
                    navigator.vibrate(30);
                }
            });
        });
        
        function updateCarousel() {
            if (items) {
                items.style.transform = `translateX(-${currentSlide * 100}%)`;
            }
            
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });
        }
        
        function nextSlide() {
            currentSlide = (currentSlide + 1) % dots.length;
            updateCarousel();
        }
        
        function startAutoSlide() {
            autoSlideInterval = setInterval(nextSlide, 4000);
        }
        
        function resetAutoSlide() {
            clearInterval(autoSlideInterval);
            startAutoSlide();
        }
        
        // 初期化
        if (dots.length > 0) {
            startAutoSlide();
        }
        
        // ページが非表示になったら自動スライドを停止
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                clearInterval(autoSlideInterval);
            } else if (dots.length > 0) {
                startAutoSlide();
            }
        });
    }
}

/**
 * 推奨タブ切り替え
 */
function initRecommendationTabs() {
    const recTabs = document.querySelectorAll('.rec-tab');
    const recContents = document.querySelectorAll('.rec-content');
    
    recTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const target = this.dataset.rec;
            
            // タブのアクティブ状態更新
            recTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // コンテンツの表示切り替え
            recContents.forEach(content => {
                content.classList.remove('active');
            });
            
            const targetContent = document.getElementById(target + '-rec');
            if (targetContent) {
                targetContent.classList.add('active');
            }
            
            // ハプティックフィードバック
            if (navigator.vibrate) {
                navigator.vibrate(30);
            }
        });
    });
}

/**
 * スクロール機能
 */
function initScrollFeatures() {
    const scrollToTopBtn = document.getElementById('scrollToTop');
    const mobileNav = document.getElementById('mobile-nav');
    
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    // スクロールトップボタン
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', function() {
            smoothScrollTo(document.body, 0);
            
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        });
    }
    
    // スクロール時の処理
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(handleScroll);
            ticking = true;
        }
    });
    
    function handleScroll() {
        const currentScrollY = window.scrollY;
        
        // スクロールトップボタンの表示/非表示
        if (scrollToTopBtn) {
            if (currentScrollY > 300) {
                scrollToTopBtn.style.opacity = '1';
                scrollToTopBtn.style.pointerEvents = 'auto';
                scrollToTopBtn.style.transform = 'scale(1)';
            } else {
                scrollToTopBtn.style.opacity = '0';
                scrollToTopBtn.style.pointerEvents = 'none';
                scrollToTopBtn.style.transform = 'scale(0.8)';
            }
        }
        
        // モバイルナビの表示/非表示（スクロール方向によって）
        if (mobileNav && window.innerWidth <= 768) {
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                // 下スクロール時は隠す
                mobileNav.style.transform = 'translateY(-100%)';
            } else {
                // 上スクロール時は表示
                mobileNav.style.transform = 'translateY(0)';
            }
        }
        
        lastScrollY = currentScrollY;
        ticking = false;
    }
}

/**
 * タッチジェスチャー
 */
function initTouchGestures() {
    const carousels = document.querySelectorAll('.review-carousel');
    
    carousels.forEach(carousel => {
        let startX = 0;
        let startY = 0;
        let isDragging = false;
        
        carousel.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isDragging = true;
        }, { passive: true });
        
        carousel.addEventListener('touchmove', function(e) {
            if (!isDragging) return;
            
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const diffX = startX - currentX;
            const diffY = startY - currentY;
            
            // 水平スワイプの場合はスクロールを防止
            if (Math.abs(diffX) > Math.abs(diffY)) {
                e.preventDefault();
            }
        }, { passive: false });
        
        carousel.addEventListener('touchend', function(e) {
            if (!isDragging || !startX || !startY) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            // 水平スワイプの判定
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                const dots = carousel.querySelectorAll('.review-dot');
                const activeDot = carousel.querySelector('.review-dot.active');
                
                if (activeDot && dots.length > 0) {
                    let currentIndex = Array.from(dots).indexOf(activeDot);
                    
                    if (diffX > 0 && currentIndex < dots.length - 1) {
                        // 左スワイプ（次へ）
                        dots[currentIndex + 1].click();
                    } else if (diffX < 0 && currentIndex > 0) {
                        // 右スワイプ（前へ）
                        dots[currentIndex - 1].click();
                    }
                }
                
                // ハプティックフィードバック
                if (navigator.vibrate) {
                    navigator.vibrate(30);
                }
            }
            
            // リセット
            startX = 0;
            startY = 0;
            isDragging = false;
        }, { passive: true });
    });
}

/**
 * パフォーマンス最適化
 */
function initPerformanceOptimizations() {
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // 一度アニメーションしたら監視を停止（パフォーマンス向上）
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // 監視対象要素
    const animateElements = document.querySelectorAll(
        '.product-card, .recommendation-section, .warning-section, .comparison-table-section'
    );
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // 画像遅延読み込み（将来の画像追加に備えて）
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
    
    // デバイス向き変更時の再計算
    window.addEventListener('orientationchange', function() {
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 500);
    });
    
    // メモリリーク防止
    window.addEventListener('beforeunload', function() {
        observer.disconnect();
        imageObserver.disconnect();
    });
}

/**
 * PWA機能
 */
function initPWA() {
    // Service Worker登録
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('./sw.js')
                .then(function(registration) {
                    console.log('🔧 SW registered: ', registration);
                    
                    // 更新があった場合の処理
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                showUpdateAvailable();
                            }
                        });
                    });
                })
                .catch(function(registrationError) {
                    console.log('❌ SW registration failed: ', registrationError);
                });
        });
    }
    
    // インストールプロンプト
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // インストールボタンを表示
        showInstallPrompt();
    });
    
    function showInstallPrompt() {
        // カスタムインストールプロンプトの実装
        const installBanner = document.createElement('div');
        installBanner.className = 'install-banner';
        installBanner.innerHTML = `
            <div class="install-content">
                <i class="fas fa-download"></i>
                <span>アプリとしてインストール</span>
                <button class="install-btn touchable">インストール</button>
                <button class="install-close touchable">×</button>
            </div>
        `;
        
        document.body.appendChild(installBanner);
        
        // インストールボタンクリック
        installBanner.querySelector('.install-btn').addEventListener('click', () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('✅ User accepted the install prompt');
                    }
                    deferredPrompt = null;
                    installBanner.remove();
                });
            }
        });
        
        // 閉じるボタン
        installBanner.querySelector('.install-close').addEventListener('click', () => {
            installBanner.remove();
        });
        
        // 5秒後に自動で非表示
        setTimeout(() => {
            if (installBanner.parentNode) {
                installBanner.remove();
            }
        }, 5000);
    }
    
    function showUpdateAvailable() {
        const updateBanner = document.createElement('div');
        updateBanner.className = 'install-banner';
        updateBanner.innerHTML = `
            <div class="install-content">
                <i class="fas fa-sync-alt"></i>
                <span>新しいバージョンが利用可能です</span>
                <button class="install-btn touchable">更新</button>
                <button class="install-close touchable">×</button>
            </div>
        `;
        
        document.body.appendChild(updateBanner);
        
        updateBanner.querySelector('.install-btn').addEventListener('click', () => {
            window.location.reload();
        });
        
        updateBanner.querySelector('.install-close').addEventListener('click', () => {
            updateBanner.remove();
        });
    }
}

/**
 * アナリティクス（オプション）
 */
function initAnalytics() {
    // Google Analytics（GA4）
    if (typeof gtag !== 'undefined') {
        // ページビュー
        gtag('config', 'GA_MEASUREMENT_ID', {
            page_title: document.title,
            page_location: window.location.href
        });
        
        // カスタムイベント
        document.querySelectorAll('.product-card').forEach((card, index) => {
            card.addEventListener('click', () => {
                gtag('event', 'product_view', {
                    event_category: 'engagement',
                    event_label: index === 0 ? 'Anua' : 'VT'
                });
            });
        });
        
        document.querySelectorAll('.rec-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                gtag('event', 'recommendation_view', {
                    event_category: 'engagement',
                    event_label: tab.dataset.rec
                });
            });
        });
        
        // スクロール深度の測定
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                if (maxScroll % 25 === 0) { // 25%, 50%, 75%, 100%
                    gtag('event', 'scroll', {
                        event_category: 'engagement',
                        event_label: `${maxScroll}%`
                    });
                }
            }
        });
    }
    
    // カスタムアナリティクス（簡易版）
    const analytics = {
        pageLoad: Date.now(),
        interactions: 0,
        
        track: function(event, data) {
            this.interactions++;
            console.log('📊 Analytics:', event, data);
            
            // ローカルストレージに保存（オプション）
            const analyticsData = JSON.parse(localStorage.getItem('beauty-analytics') || '[]');
            analyticsData.push({
                event,
                data,
                timestamp: Date.now(),
                url: window.location.href
            });
            
            // 最新100件のみ保持
            if (analyticsData.length > 100) {
                analyticsData.splice(0, analyticsData.length - 100);
            }
            
            localStorage.setItem('beauty-analytics', JSON.stringify(analyticsData));
        }
    };
    
    // イベント追跡
    document.addEventListener('click', (e) => {
        if (e.target.closest('.product-card')) {
            analytics.track('product_card_click', {
                product: e.target.closest('.product-card').id
            });
        }
        
        if (e.target.closest('.nav-tab')) {
            analytics.track('navigation_click', {
                section: e.target.closest('.nav-tab').dataset.section
            });
        }
    });
    
    // ページ離脱時の統計
    window.addEventListener('beforeunload', () => {
        const timeOnPage = Date.now() - analytics.pageLoad;
        analytics.track('page_exit', {
            timeOnPage,
            interactions: analytics.interactions
        });
    });
}

/**
 * ユーティリティ関数
 */
function smoothScrollTo(element, offset = 0) {
    const targetPosition = element.offsetTop - offset;
    
    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// エラーハンドリング
window.addEventListener('error', function(e) {
    console.error('🚨 JavaScript Error:', e.error);
    
    // エラー情報をローカルストレージに保存
    const errorLog = JSON.parse(localStorage.getItem('beauty-errors') || '[]');
    errorLog.push({
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        timestamp: Date.now(),
        userAgent: navigator.userAgent
    });
    
    // 最新10件のみ保持
    if (errorLog.length > 10) {
        errorLog.splice(0, errorLog.length - 10);
    }
    
    localStorage.setItem('beauty-errors', JSON.stringify(errorLog));
});

// 未処理のPromise拒否をキャッチ
window.addEventListener('unhandledrejection', function(e) {
    console.error('🚨 Unhandled Promise Rejection:', e.reason);
});

// デバッグ用（開発時のみ）
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.includes('github.io')) {
    console.log('🏆 日本一ウェブデザイナー監修サイト - JavaScript読み込み完了');
    
    // パフォーマンス測定
    window.addEventListener('load', () => {
        if ('performance' in window) {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            console.log(`📊 ページ読み込み時間: ${loadTime}ms`);
            
            // Core Web Vitals（簡易版）
            if ('PerformanceObserver' in window) {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.entryType === 'largest-contentful-paint') {
                            console.log(`🎯 LCP: ${entry.startTime}ms`);
                        }
                        if (entry.entryType === 'first-input') {
                            console.log(`⚡ FID: ${entry.processingStart - entry.startTime}ms`);
                        }
                    }
                });
                
                observer.observe({entryTypes: ['largest-contentful-paint', 'first-input']});
            }
        }
    });
    
    // デバッグ用のグローバル関数
    window.beautyDebug = {
        getAnalytics: () => JSON.parse(localStorage.getItem('beauty-analytics') || '[]'),
        getErrors: () => JSON.parse(localStorage.getItem('beauty-errors') || '[]'),
        clearData: () => {
            localStorage.removeItem('beauty-analytics');
            localStorage.removeItem('beauty-errors');
            console.log('🧹 デバッグデータをクリアしました');
        }
    };
}

// 初期化完了の通知
console.log('✅ 美容液比較サイト JavaScript 初期化完了 - モバイルファースト対応');
