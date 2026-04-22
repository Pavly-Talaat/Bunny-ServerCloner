const { Plugin } = require("bunny");

module.exports = class ServerCloner extends Plugin {
    async start() {
        this.registerCommand();
        console.log("🔥 ServerCloner جاهز");
    }

    registerCommand() {
        this.commands?.add({
            name: "copy",
            execute: async (args, ctx) => {
                const [sourceId, targetId] = args;
                if (!sourceId || !targetId) return "⚠️ copy <source_id> <target_id>";

                const token = localStorage.getItem("token")?.replace(/"/g, "");
                const api = "https://discord.com/api/v9";

                const reply = async (msg) => {
                    await fetch(`${api}/channels/${ctx.channel.id}/messages`, {
                        method: "POST",
                        headers: { Authorization: token, "Content-Type": "application/json" },
                        body: JSON.stringify({ content: msg })
                    });
                };

                await reply("🔥 جاري النسخ...");

                try {
                    const source = await fetch(`${api}/guilds/${sourceId}`, { headers: { Authorization: token } }).then(r => r.json());
                    if (!source.id) return reply("❌ السيرفر المصدر غير موجود");

                    const roles = await fetch(`${api}/guilds/${sourceId}/roles`, { headers: { Authorization: token } }).then(r => r.json());
                    for (const role of roles) {
                        if (role.name === "@everyone") continue;
                        await fetch(`${api}/guilds/${targetId}/roles`, {
                            method: "POST",
                            headers: { Authorization: token, "Content-Type": "application/json" },
                            body: JSON.stringify({ name: role.name, color: role.color, permissions: role.permissions?.toString?.() || "0" })
                        });
                        await new Promise(r => setTimeout(r, 500));
                    }

                    const channels = await fetch(`${api}/guilds/${sourceId}/channels`, { headers: { Authorization: token } }).then(r => r.json());
                    for (const channel of channels) {
                        if (channel.type === 4) continue;
                        await fetch(`${api}/guilds/${targetId}/channels`, {
                            method: "POST",
                            headers: { Authorization: token, "Content-Type": "application/json" },
                            body: JSON.stringify({ name: channel.name, type: channel.type, topic: channel.topic || "" })
                        });
                        await new Promise(r => setTimeout(r, 500));
                    }

                    await reply(`✅ تم استنساخ ${source.name} بنجاح`);
                } catch (e) {
                    await reply(`❌ فشل: ${e.message}`);
                }
            }
        });
    }

    stop() {
        this.commands?.removeAll();
    }
};
