let availableKupon = [];
let drawnKupon = [];

// Elemen DOM
const drawButton = document.getElementById('drawButton');
const resultImage = document.getElementById('resultImage');
const resultNumber = document.getElementById('resultNumber');
const remainingCount = document.getElementById('remainingCount');
const drawnList = document.getElementById('drawnList');
const themeToggle = document.getElementById('themeToggle');
const resetButton = document.getElementById('resetButton');
const startNumInput = document.getElementById('startNum');
const endNumInput = document.getElementById('endNum');

// ================= TEMA =================
function initTheme() {
    const savedTheme = localStorage.getItem('gachaTheme');
    if (savedTheme === 'light') {
        document.body.classList.remove('dark-mode');
        themeToggle.textContent = '🌙';
    } else {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
    }
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('gachaTheme', 'dark');
        themeToggle.textContent = '☀️';
    } else {
        localStorage.setItem('gachaTheme', 'light');
        themeToggle.textContent = '🌙';
    }
});

// ================= CUSTOM MODAL =================
function showModal({ title, message, icon = '⚠️', confirmText = 'Ya', cancelText = 'Batal', isAlert = false }) {
    return new Promise((resolve) => {
        const modal = document.getElementById('customModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalMessage = document.getElementById('modalMessage');
        const modalIcon = document.getElementById('modalIcon');
        const confirmBtn = document.getElementById('modalConfirmBtn');
        const cancelBtn = document.getElementById('modalCancelBtn');

        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modalIcon.textContent = icon;
        confirmBtn.textContent = confirmText;

        if (isAlert) {
            cancelBtn.style.display = 'none';
        } else {
            cancelBtn.style.display = '';
            cancelBtn.textContent = cancelText;
        }

        modal.classList.add('active');

        function cleanup() {
            modal.classList.remove('active');
            confirmBtn.removeEventListener('click', onConfirm);
            cancelBtn.removeEventListener('click', onCancel);
        }
        function onConfirm() { cleanup(); resolve(true); }
        function onCancel() { cleanup(); resolve(false); }

        confirmBtn.addEventListener('click', onConfirm);
        cancelBtn.addEventListener('click', onCancel);
    });
}

// ================= VALIDASI INPUT =================
function validateInputs() {
    const startVal = startNumInput.value.trim();
    const endVal = endNumInput.value.trim();

    if (startVal === '' || endVal === '') {
        showModal({
            title: 'Input Tidak Lengkap',
            message: 'Nomor awal dan nomor akhir tidak boleh kosong.',
            icon: '📝',
            confirmText: 'Mengerti',
            isAlert: true
        });
        return null;
    }

    const start = parseInt(startVal);
    const end = parseInt(endVal);

    if (isNaN(start) || isNaN(end)) {
        showModal({
            title: 'Input Tidak Valid',
            message: 'Nomor awal dan akhir harus berupa angka.',
            icon: '🚫',
            confirmText: 'Mengerti',
            isAlert: true
        });
        return null;
    }

    if (start < 1 || end < 1) {
        showModal({
            title: 'Angka Tidak Valid',
            message: 'Nomor awal dan akhir harus minimal 1.',
            icon: '🚫',
            confirmText: 'Mengerti',
            isAlert: true
        });
        return null;
    }

    if (start >= end) {
        showModal({
            title: 'Urutan Tidak Valid',
            message: 'Nomor awal harus lebih kecil dari nomor akhir.',
            icon: '↕️',
            confirmText: 'Mengerti',
            isAlert: true
        });
        return null;
    }

    return { start, end };
}

// ================= LOGIKA INPUT & PENYIMPANAN =================
function promptReset() {
    resetButton.classList.add('highlight');
    resetButton.textContent = 'Terapkan Angka';
}
startNumInput.addEventListener('input', promptReset);
endNumInput.addEventListener('input', promptReset);

function generateNewPool() {
    const validated = validateInputs();
    if (!validated) return;

    const { start, end } = validated;

    availableKupon = [];
    for (let i = start; i <= end; i++) {
        availableKupon.push(i);
    }
    drawnKupon = [];

    localStorage.setItem('gachaStartNum', start);
    localStorage.setItem('gachaEndNum', end);
    saveData();

    resetButton.classList.remove('highlight');
    resetButton.textContent = 'Reset Data';
}

function loadData() {
    const savedAvailable = localStorage.getItem('gachaAvailableFinal');
    const savedDrawn = localStorage.getItem('gachaDrawnFinal');
    const savedStart = localStorage.getItem('gachaStartNum');
    const savedEnd = localStorage.getItem('gachaEndNum');

    startNumInput.value = '';
    endNumInput.value = '';

    availableKupon = [];
    drawnKupon = [];
    localStorage.clear();

    updateUI();
}

function saveData() {
    localStorage.setItem('gachaAvailableFinal', JSON.stringify(availableKupon));
    localStorage.setItem('gachaDrawnFinal', JSON.stringify(drawnKupon));
}

function updateUI() {
    remainingCount.textContent = availableKupon.length;
    drawnList.innerHTML = '';

    [...drawnKupon].reverse().forEach(winner => {
        let badge = document.createElement('span');
        badge.className = 'history-item';
        badge.textContent = winner;
        drawnList.appendChild(badge);
    });

    if (drawnKupon.length > 0) {
        const lastWinner = drawnKupon[drawnKupon.length - 1];
        resultImage.style.display = 'block';
        resultImage.src = 'kupon doorprize/' + lastWinner + '.png';
        resultNumber.textContent = '#' + String(lastWinner).padStart(2, '0');
    } else {
        resultImage.style.display = 'none';
        resultNumber.textContent = '#---';
    }

    drawButton.disabled = availableKupon.length === 0;
}

// ================= LOGIKA GACHA =================
drawButton.addEventListener('click', async () => {
    if (availableKupon.length === 0) {
        return showModal({
            title: 'Undian Selesai',
            message: 'Semua kupon telah selesai diundi!',
            icon: '🎉',
            confirmText: 'OK',
            isAlert: true
        });
    }

    drawButton.disabled = true;
    drawButton.innerHTML = 'Mengacak...';
    resultImage.style.display = 'block';

    let roll = setInterval(() => {
        let rand = availableKupon[Math.floor(Math.random() * availableKupon.length)];
        resultNumber.textContent = '#' + String(rand).padStart(2, '0');
        resultImage.src = 'kupon doorprize/' + rand + '.png';
    }, 80);

    setTimeout(() => {
        clearInterval(roll);

        let index = Math.floor(Math.random() * availableKupon.length);
        let winner = availableKupon.splice(index, 1)[0];
        drawnKupon.push(winner);

        resultImage.src = 'kupon doorprize/' + winner + '.png';
        resultNumber.textContent = '#' + String(winner).padStart(2, '0');

        saveData();
        updateUI();

        drawButton.innerHTML = `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg> Acak Sekarang!`;
    }, 1000);
});

// ================= RESET BUTTON =================
resetButton.addEventListener('click', async () => {
    // Jika tombol dalam mode "Terapkan Angka", validasi dulu sebelum tanya konfirmasi
    const validated = validateInputs();
    if (!validated) return;

    const isConfirmed = await showModal({
        title: 'Reset Data?',
        message: 'Terapkan rentang angka baru dan hapus semua riwayat undian saat ini?',
        icon: '🔄',
        confirmText: 'Ya, Reset',
        cancelText: 'Batal'
    });

    if (isConfirmed) {
        localStorage.removeItem('gachaAvailableFinal');
        localStorage.removeItem('gachaDrawnFinal');
        generateNewPool();
        updateUI();
    }
});

// Mulai
initTheme();
loadData();