// QR Code Generator
function generateQRCode() {
    const qrContainer = document.getElementById('qrcode');
    if (!qrContainer) {
        return;
    }

    qrContainer.innerHTML = ''; // Clear previous QR
    
    const menuUrl = window.location.href;
    new QRCode(qrContainer, {
        text: menuUrl,
        width: 150,
        height: 150,
        colorDark: "#ab1f1f",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

// Load Menu Data
let menuData = {};

async function loadMenuData() {
    try {
        const response = await fetch('data/bunter-menu.json');
        menuData = await response.json();
        renderMenu('burgers');
        generateQRCode();
    } catch (error) {
        console.error('Menü yüklenirken hata:', error);
    }
}

// Render Menu
function renderMenu(category) {
    const container = document.getElementById('menu-container');
    container.innerHTML = '';
    
    const categoryData = menuData.menu[category];
    const categoryNames = {
        burgers: '🍔 BURGERLER',
        fries: '🍟 PATATES',
        beverages: '🥤 İÇECEKLER',
        sauces: '🧴 SOSLAR',
        extras: '➕ EKSTRALAR',
        dessert: '🍰 TATLI'
    };

    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'category active';
    categoryDiv.id = `category-${category}`;
    
    const title = document.createElement('h2');
    title.className = 'category-title';
    title.textContent = categoryNames[category];
    categoryDiv.appendChild(title);

    if (category === 'burgers') {
        const featuredExtras = (menuData.menu.extras || []).filter(item => item.featured);
        if (featuredExtras.length > 0) {
            const featuredDiv = document.createElement('div');
            featuredDiv.className = 'featured-extras';
            featuredDiv.innerHTML = `
                <div class="featured-extras-heading">
                    <span class="featured-extras-kicker">BURGERİNİ YÜKSELT</span>
                    <span class="featured-extras-note">İstersen ekstra lezzet kat</span>
                </div>
                <div class="featured-extra-options">
                    ${featuredExtras.map(item => `
                        <button class="featured-extra" type="button" data-category="extras">
                            <span class="featured-extra-icon">${getFeaturedExtraIcon(item.featured)}</span>
                            <span class="featured-extra-info">
                                <strong>${item.item}</strong>
                                <small>${getFeaturedExtraDescription(item)}</small>
                            </span>
                            <span class="featured-extra-price">${item.price || '170 TL'}</span>
                        </button>
                    `).join('')}
                </div>
            `;
            categoryDiv.appendChild(featuredDiv);
        }
    }
    
    const itemsDiv = document.createElement('div');
    itemsDiv.className = 'menu-items';
    
    categoryData.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'menu-item';
        const itemImage = item.image
            ? `<img class="item-image" src="${item.image}" alt="${item.item} görseli" loading="lazy">`
            : '';
        
        const hasDescription = item.itemDesc && item.itemDesc.trim() !== '';
        
        if (hasDescription) {
            // Item with description
            itemElement.innerHTML = `
                <div class="menu-item-body">
                    <div class="menu-item-content">
                        <div class="item-title">${item.item}</div>
                        <div class="item-description">${item.itemDesc}</div>
                        <div class="item-price">${item.price}</div>
                    </div>
                    ${itemImage}
                </div>
            `;
        } else {
            // Item without description (price next to title)
            itemElement.innerHTML = `
                <div class="menu-item-body">
                    <div class="menu-item-content">
                        <div class="item-row">
                            <div class="item-title">${item.item}</div>
                            <div class="item-price">${item.price}</div>
                        </div>
                    </div>
                    ${itemImage}
                </div>
            `;
        }

        if (item.image) {
            itemElement.classList.add('has-image');
            itemElement.tabIndex = 0;
            itemElement.setAttribute('role', 'button');
            itemElement.setAttribute('aria-label', `${item.item} görselini büyüt`);
            itemElement.addEventListener('click', () => openImageModal(item.image, item.item));
            itemElement.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openImageModal(item.image, item.item);
                }
            });
        }
        
        itemsDiv.appendChild(itemElement);
    });
    
    categoryDiv.appendChild(itemsDiv);
    container.appendChild(categoryDiv);
}

function getFeaturedExtraIcon(featuredType) {
    const icons = {
        'double-patty': '🍔',
        'menu-upgrade': '🍟',
        'extra-sauce': '🧴',
        'extra-cheddar': '🧀'
    };
    return icons[featuredType] || '➕';
}

function getFeaturedExtraDescription(item) {
    const descriptions = {
        'double-patty': 'Burgerine bir köfte daha ekle',
        'menu-upgrade': 'Patates + içecek dahil',
        'extra-sauce': 'Burgerine ekstra sos ekle',
        'extra-cheddar': 'Burgerine ekstra cheddar ekle'
    };
    return descriptions[item.featured] || item.itemDesc || 'Ekstra lezzet kat';
}

function openImageModal(imageSrc, itemName) {
    const modal = document.getElementById('image-modal');
    const modalImage = modal.querySelector('.image-modal-content');
    modalImage.src = imageSrc;
    modalImage.alt = `${itemName} görseli`;
    modal.hidden = false;
    document.body.classList.add('modal-open');
}

function closeImageModal() {
    const modal = document.getElementById('image-modal');
    modal.hidden = true;
    document.body.classList.remove('modal-open');
}

// Category Button Events
document.addEventListener('DOMContentLoaded', () => {
    loadMenuData();

    const imageModal = document.getElementById('image-modal');
    imageModal.querySelector('.image-modal-close').addEventListener('click', closeImageModal);
    imageModal.addEventListener('click', event => {
        if (event.target === imageModal) {
            closeImageModal();
        }
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !imageModal.hidden) {
            closeImageModal();
        }
    });
    
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            categoryBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Render new category
            const category = btn.dataset.category;
            renderMenu(category);
        });
    });
});