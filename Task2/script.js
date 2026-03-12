// Filtr funksionallığı
document.addEventListener('DOMContentLoaded', function() {
    const filterForm = document.getElementById('filterForm');
    const cards = document.querySelectorAll('.card');
    const countSpan = document.getElementById('count');
    const cardsContainer = document.querySelector('.cards');

    // Form submit hadisəsi - Tətbiq et düyməsi
    filterForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Səhifənin yenilənməsinin qarşısını al
        applyFilters();
    });

    // Form reset hadisəsi - Sıfırla düyməsi
    filterForm.addEventListener('reset', function(e) {
        // Reset hadisəsindən sonra bütün kartları göstər
        setTimeout(() => {
            cards.forEach(card => {
                card.classList.remove('hidden');
            });
            updateCount();
            removeNoResultsMessage();
        }, 0);
    });

    // Filtrləri tətbiq et
    function applyFilters() {
        // Filtr dəyərlərini al
        const marka = document.getElementById('marka').value.toLowerCase();
        const model = document.getElementById('model').value.toLowerCase();
        const qiymetMin = parseInt(document.getElementById('qiymet-min').value) || 0;
        const qiymetMax = parseInt(document.getElementById('qiymet-max').value) || Infinity;
        const motor = document.getElementById('motor').value;
        const ilMin = parseInt(document.getElementById('il-min').value) || 0;
        const ilMax = parseInt(document.getElementById('il-max').value) || Infinity;
        const yurusMin = parseInt(document.getElementById('yurus-min').value) || 0;
        const yurusMax = parseInt(document.getElementById('yurus-max').value) || Infinity;
        const seher = document.getElementById('seher').value.toLowerCase();

        let visibleCount = 0;

        // Hər kartı yoxla
        cards.forEach(card => {
            const cardMarka = card.dataset.marka.toLowerCase();
            const cardModel = card.dataset.model.toLowerCase();
            const cardQiymet = parseInt(card.dataset.qiymet);
            const cardMotor = card.dataset.motor.toLowerCase();
            const cardIl = parseInt(card.dataset.il);
            const cardYurus = parseInt(card.dataset.yurus);
            const cardSeher = card.dataset.seher.toLowerCase();

            let isVisible = true;

            // Marka filtri
            if (marka && cardMarka !== marka) {
                isVisible = false;
            }

            // Model filtri (axtarış mətni kimi)
            if (model && !cardModel.includes(model)) {
                isVisible = false;
            }

            // Qiymət filtri
            if (cardQiymet < qiymetMin || cardQiymet > qiymetMax) {
                isVisible = false;
            }

            // Motor filtri
            if (motor) {
                if (motor === 'elektrik' || motor === 'hibrid') {
                    if (cardMotor !== motor) {
                        isVisible = false;
                    }
                } else if (motor === '1.0') {
                    if (parseFloat(cardMotor) > 1.0 && cardMotor !== 'elektrik' && cardMotor !== 'hibrid') {
                        isVisible = false;
                    }
                } else if (motor === '3.5') {
                    if (parseFloat(cardMotor) < 3.5 || cardMotor === 'elektrik' || cardMotor === 'hibrid') {
                        isVisible = false;
                    }
                } else {
                    const motorValue = parseFloat(motor);
                    const cardMotorValue = parseFloat(cardMotor);
                    if (isNaN(cardMotorValue) || Math.abs(cardMotorValue - motorValue) > 0.3) {
                        isVisible = false;
                    }
                }
            }

            // İl filtri
            if (cardIl < ilMin || cardIl > ilMax) {
                isVisible = false;
            }

            // Yürüş filtri
            if (cardYurus < yurusMin || cardYurus > yurusMax) {
                isVisible = false;
            }

            // Şəhər filtri
            if (seher && cardSeher !== seher) {
                isVisible = false;
            }

            // Kartı göstər/gizlət
            if (isVisible) {
                card.classList.remove('hidden');
                visibleCount++;
            } else {
                card.classList.add('hidden');
            }
        });

        // Sayğacı yenilə
        countSpan.textContent = visibleCount;

        // Nəticə tapılmadı mesajı
        if (visibleCount === 0) {
            showNoResultsMessage();
        } else {
            removeNoResultsMessage();
        }
    }

    // Sayğacı yenilə
    function updateCount() {
        const visibleCards = document.querySelectorAll('.card:not(.hidden)');
        countSpan.textContent = visibleCards.length;
    }

    // Nəticə tapılmadı mesajını göstər
    function showNoResultsMessage() {
        removeNoResultsMessage();
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.textContent = 'Axtarış şərtlərinə uyğun elan tapılmadı. Filtrləri dəyişdirməyə çalışın.';
        cardsContainer.appendChild(noResults);
    }

    // Nəticə tapılmadı mesajını sil
    function removeNoResultsMessage() {
        const existingMessage = document.querySelector('.no-results');
        if (existingMessage) {
            existingMessage.remove();
        }
    }

    // İlkin yükləmədə sayğacı yenilə
    updateCount();
});
