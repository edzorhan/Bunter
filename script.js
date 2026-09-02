// QR Code Generator
function generateQRCode() {
    const qrContainer = document.getElementById('qrcode');
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
        burgers: '🍔 BURGERS',
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
    
    const itemsDiv = document.createElement('div');
    itemsDiv.className = 'menu-items';
    
    categoryData.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'menu-item';
        
        const hasDescription = item.itemDesc && item.itemDesc.trim() !== '';
        
        if (hasDescription) {
            // Item with description
            itemElement.innerHTML = `
                <div class="item-title">${item.item}</div>
                <div class="item-description">${item.itemDesc}</div>
                <div class="item-price">${item.price}</div>
            `;
        } else {
            // Item without description (price next to title)
            itemElement.innerHTML = `
                <div class="item-row">
                    <div class="item-title">${item.item}</div>
                    <div class="item-price">${item.price}</div>
                </div>
            `;
        }
        
        itemsDiv.appendChild(itemElement);
    });
    
    categoryDiv.appendChild(itemsDiv);
    container.appendChild(categoryDiv);
}

// Category Button Events
document.addEventListener('DOMContentLoaded', () => {
    loadMenuData();
    
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