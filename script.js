document.addEventListener('DOMContentLoaded', () => {

    // DATA DAN PENYIMPANAN
    const STORAGE = {
        cart: 'noire_cart',
        favorites: 'noire_favorites',
        history: 'noire_history',
        reviews: 'noire_reviews',
        rewards: 'noire_rewards',
        theme: 'noire_theme'
    };

    const readStorage = (key, fallback) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : fallback;
        } catch {
            return fallback;
        }
    };

    const saveStorage = (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
    };

    let cart = readStorage(STORAGE.cart, []);
    let favorites = readStorage(STORAGE.favorites, []);
    let orderHistory = readStorage(STORAGE.history, []);
    let reviews = readStorage(STORAGE.reviews, []);
    let rewards = readStorage(STORAGE.rewards, {
        stamps: 0,
        available: false
    });

    let activeFilter = 'Semua';
    let selectedRating = 5;
    let discountRate = 0;
    let currentDiscountCode = '';
    let rewardUsed = false;

    const rupiah = amount => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const escapeHTML = value => {
        return String(value).replace(/[&<>"']/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        })[char]);
    };

    const getElement = id => document.getElementById(id);

    const showToast = message => {
        const toast = getElement('toast');

        toast.textContent = message;
        toast.classList.add('show');

        clearTimeout(showToast.timer);

        showToast.timer = setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    };


    // GAMBAR MENU
    const menuImages = {
        'burger': 'photo-1568901346375-23c9450c58cd',
        'chicken-burger': 'photo-1606755962773-d324e0a13086',
        'mushroom-pasta': 'photo-1473093295043-cdd812d0e601',
        'spicy-chicken-rice': 'photo-1512058564366-18510be2db19',
        'beef-teriyaki': 'photo-1546833999-b9f581a1996d',
        'chicken-katsu': 'photo-1604908176997-125f25cc6f3d',
        'pizza': 'photo-1513104890138-7c749659a591',
        'carbonara': 'photo-1612874742237-6526221588e3',
        'fish-chips': 'photo-1544982503-9f984c14501a',
        'french-fries': 'photo-1573080496219-bb080dd4f877',
        'chicken-salad': 'photo-1512621776951-a57141f2eefd',
        'quesadilla': 'photo-1618040996337-56904b7850b9',
        'croissant': 'photo-1555507036-ab1f4038808a',
        'chocolate-croissant': 'photo-1530610476181-d83430b64dcd',
        'cinnamon-roll': 'photo-1509365465985-25d11c17e812',
        'blueberry-cheesecake': 'photo-1533134242443-d4fd215305ad',
        'cheese-toast': 'photo-1525351484163-7529414344d8',
        'donut': 'photo-1551024506-0bccd828d307',
        'spanish-latte': 'photo-1461023058943-07fcbe16d735',
        'matcha-latte': 'photo-1515823064-d6e0c04616a7',
        'strawberry-milk': 'photo-1553787499-6f9133860278',
        'iced-chocolate': 'photo-1542990253-0b8be9d8e6a3',
        'peach-tea': 'photo-1556679343-c7306c1976bc',
        'caramel-macchiato': 'photo-1461023058943-07fcbe16d735',
        'lemon-mojito': 'photo-1513558161293-cdaf765edfd4',
        'berry-smoothie': 'photo-1505252585461-04db1eb84625',
        'iced-americano': 'photo-1517701604599-bb29b565090c',
        'vanilla-milkshake': 'photo-1572490122747-3968b75cc699'
    };

    const getMenuImage = menu => {
        const photoId = menuImages[menu.foto];

        if (!photoId) {
            return 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=700&q=80';
        }

        return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=700&q=80`;
    };


    // MENU DAN FILTER
    const menuGrid = getElement('menuGrid');
    const searchInput = getElement('searchInput');
    const emptyState = getElement('emptyState');

    function renderMenu() {

        const keyword = searchInput.value.toLowerCase().trim();

        const filteredMenu = menuData.filter(menu => {

            const matchesSearch =
                menu.nama.toLowerCase().includes(keyword) ||
                menu.deskripsi.toLowerCase().includes(keyword) ||
                menu.kategori.toLowerCase().includes(keyword);

            let matchesFilter = true;

            if (activeFilter === 'Favorit') {
                matchesFilter = favorites.includes(menu.id);
            } else if (activeFilter === 'BestSeller') {
                matchesFilter = menu.bestSeller;
            } else if (activeFilter !== 'Semua') {
                matchesFilter = menu.kategori === activeFilter;
            }

            return matchesSearch && matchesFilter;
        });

        menuGrid.innerHTML = filteredMenu.map(menu => {

            const isFavorite = favorites.includes(menu.id);

            return `
                <article class="menu-card">

                    <div class="menu-image-wrap">

                        <img
                            src="${getMenuImage(menu)}"
                            alt="${escapeHTML(menu.nama)}"
                            class="menu-image"
                            loading="lazy"
                        >

                        ${menu.bestSeller
                            ? '<span class="menu-badge">★ BEST SELLER</span>'
                            : ''
                        }

                        <button
                            type="button"
                            class="favorite-button ${isFavorite ? 'active' : ''}"
                            data-favorite="${menu.id}"
                            aria-label="Tambahkan ke favorit"
                        >
                            ${isFavorite ? '♥' : '♡'}
                        </button>

                    </div>

                    <div class="menu-card-content">

                        <span class="menu-category">
                            ${escapeHTML(menu.kategori)}
                        </span>

                        <h3>${escapeHTML(menu.nama)}</h3>

                        <p class="menu-description">
                            ${escapeHTML(menu.deskripsi)}
                        </p>

                        <div class="menu-rating">
                            ★ ${Number(menu.rating).toFixed(1)}
                        </div>

                        <div class="menu-card-bottom">

                            <span class="menu-price">
                                ${rupiah(menu.harga)}
                            </span>

                            <button
                                type="button"
                                class="add-cart-button"
                                data-add-cart="${menu.id}"
                                aria-label="Tambah ke keranjang"
                            >
                                +
                            </button>

                        </div>

                    </div>

                </article>
            `;
        }).join('');

        emptyState.hidden = filteredMenu.length !== 0;
    }

    document.querySelectorAll('.filter-btn').forEach(button => {

        button.addEventListener('click', () => {

            document.querySelectorAll('.filter-btn').forEach(item => {
                item.classList.remove('active');
            });

            button.classList.add('active');
            activeFilter = button.dataset.filter;

            renderMenu();
        });
    });

    searchInput.addEventListener('input', renderMenu);

    menuGrid.addEventListener('click', event => {

        const favoriteButton = event.target.closest('[data-favorite]');
        const addButton = event.target.closest('[data-add-cart]');

        if (favoriteButton) {

            const id = Number(favoriteButton.dataset.favorite);

            if (favorites.includes(id)) {
                favorites = favorites.filter(item => item !== id);
                showToast('Menu dihapus dari favorit.');
            } else {
                favorites.push(id);
                showToast('Menu ditambahkan ke favorit ♡');
            }

            saveStorage(STORAGE.favorites, favorites);
            renderMenu();
        }

        if (addButton) {
            addToCart(Number(addButton.dataset.addCart));
        }
    });


    // PROMO MENU
    const promoData = [
        {
            name: 'Coffee & Croissant',
            description: 'Iced Spanish Latte + Butter Croissant.',
            price: 40000,
            original: 46000,
            items: [19, 13],
            label: 'MORNING FAVORITE'
        },
        {
            name: 'Sweet Little Break',
            description: 'Iced Chocolate + Blueberry Cheesecake.',
            price: 54000,
            original: 60000,
            items: [22, 16],
            label: 'SWEET COMBINATION'
        },
        {
            name: 'Comfort Meal',
            description: 'Chicken Katsu Curry + Peach Iced Tea.',
            price: 55000,
            original: 62000,
            items: [6, 23],
            label: 'LUNCH SPECIAL'
        }
    ];

    function renderPromos() {

        getElement('promoGrid').innerHTML = promoData.map((promo, index) => `
            <article class="promo-card">

                <p class="eyebrow">${promo.label}</p>

                <h3>${promo.name}</h3>

                <p>${promo.description}</p>

                <div class="promo-price">
                    ${rupiah(promo.price)}
                    <del>${rupiah(promo.original)}</del>
                </div>

                <button
                    type="button"
                    data-promo="${index}"
                >
                    Add package +
                </button>

            </article>
        `).join('');
    }

    getElement('promoGrid').addEventListener('click', event => {

        const button = event.target.closest('[data-promo]');

        if (!button) return;

        const promo = promoData[Number(button.dataset.promo)];

        promo.items.forEach(id => {
            const menu = menuData.find(item => item.id === id);

            if (menu) {
                cart.push({
                    id: menu.id,
                    name: menu.nama,
                    price: menu.harga,
                    quantity: 1
                });
            }
        });

        cart.push({
            id: `promo-${button.dataset.promo}`,
            name: promo.name,
            price: promo.price - promo.items.reduce((total, id) => {
                const menu = menuData.find(item => item.id === id);
                return total + menu.harga;
            }, 0),
            quantity: 1,
            isPromo: true
        });

        saveStorage(STORAGE.cart, cart);
        updateCart();

        showToast('Paket promo berhasil ditambahkan!');
    });


    // KERANJANG
    function addToCart(id) {

        const menu = menuData.find(item => item.id === id);

        if (!menu) return;

        const existingItem = cart.find(item => item.id === id);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                id: menu.id,
                name: menu.nama,
                price: menu.harga,
                quantity: 1
            });
        }

        saveStorage(STORAGE.cart, cart);
        updateCart();

        showToast(`${menu.nama} ditambahkan ke keranjang ♡`);
    }

    function getSubtotal() {
        return cart.reduce((total, item) => {
            return total + item.price * item.quantity;
        }, 0);
    }

    function getDiscount() {
        if (rewardUsed) {
            return Math.round(getSubtotal() * 0.2);
        }

        return Math.round(getSubtotal() * discountRate);
    }

    function getTotal() {
        return Math.max(0, getSubtotal() - getDiscount());
    }

    function updateCart() {

        const totalQuantity = cart.reduce((total, item) => {
            return total + item.quantity;
        }, 0);

        getElement('cartCount').textContent = totalQuantity;

        getElement('cartSubtotal').textContent = rupiah(getSubtotal());
        getElement('discountAmount').textContent = '-' + rupiah(getDiscount());
        getElement('cartTotal').textContent = rupiah(getTotal());
        getElement('checkoutTotal').textContent = rupiah(getTotal());

        getElement('discountRow').hidden = getDiscount() === 0;

        getElement('cartEmpty').hidden = cart.length !== 0;
        getElement('cartItems').innerHTML = cart.map(item => {

            const menu = menuData.find(menu => menu.id === item.id);

            const image = menu
                ? getMenuImage(menu)
                : getMenuImage(menuData[0]);

            return `
                <div class="cart-item">

                    <img
                        src="${image}"
                        alt="${escapeHTML(item.name)}"
                        class="cart-item-image"
                    >

                    <div class="cart-item-info">

                        <strong>${escapeHTML(item.name)}</strong>

                        <small>${rupiah(item.price)}</small>

                        <div class="quantity-controls">

                            <button
                                type="button"
                                data-decrease="${escapeHTML(item.id)}"
                            >−</button>

                            <span>${item.quantity}</span>

                            <button
                                type="button"
                                data-increase="${escapeHTML(item.id)}"
                            >+</button>

                            <button
                                type="button"
                                data-remove="${escapeHTML(item.id)}"
                            >×</button>

                        </div>

                    </div>

                </div>
            `;
        }).join('');
    }

    getElement('cartItems').addEventListener('click', event => {

        const increase = event.target.closest('[data-increase]');
        const decrease = event.target.closest('[data-decrease]');
        const remove = event.target.closest('[data-remove]');

        if (increase) {
            const item = cart.find(item => String(item.id) === increase.dataset.increase);

            if (item) item.quantity++;
        }

        if (decrease) {
            const item = cart.find(item => String(item.id) === decrease.dataset.decrease);

            if (item) {
                item.quantity--;

                if (item.quantity <= 0) {
                    cart = cart.filter(cartItem => cartItem !== item);
                }
            }
        }

        if (remove) {
            cart = cart.filter(item => String(item.id) !== remove.dataset.remove);
        }

        saveStorage(STORAGE.cart, cart);
        updateCart();
    });


    // BUKA DAN TUTUP KERANJANG
    const cartDrawer = getElement('cartDrawer');
    const drawerBackdrop = getElement('drawerBackdrop');

    function openCart() {
        cartDrawer.classList.add('open');
        drawerBackdrop.classList.add('show');
        cartDrawer.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeCart() {
        cartDrawer.classList.remove('open');
        drawerBackdrop.classList.remove('show');
        cartDrawer.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    getElement('openCart').addEventListener('click', openCart);
    getElement('closeCart').addEventListener('click', closeCart);
    drawerBackdrop.addEventListener('click', closeCart);


    // KODE PROMO
    getElement('applyPromoButton').addEventListener('click', () => {

        const code = getElement('promoCode').value.trim().toUpperCase();
        const message = getElement('promoMessage');

        if (cart.length === 0) {
            message.textContent = 'Tambahkan menu ke keranjang terlebih dahulu.';
            return;
        }

        if (code === 'NOIRE10') {

            discountRate = 0.1;
            rewardUsed = false;
            currentDiscountCode = code;

            message.textContent = 'Yeay! Diskon 10% berhasil digunakan ♡';

        } else {

            discountRate = 0;
            currentDiscountCode = '';

            message.textContent = 'Kode promo tidak valid. Coba NOIRE10.';
        }

        updateCart();
    });


    // CHECKOUT
    const checkoutBackdrop = getElement('checkoutBackdrop');

    getElement('checkoutButton').addEventListener('click', () => {

        if (cart.length === 0) {
            showToast('Keranjang kamu masih kosong.');
            return;
        }

        getElement('customerName').value =
            document.querySelector('input[name="visitor_name"]')?.value || '';

        checkoutBackdrop.classList.add('show');
    });

    getElement('closeCheckout').addEventListener('click', () => {
        checkoutBackdrop.classList.remove('show');
    });

    checkoutBackdrop.addEventListener('click', event => {

        if (event.target === checkoutBackdrop) {
            checkoutBackdrop.classList.remove('show');
        }
    });

    getElement('checkoutForm').addEventListener('submit', event => {

        event.preventDefault();

        if (cart.length === 0) {
            showToast('Keranjang kamu masih kosong.');
            checkoutBackdrop.classList.remove('show');
            return;
        }

        const customerName = getElement('customerName').value.trim();
        const customerPhone = getElement('customerPhone').value.trim();

        const order = {
            id: 'NR-' + Date.now(),
            customer: customerName,
            phone: customerPhone,
            type: getElement('orderType').value,
            payment: getElement('paymentMethod').value,
            note: getElement('orderNote').value.trim(),
            items: cart.map(item => ({ ...item })),
            subtotal: getSubtotal(),
            discount: getDiscount(),
            total: getTotal(),
            date: new Date().toLocaleString('id-ID')
        };

        orderHistory.unshift(order);
        saveStorage(STORAGE.history, orderHistory);

        rewards.stamps = Math.min(5, rewards.stamps + 1);

        if (rewards.stamps >= 5) {
            rewards.available = true;
        }

        saveStorage(STORAGE.rewards, rewards);

        renderRewards();

        renderReceipt(order);

        cart = [];
        saveStorage(STORAGE.cart, cart);

        discountRate = 0;
        currentDiscountCode = '';
        rewardUsed = false;

        getElement('promoCode').value = '';
        getElement('promoMessage').textContent = 'Gunakan kode NOIRE10 untuk diskon 10% (simulasi).';

        updateCart();

        checkoutBackdrop.classList.remove('show');
        closeCart();

        getElement('checkoutForm').reset();

        getElement('receiptBackdrop').classList.add('show');

        showToast('Pesanan demo berhasil dibuat! ♡');
    });


    // STRUK PESANAN
    function renderReceipt(order) {

        getElement('receiptContent').innerHTML = `

            <div class="receipt-line">
                <span>Order ID</span>
                <span>${escapeHTML(order.id)}</span>
            </div>

            <div class="receipt-line">
                <span>Nama</span>
                <span>${escapeHTML(order.customer)}</span>
            </div>

            <div class="receipt-line">
                <span>Tipe pesanan</span>
                <span>${escapeHTML(order.type)}</span>
            </div>

            <div class="receipt-line">
                <span>Pembayaran</span>
                <span>${escapeHTML(order.payment)}</span>
            </div>

            <div class="receipt-line">
                <span>Tanggal</span>
                <span>${escapeHTML(order.date)}</span>
            </div>

            <hr>

            ${order.items.map(item => `
                <div class="receipt-line">
                    <span>${escapeHTML(item.name)} × ${item.quantity}</span>
                    <span>${rupiah(item.price * item.quantity)}</span>
                </div>
            `).join('')}

            <div class="receipt-line">
                <span>Subtotal</span>
                <span>${rupiah(order.subtotal)}</span>
            </div>

            <div class="receipt-line">
                <span>Diskon</span>
                <span>-${rupiah(order.discount)}</span>
            </div>

            <div class="receipt-line receipt-total">
                <span>Total</span>
                <span>${rupiah(order.total)}</span>
            </div>

            ${order.note ? `
                <div class="receipt-line">
                    <span>Catatan</span>
                    <span>${escapeHTML(order.note)}</span>
                </div>
            ` : ''}

        `;
    }

    getElement('closeReceipt').addEventListener('click', () => {
        getElement('receiptBackdrop').classList.remove('show');
    });

    getElement('printReceipt').addEventListener('click', () => {
        window.print();
    });


    // RIWAYAT PESANAN
    const historyBackdrop = getElement('historyBackdrop');

    function renderHistory() {

        const historyList = getElement('historyList');

        if (orderHistory.length === 0) {

            historyList.innerHTML = `
                <p class="upload-empty">
                    Belum ada riwayat pesanan. Yuk, pilih menu favorit kamu!
                </p>
            `;

            return;
        }

        historyList.innerHTML = orderHistory.map(order => `

            <article class="history-item">

                <div class="history-item-top">

                    <strong>${escapeHTML(order.id)}</strong>

                    <strong>${rupiah(order.total)}</strong>

                </div>

                <small>${escapeHTML(order.date)}</small>

                <p>
                    ${order.items.map(item =>
                        `${escapeHTML(item.name)} × ${item.quantity}`
                    ).join(', ')}
                </p>

                <small>
                    ${escapeHTML(order.customer)} · ${escapeHTML(order.type)}
                </small>

            </article>

        `).join('');
    }

    getElement('openHistory').addEventListener('click', () => {
        renderHistory();
        historyBackdrop.classList.add('show');
    });

    getElement('closeHistory').addEventListener('click', () => {
        historyBackdrop.classList.remove('show');
    });

    historyBackdrop.addEventListener('click', event => {

        if (event.target === historyBackdrop) {
            historyBackdrop.classList.remove('show');
        }
    });

    getElement('clearHistory').addEventListener('click', () => {

        if (orderHistory.length === 0) {
            showToast('Belum ada riwayat untuk dihapus.');
            return;
        }

        const confirmed = confirm('Yakin mau menghapus semua riwayat pesanan?');

        if (!confirmed) return;

        orderHistory = [];

        saveStorage(STORAGE.history, orderHistory);

        renderHistory();

        showToast('Riwayat pesanan berhasil dihapus.');
    });


    // REWARDS
    function renderRewards() {

        const stamps = Math.min(5, rewards.stamps);

        getElement('rewardCount').textContent = `${stamps} / 5`;

        getElement('rewardFill').style.width = `${stamps * 20}%`;

        getElement('rewardStatus').textContent =
            rewards.available
                ? 'Yeay! Kamu sudah mendapatkan diskon 20% ♡'
                : `Kumpulkan ${5 - stamps} stamp lagi untuk mendapatkan diskon 20%.`;

        getElement('useRewardButton').hidden = !rewards.available;

        getElement('stampGrid').innerHTML = Array.from(
            { length: 5 },
            (_, index) => `
                <div class="stamp ${index < stamps ? 'active' : ''}">
                    ${index < stamps ? '♥' : '♡'}
                </div>
            `
        ).join('');
    }

    getElement('useRewardButton').addEventListener('click', () => {

        if (!rewards.available) return;

        if (cart.length === 0) {
            showToast('Tambahkan menu ke keranjang terlebih dahulu.');
            return;
        }

        rewardUsed = true;
        discountRate = 0;
        currentDiscountCode = '';

        getElement('promoCode').value = '';
        getElement('promoMessage').textContent = 'Reward diskon 20% berhasil digunakan!';

        updateCart();

        showToast('Reward diskon 20% berhasil dipakai ♡');
        openCart();
    });


    // REVIEW DAN RATING
    const reviewMenu = getElement('reviewMenu');

    reviewMenu.innerHTML = menuData.map(menu => `
        <option value="${menu.id}">
            ${escapeHTML(menu.nama)}
        </option>
    `).join('');

    function updateStars() {

        document.querySelectorAll('#starPicker button').forEach(button => {

            const rating = Number(button.dataset.rating);

            button.classList.toggle('active', rating <= selectedRating);
        });
    }

    getElement('starPicker').addEventListener('click', event => {

        const button = event.target.closest('[data-rating]');

        if (!button) return;

        selectedRating = Number(button.dataset.rating);

        updateStars();
    });

    function renderReviews() {

        const total = reviews.length;

        const average = total
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / total
            : 0;

        getElement('reviewAverage').textContent =
            total ? average.toFixed(1) : '—';

        getElement('reviewTotal').textContent =
            total ? `${total} ulasan pelanggan` : 'Belum ada ulasan pelanggan';

        if (total === 0) {

            getElement('reviewList').innerHTML = `
                <p class="upload-empty">
                    Belum ada love notes. Jadilah yang pertama memberikan review!
                </p>
            `;

            return;
        }

        getElement('reviewList').innerHTML = [...reviews].reverse().map(review => `

            <article class="review-item">

                <div class="review-item-top">

                    <strong>${escapeHTML(review.name)}</strong>

                    <span class="review-item-stars">
                        ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                    </span>

                </div>

                <small>${escapeHTML(review.menu)} · ${escapeHTML(review.date)}</small>

                <p>${escapeHTML(review.text)}</p>

            </article>

        `).join('');
    }

    getElement('reviewForm').addEventListener('submit', event => {

        event.preventDefault();

        const name = getElement('reviewName').value.trim();
        const menuId = Number(getElement('reviewMenu').value);
        const menu = menuData.find(item => item.id === menuId);
        const text = getElement('reviewText').value.trim();

        if (!name || !menu || !text) {
            showToast('Lengkapi data review terlebih dahulu.');
            return;
        }

        reviews.push({
            name,
            menu: menu.nama,
            rating: selectedRating,
            text,
            date: new Date().toLocaleDateString('id-ID')
        });

        saveStorage(STORAGE.reviews, reviews);

        renderReviews();

        getElement('reviewForm').reset();

        selectedRating = 5;
        updateStars();

        showToast('Terima kasih sudah memberikan review ♡');
    });


    // DARK MODE
    const themeToggle = getElement('themeToggle');

    function applyTheme(theme) {

        const isDark = theme === 'dark';

        document.body.classList.toggle('dark-mode', isDark);

        getElement('themeIcon').textContent = isDark ? '☀' : '☾';

        getElement('themeLabel').textContent =
            isDark ? 'Light mode' : 'Dark mode';
    }

    const savedTheme = localStorage.getItem(STORAGE.theme) || 'light';

    applyTheme(savedTheme);

    themeToggle.addEventListener('click', () => {

        const newTheme = document.body.classList.contains('dark-mode')
            ? 'light'
            : 'dark';

        localStorage.setItem(STORAGE.theme, newTheme);

        applyTheme(newTheme);
    });


    // TUTUP MODAL DENGAN TOMBOL ESCAPE
    document.addEventListener('keydown', event => {

        if (event.key === 'Escape') {

            closeCart();

            checkoutBackdrop.classList.remove('show');
            getElement('receiptBackdrop').classList.remove('show');
            historyBackdrop.classList.remove('show');
        }
    });


    // JALANKAN SEMUA FITUR
    renderMenu();
    renderPromos();
    updateCart();
    renderRewards();
    renderReviews();
    updateStars();

});
