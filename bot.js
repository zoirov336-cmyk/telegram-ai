const { Telegraf } = require("telegraf");
const mineflayer = require("mineflayer");

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMINS = (process.env.ADMIN_IDS || "").split(",").map(x => x.trim()).filter(Boolean);
const MAX_SERVERS = Number(process.env.MAX_SERVERS || 3);
if (!TOKEN) throw new Error("TELEGRAM_BOT_TOKEN kiritilmagan");
if (!ADMINS.length) throw new Error("ADMIN_IDS kiritilmagan");

const bot = new Telegraf(TOKEN), configs = new Map(), sessions = new Map();
const admin = ctx => ADMINS.includes(String(ctx.from?.id || ""));
const onlyAdmin = ctx => admin(ctx) || (ctx.reply("⛔ Bu buyruq faqat admin uchun."), false);
const clean = s => String(s || "").toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0,20);
const duration = ms => { const n=Math.floor(ms/1000); return `${Math.floor(n/3600)} soat ${Math.floor(n%3600/60)} daqiqa ${n%60} soniya`; };

function stop(name) {
  const s=sessions.get(name); if(!s) return false;
  s.reconnect=false; if(s.timer) clearTimeout(s.timer);
  try { s.client?.quit("Admin stopped AFK bot"); } catch(e) {}
  sessions.delete(name); return true;
}
function connect(name) {
  const cfg=configs.get(name);
  if(!cfg) return "Server topilmadi. /servers buyrug‘ini tekshiring.";
  if(sessions.has(name)) return "Bot allaqachon ulangan yoki ulanmoqda.";
  const s={client:null,start:Date.now(),reconnect:true,timer:null}; sessions.set(name,s);
  function launch() {
    if(!s.reconnect || !sessions.has(name)) return;
    try {
      const client=mineflayer.createBot({host:cfg.host,port:cfg.port,username:cfg.username,version:cfg.version||false,auth:"offline"});
      s.client=client;
      client.once("spawn",()=>{s.start=Date.now(); console.log(name+" connected");});
      client.on("error",e=>console.log(name,e.message));
      client.on("end",()=>{s.client=null;if(s.reconnect&&sessions.has(name))s.timer=setTimeout(launch,10000);});
    } catch(e) { console.log(e.message); if(s.reconnect)s.timer=setTimeout(launch,10000); }
  }
  launch(); return null;
}
bot.start(ctx=>ctx.reply("👋 Salom! ZERUX Minecraft AFK Bot.\n/help — buyruqlar va sozlash"));
bot.help(ctx=>ctx.reply(
"💎 ZERUX MINECRAFT AFK BOT\n\n"+
"Admin buyruqlari:\n"+
"/addserver nom host port username version — server qo‘shish\n"+
"/servers — serverlar ro‘yxati\n/connect nom — AFK botni ulash\n/disconnect nom — uzish\n/status — holat\n/time nom — ishlagan vaqt\n/removeserver nom — serverni o‘chirish\n\n"+
"Misol:\n/addserver zerux play.example.net 25565 ZeruxAFK 1.16.5\n/connect zerux\n\n"+
"Faqat offline-mode serverlar uchun. Server egasining ruxsati bilan ishlating."
));
bot.command("addserver",ctx=>{
 if(!onlyAdmin(ctx))return;
 const p=ctx.message.text.trim().split(/\s+/);
 if(p.length<6)return ctx.reply("Format: /addserver nom host port username version");
 if(configs.size>=MAX_SERVERS)return ctx.reply("Serverlar limiti: "+MAX_SERVERS);
 const name=clean(p[1]),port=Number(p[3]),username=p[4],version=p[5]==="-"?false:p[5];
 if(!name||!p[2]||!Number.isInteger(port)||port<1||port>65535||!/^[A-Za-z0-9_]{3,16}$/.test(username))return ctx.reply("❌ Ma’lumot xato. Port 1–65535, username 3–16 belgi bo‘lsin.");
 if(configs.has(name))return ctx.reply("Bu nom mavjud.");
 configs.set(name,{host:p[2],port,username,version});
 ctx.reply(`✅ ${name} qo‘shildi: ${p[2]}:${port}\nEndi /connect ${name}`);
});
bot.command("servers",ctx=>{
 if(!onlyAdmin(ctx))return;
 ctx.reply(configs.size?[...configs].map(([n,c])=>`• ${n} — ${c.host}:${c.port} (${c.version||"auto"})`).join("\n"):"Server yo‘q. /addserver buyrug‘idan foydalaning.");
});
bot.command("connect",ctx=>{
 if(!onlyAdmin(ctx))return;
 const n=clean(ctx.message.text.trim().split(/\s+/)[1]); if(!n)return ctx.reply("Format: /connect nom");
 const err=connect(n); ctx.reply(err?"ℹ️ "+err:`🔄 ${n} serveriga ulanish boshlandi. /status bilan tekshiring.`);
});
bot.command("disconnect",ctx=>{
 if(!onlyAdmin(ctx))return;
 const n=clean(ctx.message.text.trim().split(/\s+/)[1]); if(!n)return ctx.reply("Format: /disconnect nom");
 ctx.reply(stop(n)?`⏹ ${n} serveridan uzildi.`:"Faol bot topilmadi.");
});
bot.command("status",ctx=>{
 if(!onlyAdmin(ctx))return;
 if(!configs.size)return ctx.reply("Server sozlanmagan.");
 ctx.reply([...configs.keys()].map(n=>{const s=sessions.get(n);return !s?`⚪ ${n}: ulanmagan`:s.client?.player?`🟢 ${n}: AFK\n⏱ ${duration(Date.now()-s.start)}`:`🟡 ${n}: ulanmoqda`;}).join("\n\n"));
});
bot.command("time",ctx=>{
 if(!onlyAdmin(ctx))return;
 const n=clean(ctx.message.text.trim().split(/\s+/)[1]),s=sessions.get(n);
 ctx.reply(s?.client?.player?`⏱ ${n}: ${duration(Date.now()-s.start)}`:"Bot serverga ulanmagan.");
});
bot.command("removeserver",ctx=>{
 if(!onlyAdmin(ctx))return;
 const n=clean(ctx.message.text.trim().split(/\s+/)[1]); if(!n)return ctx.reply("Format: /removeserver nom");
 stop(n); ctx.reply(configs.delete(n)?`🗑 ${n} o‘chirildi.`:"Server topilmadi.");
});
bot.catch((e,ctx)=>{console.error(e);ctx.reply("⚠️ Xatolik. Keyinroq urinib ko‘ring.").catch(()=>{});});
bot.launch().then(()=>console.log("ZERUX AFK bot ishga tushdi."));
const shutdown=()=>{for(const n of sessions.keys())stop(n);bot.stop("shutdown");};
process.once("SIGINT",shutdown);process.once("SIGTERM",shutdown);
