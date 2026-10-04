# ZERUX Minecraft AFK Bot

## Railway sozlash
1. ZIP faylni ochib, ichidagi fayllarni GitHub repositoryga yuklang.
2. Railway -> New Project -> Deploy from GitHub Repo orqali repositoryni tanlang.
3. Railway -> Variables bo‘limiga quyidagilarni kiriting:
   - TELEGRAM_BOT_TOKEN: BotFather bergan token
   - ADMIN_IDS: admin Telegram ID (bir nechta bo‘lsa vergul bilan, masalan 123,456)
   - MAX_SERVERS: serverlar limiti (ixtiyoriy, odatiy 3)
4. Deploy qiling. Procfile worker jarayonini ishga tushiradi.

## Telegram buyruqlari
- /start, /help — boshlash va yordam
- /addserver nom host port username version — server qo‘shish
- /servers — serverlar ro‘yxati
- /connect nom — botni serverga ulash
- /disconnect nom — uzish
- /status — ulanish holati
- /time nom — ishlagan vaqt
- /removeserver nom — serverni o‘chirish

Misol: `/addserver zerux play.example.net 25565 ZeruxAFK 1.16.5`, keyin `/connect zerux`.

## Eslatma
Ushbu starter loyiha `auth: offline` ishlatadi va faqat offline-mode serverlarga mos. Online-mode serverlar rasmiy Microsoft/Minecraft autentifikatsiyasini talab qiladi; loyiha login ma’lumotlarini yig‘maydi. Server egasining ruxsati bilan ishlating va server qoidalariga rioya qiling. Ayrim serverlar avtomatlashtirilgan clientlarni bloklashi mumkin.

Server sozlamalari xotirada turadi, worker qayta ishga tushganda ularni `/addserver` bilan qayta kiritish kerak. 24/7 ishlashi Railway tarifidagi worker limitlariga bog‘liq.
