// Filtr funksionallığı
document.addEventListener('DOMContentLoaded', async function() {
    const filterForm = document.getElementById('filterForm');
    const countSpan = document.getElementById('count');
    const cardsContainer = document.getElementById('cardsContainer');
    let cards = [];

    try {
        const data = await loadArticles();
        renderCards(Array.isArray(data.articles) ? data.articles : []);
    } catch (error) {
        showLoadError(error);
    }

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

    function loadArticles() {
        return fetch('articles.json', { cache: 'no-store' }).then(response => {
            if (!response.ok) {
                throw new Error('JSON yüklənmədi');
            }

            return response.json();
        });
    }

    function renderCards(articles) {
        cardsContainer.innerHTML = '';
        const fragment = document.createDocumentFragment();

        articles.forEach(article => {
            const card = document.createElement('article');
            card.className = 'card';
            card.dataset.marka = article.marka;
            card.dataset.model = article.model;
            card.dataset.qiymet = article.qiymet;
            card.dataset.motor = article.motor;
            card.dataset.il = article.il;
            card.dataset.yurus = article.yurus;
            card.dataset.seher = article.seher;

            card.innerHTML = `
                <figure class="thumb"><img src="${escapeHtml(article.image.src)}" alt="${escapeHtml(article.image.alt)}" loading="lazy"></figure>
                <h3>${escapeHtml(article.title)}</h3>
                <span class="price">${escapeHtml(article.priceText)}</span>
                <p>${escapeHtml(article.details)}</p>
                <div class="info"><span>${escapeHtml(article.posted.city)}</span><span>${escapeHtml(article.posted.time)}</span></div>
            `;

            card.addEventListener('click', function() {
                openCreditCalculator(this);
            });

            fragment.appendChild(card);
        });

        cardsContainer.appendChild(fragment);
        cards = Array.from(cardsContainer.querySelectorAll('.card'));
        updateCount();
        removeNoResultsMessage();
    }

    function showLoadError(error) {
        cardsContainer.innerHTML = '';
        cards = [];
        countSpan.textContent = '0';

        if (window.location.protocol === 'file:') {
            showNoResultsMessage('Elanlar yüklənmədi. Bu səhifəni lokal server ilə açın (məsələn: python -m http.server 5500).');
        } else {
            showNoResultsMessage('Elanlar yüklənmədi. Zəhmət olmasa bir az sonra yenidən cəhd edin.');
        }

        console.error('articles.json yüklənərkən xəta baş verdi:', error);
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

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
        const visibleCards = cards.filter(card => !card.classList.contains('hidden'));
        countSpan.textContent = visibleCards.length;
    }

    // Nəticə tapılmadı mesajını göstər
    function showNoResultsMessage(message) {
        removeNoResultsMessage();
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.textContent = message || 'Axtarış şərtlərinə uyğun elan tapılmadı. Filtrləri dəyişdirməyə çalışın.';
        cardsContainer.appendChild(noResults);
    }

    // Nəticə tapılmadı mesajını sil
    function removeNoResultsMessage() {
        const existingMessage = document.querySelector('.no-results');
        if (existingMessage) {
            existingMessage.remove();
        }
    }

    // İlkin yükləmədə sayğac JSON məlumatı əsasında yenilənir.
});

// Kredit Kalkulyatoru Funksiyaları
function openCreditCalculator(cardElement) {
    const modal = document.getElementById('creditModal');
    const carTitle = document.getElementById('carTitle');
    const carPrice = document.getElementById('carPrice');
    const creditAmountInput = document.getElementById('creditAmount');
    
    // Kartdan məlumatları al
    const marka = cardElement.dataset.marka;
    const model = cardElement.dataset.model;
    const qiymet = parseInt(cardElement.dataset.qiymet);
    
    // Modal-da məlumatları göstər
    const carName = `${marka.charAt(0).toUpperCase() + marka.slice(1)} ${model}`;
    carTitle.textContent = carName;
    carPrice.textContent = `Qiymət: ${formatNumber(qiymet)} AZN`;
    creditAmountInput.value = qiymet;
    
    // Modal-ı aç
    modal.style.display = 'flex';
    
    // Nəticələr bölməsini gizlət
    document.getElementById('resultsSection').style.display = 'none';
}

function closeCreditCalculator() {
    const modal = document.getElementById('creditModal');
    modal.style.display = 'none';
}

// Modal kapatma düğmesi
document.getElementById('closeModal').addEventListener('click', closeCreditCalculator);

// Modal açıq olduğu zaman modal-ın xəricində kliklədikdə kapatma
document.getElementById('creditModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeCreditCalculator();
    }
});

// Hesabla düyməsi
document.getElementById('calculateBtn').addEventListener('click', function() {
    calculateCredit();
});

function calculateCredit() {
    const creditAmount = parseFloat(document.getElementById('creditAmount').value);
    const duration = parseInt(document.getElementById('duration').value);
    const annualRate = parseFloat(document.getElementById('interestRate').value);
    const interestType = document.getElementById('interestType').value;
    
    // Validasiya
    if (!creditAmount || !duration || !annualRate || !interestType) {
        alert('Bütün sahələri doldurun!');
        return;
    }
    
    // Hesabla
    let monthlyPayment, totalPayment, totalInterest;
    
    if (interestType === 'simple') {
        // Sadə Faiz Hesabı
        const monthlyRate = annualRate / 12 / 100;
        const totalInterestAmount = creditAmount * annualRate * (duration / 12) / 100;
        totalPayment = creditAmount + totalInterestAmount;
        monthlyPayment = totalPayment / duration;
        totalInterest = totalInterestAmount;
    } else {
        // Mürəkkəb Faiz Hesabı
        const monthlyRate = annualRate / 12 / 100;
        monthlyPayment = (creditAmount * monthlyRate * Math.pow(1 + monthlyRate, duration)) / 
                         (Math.pow(1 + monthlyRate, duration) - 1);
        totalPayment = monthlyPayment * duration;
        totalInterest = totalPayment - creditAmount;
    }
    
    // Nəticələri göstər
    displayResults(creditAmount, monthlyPayment, totalPayment, totalInterest, duration, annualRate, interestType);
}

function displayResults(creditAmount, monthlyPayment, totalPayment, totalInterest, duration, annualRate, interestType) {
    document.getElementById('displayCreditAmount').textContent = formatNumber(creditAmount) + ' AZN';
    document.getElementById('monthlyPayment').textContent = formatNumber(monthlyPayment.toFixed(2)) + ' AZN';
    document.getElementById('totalPayment').textContent = formatNumber(totalPayment.toFixed(2)) + ' AZN';
    document.getElementById('totalInterest').textContent = formatNumber(totalInterest.toFixed(2)) + ' AZN';
    
    // Ödəniş cədvəlini yaradılsın
    generatePaymentSchedule(creditAmount, duration, annualRate, interestType);
    
    // Nəticələr bölməsini göstər
    document.getElementById('resultsSection').style.display = 'block';
}

function generatePaymentSchedule(creditAmount, duration, annualRate, interestType) {
    const tableBody = document.getElementById('paymentTableBody');
    tableBody.innerHTML = '';
    
    const monthlyRate = annualRate / 12 / 100;
    let remainingBalance = creditAmount;
    let monthlyPayment;
    
    // Aylıq ödənişi hesabla
    if (interestType === 'simple') {
        const totalInterest = creditAmount * annualRate * (duration / 12) / 100;
        monthlyPayment = (creditAmount + totalInterest) / duration;
    } else {
        monthlyPayment = (creditAmount * monthlyRate * Math.pow(1 + monthlyRate, duration)) / 
                         (Math.pow(1 + monthlyRate, duration) - 1);
    }
    
    // Bütün aylar üçün cədvəl
    for (let i = 1; i <= duration; i++) {
        let interestPayment;
        
        if (interestType === 'simple') {
            interestPayment = (creditAmount * annualRate * (1 / 12)) / 100;
        } else {
            interestPayment = remainingBalance * monthlyRate;
        }
        
        const principalPayment = monthlyPayment - interestPayment;
        remainingBalance -= principalPayment;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${i}</td>
            <td>${formatNumber(monthlyPayment.toFixed(2))}</td>
            <td>${formatNumber(interestPayment.toFixed(2))}</td>
            <td>${formatNumber(principalPayment.toFixed(2))}</td>
            <td>${formatNumber(Math.max(0, remainingBalance).toFixed(2))}</td>
        `;
        tableBody.appendChild(row);
    }
}

function formatNumber(num) {
    return parseFloat(num).toLocaleString('az-AZ');
}
