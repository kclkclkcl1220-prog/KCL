// Smooth scroll hint for internal anchors if used later
try { document.documentElement.style.scrollBehavior = 'smooth'; } catch (e) {}

// Modal: 联系方式
const contactModal = document.getElementById('contactModal');
const modalClose = contactModal ? contactModal.querySelector('.close') : null;

function showContactInfo() {
    if (!contactModal) return;
    contactModal.classList.add('show');
}

function hideContactInfo() {
    if (!contactModal) return;
    contactModal.classList.remove('show');
}

if (modalClose) modalClose.addEventListener('click', hideContactInfo);
window.addEventListener('click', (e) => {
    if (e.target === contactModal) hideContactInfo();
});
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideContactInfo();
});

// 复制到剪贴板
function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            toast('已复制到剪贴板');
        }, () => alert('复制失败，请手动复制'));
    } else {
        const temp = document.createElement('textarea');
        temp.value = text; document.body.appendChild(temp);
        temp.select(); document.execCommand('copy'); document.body.removeChild(temp);
        toast('已复制到剪贴板');
    }
}
window.copyToClipboard = copyToClipboard;

// 简历下载
function downloadResume() {
    // 请把您的简历文件放到项目根目录并命名为 resume.pdf
    const url = 'resume.pdf';
    const a = document.createElement('a');
    a.href = url; a.download = '简历.pdf'; document.body.appendChild(a); a.click(); a.remove();
}
window.downloadResume = downloadResume;

// 移除模块切换逻辑（改为纵向展示）

// IntersectionObserver: 元素入场动画 + 进度条 + 图表懒渲染
const ioOptions = { threshold: 0.2 };
const inViewObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            // 进度条动画
            if (entry.target.classList.contains('progress-fill')) {
                const percent = Number(entry.target.getAttribute('data-percent') || '0');
                // 确保进度条从0开始
                entry.target.style.width = '0%';
                // 使用setTimeout确保CSS过渡效果能够正确应用
                setTimeout(() => {
                    entry.target.style.width = Math.min(Math.max(percent, 0), 100) + '%';
                }, 100);
            }
            // 渲染卡片中的图表
            if (entry.target.classList.contains('work-card')) {
                renderChartsInElement(entry.target);
            }
        }
    });
}, ioOptions);

window.addEventListener('DOMContentLoaded', () => {
    // 观测需要入场动画的元素
    document.querySelectorAll('.timeline-item, .portfolio-item').forEach(el => inViewObserver.observe(el));
    // 观测所有进度条
    document.querySelectorAll('.progress-fill').forEach(el => inViewObserver.observe(el));
    // 观测实习卡片
    document.querySelectorAll('.work-card').forEach(el => inViewObserver.observe(el));

    // 改为纵向展示：入场时渲染每个模块内的图表
    document.querySelectorAll('.internship-module').forEach(module => inViewObserver.observe(module));

    // 简单视差：跟随滚动轻微移动辉光
    const glow = document.querySelector('.profile-glow');
    if (glow) {
        window.addEventListener('scroll', () => {
            const y = window.scrollY * 0.03;
            glow.style.transform = `translateY(${y}px)`;
        });
    }

    // Hero 步入式动画：将姓名/标题拆分为字符/词并依次入场
    const nameEl = document.querySelector('.profile-text .name');
    const titleEl = document.querySelector('.profile-text .title');
    if (nameEl) {
        wrapTextStep(nameEl, 'char', 24, { txSequence: [0, 4, -4, 2, -2], ty: 12 });
    }
    if (titleEl) {
        wrapTextStep(titleEl, 'word', 50, { txSequence: [6, -6, 4, -4, 2, -2], ty: 10 });
    }

    // 绑定图片/缩略图点击放大
    const mediaModal = document.getElementById('mediaModal');
    const mediaImage = document.getElementById('mediaImage');
    const mediaClose = document.getElementById('mediaClose');
    function openMedia(src) {
        if (!mediaModal || !mediaImage) return;
        mediaImage.src = src;
        mediaModal.classList.add('show');
    }
    function closeMedia() { if (mediaModal) mediaModal.classList.remove('show'); }
    if (mediaClose) mediaClose.addEventListener('click', closeMedia);
    if (mediaModal) mediaModal.addEventListener('click', (e) => { if (e.target === mediaModal) closeMedia(); });

    // 为所有图片添加点击事件（除了书籍轮播中的图片）
    function setupImageClickEvents() {
        const images = document.querySelectorAll('.project-image, .portfolio-thumbnail.image-thumbnail img, .portfolio-item img:not(.book-carousel img)');
        
        images.forEach((img) => {
            // 移除可能存在的旧事件监听器
            if (img._clickHandler) {
                img.removeEventListener('click', img._clickHandler);
            }
            
            // 创建新的点击处理函数
            img._clickHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const largeSrc = img.getAttribute('data-large') || img.src;
                openMedia(largeSrc);
            };
            
            // 添加点击事件
            img.addEventListener('click', img._clickHandler);
        });
    }
    
    // 立即设置图片点击事件
    setupImageClickEvents();
    
    // 延迟再次设置，确保所有图片都已加载
    setTimeout(setupImageClickEvents, 1000);
    
    // 页面加载完成后再次设置
    window.addEventListener('load', setupImageClickEvents);
    
    // 设置链接视频弹窗的关闭事件
    const linkVideoModal = document.getElementById('linkVideoModal');
    const linkVideoClose = document.getElementById('linkVideoClose');
    const linkVideoFrame = document.getElementById('linkVideoFrame');
    
    if (linkVideoClose) {
        linkVideoClose.addEventListener('click', () => {
            if (linkVideoModal) {
                linkVideoModal.classList.remove('show');
            }
            if (linkVideoFrame) {
                linkVideoFrame.src = '';
            }
        });
    }
    
    if (linkVideoModal) {
        linkVideoModal.addEventListener('click', (e) => {
            if (e.target === linkVideoModal) {
                linkVideoModal.classList.remove('show');
                if (linkVideoFrame) {
                    linkVideoFrame.src = '';
                }
            }
        });
    }

    // 视频功能
    const videoModal = document.getElementById('videoModal');
    const modalVideo = document.getElementById('modalVideo');
    const videoClose = document.getElementById('videoClose');

    // 打开视频弹窗
    function openVideo(videoSrc) {
        if (!videoModal || !modalVideo) return;
        modalVideo.src = videoSrc;
        videoModal.classList.add('show');
        modalVideo.play();
    }

    // 关闭视频弹窗
    function closeVideo() {
        if (!videoModal || !modalVideo) return;
        modalVideo.pause();
        modalVideo.src = '';
        videoModal.classList.remove('show');
    }
    
    // 打开链接视频弹窗
    function openLinkVideo(videoUrl) {
        const linkVideoModal = document.getElementById('linkVideoModal');
        const linkVideoFrame = document.getElementById('linkVideoFrame');
        
        if (!linkVideoModal || !linkVideoFrame) return;
        
        // 尝试优化链接，只显示视频内容
        let optimizedUrl = videoUrl;
        
        // 如果是腾讯会议链接，尝试添加参数来优化显示
        if (videoUrl.includes('meeting.tencent.com')) {
            // 添加参数来尝试隐藏不必要的元素
            optimizedUrl = videoUrl + '?embed=true&minimal=true';
        }
        
        // 设置iframe的src
        linkVideoFrame.src = optimizedUrl;
        
        // 显示弹窗
        linkVideoModal.classList.add('show');
    }

    if (videoClose) videoClose.addEventListener('click', closeVideo);
    if (videoModal) videoModal.addEventListener('click', (e) => { if (e.target === videoModal) closeVideo(); });

    // 视频悬停预览和点击播放
    document.querySelectorAll('.video-thumbnail').forEach(thumbnail => {
        const video = thumbnail.querySelector('video');
        const playButton = thumbnail.querySelector('.play-button');
        const videoType = thumbnail.getAttribute('data-type');
        
        if (video && videoType !== 'link') {
            // 处理纯本地视频文件（非链接类型）
            // 设置视频为静音
            video.muted = true;
            
            // 悬停时开始播放预览
            thumbnail.addEventListener('mouseenter', () => {
                video.currentTime = 0;
                video.play().catch(e => console.log('视频播放失败:', e));
            });
            
            // 鼠标离开后继续播放，不暂停不重置
            // 移除了 mouseleave 事件监听器
            
            // 点击播放按钮打开弹窗
            if (playButton) {
                playButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const videoSrc = thumbnail.getAttribute('data-video');
                    if (videoSrc) {
                        openVideo(videoSrc);
                    }
                });
            }
            
            // 点击视频缩略图也可以打开弹窗
            thumbnail.addEventListener('click', () => {
                const videoSrc = thumbnail.getAttribute('data-video');
                if (videoSrc) {
                    openVideo(videoSrc);
                }
            });
        } else if (videoType === 'link') {
            // 处理链接类型的视频（包括有预览视频的链接类型）
            if (video) {
                // 如果有预览视频，设置自动播放
                video.muted = true;
                video.loop = true;
                video.autoplay = true;
                
                // 强制尝试播放预览视频
                const playPreview = () => {
                    console.log('尝试播放预览视频:', video.src);
                    // 确保视频已加载
                    if (video.readyState >= 2) { // HAVE_CURRENT_DATA
                        video.play().catch(e => {
                            console.log('预览视频自动播放失败，尝试静音播放:', e);
                            // 如果自动播放失败，确保静音并重试
                            video.muted = true;
                            video.play().catch(e2 => console.log('静音播放也失败:', e2));
                        });
                    } else {
                        // 等待视频加载完成
                        video.addEventListener('canplay', () => {
                            console.log('视频已加载完成，开始播放');
                            video.play().catch(e => console.log('延迟播放失败:', e));
                        }, { once: true });
                    }
                };
                
                // 页面加载完成后尝试播放
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', playPreview);
                } else {
                    // 延迟一点时间确保DOM完全渲染
                    setTimeout(playPreview, 100);
                }
                
                // 悬停时确保播放
                thumbnail.addEventListener('mouseenter', () => {
                    if (video.paused) {
                        console.log('悬停时重新播放视频');
                        video.play().catch(e => console.log('悬停播放失败:', e));
                    }
                });
                
                // 监听视频加载事件
                video.addEventListener('loadstart', () => console.log('视频开始加载'));
                video.addEventListener('loadedmetadata', () => console.log('视频元数据已加载'));
                video.addEventListener('canplay', () => console.log('视频可以播放'));
                video.addEventListener('playing', () => console.log('视频开始播放'));
                video.addEventListener('error', (e) => console.log('视频加载错误:', e));
            }
            
            // 点击播放按钮打开内嵌弹窗
            if (playButton) {
                playButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const videoUrl = thumbnail.getAttribute('data-video');
                    if (videoUrl) {
                        openLinkVideo(videoUrl);
                    }
                });
            }
            
            // 点击视频预览区域也可以打开内嵌弹窗
            thumbnail.addEventListener('click', () => {
                const videoUrl = thumbnail.getAttribute('data-video');
                if (videoUrl) {
                    openLinkVideo(videoUrl);
                }
            });
        }
    });

    // 轮播组件功能
    let currentCarouselSlide = 0;
    let carouselInterval;
    const carouselModal = document.getElementById('carouselModal');
    const carouselClose = document.getElementById('carouselClose');
    const carouselMainImage = document.getElementById('carouselMainImage');

    // 自动轮播
    function startCarousel() {
        carouselInterval = setInterval(() => {
            currentCarouselSlide = (currentCarouselSlide + 1) % 5;
            updateCarousel();
        }, 3000);
    }

    function stopCarousel() {
        if (carouselInterval) {
            clearInterval(carouselInterval);
        }
    }

    // 更新轮播显示
    function updateCarousel() {
        // 更新缩略图轮播
        document.querySelectorAll('.carousel-slide').forEach((slide, index) => {
            slide.classList.toggle('active', index === currentCarouselSlide);
        });
        document.querySelectorAll('.carousel-indicators .indicator').forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentCarouselSlide);
        });

        // 更新弹窗主图
        if (carouselMainImage) {
            const slides = document.querySelectorAll('.carousel-slide img');
            if (slides[currentCarouselSlide]) {
                carouselMainImage.src = slides[currentCarouselSlide].src;
            }
        }

        // 更新弹窗缩略图
        document.querySelectorAll('.thumbnail').forEach((thumb, index) => {
            thumb.classList.toggle('active', index === currentCarouselSlide);
        });
    }

    // 切换轮播图片
    window.changeCarouselSlide = function(direction) {
        currentCarouselSlide = (currentCarouselSlide + direction + 5) % 5;
        updateCarousel();
    };

    // 点击缩略图切换
    function setupCarouselThumbnails() {
        document.querySelectorAll('.carousel-indicators .indicator').forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                currentCarouselSlide = index;
                updateCarousel();
                stopCarousel();
                startCarousel();
            });
        });

        document.querySelectorAll('.thumbnail').forEach((thumb, index) => {
            thumb.addEventListener('click', () => {
                currentCarouselSlide = index;
                updateCarousel();
            });
        });
    }

    // 点击轮播图片打开弹窗
    function setupCarouselClick() {
        // 只针对实习经历中的轮播图片，排除书籍轮播
        document.querySelectorAll('.internship-module .carousel-image').forEach((img, index) => {
            img.addEventListener('click', () => {
                currentCarouselSlide = index;
                updateCarousel();
                if (carouselModal) {
                    carouselModal.classList.add('show');
                    stopCarousel();
                }
            });
        });
    }

    // 关闭轮播弹窗
    function closeCarousel() {
        if (carouselModal) {
            carouselModal.classList.remove('show');
            startCarousel();
        }
    }

    if (carouselClose) carouselClose.addEventListener('click', closeCarousel);
    if (carouselModal) carouselModal.addEventListener('click', (e) => { if (e.target === carouselModal) closeCarousel(); });

    // 初始化轮播
    setupCarouselThumbnails();
    setupCarouselClick();
    startCarousel();

    // 书籍轮播功能
    let currentBookSlide = 0;
    let bookInterval;
    const bookModal = document.getElementById('bookModal');
    const bookClose = document.getElementById('bookClose');
    const bookMainImage = document.getElementById('bookMainImage');

    // 自动轮播
    function startBookCarousel() {
        bookInterval = setInterval(() => {
            currentBookSlide = (currentBookSlide + 1) % 10;
            updateBookCarousel();
        }, 3000);
    }

    function stopBookCarousel() {
        if (bookInterval) {
            clearInterval(bookInterval);
        }
    }

    // 更新书籍轮播显示
    function updateBookCarousel() {
        // 更新缩略图轮播
        document.querySelectorAll('.book-carousel .carousel-slide').forEach((slide, index) => {
            slide.classList.toggle('active', index === currentBookSlide);
            slide.classList.toggle('prev', index === (currentBookSlide - 1 + 10) % 10);
        });
        document.querySelectorAll('.book-carousel .carousel-indicators .indicator').forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentBookSlide);
        });

        // 更新弹窗主图
        if (bookMainImage) {
            const slides = document.querySelectorAll('.book-carousel .carousel-slide img');
            if (slides[currentBookSlide]) {
                bookMainImage.src = slides[currentBookSlide].src;
            }
        }

        // 更新弹窗缩略图
        document.querySelectorAll('.book-thumbnails .thumbnail').forEach((thumb, index) => {
            thumb.classList.toggle('active', index === currentBookSlide);
        });
    }

    // 切换书籍轮播图片
    window.changeBookSlide = function(direction) {
        currentBookSlide = (currentBookSlide + direction + 10) % 10;
        updateBookCarousel();
        
        // 更新弹窗主图
        if (bookMainImage) {
            const slides = document.querySelectorAll('.book-carousel .carousel-slide img');
            if (slides[currentBookSlide]) {
                bookMainImage.src = slides[currentBookSlide].src;
            }
        }
    };

    // 点击缩略图切换
    function setupBookCarouselThumbnails() {
        document.querySelectorAll('.book-carousel .carousel-indicators .indicator').forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                currentBookSlide = index;
                updateBookCarousel();
                stopBookCarousel();
                startBookCarousel();
            });
        });

        document.querySelectorAll('.book-thumbnails .thumbnail').forEach((thumb, index) => {
            thumb.addEventListener('click', () => {
                currentBookSlide = index;
                updateBookCarousel();
                
                // 更新弹窗主图
                if (bookMainImage) {
                    const slides = document.querySelectorAll('.book-carousel .carousel-slide img');
                    if (slides[currentBookSlide]) {
                        bookMainImage.src = slides[currentBookSlide].src;
                    }
                }
            });
        });
    }

    // 点击书籍图片打开弹窗
    function setupBookCarouselClick() {
        document.querySelectorAll('.book-carousel .carousel-image').forEach((img, index) => {
            // 阻止事件冒泡，防止触发父级的事件
            img.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                currentBookSlide = index;
                updateBookCarousel();
                if (bookModal) {
                    bookModal.classList.add('show');
                    stopBookCarousel();
                }
            });
        });
    }

    // 关闭书籍弹窗
    function closeBook() {
        if (bookModal) {
            bookModal.classList.remove('show');
            startBookCarousel();
        }
    }

    if (bookClose) bookClose.addEventListener('click', closeBook);
    if (bookModal) bookModal.addEventListener('click', (e) => { if (e.target === bookModal) closeBook(); });

    // 初始化书籍轮播
    setupBookCarouselThumbnails();
    setupBookCarouselClick();
    startBookCarousel();
    
    // 初始化实践经历视频功能
    setupPracticeVideos();
    
    // 初始化兴趣爱好轮播功能
    setupInterestsCarousels();
    
    // 确保UST弹窗在页面加载时是隐藏的
    const ustModal = document.getElementById('ustModal');
    if (ustModal) {
        ustModal.style.display = 'none';
        console.log('确保UST弹窗在页面加载时隐藏');
    }

    // 纵向展示无需滑动切换

    // 顶部导航：移动端开关
    const nav = document.querySelector('.site-header .nav');
    window.toggleMenu = function toggleMenu(){
        if (!nav) return;
        nav.classList.toggle('open');
    };

    // 点击导航平滑跳转并高亮当前
    document.querySelectorAll('.site-header .nav-link').forEach(link => {
        link.addEventListener('click', () => { if (nav) nav.classList.remove('open'); });
    });

    // 滚动高亮当前分区
    const sections = Array.from(document.querySelectorAll('section[id]'));
    const linkMap = new Map();
    document.querySelectorAll('.site-header .nav-link').forEach(a => linkMap.set(a.getAttribute('href'), a));

    const activeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const id = '#' + entry.target.id;
            const link = linkMap.get(id);
            if (!link) return;
            if (entry.isIntersecting) {
                document.querySelectorAll('.site-header .nav-link.active').forEach(el => el.classList.remove('active'));
                link.classList.add('active');
            }
        });
    }, { threshold: 0.5 });

    sections.forEach(sec => activeObserver.observe(sec));
});

// 图表渲染
const renderedCanvas = new WeakSet();
function renderChartsInElement(root) {
    if (!root) return;
    const canvases = root.querySelectorAll('canvas.chart');
    canvases.forEach(cv => {
        if (renderedCanvas.has(cv)) return;
        const type = cv.getAttribute('data-type') || 'bar';
        const num = Number(cv.getAttribute('data-data') || '0');
        const ctx = cv.getContext('2d');
        if (!window.Chart || !ctx) return;

        const common = {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 900 },
            plugins: { legend: { display: false }, tooltip: { enabled: true } },
            scales: type === 'pie' ? {} : { x: { display: true }, y: { display: true } }
        };

        let chart;
        if (type === 'bar') {
            // 检查是否有自定义标签
            const customLabels = cv.getAttribute('data-labels');
            const customData = cv.getAttribute('data-data');
            
            let labels, data;
            if (customLabels && customData) {
                // 使用自定义标签和数据
                labels = customLabels.split(',');
                data = customData.split(',').map(n => Number(n));
            } else {
                // 使用默认标签和数据
                labels = ['基线', '结果'];
                data = [0, num];
            }
            
            // 检查是否为模块4的图表，应用优化配色
            const isModule4 = cv.closest('.internship-module[data-module="4"]');
            
            let barColors;
            if (isModule4) {
                // 模块4卡片2的优化配色：蓝色系渐变
                barColors = {
                    bg: ['rgba(79,172,254,0.8)', 'rgba(0,242,254,0.9)'],
                    border: ['#4facfe', '#00f2fe']
                };
            } else {
                // 默认配色
                barColors = {
                    bg: ['#e5e7eb', '#FF6B6B'],
                    border: ['#d1d5db', '#ef4444']
                };
            }
            
            chart = new Chart(ctx, {
                type: 'bar',
                data: { 
                    labels: labels, 
                    datasets: [{ 
                        data: data, 
                        backgroundColor: barColors.bg,
                        borderColor: barColors.border,
                        borderWidth: 1,
                        borderRadius: 4
                    }] 
                },
                options: {
                    ...common,
                    animation: { duration: 1200 },
                    plugins: { 
                        legend: { display: false }, 
                        tooltip: { enabled: true },
                        title: {
                            display: true,
                            text: '浏览量提升对比',
                            color: '#374151',
                            font: { size: 14, weight: 'bold' }
                        }
                    },
                    scales: {
                        x: { 
                            display: true,
                            grid: { display: false }
                        }, 
                        y: { 
                            display: true,
                            grid: { color: '#e5e7eb' },
                            beginAtZero: true
                        }
                    }
                }
            });
            
            // 如果设置了动画，添加动态增长效果
            const animateFlag = cv.getAttribute('data-animate');
            if (animateFlag === 'once') {
                // 从初始值开始动态增长到目标值
                const initialData = data.map(() => 0);
                chart.data.datasets[0].data = initialData;
                chart.update();
                
                setTimeout(() => {
                    chart.data.datasets[0].data = data;
                    chart.update('active');
                }, 500);
            }
        } else if (type === 'line') {
            chart = new Chart(ctx, {
                type: 'line',
                data: { labels: ['开始', '中间', '结果'], datasets: [{ data: [0, Math.round(num * 0.6), num], borderColor: '#45B7D1', backgroundColor: 'rgba(69,183,209,0.20)', fill: true, tension: 0.35 }] },
                options: common
            });
        } else if (type === 'pie') {
            chart = new Chart(ctx, {
                type: 'pie',
                data: { labels: ['达成', '未达'], datasets: [{ data: [num, Math.max(0, 100 - num)], backgroundColor: ['#4ECDC4', '#e5e7eb'] }] },
                options: common
            });
        } else if (type === 'combo') {
            // 组合图：柱（展示）+折线（点击）
            const labels = (cv.getAttribute('data-labels') || '优化前,优化后').split(',');
            const bars = (cv.getAttribute('data-bars') || '0,0').split(',').map(n => Number(n));
            const lines = (cv.getAttribute('data-lines') || '0,0').split(',').map(n => Number(n));
            chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [
                        // 点击量：动态从起始值发射到目标值（先渲染，显示在前面）
                        { type: 'line', label: '点击量', data: [lines[0], lines[0]], borderColor: '#45B7D1', backgroundColor: 'transparent', fill: false, tension: 0, yAxisID: 'y2', animation: false, pointRadius: 3, pointBackgroundColor: '#45B7D1', pointHoverRadius: 4, borderWidth: 3, borderCapStyle: 'round' },
                        // 展示量：静态柱状（不需要动态增长）
                        { type: 'bar', label: '展示量', data: bars, backgroundColor: 'rgba(255,107,107,0.7)', animation: false }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    plugins: { legend: { display: true }, tooltip: { enabled: true } },
                    scales: {
                        x: { title: { display: true, text: '阶段' } },
                        y: { position: 'left', title: { display: true, text: '展示量' }, grid: { drawOnChartArea: true }, min: 100000, max: 140000 },
                        y2: { position: 'right', title: { display: true, text: '点击量' }, grid: { drawOnChartArea: false }, min: 8000, max: 10000 }
                    }
                }
            });

            // 循环播放：点击量从起始值发射到目标值
            const animateFlag = cv.getAttribute('data-animate');
            if (animateFlag === 'once') {
                startComboLineOnce(chart, lines[0], lines[1]);
            } else if (animateFlag !== 'false') {
                startComboLineLoop(chart, lines[0], lines[1]);
            } else {
                // 静态：直接设置到最终值
                const dsIndex = chart.data.datasets.findIndex(d => d.type === 'line');
                if (dsIndex !== -1) {
                    chart.data.datasets[dsIndex].data = [lines[0], lines[1]];
                    chart.update();
                }
            }
        } else if (type === 'stackedBar') {
            // 堆叠柱状图：三个公司的数据
            const labels = (cv.getAttribute('data-labels') || '2023.06,2023.07,2023.08').split(',');
            const company1Data = (cv.getAttribute('data-company1') || '0,0,0').split(',').map(n => Number(n));
            const company2Data = (cv.getAttribute('data-company2') || '0,0,0').split(',').map(n => Number(n));
            const company3Data = (cv.getAttribute('data-company3') || '0,0,0').split(',').map(n => Number(n));
            
            // 判断是销售额还是上架数量（通过数据范围判断）
            const maxValue = Math.max(...company1Data, ...company2Data, ...company3Data);
            const isInventory = maxValue < 1000; // 如果最大值小于1000，认为是上架数量
            
            // 检查是否为模块3或模块4的图表，应用优化配色
            const isModule3 = cv.closest('.internship-module[data-module="3"]');
            const isModule4 = cv.closest('.internship-module[data-module="4"]');
            
            let chartColors;
            if (isModule3) {
                // 检查是卡片1还是卡片2，应用不同的配色方案
                const workCard = cv.closest('.work-card');
                const workCards = workCard.parentElement.querySelectorAll('.work-card');
                const cardIndex = Array.from(workCards).indexOf(workCard);
                
                if (cardIndex === 0) {
                    // 卡片1：销售额数据 - 使用清新蓝绿色系
                    chartColors = [
                        { bg: 'rgba(144,205,244,0.8)', border: '#90cdf4' },    // 淡蓝色
                        { bg: 'rgba(129,230,217,0.8)', border: '#81e6d9' },    // 淡青色
                        { bg: 'rgba(167,139,250,0.8)', border: '#a78bfa' }     // 淡紫色
                    ];
                } else if (cardIndex === 1) {
                    // 卡片2：上架数量数据 - 使用清新暖色系
                    chartColors = [
                        { bg: 'rgba(251,207,232,0.8)', border: '#fbcfe8' },    // 淡粉色
                        { bg: 'rgba(254,215,170,0.8)', border: '#fed7aa' },    // 淡橙色
                        { bg: 'rgba(254,226,226,0.8)', border: '#fee2e2' }     // 淡红色
                    ];
                } else {
                    // 其他卡片：使用默认配色
                    chartColors = [
                        { bg: 'rgba(102,126,234,0.8)', border: '#667eea' },
                        { bg: 'rgba(118,75,162,0.8)', border: '#764ba2' },
                        { bg: 'rgba(240,147,251,0.8)', border: '#f093fb' }
                    ];
                }
            } else if (isModule4) {
                // 模块4卡片2的优化配色：蓝色系
                chartColors = [
                    { bg: 'rgba(79,172,254,0.8)', border: '#4facfe' },   // 淡蓝色
                    { bg: 'rgba(0,242,254,0.8)', border: '#00f2fe' }     // 青色
                ];
            } else {
                // 默认配色
                chartColors = [
                    { bg: 'rgba(255,107,107,0.8)', border: '#FF6B6B' },
                    { bg: 'rgba(78,205,196,0.8)', border: '#4ECDC4' },
                    { bg: 'rgba(69,183,209,0.8)', border: '#45B7D1' }
                ];
            }
            
            chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [
                        {
                            label: '玉见享物公司',
                            data: company1Data,
                            backgroundColor: chartColors[0].bg,
                            borderColor: chartColors[0].border,
                            borderWidth: 1,
                            stack: 'Stack 0'
                        },
                        {
                            label: '颐拍公司',
                            data: company2Data,
                            backgroundColor: chartColors[1].bg,
                            borderColor: chartColors[1].border,
                            borderWidth: 1,
                            stack: 'Stack 0'
                        },
                        {
                            label: '华艺淘珍公司',
                            data: company3Data,
                            backgroundColor: chartColors[2].bg,
                            borderColor: chartColors[2].border,
                            borderWidth: 1,
                            stack: 'Stack 0'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { 
                            display: true,
                            position: 'top',
                            labels: {
                                usePointStyle: true,
                                padding: 15,
                                font: { size: 12 }
                            }
                        },
                        tooltip: {
                            enabled: true,
                            callbacks: {
                                label: function(context) {
                                    if (isInventory) {
                                        return context.dataset.label + ': ' + context.parsed.y + '件';
                                    } else {
                                        return context.dataset.label + ': ¥' + context.parsed.y.toLocaleString();
                                    }
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: { display: true, text: '时间', font: { size: 12 } },
                            grid: { display: false }
                        },
                        y: {
                            title: { display: true, text: isInventory ? '上架数量（件）' : '销售额（元）', font: { size: 12 } },
                            grid: { color: 'rgba(0,0,0,0.1)' },
                            ticks: {
                                callback: function(value) {
                                    if (isInventory) {
                                        return value + '件';
                                    } else {
                                        return '¥' + value.toLocaleString();
                                    }
                                }
                            }
                        }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    }
                }
            });

            // 动画效果：从0开始逐步增长
            const animateFlag = cv.getAttribute('data-animate');
            if (animateFlag === 'once') {
                startStackedBarAnimation(chart, [company1Data, company2Data, company3Data]);
            }
        }
        renderedCanvas.add(cv);
    });
}

// 小提示气泡
function toast(message) {
    const el = document.createElement('div');
    el.textContent = message;
    Object.assign(el.style, {
        position: 'fixed', left: '50%', bottom: '24px', transform: 'translateX(-50%)',
        background: '#111827', color: '#fff', padding: '10px 14px', borderRadius: '10px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.18)', zIndex: 1200, opacity: '0', transition: 'opacity 200ms ease'
    });
    document.body.appendChild(el);
    requestAnimationFrame(() => { el.style.opacity = '1'; });
    setTimeout(() => {
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 220);
    }, 1600);
}

// 组合图点击量循环动画：从起点向终点发射延伸
function startComboLineLoop(chart, from, to) {
    if (!chart) return;
    const dsIndex = chart.data.datasets.findIndex(d => d.type === 'line');
    if (dsIndex === -1) return;
    const ds = chart.data.datasets[dsIndex];

    let rafId;
    const duration = 1500; // ms
    const pause = 800; // 停留时间

    function animate(fromVal, toVal, onDone) {
        const start = performance.now();
        function frame(now) {
            const t = Math.min(1, (now - start) / duration);
            // easeOutCubic
            const e = 1 - Math.pow(1 - t, 3);
            // 从起点“长出”到终点：第一点固定为起点，第二点逐步靠近终点
            const current = fromVal + (toVal - fromVal) * e;
            ds.data = [fromVal, current];
            chart.update('none');
            if (t < 1) {
                rafId = requestAnimationFrame(frame);
            } else {
                setTimeout(onDone, pause);
            }
        }
        rafId = requestAnimationFrame(frame);
    }

    function loop() {
        animate(from, to, () => animate(to, from, loop));
    }
    loop();

    // 在页面卸载时取消动画
    window.addEventListener('beforeunload', () => cancelAnimationFrame(rafId));
}

// 一次性从起点生长到终点后停留
function startComboLineOnce(chart, from, to) {
    if (!chart) return;
    const dsIndex = chart.data.datasets.findIndex(d => d.type === 'line');
    if (dsIndex === -1) return;
    const ds = chart.data.datasets[dsIndex];
    const duration = 1200;
    const start = performance.now();
    function frame(now) {
        const t = Math.min(1, (now - start) / duration);
        const e = 1 - Math.pow(1 - t, 3);
        const current = from + (to - from) * e;
        ds.data = [from, current];
        chart.update('none');
        if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}

// 堆叠柱状图动画：从0开始逐步增长
function startStackedBarAnimation(chart, allData) {
    if (!chart) return;
    
    const duration = 2000; // 动画持续时间
    const start = performance.now();
    
    // 初始化所有数据为0
    chart.data.datasets.forEach((dataset, index) => {
        dataset.data = dataset.data.map(() => 0);
    });
    chart.update('none');
    
    function frame(now) {
        const t = Math.min(1, (now - start) / duration);
        const e = 1 - Math.pow(1 - t, 3); // easeOutCubic
        
        // 逐步增长每个数据点
        chart.data.datasets.forEach((dataset, datasetIndex) => {
            dataset.data = dataset.data.map((_, dataIndex) => {
                const targetValue = allData[datasetIndex][dataIndex];
                return targetValue * e;
            });
        });
        
        chart.update('none');
        
        if (t < 1) {
            requestAnimationFrame(frame);
        }
    }
    
    requestAnimationFrame(frame);
}

// 实践经历模块2卡片1视频功能
function setupPracticeVideos() {
    const videoItems = document.querySelectorAll('.internship-module[data-module="2"] .work-card:first-child .video-item');
    const videoModal = document.getElementById('videoModal');
    const modalVideo = document.getElementById('modalVideo');
    const videoClose = document.getElementById('videoClose');
    
    if (!videoItems.length || !videoModal || !modalVideo || !videoClose) return;
    
    // 为每个视频项添加点击事件
    videoItems.forEach(item => {
        const video = item.querySelector('video');
        const videoSrc = item.getAttribute('data-video');
        
        if (!video || !videoSrc) return;
        
        // 点击事件：打开弹窗播放视频
        item.addEventListener('click', () => {
            modalVideo.src = videoSrc;
            videoModal.classList.add('show');
            modalVideo.play();
        });
        
        // 悬停事件：视频放大预览
        item.addEventListener('mouseenter', () => {
            if (video.paused) {
                video.play();
            }
        });
        
        item.addEventListener('mouseleave', () => {
            // 保持视频播放，不暂停
        });
    });
    
    // 关闭弹窗事件
    videoClose.addEventListener('click', () => {
        videoModal.classList.remove('show');
        modalVideo.pause();
        modalVideo.src = '';
    });
    
    // 点击弹窗外部关闭
    videoModal.addEventListener('click', (e) => {
        if (e.target === videoModal) {
            videoModal.classList.remove('show');
            modalVideo.pause();
            modalVideo.src = '';
        }
    });
}

// 兴趣爱好轮播功能
function setupInterestsCarousels() {
    const carousels = document.querySelectorAll('.photo-carousel');
    const interestsModal = document.getElementById('interestsModal');
    const interestsMainImage = document.getElementById('interestsMainImage');
    const interestsClose = document.getElementById('interestsClose');
    const interestsThumbnails = document.querySelector('.interests-thumbnails');
    
    if (!carousels.length || !interestsModal || !interestsMainImage || !interestsClose) return;
    
    let currentCarousel = null;
    let currentSlideIndex = 0;
    let carouselIntervals = {};
    
    // 为每个轮播添加自动播放
    carousels.forEach((carousel, carouselIndex) => {
        const slides = carousel.querySelectorAll('.carousel-slide');
        const indicators = carousel.querySelectorAll('.indicator');
        let currentIndex = 0;
        
        // 自动轮播
        const interval = setInterval(() => {
            slides[currentIndex].classList.remove('active');
            indicators[currentIndex].classList.remove('active');
            currentIndex = (currentIndex + 1) % slides.length;
            slides[currentIndex].classList.add('active');
            indicators[currentIndex].classList.add('active');
        }, 3000);
        
        carouselIntervals[carouselIndex] = interval;
        
        // 点击轮播打开弹窗
        carousel.addEventListener('click', () => {
            currentCarousel = carousel;
            currentSlideIndex = currentIndex;
            openInterestsModal(carousel, currentIndex);
        });
        
        // 点击指示器切换图片
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', (e) => {
                e.stopPropagation();
                slides[currentIndex].classList.remove('active');
                indicators[currentIndex].classList.remove('active');
                currentIndex = index;
                slides[currentIndex].classList.add('active');
                indicators[currentIndex].classList.add('active');
            });
        });
    });
    
    // 打开兴趣爱好弹窗
    function openInterestsModal(carousel, slideIndex) {
        const slides = carousel.querySelectorAll('.carousel-slide img');
        const category = carousel.getAttribute('data-category');
        
        // 设置主图片
        interestsMainImage.src = slides[slideIndex].src;
        currentSlideIndex = slideIndex;
        
        // 生成缩略图
        interestsThumbnails.innerHTML = '';
        slides.forEach((slide, index) => {
            const thumbnail = document.createElement('img');
            thumbnail.src = slide.src;
            thumbnail.alt = `缩略图${index + 1}`;
            thumbnail.className = index === slideIndex ? 'thumbnail active' : 'thumbnail';
            thumbnail.dataset.index = index;
            
            thumbnail.addEventListener('click', () => {
                interestsMainImage.src = slide.src;
                currentSlideIndex = index;
                
                // 更新缩略图状态
                interestsThumbnails.querySelectorAll('.thumbnail').forEach(thumb => thumb.classList.remove('active'));
                thumbnail.classList.add('active');
            });
            
            interestsThumbnails.appendChild(thumbnail);
        });
        
        interestsModal.classList.add('show');
    }
    
    // 切换兴趣爱好图片
    window.changeInterestsSlide = function(direction) {
        if (!currentCarousel) return;
        
        const slides = currentCarousel.querySelectorAll('.carousel-slide img');
        const totalSlides = slides.length;
        
        currentSlideIndex = (currentSlideIndex + direction + totalSlides) % totalSlides;
        interestsMainImage.src = slides[currentSlideIndex].src;
        
        // 更新缩略图状态
        interestsThumbnails.querySelectorAll('.thumbnail').forEach((thumb, index) => {
            thumb.classList.toggle('active', index === currentSlideIndex);
        });
    };
    
    // 关闭弹窗
    interestsClose.addEventListener('click', () => {
        interestsModal.classList.remove('show');
    });
    
    // 点击弹窗外部关闭
    interestsModal.addEventListener('click', (e) => {
        if (e.target === interestsModal) {
            interestsModal.classList.remove('show');
        }
    });
    
    // 页面卸载时清理定时器
    window.addEventListener('beforeunload', () => {
        Object.values(carouselIntervals).forEach(interval => clearInterval(interval));
    });
    
    // 设置UST概念图弹窗事件
    const ustModal = document.getElementById('ustModal');
    const ustClose = document.getElementById('ustClose');
    const ustPrevBtn = document.getElementById('ustPrevBtn');
    const ustNextBtn = document.getElementById('ustNextBtn');
    
    if (ustClose) {
        ustClose.addEventListener('click', closeUSTModal);
    }
    
    if (ustModal) {
        ustModal.addEventListener('click', (e) => {
            if (e.target === ustModal) {
                closeUSTModal();
            }
        });
    }
    
    if (ustPrevBtn) {
        ustPrevBtn.addEventListener('click', () => changeUSTSlide(-1));
    }
    
    if (ustNextBtn) {
        ustNextBtn.addEventListener('click', () => changeUSTSlide(1));
    }
    
    // 设置缩略图点击事件
    document.querySelectorAll('.ust-thumbnail').forEach((thumbnail, index) => {
        thumbnail.addEventListener('click', () => selectUSTThumbnail(index));
    });
}

// 工具：将文本拆分并添加步入式动画 span
function wrapTextStep(element, mode = 'char', baseDelay = 20, opts = {}) {
    const original = element.textContent.trim();
    if (!original) return;
    const txSeq = (opts.txSequence || [0]);
    const ty = opts.ty || 8;
    element.textContent = '';
    element.classList.add('hero-step');
    if (mode === 'word') {
        const words = original.split(/(\s+)/);
        let i = 0;
        words.forEach(w => {
            const span = document.createElement('span');
            const isSpace = /^\s+$/.test(w);
            span.textContent = w;
            if (!isSpace) {
                span.className = 'word';
                span.style.setProperty('--d', `${i * baseDelay}ms`);
                span.style.setProperty('--tx', `${txSeq[i % txSeq.length]}px`);
                span.style.setProperty('--ty', `${ty}px`);
                i += 1;
            }
            element.appendChild(span);
        });
    } else {
        const chars = Array.from(original);
        chars.forEach((c, i) => {
            const span = document.createElement('span');
            span.textContent = c;
            span.className = 'char';
            span.style.setProperty('--d', `${i * baseDelay}ms`);
            span.style.setProperty('--tx', `${txSeq[i % txSeq.length]}px`);
            span.style.setProperty('--ty', `${ty}px`);
            element.appendChild(span);
        });
    }
}

// UST概念图弹窗功能
let currentUSTIndex = 0;
let currentScale = 0.8; // 初始缩放改为0.8，让图片显示更合适
let currentTranslateX = 0;
let currentTranslateY = 0;
let isDragging = false;
let startX = 0;
let startY = 0;
let lastTranslateX = 0;
let lastTranslateY = 0;

const ustImages = [
    'assets/ust-1.jpg',
    'assets/ust-2.jpg',
    'assets/ust-3.jpg',
    'assets/ust-4.jpg',
    'assets/ust-5.jpg'
];

function openUSTModal() {
    console.log('UST弹窗被打开');
    const modal = document.getElementById('ustModal');
    if (modal) {
        modal.style.display = 'flex';
        console.log('UST弹窗显示状态设置为flex');
    } else {
        console.error('找不到UST弹窗元素');
    }
    currentUSTIndex = 0;
    // 不在这里调用resetUSTImage，让updateUSTDisplay来处理缩放
    updateUSTDisplay();
    setupUSTDragAndDrop();
}

function closeUSTModal() {
    document.getElementById('ustModal').style.display = 'none';
}

function changeUSTSlide(direction) {
    currentUSTIndex += direction;
    if (currentUSTIndex < 0) currentUSTIndex = ustImages.length - 1;
    if (currentUSTIndex >= ustImages.length) currentUSTIndex = 0;
    updateUSTDisplay();
}

function updateUSTDisplay() {
    // 更新主图
    const mainImage = document.getElementById('ustMainImage');
    mainImage.src = ustImages[currentUSTIndex];
    
    // 根据图片尺寸计算合适的初始缩放和位置
    calculateOptimalScale(ustImages[currentUSTIndex]).then(result => {
        currentScale = result.scale;
        currentTranslateX = result.translateX;
        currentTranslateY = result.translateY;
        updateUSTTransform();
        updateZoomButtons();
        console.log(`图片${currentUSTIndex + 1}设置缩放: ${result.scale}, 位置: (${result.translateX}, ${result.translateY})`);
    });
    
    // 更新缩略图状态
    const thumbnails = document.querySelectorAll('.ust-thumbnail');
    thumbnails.forEach((thumb, index) => {
        if (index === currentUSTIndex) {
            thumb.classList.add('active');
        } else {
            thumb.classList.remove('active');
        }
    });
}

function selectUSTThumbnail(index) {
    currentUSTIndex = index;
    updateUSTDisplay();
}

// 缩放功能
function zoomUSTImage(direction) {
    if (direction === 'in') {
        currentScale = Math.min(currentScale * 1.2, 5);
    } else if (direction === 'out') {
        currentScale = Math.max(currentScale / 1.2, 0.3); // 最小缩放改为0.3，方便查看长图
    }
    updateUSTTransform();
    updateZoomButtons();
}

// 重置缩放和位置
function resetUSTImage() {
    // 检测是否为移动端，设置合适的重置缩放
    const isMobile = window.innerWidth <= 768;
    currentScale = isMobile ? 0.9 : 0.8; // 移动端使用0.9，PC端使用0.8
    currentTranslateX = 0;
    currentTranslateY = 0;
    updateUSTTransform();
    updateZoomButtons();
}

// 更新图片变换
function updateUSTTransform() {
    const mainImage = document.getElementById('ustMainImage');
    if (mainImage) {
        // 检测是否为移动端
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // 移动端：先居中定位，再应用缩放和拖拽变换
            const transform = `translate(-50%, -50%) translate(${currentTranslateX}px, ${currentTranslateY}px) scale(${currentScale})`;
            mainImage.style.transform = transform;
            console.log('移动端应用变换:', transform);
        } else {
            // PC端：直接应用缩放和拖拽变换
            const transform = `translate(${currentTranslateX}px, ${currentTranslateY}px) scale(${currentScale})`;
            mainImage.style.transform = transform;
            console.log('PC端应用变换:', transform);
        }
    }
}

// 根据图片尺寸计算合适的初始缩放和位置
function calculateOptimalScale(imageSrc) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = function() {
            // 检测是否为移动端
            const isMobile = window.innerWidth <= 768;
            
            // 根据设备类型设置容器尺寸
            let containerWidth, containerHeight;
            if (isMobile) {
                if (window.innerWidth <= 480) {
                    containerWidth = window.innerWidth * 0.85; // 小屏设备
                    containerHeight = 250;
                } else {
                    containerWidth = window.innerWidth * 0.85; // 平板设备
                    containerHeight = 300;
                }
            } else {
                containerWidth = 800; // PC端
                containerHeight = 400;
            }
            
            const imgWidth = this.width;
            const imgHeight = this.height;
            
            // 计算宽度和高度的缩放比例
            const scaleX = containerWidth / imgWidth;
            const scaleY = containerHeight / imgHeight;
            
            // 选择较小的缩放比例，确保图片完全显示在容器内
            let optimalScale = Math.min(scaleX, scaleY);
            
            // 如果图片比容器小，则使用0.9的缩放（移动端）或0.8的缩放（PC端）
            if (optimalScale > 1) {
                optimalScale = isMobile ? 0.9 : 0.8;
            }
            
            // 对于特别大的图片，进一步缩小缩放
            if (imgWidth > 1200 || imgHeight > 800) {
                optimalScale = Math.min(optimalScale, isMobile ? 0.7 : 0.6);
            }
            
            // 限制最小缩放为0.3
            optimalScale = Math.max(optimalScale, 0.3);
            
            // 计算初始位置，让长图从顶部开始显示
            let initialTranslateX = 0;
            let initialTranslateY = 0;
            
            // 移动端和PC端的初始位置计算策略不同
            if (isMobile) {
                // 移动端：图片已经通过CSS居中，只需要微调位置
                if (imgHeight > imgWidth && imgHeight * optimalScale > containerHeight) {
                    // 长图：从顶部开始显示，但保持在容器中心
                    initialTranslateY = -(imgHeight * optimalScale - containerHeight) / 2;
                }
            } else {
                // PC端：原有的位置计算逻辑
                if (imgHeight > imgWidth && imgHeight * optimalScale > containerHeight) {
                    initialTranslateY = (containerHeight - imgHeight * optimalScale) / 2;
                }
            }
            
            console.log(`设备: ${isMobile ? '移动端' : 'PC端'}, 容器尺寸: ${containerWidth}x${containerHeight}, 图片尺寸: ${imgWidth}x${imgHeight}, 计算缩放: ${optimalScale}, 初始位置: (${initialTranslateX}, ${initialTranslateY})`);
            resolve({
                scale: optimalScale,
                translateX: initialTranslateX,
                translateY: initialTranslateY
            });
        };
        img.src = imageSrc;
    });
}

// 更新缩放按钮状态
function updateZoomButtons() {
    const zoomInBtn = document.getElementById('ustZoomInBtn');
    const zoomOutBtn = document.getElementById('ustZoomOutBtn');
    
    if (zoomInBtn) zoomInBtn.disabled = currentScale >= 5;
    if (zoomOutBtn) zoomOutBtn.disabled = currentScale <= 0.3; // 更新为0.3
}

// 拖拽功能 - 重新实现
function setupUSTDragAndDrop() {
    const mainImage = document.getElementById('ustMainImage');
    if (!mainImage) return;

    // 清除所有旧的事件监听器
    const newImage = mainImage.cloneNode(true);
    mainImage.parentNode.replaceChild(newImage, mainImage);
    
    // 重新获取图片元素
    const freshImage = document.getElementById('ustMainImage');
    
    // 添加新的事件监听器
    freshImage.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);

    // 触摸事件（移动端）
    freshImage.addEventListener('touchstart', startDragTouch);
    document.addEventListener('touchmove', dragTouch);
    document.addEventListener('touchend', endDrag);

    // 滚轮缩放
    freshImage.addEventListener('wheel', handleWheel);
}

function startDrag(e) {
    console.log('开始拖拽，当前缩放:', currentScale);
    // 使用新的拖拽判断逻辑
    if (!canDragImage()) {
        console.log('图片完全展示，无需拖拽');
        return;
    }
    isDragging = true;
    startX = e.clientX - lastTranslateX;
    startY = e.clientY - lastTranslateY;
    console.log('拖拽开始位置:', startX, startY);
    e.preventDefault();
    e.stopPropagation();
}

function drag(e) {
    if (!isDragging) return;
    
    // 计算新的位置
    let newTranslateX = e.clientX - startX;
    let newTranslateY = e.clientY - startY;
    
    // 获取图片和容器的尺寸信息
    const mainImage = document.getElementById('ustMainImage');
    const container = mainImage.parentElement;
    
    if (mainImage && container) {
        const imgRect = mainImage.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // 计算拖拽边界
        const maxTranslateX = Math.max(0, (imgRect.width - containerRect.width) / 2);
        const maxTranslateY = Math.max(0, (imgRect.height - containerRect.height) / 2);
        
        // 限制拖拽范围，确保图片不会完全移出容器
        newTranslateX = Math.max(-maxTranslateX, Math.min(maxTranslateX, newTranslateX));
        newTranslateY = Math.max(-maxTranslateY, Math.min(maxTranslateY, newTranslateY));
        
        console.log('拖拽边界限制:', {
            maxX: maxTranslateX,
            maxY: maxTranslateY,
            newX: newTranslateX,
            newY: newTranslateY
        });
    }
    
    currentTranslateX = newTranslateX;
    currentTranslateY = newTranslateY;
    updateUSTTransform();
    e.preventDefault();
}

function endDrag() {
    if (isDragging) {
        lastTranslateX = currentTranslateX;
        lastTranslateY = currentTranslateY;
        isDragging = false;
    }
}

function startDragTouch(e) {
    // 使用新的拖拽判断逻辑
    if (!canDragImage()) return;
    isDragging = true;
    const touch = e.touches[0];
    startX = touch.clientX - lastTranslateX;
    startY = touch.clientY - lastTranslateY;
    e.preventDefault();
    e.stopPropagation();
}

function dragTouch(e) {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    
    // 计算新的位置
    let newTranslateX = touch.clientX - startX;
    let newTranslateY = touch.clientY - startY;
    
    // 获取图片和容器的尺寸信息
    const mainImage = document.getElementById('ustMainImage');
    const container = mainImage.parentElement;
    
    if (mainImage && container) {
        const imgRect = mainImage.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // 计算拖拽边界
        const maxTranslateX = Math.max(0, (imgRect.width - containerRect.width) / 2);
        const maxTranslateY = Math.max(0, (imgRect.height - containerRect.height) / 2);
        
        // 限制拖拽范围，确保图片不会完全移出容器
        newTranslateX = Math.max(-maxTranslateX, Math.min(maxTranslateX, newTranslateX));
        newTranslateY = Math.max(-maxTranslateY, Math.min(maxTranslateY, newTranslateY));
    }
    
    currentTranslateX = newTranslateX;
    currentTranslateY = newTranslateY;
    updateUSTTransform();
    e.preventDefault();
}

function handleWheel(e) {
    e.preventDefault();
    const direction = e.deltaY > 0 ? 'out' : 'in';
    zoomUSTImage(direction);
}

// 检查图片是否可以拖拽
function canDragImage() {
    const mainImage = document.getElementById('ustMainImage');
    if (!mainImage) return false;
    
    // 获取图片的实际显示尺寸
    const imgRect = mainImage.getBoundingClientRect();
    const containerRect = mainImage.parentElement.getBoundingClientRect();
    
    // 计算图片在容器中的实际显示尺寸
    const imgDisplayWidth = imgRect.width;
    const imgDisplayHeight = imgRect.height;
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
    
    // 如果图片的显示尺寸大于容器尺寸，说明需要拖拽
    const needsDrag = imgDisplayWidth > containerWidth || imgDisplayHeight > containerHeight;
    
    // 检查图片是否完全可见
    const isFullyVisible = imgDisplayWidth <= containerWidth && imgDisplayHeight <= containerHeight;
    
    console.log('拖拽检查:', {
        imgDisplaySize: `${imgDisplayWidth}x${imgDisplayHeight}`,
        containerSize: `${containerWidth}x${containerHeight}`,
        needsDrag: needsDrag,
        isFullyVisible: isFullyVisible
    });
    
    return needsDrag;
}

// 检查图片是否完全可见
function isImageFullyVisible() {
    const mainImage = document.getElementById('ustMainImage');
    if (!mainImage) return true;
    
    const imgRect = mainImage.getBoundingClientRect();
    const containerRect = mainImage.parentElement.getBoundingClientRect();
    
    return imgRect.width <= containerRect.width && imgRect.height <= containerRect.height;
}

// 将函数添加到全局作用域
window.openUSTModal = openUSTModal;
window.closeUSTModal = closeUSTModal;
window.changeUSTSlide = changeUSTSlide;
window.selectUSTThumbnail = selectUSTThumbnail;
window.zoomUSTImage = zoomUSTImage;
window.resetUSTImage = resetUSTImage;

// 测试拖拽功能
window.testUSTDrag = function() {
    console.log('测试拖拽功能');
    console.log('当前缩放:', currentScale);
    console.log('当前位置:', currentTranslateX, currentTranslateY);
    console.log('拖拽状态:', isDragging);
    console.log('是否可以拖拽:', canDragImage());
    
    // 强制设置一个缩放值来测试
    currentScale = 2;
    updateUSTTransform();
    console.log('设置缩放为2，现在应该可以拖拽了');
};

// 检查UST弹窗状态
window.checkUSTModalStatus = function() {
    const modal = document.getElementById('ustModal');
    if (modal) {
        console.log('UST弹窗状态:', {
            element: modal,
            display: modal.style.display,
            computedDisplay: window.getComputedStyle(modal).display,
            classList: modal.classList.toString(),
            isVisible: modal.offsetParent !== null
        });
    } else {
        console.error('找不到UST弹窗元素');
    }
};
