const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    });
}

function scrollToDownloader() {
    document.getElementById('downloader').scrollIntoView({ behavior: 'smooth' });
}

function clearInput() {
    document.getElementById('videoUrlInput').value = '';
    document.getElementById('mediaResult').classList.add('hidden');
}

function fillSample(url) {
    document.getElementById('videoUrlInput').value = url;
    analyzeUrl();
}

function quickSelectPlatform(platform) {
    const input = document.getElementById('videoUrlInput');
    input.value = `https://www.${platform.toLowerCase()}.com/trending-sample-video`;
    scrollToDownloader();
    analyzeUrl();
}

function analyzeUrl() {
    const urlInput = document.getElementById('videoUrlInput').value.trim();
    const fetchBtn = document.getElementById('fetchBtn');
    const resultCard = document.getElementById('mediaResult');

    if (!urlInput) {
        showToast('Please paste a valid video or media link first!', 'error');
        return;
    }

    fetchBtn.disabled = true;
    fetchBtn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> Analyzing...';

    setTimeout(() => {
        fetchBtn.disabled = false;
        fetchBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Fetch Media';

        const resPlatform = document.getElementById('resPlatform');
        const resTitle = document.getElementById('resTitle');
        const resAuthor = document.getElementById('resAuthor');

        if (urlInput.includes('tiktok')) {
            resPlatform.innerText = 'TikTok HD (No Watermark)';
            resPlatform.className = 'px-2.5 py-1 rounded-md text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30';
            resTitle.innerText = 'Viral Street Dance Performance in Tokyo Neon Lights';
            resAuthor.innerText = '@dance_tokyo_official';
        } else if (urlInput.includes('instagram')) {
            resPlatform.innerText = 'Instagram Reel HQ';
            resPlatform.className = 'px-2.5 py-1 rounded-md text-xs font-semibold bg-pink-500/20 text-pink-300 border border-pink-500/30';
            resTitle.innerText = 'Cinematic Sunset drone shot over Amalfi Coast Italy';
            resAuthor.innerText = 'travel_creators';
        } else {
            resPlatform.innerText = 'YouTube Ultra HD';
            resPlatform.className = 'px-2.5 py-1 rounded-md text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30';
            resTitle.innerText = 'Neon Synthwave Cityscape 4K HDR Speed Demonstration';
            resAuthor.innerText = 'CyberAesthetics Studio';
        }

        resultCard.classList.remove('hidden');
        resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        showToast('Media stream successfully extracted!', 'success');
    }, 1000);
}

function switchFormatTab(type) {
    const tabVideo = document.getElementById('tabVideo');
    const tabAudio = document.getElementById('tabAudio');
    const videoOptions = document.getElementById('videoOptions');
    const audioOptions = document.getElementById('audioOptions');

    if (type === 'video') {
        tabVideo.className = 'text-cyan-400 font-bold text-sm border-b-2 border-cyan-400 pb-1 flex items-center gap-2';
        tabAudio.className = 'text-gray-400 font-bold text-sm hover:text-white pb-1 flex items-center gap-2';
        videoOptions.classList.remove('hidden');
        audioOptions.classList.add('hidden');
    } else {
        tabAudio.className = 'text-cyan-400 font-bold text-sm border-b-2 border-cyan-400 pb-1 flex items-center gap-2';
        tabVideo.className = 'text-gray-400 font-bold text-sm hover:text-white pb-1 flex items-center gap-2';
        audioOptions.classList.remove('hidden');
        videoOptions.classList.add('hidden');
    }
}

async function createAndDownloadDemoVideo() {
    if (!window.MediaRecorder || !window.URL || !window.URL.createObjectURL) {
        showToast('This browser does not support saving a demo video file.', 'error');
        return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    const stream = canvas.captureStream(30);

    const mimeTypeCandidates = ['video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
    const mimeType = mimeTypeCandidates.find(type => {
        return MediaRecorder.isTypeSupported ? MediaRecorder.isTypeSupported(type) : true;
    }) || 'video/webm';

    const recorder = new MediaRecorder(stream, mimeType.includes('mp4') ? undefined : { mimeType });
    const chunks = [];

    recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
            chunks.push(event.data);
        }
    };

    await new Promise((resolve) => {
        recorder.onstop = resolve;
        recorder.start();

        const start = performance.now();
        const render = (now) => {
            const elapsed = (now - start) / 1000;
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#00f2fe');
            gradient.addColorStop(0.5, '#4facfe');
            gradient.addColorStop(1, '#7f00ff');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = 'rgba(10, 15, 30, 0.45)';
            ctx.fillRect(28, 28, canvas.width - 56, canvas.height - 56);

            ctx.fillStyle = '#ffffff';
            ctx.font = '700 32px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Zentro Demo Video', canvas.width / 2, canvas.height / 2 - 10);

            ctx.fillStyle = '#00f2fe';
            ctx.fillRect(60, canvas.height - 70, (canvas.width - 120) * (elapsed / 2.0), 18);

            ctx.fillStyle = '#ffffff';
            ctx.font = '600 18px Arial';
            ctx.fillText(`Time ${elapsed.toFixed(1)}s`, canvas.width / 2, canvas.height - 22);

            if (elapsed < 2) {
                requestAnimationFrame(render);
            } else {
                recorder.stop();
                stream.getTracks().forEach(track => track.stop());
            }
        };

        requestAnimationFrame(render);
    });

    const blob = new Blob(chunks, { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = mimeType.includes('mp4') ? 'zentro-demo-video.mp4' : 'zentro-demo-video.webm';
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function simulateDownload(quality, size) {
    const container = document.getElementById('downloadProgressContainer');
    const progressBar = document.getElementById('progressBar');
    const statusText = document.getElementById('downloadStatusText');
    const percentageText = document.getElementById('downloadPercentage');
    const timeText = document.getElementById('downloadTimeText');

    container.classList.remove('hidden');
    progressBar.style.width = '0%';
    percentageText.innerText = '0%';
    timeText.innerText = 'Time: 00:00';
    statusText.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Preparing ${quality} (${size})...`;

    const startedAt = Date.now();
    const updateTime = () => {
        const totalSeconds = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
        const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        timeText.innerText = `Time: ${minutes}:${seconds}`;
    };

    updateTime();

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 10;
        updateTime();

        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            progressBar.style.width = '100%';
            percentageText.innerText = '100%';
            updateTime();
            statusText.innerHTML = '<i class="fa-solid fa-circle-check text-emerald-400"></i> Download Complete!';
            showToast(`Successfully saved ${quality}!`, 'success');
        } else {
            progressBar.style.width = `${progress}%`;
            percentageText.innerText = `${progress}%`;
        }
    }, 250);

    setTimeout(async () => {
        try {
            await createAndDownloadDemoVideo();
        } catch (error) {
            showToast('Download failed on this browser.', 'error');
        }
    }, 1200);
}

function simulateApkDownload() {
    showToast('Downloading Zentro_v4.8_Installer.apk...', 'info');
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');

    let bgClass = 'bg-slate-900 border-cyan-500/50 text-cyan-300';
    let icon = 'fa-circle-info';

    if (type === 'success') {
        bgClass = 'bg-slate-900 border-emerald-500/50 text-emerald-300';
        icon = 'fa-circle-check';
    } else if (type === 'error') {
        bgClass = 'bg-slate-900 border-red-500/50 text-red-300';
        icon = 'fa-circle-exclamation';
    }

    toast.className = `pointer-events-auto px-4 py-3 rounded-xl border ${bgClass} shadow-2xl flex items-center gap-3 text-sm font-medium transition-all duration-300 transform translate-y-4 opacity-0`;
    toast.innerHTML = `<i class="fa-solid ${icon} text-lg"></i> <span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('translate-y-4', 'opacity-0');
    }, 50);

    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-4');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}
