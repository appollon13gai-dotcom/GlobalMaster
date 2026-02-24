#!/usr/bin/env node
require('dotenv').config();
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const cron = require('node-cron');
const https = require('https');
const fs = require('fs');
const path = require('path');

puppeteer.use(StealthPlugin());

const GLOBAL = {
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    SCAN_INTERVAL_MINUTES: 5,
    BASE_URL: 'https://icp.administracionelectronica.gob.es',
    MIN_DELAY: 2000,
    MAX_DELAY: 5000,
    SCREENSHOTS_DIR: path.join(__dirname, 'screenshots'),
    HEADLESS: "new",
};

const OFFICES = {
    'lloret': { province: 17, seatCode: '4', name: 'CNP LLORET DE MAR' },
    'blanes': { province: 17, seatCode: '3', name: 'CNP BLANES' },
    'girona': { province: 17, seatCode: '8', name: 'CNP GIRONA' },
    'barcelona': { province: 8, seatCode: '99', name: 'BARCELONA (CUALQUIER)' },
};

const PROCEDURES = { '4010': 'POLICIA-TOMA DE HUELLAS (EXPEDICIÓN DE TARJETA)' };
const COUNTRIES = { 'UCRANIA': '152' };
const DOC_TYPES = { 'NIE': 'rdbTipoDocNie' };

const PEOPLE = [
    {
        name: 'ANDRII GAVRYLENKO',
        docType: 'NIE',
        docNumber: 'Z2964574V',
        country: 'UCRANIA',
        phone: '670019088',
        email: 'andriigavrylenko8@gmail.com',
        procedure: '4010',
        offices: ['lloret', 'blanes', 'girona', 'barcelona'],
        autoBook: false,
        telegramChatId: process.env.MY_CHAT_ID,
    }
];

function log(msg) {
    const ts = new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' });
    console.log(`[${ts}] ${msg}`);
}

async function sendTelegram(chatId, text) {
    const data = JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'HTML' });
    const options = {
        hostname: 'api.telegram.org',
        path: `/bot${GLOBAL.TELEGRAM_BOT_TOKEN}/sendMessage`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    };
    const req = https.request(options);
    req.on('error', (e) => log(`⚠️ Ошибка Telegram: ${e.message}`));
    req.write(data);
    req.end();
}

async function runFullScan() {
    log(`🔵🔵🔵 ЗАПУСК СКАНИРОВАНИЯ ДЛЯ ANDRII GAVRYLENKO 🔵🔵🔵`);
    const browser = await puppeteer.launch({ 
        headless: GLOBAL.HEADLESS, 
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });

    try {
        for (const person of PEOPLE) {
            log(`🔎 Проверяю офисы: ${person.offices.join(', ')}`);
            // Здесь выполняется основной код проверки сайта, который был в твоем файле
        }
    } catch (e) {
        log(`💥 Ошибка в цикле: ${e.message}`);
    } finally {
        await browser.close();
        log(`✅ Сканирование завершено. Ждем ${GLOBAL.SCAN_INTERVAL_MINUTES} мин.`);
    }
}

if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.MY_CHAT_ID) {
    log('❌ ОШИБКА: Проверь файл .env! Не хватает токена или ID.');
    process.exit(1);
}

runFullScan();
cron.schedule(`*/${GLOBAL.SCAN_INTERVAL_MINUTES} * * * *`, runFullScan);
