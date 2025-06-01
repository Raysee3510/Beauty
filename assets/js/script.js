/**
 * Anua vs VT アゼライン酸美容液比較サイト
 * 日本一ウェブデザイナー監修
 * 静的表示版（コンテンツが消えない）
 */

// DOM読み込み完了後に実行
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏆 日本一ウェブデザイナー監修サイト読み込み完了！');
    
    // 基本的な機能のみ初期化
    initBasicNavigation();
    initBasicInteractions();
    initScrollToTop();
});

/**
 * 基本的なナビゲーション
 */
function initBasicNavigation() {
    const navTabs = document.querySelectorAll('.nav-tab');
    
    navTabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            // アクティブ状態更新
            navTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // スムーススクロール
            const targetSection = this.dataset.section;
            const targetElement = document.getElementById(targetSection);
            
            if (targetElement) {
                targetElement.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * 基本的なインタラクション
 */
function initBasicInteractions() {
    // 製品切り替えボタン（モバイル用）
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // ボタンのアクティブ状態のみ更新
            toggleBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // カードは非表示にしない（常に表示）
            console.log('製品切り替え:', this.dataset.product);
        });
    });
    
    // 推奨タブ（モバイル用）
    const recTabs = document.querySelectorAll('.rec-tab');
    
    recTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // タブのアクティブ状態のみ更新
            recTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            console.log('推奨タブ:', this.dataset.rec);
        });
    });
    
    // レビュードット（クリック可能にするが自動切り替えなし）
    const reviewDots = document.querySelectorAll('.review-dot');
    
    reviewDots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            const carousel = this.closest('.review-carousel');
            const items = carousel.querySelector('.review-items');
            const dots = carousel.querySelectorAll('.review-dot');
            
            // ドットのアクティブ状態更新
            dots.forEach(d => d.classList.remove('active'));
            this.classList.add('active');
            
            // レビューを切り替え
            if (items) {
                items.style.transform = `translateX(-${index * 100}%)`;
            }
        });
    });
}

/**
 * スクロールトップボタン
 */
function initScrollToTop() {
    const scrollToTopBtn = document.getElementById('scrollToTop');
    
    if (scrollToTopBtn) {
        // ボタンを最初から表示
        scrollToTopBtn.style.opacity = '1';
        scrollToTopBtn.style.pointerEvents = 'auto';
        scrollToTopBtn.style.transform = 'scale(1)';
        
        scrollToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // スクロール時の表示制御（シンプル版）
    window.addEventListener('scroll', function() {
        if (scrollToTopBtn) {
            if (window.scrollY > 300) {
                scrollToTopBtn.style.opacity = '1';
            } else {
                scrollToTopBtn.style.opacity = '0.5';
            }
        }
    });
}

// エラーハンドリング
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.message);
});

console.log('✅ 静的表示版 JavaScript 読み込み完了');
