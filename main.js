require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TOKEN;
const options = { polling: true };
const rafeebot = new TelegramBot(token, options);

const orders = {}; // Object untuk menyimpan pesanan pengguna

// Menu items with price
const menuItems = [
    { name: 'Risol Mayo', price: '6k', callback_data: 'order_risolmayo' },
    { name: 'Kopi Gula Aren', price: '7k', callback_data: 'order_kopigulaaren' },
    { name: 'Stuff Roti', price: '10k', callback_data: 'order_stuffroti' },
    { name: 'Kopi Dalgona', price: '7k', callback_data: 'order_kopidalgona' },
    { name: 'Mie Kocok', price: '10k', callback_data: 'order_miekocok' },
];

// Opsi untuk menambah atau menyelesaikan pesanan
const orderOptions = [
    { text: 'Tambah Pesanan', callback_data: 'add_more' },
    { text: 'Selesai dan Order', callback_data: 'finish_order' },
];

// Fungsi untuk menampilkan menu pesanan (hanya saat user memilih "Tambah Pesanan")
const showMenu = (chatId) => {
    rafeebot.sendMessage(chatId, 'Silakan pilih menu untuk memesan:', {
        reply_markup: {
            inline_keyboard: menuItems.map(item => [{ text: `${item.name} (${item.price})`, callback_data: item.callback_data }])
        }
    });
};

// Fungsi untuk menampilkan opsi setelah memilih item
const showOrderOptions = (chatId) => {
    rafeebot.sendMessage(chatId, 'Apakah Anda ingin menambah pesanan atau menyelesaikan pesanan?', {
        reply_markup: {
            inline_keyboard: [orderOptions]
        }
    });
};

// Fungsi untuk mengirim menu awal sebagai buble chat terpisah
const sendMenuBubleChat = (chatId) => {
    let result = `
    menu rafee. shop ☕
    `;
    menuItems.forEach(item => {
        result += `
        ${item.name} - ${item.price}
        ============================
        `
    });
    rafeebot.sendMessage(chatId, result);
};

// Handle /start command
rafeebot.onText(/\/start/, (callback) => {
    const id = callback.from.id;
    rafeebot.sendMessage(id, 'Selamat datang di Rafee Bot. ☕\nBerikut adalah daftar menu beserta harganya:');
    orders[id] = []; // Inisialisasi pesanan untuk pengguna ini
    
    // Kirimkan menu dalam bentuk buble chat terpisah
    sendMenuBubleChat(id);

    // Setelah semua menu dikirim, tampilkan opsi pemilihan
    setTimeout(() => {
        showMenu(id); // Tampilkan menu dengan inline keyboard setelah buble chat
    }, 500);
});

// Handle pemilihan menu item
rafeebot.on('callback_query', (callbackQuery) => {
    const id = callbackQuery.from.id;
    const item = callbackQuery.data;

    // Cek jika user memilih item menu
    if (item.startsWith('order_')) {
        const selectedItem = item.replace('order_', '').replace(/_/g, ' '); // Misalnya, 'order_risolmayo' jadi 'Risol Mayo'
        orders[id].push(selectedItem); // Tambahkan item ke pesanan

        // Setelah user memilih item, beri opsi lanjut/tambah atau selesaikan
        rafeebot.sendMessage(id, `Anda telah memesan ${selectedItem}.`).then(() => {
            showOrderOptions(id); // Tampilkan opsi setelah pemesanan
        });
    }

    // Handle pemilihan opsi (Tambah Pesanan atau Selesai)
    if (item === 'add_more') {
        showMenu(id); // Tampilkan menu lagi jika user memilih untuk tambah pesanan
    } else if (item === 'finish_order') {
        const orderList = orders[id].join(', ');
        rafeebot.sendMessage(id, `Pesanan Anda telah selesai: ${orderList}. Terima kasih telah memesan di Rafee Bot!`);
        orders[id] = []; // Reset pesanan setelah selesai
    }
});
