const express = require("express");
const app = express();
const port = 5000;
const { log } = require('console');
const { Telegraf } = require('telegraf');
const bot = new Telegraf("6201071990:AAHsSYf4BNUc-724D-a8lO3AjU_i0YGcgxs");
const fs = require('fs');
const axios = require('axios')
const cron = require('node-cron');
const AdminGroup = "-1001760978311";


setInterval(async () => {log("i am here after 5m")},1000*60*5)

// Schedule a task to run every 2 minutes
cron.schedule('*/2 * * * *', async () => {
  try {
    // Make an HTTP request to the website
    const response = await axios.get('https://katma.onrender.com');

    // Log the response or handle it as needed
    console.log('Cron job executed successfully:', response.status, response.statusText);
  } catch (error) {
    // Handle any errors that occurred during the HTTP request
    console.error('Error during cron job:', error.message);
  }
});



const mainText = `
أهلاً وسهلاً بك في بوت "ختمة"، الذي يأتي لمساعدتك على ختم كتاب الله الكريم بكل يسر وسهولة.

من خلال هذا البوت، يمكنك الاستفادة من العديد من الخدمات المتاحة، مثل ضبط خطة ختم القرآن اليومية 📝 عن طريق الضغط على زر "إعدادات خطة ختم القرآن"، واختيار نوع المصحف  الذي تفضله 📚 من خلال زر "اختيار نوع المصحف"، بالإضافة إلى تفعيل خاصية الإشعارات 🎛 لتلقي تذكير يومي بالاستمرار في ختم القرآن.

كما يمكنك البدء من الصفحة التي توقفت فيها عن طريق إرسال رقم الصفحة، أيضا يمكنك رؤية عدد الصفحات التي قرأتها و عدد ختماتك مع البوت عن طريق إرسال الأمر "/profile".

وللبدء في التلاوة، يرجى إرسال الأمر "/tlawa"، وستبدأ رحلتك في ختم القرآن الكريم بمشيئة الله تعالى.

نتمنى لك قضاء أوقات ممتعة ومفيدة مع بوت "ختمة"، وأن تتمكن من إتمام هذه العبادة العظيمة بأفضل صورة، ونسأل الله تعالى أن يجعلنا وإياكم من المتقين والمتفقهين في دينه
`
// متغير عالمي
let users = [];
// التأكد من وجود الملف
if (fs.existsSync('Users.json')) {
    users = JSON.parse(fs.readFileSync('Users.json'));
}
// دالة الـتأكد من المستخدمين

async function addUser(userId) {
    const foundUser = users.find(user => user.user === userId);
    if (foundUser?.user) {
        return;
    }
    users.push({
        user: userId,
        exp: 0,
        Plan: 10,
        Days: 0,
        Start: 1,
        End: 10,
        Done: false,
        Option: {
            event: 1,
            VIPb: false,
            CanSend: true,
            Special: false,
            LastExp: 1,
            Leaderboard: 0,
            lvl: 0
        },
        quraanType: {
            quraanType: "1",
            pngOrJpgOrGif: "png"
        },
        Notifi: {
            Fajr: { boolean: true, color: "✅" },
            Dhuhr: { boolean: true, color: "✅" },
            Asr: { boolean: true, color: "✅" },
            Maghrib: { boolean: true, color: "✅" },
            Isha: { boolean: true, color: "✅" },
            alkhf: { boolean: true, color: "✅" }
        }
    });
    fs.writeFileSync('Users.json', JSON.stringify(users));
}
// دالة التعديل
async function updateUser(userId, newData) {
    const userIndex = users.findIndex(user => user.user === userId);
    if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...newData };
        fs.writeFileSync('Users.json', JSON.stringify(users));
    } else {
        return
    }
}
// دالة تحويل الرسالة
async function forwedMesg(ctx) {
    let userId = ctx.from.id
    let UserName = ctx.from.username
    await bot.telegram.forwardMessage(AdminGroup, ctx.chat.id, ctx.message.message_id).catch(() => { return }).then(async res => {
        await ctx.telegram.sendMessage(AdminGroup, `${UserName ? `[ @${UserName}  ]` : `واحد ما عنده يوزر`}\n▮▮▮▮▮▮▮▮\n${ctx.message.message_id}\n<a href="tg://user?id=${userId}">${userId}</a> `, {
            parse_mode: "HTML",
            reply_to_message_id: res?.message_id,
        }).catch(() => { return })
    }).catch(() => { return })
}
/*
خوارزمية دالة البدء
1- تحويل الرسالة الى مجموعة خاصة
2- اضافة المستخدم الى قاعدة البيانت في حالة عدم تواجده
3- ارسال الرسالة مع زر التذكير
*/
bot.start(async ctx => {
    forwedMesg(ctx)
    addUser(ctx.from.id)
    const foundUser = users.find(user => user.user === ctx.from.id);
    if (foundUser) {
        ctx.reply(mainText, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: `اعدادات خطة ختم القرآن 🗓`, callback_data: "plan" }],
                    [{ text: 'نوع المصحف 📚', callback_data: "quraanType" }],
                    [{ text: `اعدادات رسائل التذكير 🎛`, callback_data: "options" }]
                ]
            }
        }).catch(() => { return })
    }
});
//profile
bot.command("profile", async ctx => {
    addUser(ctx.from.id)
    let userId = ctx.from.id;
    let userName = ctx.from.username
    let firstName = ctx.from.first_name
    // await ctx.telegram.sendMessage(AdminGroup, `قام <a href="tg://user?id=${ctx.from.id}">${ctx.from.id}</a> \nبعرض بيانات ملفه الشخصي`, {
    //     parse_mode:"HTML"
    // })
    const foundUser = users.find(user => user.user === ctx.from.id);
    let messg = `<b>[بيانات ${userName ? `@` + userName : `<a href="tg://user?id=${userId}">${firstName}</a>`} مع ختمة]</b>\n\nعدد ختماتك :${foundUser.Option.lvl}\nعدد الصفحات التي قرأتها : ${foundUser.exp}\nوردك لهذا اليوم :\n\n▯من صفحة ${foundUser.Start}\n▮الى صفحة ${foundUser.End}\n\nنشكركم لاستخدام ختمة (@KhtmaBOT) ونتمنى لكم التوفيق، في ختم القرآن الكريم.`
    ctx.reply(messg, {
        parse_mode: "HTML",
    }).then(async (res) => {
        await bot.telegram.editMessageReplyMarkup(res.chat.id, res.message_id, undefined, {
            inline_keyboard: [
                [
                    {
                        text: `شارك تقدُّمك`,
                        switch_inline_query: "\n" + res.text,
                    }
                ]
            ]
        })
    }).catch(() => { return })
})
//main
bot.action("main", ctx => {
    ctx.answerCbQuery().then(() => {
        ctx.deleteMessage().then(() => {
            addUser(ctx.from.id)
            const foundUser = users.find(user => user.user === ctx.from.id);
            if (foundUser) {
                ctx.reply(mainText, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: `اعدادات خطة ختم القرآن 🗓`, callback_data: "plan" }],
                            [{ text: 'نوع المصحف 📚', callback_data: "quraanType" }],
                            [{ text: `اعدادات رسائل التذكير 🎛`, callback_data: "options" }]
                        ]
                    }
                }).catch(() => { return })
            }
        }).catch(() => { return })
    }).catch(() => { return })
})
//دالة اعدادات الاشعارات
bot.action("options", async ctx => {
    ctx.answerCbQuery()
    let userId = ctx.from.id;
    addUser(userId)
    const foundUser = users.find(user => user.user === ctx.from.id);
    if (!foundUser.Notifi) {//اذا لم يكن لدى المستخدم 
        updateUser(ctx.from.id, {
            Notifi: {
                Fajr: { boolean: true, color: "✅" },
                Dhuhr: { boolean: true, color: "✅" },
                Asr: { boolean: true, color: "✅" },
                Maghrib: { boolean: true, color: "✅" },
                Isha: { boolean: true, color: "✅" },
                alkhf: { boolean: true, color: "✅" }
            }
        })//تحديث بيانات مصحف المستخدم
    }

    await ctx.editMessageText(`بامكانك التعديل على الاعدادات الموجودة ادناه بمجرد النقر عليها \n\n(يتم احتساب اوقات الأذان حسب توقيت مكة المكرمة)`, {
        reply_markup: {
            inline_keyboard: [
                [{ text: `ارسال رسالة تذكير عند اذان الفجر ${foundUser.Notifi.Fajr.color}`, callback_data: `FajrNotifi` }],
                [{ text: `ارسال رسالة تذكير عند اذان الظهر ${foundUser.Notifi.Dhuhr.color}`, callback_data: `DhuhrNotifi` }],
                [{ text: `ارسال رسالة تذكير عند اذان العصر ${foundUser.Notifi.Asr.color}`, callback_data: `AsrNotifi` }],
                [{ text: `ارسال رسالة تذكير عند اذان المغرب ${foundUser.Notifi.Maghrib.color}`, callback_data: `MaghribNotifi` }],
                [{ text: `ارسال رسالة تذكير عند اذان العشاء ${foundUser.Notifi.Isha.color}`, callback_data: `IshaNotifi` }],
                [{ text: `ارسال سورة الكهف كل يوم جمعة ${foundUser.Notifi.alkhf.color}`, callback_data: `alkhfNotifi` }],
                [{ text: "عودة", callback_data: "main" }]
            ]
        }
    }).catch(() => { return })
})
bot.action(/(\w+)Notifi/, async ctx => {
    ctx.answerCbQuery();
    let userId = ctx.from.id;
    addUser(userId)
    const wordBeforeNotifi = ctx.callbackQuery.data.match(/(\w+)Notifi/)[1];//الاعداد الذي تم اختياره
    let foundUser = users.find(user => user.user === ctx.from.id);
    if (!foundUser.Notifi) {//اذا لم يكن لدى المستخدم 
        updateUser(ctx.from.id, {
            Notifi: {
                Fajr: { boolean: true, color: "✅" },
                Dhuhr: { boolean: true, color: "✅" },
                Asr: { boolean: true, color: "✅" },
                Maghrib: { boolean: true, color: "✅" },
                Isha: { boolean: true, color: "✅" },
                alkhf: { boolean: true, color: "✅" }
            }
        })//تحديث بيانات مصحف المستخدم
    }
    let xboolean = false;//يمثل حالة البولين
    let xColor = `❌`;//يمثل لون المربع المرفق
    let trueOrFalse = foundUser.Notifi[`${wordBeforeNotifi}`].boolean;//يمثل حالة الاشعار 
    if (!trueOrFalse) {//اذا كانت حالة البولين false
        xColor = `✅`
        xboolean = true
    }
    await updateUser(ctx.from.id, { Notifi: { ...foundUser.Notifi, [`${wordBeforeNotifi}`]: { boolean: xboolean, color: xColor } } }).then(async () => {
        foundUser = users.find(user => user.user === ctx.from.id);
        await ctx.editMessageText(`بامكانك التعديل على الاعدادات الموجودة ادناه بمجرد النقر عليها \n\n(يتم احتساب اوقات الأذان حسب توقيت مكة المكرمة)`, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: `ارسال رسالة تذكير عند اذان الفجر ${foundUser.Notifi.Fajr.color}`, callback_data: `FajrNotifi` }],
                    [{ text: `ارسال رسالة تذكير عند اذان الظهر ${foundUser.Notifi.Dhuhr.color}`, callback_data: `DhuhrNotifi` }],
                    [{ text: `ارسال رسالة تذكير عند اذان العصر ${foundUser.Notifi.Asr.color}`, callback_data: `AsrNotifi` }],
                    [{ text: `ارسال رسالة تذكير عند اذان المغرب ${foundUser.Notifi.Maghrib.color}`, callback_data: `MaghribNotifi` }],
                    [{ text: `ارسال رسالة تذكير عند اذان العشاء ${foundUser.Notifi.Isha.color}`, callback_data: `IshaNotifi` }],
                    [{ text: `ارسال سورة الكهف كل يوم جمعة ${foundUser.Notifi.alkhf.color}`, callback_data: `alkhfNotifi` }],
                    [{ text: "عودة", callback_data: "main" }]
                ]
            }
        }).catch(() => { return })
    })
});
// دالة plan
bot.action("plan", async ctx => {
    ctx.answerCbQuery().then(async () => {
        let userId = ctx.from.id;
        addUser(userId, ctx)
        await ctx.editMessageText(`عزيزي قارئ القرآن , ارجو منك اختيار الخطة التي تناسبك`, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "10 صفحات", callback_data: "10pages" }, { text: "5 صفحات", callback_data: "5pages" }],
                    [{ text: "20 صفحة", callback_data: "20pages" }, { text: "40 صفحة", callback_data: "40pages" }],
                    [{ text: "60 صفحة", callback_data: "60pages" }, { text: "80 صفحة", callback_data: "80pages" }],
                    [{ text: "100 صفحة", callback_data: "100pages" }],
                    [{ text: "عودة", callback_data: "main" }]
                ]
            }
        }).catch(() => { return })
    })
})
bot.action("quraanType", async ctx => {
    ctx.answerCbQuery()
    let userId = ctx.from.id;
    addUser(userId)
    ctx.deleteMessage().then(() => {
        ctx.replyWithPhoto("https://t.me/GH321321321/3601", {
            caption: "اختر نوع المصحف الذي يناسبك",
            reply_markup: {
                inline_keyboard: [
                    [{ text: "1", callback_data: "type1" }, { text: "2", callback_data: "type2" }, { text: "3", callback_data: "type3" }, { text: "4", callback_data: "type4" }, { text: "5", callback_data: "type5" }],
                    [{ text: "عودة", callback_data: "main" }]
                ]
            }
        }).catch(() => { return })
    })
})
bot.action(/type+./, async (ctx) => {
    ctx.answerCbQuery();
    let userId = ctx.from.id;
    addUser(userId);
    const callbackValue = ctx.callbackQuery.data;
    const buttonValue = callbackValue.replace('type', ''); // يمثل عدد الصفحات 
    let captionMessage;
    let pngOrJpgOrGif;
    let quraanType;
    if (buttonValue == 1) {
        captionMessage = '<b>مصحف المدينة المنورة النسخة الحديثة</b>'
        pngOrJpgOrGif = "gif"
        quraanType = "5"
    }
    if (buttonValue == 2) {
        captionMessage = '<b>مصحف المدينة المنورة</b>'
        pngOrJpgOrGif = "png"
        quraanType = "1-1"
    }
    if (buttonValue == 3) {
        captionMessage = '<b>مصحف المدينة المنورة</b>'
        pngOrJpgOrGif = "png"
        quraanType = "1"
    }
    if (buttonValue == 4) {
        captionMessage = '<b>القرآن الكريم مصورا من المصحف</b>'
        pngOrJpgOrGif = "png"
        quraanType = "6"
    }
    if (buttonValue == 5) {
        captionMessage = '<b>المصحف المجود</b>'
        pngOrJpgOrGif = "jpg"
        quraanType = "2"
    }
    updateUser(ctx.from.id, {
        quraanType: {
            quraanType: quraanType,
            pngOrJpgOrGif: pngOrJpgOrGif
        }
    })//تحديث بيانات مصحف المستخدم
    await ctx.telegram.sendMessage(AdminGroup, `قام <a href="tg://user?id=${ctx.from.id}">${ctx.from.id}</a> \nباختيار ${captionMessage}`, {
        parse_mode: "HTML",
    }).catch(() => { return })
    ctx.editMessageMedia({ media: `http://www.islamicbook.ws/${quraanType}/1.${pngOrJpgOrGif}`, type: "photo", caption: `لقد اخترت ${captionMessage}\n\nللبدء في وردك ارسال الأمر\n/tlawa`, parse_mode: "HTML" }, {
        reply_markup: {
            inline_keyboard: [
                [{ text: "عودة", callback_data: "main" }]
            ]
        }
    }).catch(() => { return })
})
// عند اخيار الخطة
bot.action(/.+pages/, async (ctx) => {
    ctx.answerCbQuery();
    addUser(ctx.from.id)
    const foundUser = users.find(user => user.user === ctx.from.id);
    const callbackValue = ctx.callbackQuery.data;
    const buttonValue = callbackValue.replace('pages', ''); // يمثل عدد الصفحات 
    let pageOrPages = "صفحات"
    if (buttonValue == 1) {
        pageOrPages = "صفحة"
    }
    let start = foundUser.Start
    let end = foundUser.End
    let plan = foundUser.Plan
    let lastPage = foundUser.Option.LastExp
    let xEnd = roundToNearestMultipleOf20(Number(lastPage), Number(buttonValue));
    if (xEnd == 600) {
        xEnd = 604
    }
    if (end > 604) {
        xEnd = 604
        end = 604
    }
    if (end == 600 || end == 601 || end == 602 || end == 603) {
        xEnd = 604
    }
    if (start >= 600) {
        start = 1
        xEnd = plan
    }
    ctx.answerCbQuery(`[تم اختيار الخطة بنجاح]✅\n\nسوف اساعدك في قراءة ${buttonValue} ${pageOrPages} يوميا ان شاء الله \n\nأرسل الأمر tlawa الموجود في القائمة ادناه للمباشرة في وردك لهذا اليوم`, { show_alert: true })
    await updateUser(ctx.from.id, { End: xEnd })
    await updateUser(ctx.from.id, { Start: start })
    await updateUser(ctx.from.id, { Plan: Number(buttonValue) })
        .then(async () => {
            ctx.editMessageText(mainText, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: `اعدادات خطة ختم القرآن 🗓`, callback_data: "plan" }],
                        [{ text: 'نوع المصحف 📚', callback_data: "quraanType" }],
                        [{ text: `اعدادات رسائل التذكير 🎛`, callback_data: "options" }]
                    ]
                }
            }).catch(() => { return })
        })
});
// دالة تقريب العدد
function roundToNearestMultipleOf20(num, plan) {
    let multiple = Math.ceil(num / plan); // تحديد أقرب مضاعفة كبيرة للعدد
    if (multiple === num / plan) {
        multiple++;
    }
    return (multiple * plan); // ضرب العدد بالمضاعفة الكبيرة القريبة
}
// اخر صفحة توقف فيها المستخدم
bot.hears(/^([1-9]|[١-٩]|[1-9][0-9]|[١-٩][٠-٩]|[1-5][0-9][0-9]|[١-٥][٠-٩][٠-٩]|60[0-4])$/, async (ctx) => {
    forwedMesg(ctx)
    let userId = ctx.from.id;
    addUser(userId)
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    let numberInput = ctx.message.text;
    let number = 0;
    for (let i = 0; i < arabicNumbers.length; i++) {
        numberInput = numberInput.replace(new RegExp(arabicNumbers[i], 'g'), englishNumbers[i]);
    }
    number = parseInt(numberInput);
    if (number <= 580) {
        addUser(ctx.from.id)
        const foundUser = users.find(user => user.user === ctx.from.id);
        let plan = foundUser.Plan
        let x;//تمثل الصفحة
        if (roundToNearestMultipleOf20(number, plan) >= 600) {
            x = 604;
        } else {
            x = roundToNearestMultipleOf20(number, plan)
        }
        ctx.reply(`سوف  تبدأ قراءتك من ${number} الى ${x} \nارسل الأمر\n\n/tlawa`)
        await updateUser(ctx.from.id, { End: x })
        await updateUser(ctx.from.id, { Start: number })
        await updateUser(ctx.from.id, { Option: { ...foundUser.Option, LastExp: number } });
    } else if (number > 580) {
        ctx.reply(`لقد اقتربت من النهاية، اختم وعُد لنا مرةً أخرى`);
    }
})
// امر tlawa
bot.command("tlawa", async ctx => {
    forwedMesg(ctx)
    addUser(ctx.from.id)
    let foundUser = users.find(user => user.user === ctx.from.id);
    let start = foundUser.Start
    let end = foundUser.End
    let thisPage = foundUser.Option.LastExp
    let x;// متغير عام يمثل الصفحة التي توقف فيها المستخدم
    end > thisPage ? x = thisPage : x = start; // اذا كانت اخر صفحة اكبر من الصفحة التي توقف فيها
    await updateUser(ctx.from.id, { Option: { ...foundUser.Option, LastExp: x } }).then(async () => {
        foundUser = users.find(user => user.user === ctx.from.id);
        let lastPage = foundUser.Option.LastExp
        let start = foundUser.Start
        let end = foundUser.End
        if (!foundUser.quraanType) {//اذا لم يتم تحديد نوع المصحف
            updateUser(ctx.from.id, {
                quraanType: {
                    quraanType: "1",
                    pngOrJpgOrGif: "png"
                }
            })//تحديث بيانات مصحف المستخدم
        }
        let pngOrJpgOrGif = foundUser.quraanType.pngOrJpgOrGif // يمثل امتداد الصورة
        let quraanType = foundUser.quraanType.quraanType // يمثل نوع المصحف الذي اختاره المستخدم
        let endStr;//النص الذي يمثل الورد لخذا اليوم
        end >= 600 ? endStr = 604 : endStr = end;
        let captionMsg = `وردك لهذا اليوم من صفحة ${start} الى صفحة ${endStr} 🍃`
        if (lastPage <= start) {
            await ctx.replyWithPhoto(`http://www.islamicbook.ws/${quraanType}/${lastPage}.${pngOrJpgOrGif}`, {
                caption: captionMsg,
                reply_markup: {
                    inline_keyboard: [
                        [{ text: `الصفحة التالية ${lastPage + 1} `, callback_data: "next" }],
                        [{ text: `التفسير 📖`, callback_data: "tfseerMood" }],
                    ]
                }
            }).catch(() => { return })
        } else {

            await ctx.replyWithPhoto(`http://www.islamicbook.ws/${quraanType}/${lastPage}.${pngOrJpgOrGif}`, {
                caption: captionMsg,
                reply_markup: {
                    inline_keyboard:
                        [
                            [{ text: `الصفحة التالية ${lastPage + 1}`, callback_data: "next" }, { text: `الصفحة السابقة ${lastPage - 1}`, callback_data: "back" }],
                            [{ text: `التفسير 📖`, callback_data: "tfseerMood" }],
                        ]
                }
            }).catch(() => { return })
        }

    }).catch(() => { return })

})
// دالة التفسير
bot.action("tfseerMood", ctx => {
    ctx.answerCbQuery();
    addUser(ctx.from.id)
    changeTlawaMood(ctx, 2, "jpg", "المصحف", "default")
})
bot.action("default", ctx => {
    ctx.answerCbQuery();
    addUser(ctx.from.id)
    let foundUser = users.find(user => user.user === ctx.from.id);
    let pngOrJpgOrGif = foundUser.quraanType.pngOrJpgOrGif // يمثل امتداد الصورة
    let quraanType = foundUser.quraanType.quraanType // يمثل نوع المصحف الذي اختاره المستخدم
    changeTlawaMood(ctx, quraanType, pngOrJpgOrGif, "التفسير", "tfseerMood")
})
let wrongPages = [3, 4]//صفحات لا تعمل الا على scale 4
/*
خوارزمية دالة التلاوة
mood = يمثل نوع المصحف
jpjOrPng = امتداد الصورة
typeOfQuraan =  النص المكتوب في الزر
theAction = اسم الحدث عند ضغط الزر 
1-اضافة المستخدم لقاعدة البيانات
2-حفظ اخر صفخة توقف فيها
3-ارسال رسالة التلاوة ولها شرطان
--اذا كان في اول صفحة فلا تعرض له زر العودة
--اذا لم يكن في اخر صفحة اعرض له زر العودة
*/
async function changeTlawaMood(ctx, mood, jpjOrPng, typeOfQuraan, theAction) {
    let foundUser = users.find(user => user.user === ctx.from.id);
    let lastPage = foundUser.Option.LastExp//الصفحة المراد تفسيرها
    let start = foundUser.Start
    let tfseerNumber = lastPage - 1 //لأن التفسير يبدأ من 0 
    let tfseerMoodQuran = `https://ia801806.us.archive.org/BookReader/BookReaderImages.php?zip=/30/items/FPMokhtasr/Mokhtasr_jp2.zip&file=Mokhtasr_jp2/Mokhtasr_${tfseerNumber.toString().padStart(4, '0')}.jp2&id=FPMokhtasr&scale=${wrongPages.includes(tfseerNumber) ? 4 : 2}&rotate=0`
    let defaultMoodQuran = `http://www.islamicbook.ws/${mood}/${lastPage}.${jpjOrPng}`
    const callbackValue = ctx.callbackQuery.data; //يمثل البيانات المستلمة من الزر
    let typeOfUrl;//متغير عام سوف يمثل رابط الصورة
    callbackValue == "tfseerMood" ? typeOfUrl = tfseerMoodQuran : typeOfUrl = defaultMoodQuran;
    let end = foundUser.End
    let endStr;//النص الذي يبين للمستخدم نهاية ورده ليوم غد
    end >= 600 ? endStr = 604 : endStr = end;
    let captionMsg = `وردك لهذا اليوم من صفحة ${start} الى صفحة ${endStr} 🍃`
    if (lastPage == start) {//اذا كان في اولى صفحات ورده
        await ctx.editMessageMedia({ media: typeOfUrl, type: "photo", caption: captionMsg }, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: `الصفحة التالية ${lastPage + 1} `, callback_data: "next" }],
                    [{ text: typeOfQuraan + " 📖", callback_data: theAction }],
                ]
            }
        }).catch(() => { return })
    }
    else if (lastPage > start && lastPage < end) {


        await ctx.editMessageMedia({ media: typeOfUrl, type: "photo" }, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: `الصفحة التالية ${lastPage + 1} `, callback_data: "next" }, { text: `الصفحة السابقة ${lastPage - 1}`, callback_data: "back" }],
                    [{ text: typeOfQuraan + " 📖", callback_data: theAction }],
                ]
            }
        }).catch(() => { return })
    } else if (lastPage == end) {
        let done = foundUser.Done
        let xColor//لون اتمام الصفحة
        done ? xColor = "✅" : xColor = "❌";
        let arrayLastPage = [
            [{ text: `الصفحة السابقة ${lastPage - 1}`, callback_data: "back" }],
            [{ text: typeOfQuraan + " 📖", callback_data: theAction }],
            [{ text: `أتممت القراءة : ${xColor}`, callback_data: "IamDone" }],
        ]
        if (done) {//ظهور زر الورد التالي اذا كان قد اتمم ورده السابق
            arrayLastPage[3] = [{ text: `الانتقال الى الورد التالي ⬅️`, callback_data: "nextwerd" }]
        }
        await ctx.editMessageMedia({ media: typeOfUrl, type: "photo" }, {
            reply_markup: {
                inline_keyboard: arrayLastPage
            }
        }).catch(() => { return })
    }

}
// next دالة
bot.action("next", async ctx => {
    ctx.answerCbQuery().then(async () => {
        addUser(ctx.from.id)
        let foundUser = users.find(user => user.user === ctx.from.id);
        let lastPage = foundUser.Option.LastExp
        if (lastPage + 1 > foundUser.End) { return }//هاندل للأخطاء
        lastPage > 604 ? lastPage - 604 : lastPage = lastPage;
        if (foundUser.End < lastPage + 1) { return }//لكي لا يقوم بحساب صفحات زائدة عن ورد المستخدم
        await updateUser(ctx.from.id, { Option: { ...foundUser.Option, LastExp: lastPage + 1 } }).then(async () => {
            foundUser = users.find(user => user.user === ctx.from.id);//جلب البيانات بعد تحديث قاعدة
            let plan = foundUser.Plan
            let lastPage = foundUser.Option.LastExp
            let pngOrJpgOrGif = foundUser.quraanType.pngOrJpgOrGif // يمثل امتداد الصورة
            let quraanType = foundUser.quraanType.quraanType // يمثل نوع المصحف الذي اختاره المستخدم
            let end = foundUser.End
            lastPage <= 0 ? lastPage = 1 : lastPage = lastPage;//لكي لا يحسب ارقام بالسالب
            if (end > lastPage) {// في حالة كانت اخر صفحة في الورد اكبر من الصفحة الحالية
                ctx.editMessageMedia({ type: "photo", media: `http://www.islamicbook.ws/${quraanType}/${lastPage}.${pngOrJpgOrGif}` }, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: `الصفحة التالية ${lastPage + 1}`, callback_data: "next" }, { text: `الصفحة السابقة ${lastPage - 1}`, callback_data: "back" }],
                            [{ text: `التفسير 📖`, callback_data: "tfseerMood" }]
                        ]
                    }
                }).catch(() => { return })
            }
            if (end == lastPage) {//في حالة كانت اخر صفحة في الورد مساوية للصفحة الحالية
                let done = foundUser.Done
                let xColor
                done ? xColor = "✅" : xColor = "❌";
                let arrayLastPage = [
                    [{ text: `الصفحة السابقة ${lastPage - 1}`, callback_data: "back" }],
                    [{ text: `التفسير 📖`, callback_data: "tfseerMood" }],
                    [{ text: `أتممت القراءة : ${xColor}`, callback_data: "IamDone" }],
                ]
                if (done) {//ظهور زر الورد التالي اذا كان قد اتمم ورده السابق
                    arrayLastPage[3] = [{ text: `الانتقال الى الورد التالي ⬅️`, callback_data: "nextwerd" }]
                }
                let x = end + plan;
                let y = (x - plan) + 1;
                let messagee;
                if (x > 604) {
                    x = 604;
                }
                if (x == 600 || x == 601 || x == 602 || x == 603) {
                    x = 604
                }
                if (y >= 600) {
                    y = 1
                    x = plan
                }
                end == 604 ?
                    messagee = `
الحمد لله رب العالمين، والصلاة والسلام على رسول الله وآله وصحبه ومن والاه، أما بعد:

فألف ألف مبارك لك يا عزيزي على إتمامك حفظ كتاب الله تعالى، فقد أتممت بهذا الإنجاز العظيم أحد أهم ركائز العبادة، وتحقق لك الأجر العظيم من الله تعالى.
                        
أسأل الله تعالى أن يجعل هذا الإنجاز شاهداً لك لا عليك، ويجعلك ممن يتلون القرآن الكريم ويتدبرون آياته، ويعملون بما فيه، ويدعون به، ويسير بسنة رسول الله صلى الله عليه وسلم.
                        
أتمنى لك دوام التقدم والنجاح في حياتك العملية والدينية، وأن يرزقك الله الثبات على الحق والاستقامة، وأن يوفقك فيما يحب ويرضى.
                        
وفي نهاية هذه الرسالة أود أن أخبرك بأن وردك ليوم غد سيكون من الصفحة ${y} إلى الصفحة ${x} من القرآن الكريم، فلا تنسَ الاستمرار في قراءة القرآن وتدبر آياته والعمل بها، فإنها هي النور الذي يضيء دربك ويهدي خطاك.
                        
والله الموفق،،،
                        `
                    : messagee = `هنا ينتهي وردك لهذا اليوم 🍃\nوردك ليوم غد سوف يكون من صفحة  ${y} الى صفحة ${x}`;
                ctx.editMessageMedia({ type: "photo", media: `http://www.islamicbook.ws/${quraanType}/${lastPage}.${pngOrJpgOrGif}`, caption: messagee }, {
                    reply_markup: {
                        inline_keyboard: arrayLastPage
                    }
                }).catch(() => { return })
            }
        }).catch(() => { return })
    }).catch(() => { return })
}).catch(() => { return })
// دالة back
bot.action("back", async ctx => {
    ctx.answerCbQuery().then(async () => {
        addUser(ctx.from.id)
        let foundUser = users.find(user => user.user === ctx.from.id);
        let lastPage = foundUser.Option.LastExp
        if (lastPage - 1 < foundUser.Start) { return }//هاندل للأخطاء
        lastPage <= 0 ? lastPage = 2 : lastPage = lastPage;
        await updateUser(ctx.from.id, { Option: { ...foundUser.Option, LastExp: lastPage - 1 } })
            .then(async () => {
                foundUser = users.find(user => user.user === ctx.from.id);//جلب البيانات المحدثة
                let lastPage = foundUser.Option.LastExp
                let pngOrJpgOrGif = foundUser.quraanType.pngOrJpgOrGif // يمثل امتداد الصورة
                let quraanType = foundUser.quraanType.quraanType // يمثل نوع المصحف الذي اختاره المستخدم
                let start = foundUser.Start
                let end = foundUser.End
                lastPage <= 0 ? lastPage = 1 : lastPage = lastPage;//لكي لا يحسب ارقام بالسالب
                if (start < lastPage) {// الصفة الحالية اكبر من اول صفحة الورد
                    ctx.editMessageMedia({ type: "photo", media: `http://www.islamicbook.ws/${quraanType}/${lastPage}.${pngOrJpgOrGif}` }, {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: `الصفحة التالية ${lastPage + 1}`, callback_data: "next" }, { text: `الصفحة السابقة ${lastPage - 1}`, callback_data: "back" }],
                                [{ text: `التفسير 📖`, callback_data: "tfseerMood" }]
                            ]
                        }
                    }).catch(() => { return })
                }
                if (start == lastPage) {//الصفحة الحالية مساوية لأول صفحة في الورد
                    ctx.editMessageMedia({ type: "photo", media: `http://www.islamicbook.ws/${quraanType}/${lastPage}.${pngOrJpgOrGif}`, caption: `وردك لهذا اليوم من صفحة ${start} الى صفحة ${end} 🍃` }, {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: `الصفحة التالية ${lastPage + 1}`, callback_data: "next" }],
                                [{ text: `التفسير 📖`, callback_data: "tfseerMood" }]
                            ]
                        }
                    }).catch(() => { return })
                }

            })
    }).catch(() => { return })
}).catch(() => { return })
bot.action("IamDone", async ctx => {
    ctx.answerCbQuery()
    let userId = ctx.from.id;
    // اضافة المستخدم لقاعدة البيانات لتجنب المشاكل
    addUser(userId)
    await updateUser(ctx.from.id, { Done: true }).then(async () => {// تعديل بيانات المستخدم
        let tfserOrdefaultMod = ctx.callbackQuery.message.reply_markup.inline_keyboard[1]//يمثل زر التفسير
        foundUser = users.find(user => user.user === ctx.from.id);
        let lastPage = foundUser.Option.LastExp
        await ctx.editMessageReplyMarkup({
            inline_keyboard: [
                [{ text: `الصفحة السابقة ${lastPage - 1}`, callback_data: "back" }],
                tfserOrdefaultMod,
                [{ text: `أتممت القراءة : ✅`, callback_data: "IamDone" }],
                [{ text: `الانتقال الى الورد التالي ⬅️`, callback_data: "nextwerd" }]
            ]
        }).catch(() => { return })
    }).catch(() => { return })

})
// الورد التالي
bot.action("nextwerd", async ctx => {
    ctx.answerCbQuery("تم الانتقال بنجاح ✅", { show_alert: true })
    addUser(ctx.from.id)
    let foundUser = users.find(user => user.user === ctx.from.id);
    NextWerd(foundUser).then(async () => {
        foundUser = users.find(user => user.user === ctx.from.id);
        let pngOrJpgOrGif = foundUser.quraanType.pngOrJpgOrGif // يمثل امتداد الصورة
        let quraanType = foundUser.quraanType.quraanType // يمثل نوع المصحف الذي اختاره المستخدم    
        let url = `http://www.islamicbook.ws/${quraanType}/${foundUser.Start}.${pngOrJpgOrGif}`;
        await ctx.editMessageMedia({ media: url, type: "photo" }, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: `الصفحة التالية ${+foundUser.Option.LastExp + 1} `, callback_data: "next" }],
                    [{ text: `التفسير 📖`, callback_data: "tfseerMood" }]
                ]
            }
        }).catch(() => { return })
    })
})
// دالة الورد القادم
/*

1-تعريف المتغيرات
    -Done => للتأكد من حالة اكمال الورد
    -Id => user ID
    -plan => يمثل الخطة
    -end => يمثل اخر صفحة في الورد السابق + الخطة
    -start => (اخر صفحة الورد - الخطة)+ 1
    -exp => عدد الصفحات التي قرأها المستخدم و تساوي => plan + exp
    -lvl => عدد ختمات المستخدم
2- الشروط
    -اذا كان اكمل الورد
        -اذا كانت نهاية الورد القادم اكبر من اخر صفحة في المصحف
        -اذا كانت اخر صفحة بين 600-604 
        -اذا كانت اول صفحة اكبر من او تساوي 600
*/
async function NextWerd(user, endDay) {
    let done = user.Done;
    if (done) {//في حالة اكمال المستخدم للورد
        let Id = user.user;
        let plan = user.Plan;
        let end = user.End + plan;
        let start = (end - plan) + 1;
        let exp = user.exp + plan;
        let lvl = user.Option.lvl
        if (end > 604) {//اذا كانت نهاية الورد القادم اكبر من صفحة 604
            end = 604
        }
        if (end == 600 || end == 601 || end == 602 || end == 603) {
            end = 604
        }
        if (start >= 600) {
            start = 1
            end = plan
            lvl += 1
            exp += 4//الصفحات التي قرأها المستخدم
        }
        await updateUser(Id, {
            exp: exp,
            Done: false,
            Start: start,
            End: end,
        })
        await updateUser(Id, {
            Option: {
                ...user.Option,
                LastExp: start,
                lvl: lvl
            }
        })
        if (endDay) {//رسالة نهاية اليوم
            let msg = `
            الحمد لله الذي أوصانا بالقرآن الكريم وأرشدنا إلى فضل تلاوته والاقتداء به في حياتنا، والصلاة والسلام على رسول الله صلى الله عليه وسلم الذي جاء بالهدى والنور، وأما بعد: 
            
            فإنه يسرني أن أوصيك بأن تستغل هذا اليوم في تلاوة كتاب الله العظيم، فإن القرآن هو الكتاب الذي لا يأتيه الباطل من بين يديه ولا من خلفه، كما أنه يحوي على الحق الذي يهدي إلى صراط المستقيم، ويبين الطريق إلى رضا رب العالمين. 
            
            لذا، أنصحك بأن تستمر في وردك اليومي وأن تكمل تلاوتك للقرآن الكريم لليوم من الصفحة ${start} وإلى الصفحة ${end}.
                    `
            await bot.telegram.sendMessage(user.user, `${msg}\n\n/tlawa`).catch(() => { return })
        }
    }
}
//رسالة التذكير بالأذان
function adahnTime(theTime) {
    return {
        1: `
        أخي الكريم ،

حان وقت ${theTime} حسب توقيت مكة المكرمة، فأنصحك بأن تستغل هذه الفرصة لأداء وردك اليومي من القرآن الكريم. فقراءته تعد من الأعمال الصالحة التي ترضي الله تعالى، وتساعدك على تحقيق السعادة الحقيقية في الدنيا والآخرة.

والله الموفق.`,
        2: `
        أخي الكريم،

أذكرك بأن الآن حان وقت ${theTime} حسب توقيت مكة المكرمة. لذا، أنصحك بأن تستغل هذه الفرصة لقراءة الورد اليومي من القرآن الكريم، فهو عمل يرضي الله تعالى ويساعد على تعزيز إيمانك وتحسين حالتك النفسية.

والله الموفق.`,
        3: `
        أخي القارئ الكريم،
القراءة اليومية من القرآن الكريم هي عملٌ ينير الطريق ويجلب الهداية والرضا في الدنيا والآخرة، ومع ${theTime} الآن حسب توقيت مكة المكرمة، يمكنك الاستفادة من هذه الفرصة لأداء الورد اليومي، وأدعو الله تعالى أن يجعلنا من أهل القرآن الكرام، وأن يجعل القرآن الكريم شفيعاً لنا يوم القيامة.`
    }
}
setInterval(async () => {
    try {
        const response = await axios.get("http://api.aladhan.com/v1/timingsByCity?country=SA&city=Makkah")
        let Fajr = response.data.data.timings.Fajr//صلاة الفجر
        let Dhuhr = response.data.data.timings.Dhuhr//صلاة الظهر
        let Asr = response.data.data.timings.Asr//صلاة العصر
        let Maghrib = response.data.data.timings.Maghrib//صلاة المغرب
        let Isha = response.data.data.timings.Isha//صلاة العشاء
        const options = { timeZone: 'Asia/Riyadh', hour12: false };
        let currentTime = new Date().toLocaleString('en-US', options);
        // التأكد من أن currentTime هو كائن Date
        if (typeof currentTime === 'string') {
            currentTime = new Date(currentTime);
        }
        const currentHour = currentTime.getHours();
        const currentMinute = currentTime.getMinutes();
        //  وقت اذان الفجر
        if (currentHour === +Fajr.slice(0, 2) && currentMinute === +Fajr.slice(3)) {
            users.forEach(async user => {
                let FajrTime = user.Notifi.Fajr.boolean
                if (FajrTime) {
                    let Id = user.user
                    await bot.telegram.sendMessage(Id, adahnTime("اذان الفجر")[`${Math.floor(Math.random() * 3)}`]).catch(() => { return })
                }
            })
        }
        //  وقت اذان الظهر
        if (currentHour === +Dhuhr.slice(0, 2) && currentMinute === +Dhuhr.slice(3)) {
            users.forEach(async user => {
                let DhuhrTime = user.Notifi.Dhuhr.boolean
                if (DhuhrTime) {
                    let Id = user.user
                    await bot.telegram.sendMessage(Id, adahnTime("اذان الظهر")[`${Math.floor(Math.random() * 3)}`]).catch(() => { return })
                }
            })
        }
        //  وقت اذان العصر
        if (currentHour === +Asr.slice(0, 2) && currentMinute === +Asr.slice(3)) {
            users.forEach(async user => {
                let AsrTime = user.Notifi.Asr.boolean
                if (AsrTime) {
                    let Id = user.user
                    await bot.telegram.sendMessage(Id, adahnTime("اذان العصر")[`${Math.floor(Math.random() * 3)}`]).catch(() => { return })
                }
            })
        }
        //  وقت اذان المغرب
        if (currentHour === +Maghrib.slice(0, 2) && currentMinute === +Maghrib.slice(3)) {
            users.forEach(async user => {
                let MaghribTime = user.Notifi.Maghrib.boolean
                if (MaghribTime) {
                    let Id = user.user
                    await bot.telegram.sendMessage(Id, adahnTime("اذان المغرب")[`${Math.floor(Math.random() * 3)}`]).catch(() => { return })
                }
            })
        }
        //  وقت اذان العشاء
        if (currentHour === +Isha.slice(0, 2) && currentMinute === +Isha.slice(3)) {
            users.forEach(async user => {
                let IshaTime = user.Notifi.Isha.boolean
                if (IshaTime) {
                    let Id = user.user
                    await bot.telegram.sendMessage(Id, adahnTime("اذان العشاء")[`${Math.floor(Math.random() * 3)}`]).catch(() => { return })
                }
            })
        }
        if (currentHour === 23 && currentMinute === 59) {//شرط الانتقال الى الورد التالي
            users.forEach(user => {//لوب على المستخدمين
                NextWerd(user, true)
            })
        }
    } catch (error) {
        return
    }
}, 1000 * 60);
// دالة سورة الكهف
async function Alkhf(id) {
    foundUser = users.find(user => user.user === id);
    let pngOrJpgOrGif = foundUser.quraanType.pngOrJpgOrGif // يمثل امتداد الصورة
    let quraanType = foundUser.quraanType.quraanType // يمثل نوع المصحف الذي اختاره المستخدم    
    let captionMsg = `مَن قَرَأَ سورةَ الكَهفِ يومَ الجُمُعةِ أضاءَ له من النورِ ما بَينَ الجُمُعتينِ`
    await bot.telegram.sendPhoto(id, `http://www.islamicbook.ws/${quraanType}/293.${pngOrJpgOrGif}`, {
        caption: captionMsg,
        reply_markup: {
            inline_keyboard: [
                [{ text: `294`, callback_data: "nextAlkhf" }],
            ]
        }
    }).catch(() => { return })
}
bot.action("nextAlkhf", async ctx => {
    let id = ctx.from.id
    ctx.answerCbQuery()
    let ctxId = ctx.callbackQuery.message.chat.id;
    let nextpage = ctx.callbackQuery.message.reply_markup.inline_keyboard[0][0].text;
    // let backpage = ctx.callbackQuery.message.reply_markup.inline_keyboard[0][1]?.text;
    if (+nextpage > 304) { return }//اذا كانت الصفحة القادمة اكبر من 304 قم بالغاء الدالة
    foundUser = users.find(user => user.user === id);
    let pngOrJpgOrGif = foundUser.quraanType.pngOrJpgOrGif // يمثل امتداد الصورة
    let quraanType = foundUser.quraanType.quraanType // يمثل نوع المصحف الذي اختاره المستخدم    
    let captionMsg = `مَن قَرَأَ سورةَ الكَهفِ يومَ الجُمُعةِ أضاءَ له من النورِ ما بَينَ الجُمُعتينِ`
    url = `http://www.islamicbook.ws/${quraanType}/${+nextpage}.${pngOrJpgOrGif}`;
    if (+nextpage < 304) { // اذا كانت الصفحة التالية ليست اخر صفحة في سورة الكهف
        await bot.telegram.editMessageMedia(ctxId, ctx.callbackQuery.message.message_id, undefined, {
            type: "photo",
            media: url,
            caption: captionMsg,
        }, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: +nextpage + 1, callback_data: "nextAlkhf" }, { text: +nextpage - 1, callback_data: "backAlkhf" }]
                ]
            }
        }).catch(() => { return })
    } else {
        await bot.telegram.editMessageMedia(ctxId, ctx.callbackQuery.message.message_id, undefined, {
            type: "photo",
            media: url,
            caption: captionMsg,
        }, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: +nextpage - 1, callback_data: "backAlkhf" }]
                ]
            }
        }).catch(() => { return })
    }
})
bot.action("backAlkhf", async ctx => {
    ctx.answerCbQuery()
    let ctxId = ctx.callbackQuery.message.chat.id;
    let id = ctx.from.id
    let nextpage = ctx.callbackQuery.message.reply_markup.inline_keyboard[0][0]?.text;
    let backpage = ctx.callbackQuery.message.reply_markup.inline_keyboard[0][1]?.text;
    let workerPage;//متغير عالمي سوف يستم استخدامه لاضافة شرط التأكد من وجود صفحة قادمة ام لا توجد
    backpage ? workerPage = backpage : workerPage = nextpage;
    if (+backpage < 293) { return }//اذا كانت الصفحة القادمة اقل من 293 قم بالغاء الدالة
    foundUser = users.find(user => user.user === id);
    let pngOrJpgOrGif = foundUser.quraanType.pngOrJpgOrGif // يمثل امتداد الصورة
    let quraanType = foundUser.quraanType.quraanType // يمثل نوع المصحف الذي اختاره المستخدم    
    let captionMsg = `مَن قَرَأَ سورةَ الكَهفِ يومَ الجُمُعةِ أضاءَ له من النورِ ما بَينَ الجُمُعتينِ`
    url = `http://www.islamicbook.ws/${quraanType}/${workerPage}.${pngOrJpgOrGif}`;
    if (+workerPage > 293) { // اذا كانت الصفحة التالية ليست اول صفحة في سورة الكهف
        await bot.telegram.editMessageMedia(ctxId, ctx.callbackQuery.message.message_id, undefined, {
            type: "photo",
            media: url,
            caption: captionMsg,
        }, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: +workerPage + 1, callback_data: "nextAlkhf" }, { text: +workerPage - 1, callback_data: "backAlkhf" }]
                ]
            }
        }).catch(() => { return })
    }
    if (+workerPage == 293) {
        await bot.telegram.editMessageMedia(ctxId, ctx.callbackQuery.message.message_id, undefined, {
            type: "photo",
            media: url,
            caption: captionMsg,
        }, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: +workerPage + 1, callback_data: "nextAlkhf" }]
                ]
            }
        }).catch(() => { return })
    }
})
const tz = 'Asia/Riyadh'; // تحديد المنطقة الزمنية الخاصة بك
const scheduledDayOfWeek = 5; // يوم الجمعة هو الخامس في الأسبوع
const scheduledHourOfDay = 5; // الساعة 5 صباحًا
const scheduledMinute = 30; // الدقيقة 30
// التحقق من صحة تنسيق جدول التشغيل
const isValidSchedule = cron.validate(`${scheduledMinute} ${scheduledHourOfDay} * * ${scheduledDayOfWeek}`);
if (isValidSchedule) {
    // جدول زمني يعمل كل يوم جمعة في الساعة والدقيقة المحددتين
    const scheduledTime = `${scheduledMinute} ${scheduledHourOfDay} * * ${scheduledDayOfWeek}`;
    cron.schedule(scheduledTime, () => {
        users.forEach(user => {
            if (user.Notifi.alkhf.boolean) {
                Alkhf(user.user)
            }
        })
    }, { timezone: tz });
} else {
    console.error('Invalid cron schedule');
}
// للرد على رسائل الاعضاء
bot.command('send', (ctx) => {
    if (ctx.from.id == 2098036983 || 1168709542) {
        let msg = ctx.message?.reply_to_message?.text
        if (msg) {
            let userId = msg.split("\n")
            let UderId = userId[userId.length - 1]
            let text = ctx.message.text
            bot.telegram.sendMessage(UderId, text.slice(6), {
                reply_to_message_id: userId[userId.length - 2]
            }).catch(() => { return }).then(() => {
                ctx.reply(`[تم ارسال الرد ]\n\n`)
            })
        } else {
            ctx.reply("قم بتحديد الرسالة التي تريد الرد عليها")
        }
    }
});
bot.command("all", ctx => {
    if (ctx.message.reply_to_message && ctx.from.id == 2098036983) {
        let msgCopied = ctx.message.reply_to_message.message_id;
        users.forEach(async user => {
            await bot.telegram.copyMessage(user.user, ctx.chat.id, msgCopied).catch(() => { return })
        })
    }
})

bot.command("new", ctx => {
    if (ctx.from.id == 2098036983) {
        users.forEach(async user => {
            await bot.telegram.sendMessage(user.user, mainText, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: `اعدادات خطة ختم القرآن 🗓`, callback_data: "plan" }],
                        [{ text: 'نوع المصحف 📚', callback_data: "quraanType" }],
                        [{ text: `اعدادات رسائل التذكير 🎛`, callback_data: "options" }]
                    ]
                }
            }).catch(() => { return })
        })
    }
})

//تحويل جميع الرسائل الى المشرفين
bot.on('message', async (ctx) => {
    if (ctx.chat.type === 'private') {
        let userId = ctx.from.id
        let UserName = ctx.from.username
        let mt = ctx.message.text
        await bot.telegram.forwardMessage(AdminGroup, ctx.chat.id, ctx.message.message_id).catch(() => { return }).then(async res => {
            await ctx.telegram.sendMessage(AdminGroup, `${UserName ? `[ @${UserName}  ]` : `واحد ما عنده يوزر`}\n▮▮▮▮▮▮▮▮\n${ctx.message.message_id}\n${userId} `, {
                reply_to_message_id: res?.message_id
            }).catch(() => { return })
        }).catch(() => { return })
    }
})
bot.launch();
// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
//For the deployment
{
  const http = require("http");
  const port = process.env.PORT || 5000;
  http
    .createServer(function (req, res) {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("This is my telegram bot :)\n");
    })
    .listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
}
