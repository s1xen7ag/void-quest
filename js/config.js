// ============================================================
//  НАЛАШТУВАННЯ КВЕСТУ — усе, що можна міняти без програмування.
//  Рядки з позначкою TODO_ВІД_ЗАМОВНИКА треба замінити перед подарунком.
// ============================================================
window.VQ = window.VQ || {};

VQ.config = {
  player: {
    name: 'Михайле',          // ім'я брата (як звертатися)
    nick: 'VoidWalker'        // TODO_ВІД_ЗАМОВНИКА: нік у верхній панелі
  },

  // фінальне привітання; кожен рядок тексту (через \n) показується окремим рядком вірша
  greeting: {
    title: 'Вітаю, Михайле!',
    text: [
      'Михайле! Час для тебе зупинився —',
      'ти Шлях пройшов і молот свій добув.',
      'Та Войд просив, щоб ти угамувався',
      'і в порожнечу ульт свій не жбурнув.',
      'Хай Хроносфера ловить всіх п\'ятьох,',
      'а не повітря, вітер і кущі.',
      'Хай менше «воздуху» — і більше перемог,',
      'а молот хай завжди лежить в руці!'
    ].join('\n')
  },

  // штраф за помилки у випробуваннях
  penalty: { perMistake: 0.3, minShare: 0.1 },

  outro: [
    'Ти пройшов Шлях Войда. Усе золото, яке ти не розгубив на помилках, — твоє.',
    'Скарбниця, Арсенал і Кузня тепер відкриті… подивимось, чи прихильний до тебе час.'
  ],

  heroNames: {
    pudge: 'Pudge', tidehunter: 'Tidehunter', ogre_magi: 'Ogre Magi', bristleback: 'Bristleback',
    juggernaut: 'Juggernaut', sven: 'Sven', kunkka: 'Kunkka', dragon_knight: 'Dragon Knight',
    techies: 'Techies', tinker: 'Tinker', gyrocopter: 'Gyrocopter', rattletrap: 'Clockwerk',
    life_stealer: 'Lifestealer', slardar: 'Slardar', axe: 'Axe',
    nevermore: 'Shadow Fiend', doom_bringer: 'Doom', shadow_demon: 'Shadow Demon', lich: 'Lich',
    invoker: 'Invoker', rubick: 'Rubick', skywrath_mage: 'Skywrath Mage', dark_willow: 'Dark Willow',
    zuus: 'Zeus', razor: 'Razor', disruptor: 'Disruptor', storm_spirit: 'Storm Spirit',
    crystal_maiden: 'Crystal Maiden', ancient_apparition: 'Ancient Apparition', winter_wyvern: 'Winter Wyvern',
    earthshaker: 'Earthshaker', tiny: 'Tiny', elder_titan: 'Elder Titan', sand_king: 'Sand King',
    tusk: 'Tusk', ursa: 'Ursa', magnataur: 'Magnus', brewmaster: 'Brewmaster',
    mirana: 'Mirana', luna: 'Luna', templar_assassin: 'Templar Assassin', windrunner: 'Windranger',
    earth_spirit: 'Earth Spirit',
    vengefulspirit: 'Vengeful Spirit', alchemist: 'Alchemist', meepo: 'Meepo', beastmaster: 'Beastmaster',
    centaur: 'Centaur Warrunner', legion_commander: 'Legion Commander', abaddon: 'Abaddon', chaos_knight: 'Chaos Knight',
    mars: 'Mars', troll_warlord: 'Troll Warlord', drow_ranger: 'Drow Ranger', lina: 'Lina', phantom_assassin: 'Phantom Assassin',
    riki: 'Riki', spectre: 'Spectre', queenofpain: 'Queen of Pain', lycan: 'Lycan', lone_druid: 'Lone Druid',
    enchantress: 'Enchantress', void_spirit: 'Void Spirit', enigma: 'Enigma', lion: 'Lion', shadow_shaman: 'Shadow Shaman',
    witch_doctor: 'Witch Doctor', naga_siren: 'Naga Siren', viper: 'Viper', venomancer: 'Venomancer', slark: 'Slark',
    night_stalker: 'Night Stalker', sniper: 'Sniper',
    faceless_void: 'Faceless Void',
    // нові герої для «Хто це?»
    abyssal_underlord: 'Underlord', arc_warden: 'Arc Warden', bane: 'Bane', batrider: 'Batrider', bounty_hunter: 'Bounty Hunter', broodmother: 'Broodmother', chen: 'Chen', dark_seer: 'Dark Seer', dawnbreaker: 'Dawnbreaker', dazzle: 'Dazzle', death_prophet: 'Death Prophet', ember_spirit: 'Ember Spirit', grimstroke: 'Grimstroke', hoodwink: 'Hoodwink', jakiro: 'Jakiro', keeper_of_the_light: 'Keeper of the Light', kez: 'Kez', largo: 'Largo', marci: 'Marci', monkey_king: 'Monkey King', muerta: 'Muerta', necrolyte: 'Necrophos', nyx_assassin: 'Nyx Assassin', omniknight: 'Omniknight', oracle: 'Oracle', pangolier: 'Pangolier', phantom_lancer: 'Phantom Lancer', phoenix: 'Phoenix', primal_beast: 'Primal Beast', puck: 'Puck', ringmaster: 'Ring Master', snapfire: 'Snapfire', spirit_breaker: 'Spirit Breaker', visage: 'Visage', warlock: 'Warlock', weaver: 'Weaver'
  },

  // ---------- ШЛЯХ ВОЙДА: 10 рівнів, разом 1000 ₴ ----------
  levels: [
    {
      title: 'Загадки Рошана', reward: 50,
      intro: ['Я — Darkterror, якого смертні звуть Faceless Void. Час підкоряється лише мені.',
              'Пройди мій Шлях — і, можливо, я поділюся з тобою скарбом, який не вдалося забрати навіть Рошану. А почнемо з його загадок.'],
      hint: 'Відповідь — одне слово чи коротка назва з Доти: предмет, монстр або річ. Можна англійською чи українською.',
      trial: {
        type: 'riddle',
        art: 'assets/img/roshan.png',
        count: 3,          // скільки загадок за раз — випадкові з пулу
        placeholder: 'Твоя відповідь…',
        pool: [
          { text: '«Я жовтий і дірявий. Рошан віддає мене лише тим, хто здолав його не вперше. З\'їж мене — і здоров\'я та мана повернуться миттєво. Що я?»',
            answers: ['cheese', 'сир', 'сирок', 'сыр', 'сырок', 'чіз', 'чиз', 'сирчик'], hint: 'Жовтий, з дірочками, і його можна з\'їсти.' },
          { text: '«Я ласую деревами, щоб повернути тобі здоров\'я. На початку гри мене купує майже кожен. Що я?»',
            answers: ['tango', 'танго', 'танґо'], hint: 'Назва — як у пристрасного танцю.' },
          { text: '«Я сувій, що за кілька секунд переносить тебе на базу чи до союзної вежі. Без мене не встигнеш на захист. Що я?»',
            answers: ['tp', 'tpscroll', 'townportal', 'townportalscroll', 'тп', 'телепорт', 'сувій', 'сувійтелепорту', 'свиток', 'свитоктелепорта', 'портал'], hint: 'Скорочено — дві літери.' },
          { text: '«Я невидиме око в тумані війни. Мене ставлять на землю, щоб бачити ворога, а вороги шукають мене з Sentry. Що я?»',
            answers: ['ward', 'observer', 'observerward', 'вард', 'варди', 'варды', 'обсервер', 'обс'], hint: 'Сапорти ставлять мене десятками. Моя пара — Sentry.' },
          { text: '«Я найсильніший нейтральний монстр. Моя яма біля річки, я прокидаюсь знову після смерті, а мій сир дістається переможцям. Хто я?»',
            answers: ['roshan', 'рошан', 'рошик', 'рошань', 'рош'], hint: 'Це я й загадую тобі ці загадки.' },
          { text: '«Я ношу тобі предмети з магазину й ніколи не б\'юся. Мене часто ловлять і вбивають на півдорозі. Хто я?»',
            answers: ['courier', 'animalcourier', 'кур\'єр', 'курьер', 'курєр', 'кура', 'курка', 'курочка'], hint: 'Мене ще жартома називають «курка».' },
          { text: '«Я скляна посудина. Наповнююсь у фонтані, а мідери зберігають у мені руни. Що я?»',
            answers: ['bottle', 'ботл', 'боттл', 'пляшка', 'фляга', 'фляжка', 'бутилка', 'бутылка'], hint: 'Англійською — «пляшка».' },
          { text: '«Я хмара, що ховає всю твою команду від очей ворога, поки ви не підійдете впритул. Ідеально для засідок. Що я?»',
            answers: ['smoke', 'smokeofdeceit', 'смок', 'смоук', 'дим'], hint: 'Англійською — «дим».' },
          { text: '«Я самоцвіт, що бачить невидимих. Коли мій власник помирає, я падаю на землю, і мене може підняти ворог. Що я?»',
            answers: ['gem', 'gemoftruesight', 'гем', 'джем', 'самоцвіт'], hint: 'Скорочено — три літери.' },
          { text: '«Я золота рукавиця: торкнуся крипа — і він стане золотом та досвідом для тебе. Що я?»',
            answers: ['midas', 'handofmidas', 'мідас', 'мидас', 'рукамідаса', 'рукамидаса'], hint: 'Як той цар, від дотику якого все ставало золотом.' }
        ]
      }
    },
    {
      title: 'Збери предмет', reward: 100,
      intro: ['Справжній воїн знає, з чого кується зброя.', 'Три предмети — три рецепти. Обери лише потрібні компоненти й не дай зайвому металу себе обдурити.'],
      hint: 'Рецепт-сувій не потрібен — лише компоненти. Подумай, що дає предмет (ухилення, ману, броню, урон) — з того він і зібраний.',
      trial: {
        type: 'craft',
        count: 3,          // скільки предметів за раз — випадкові з пулу
        // рецепти з даних гри (OpenDota constants); предмети зі старого квесту не використовуються
        pool: [
          { target: 'butterfly', correct: ['eagle', 'claymore', 'talisman_of_evasion'], wrong: ['ultimate_orb', 'blade_of_alacrity', 'reaver'] },
          { target: 'lotus_orb', correct: ['pers', 'platemail', 'energy_booster'], wrong: ['chainmail', 'void_stone', 'point_booster'] },
          { target: 'abyssal_blade', correct: ['basher', 'sange'], wrong: ['yasha', 'mithril_hammer', 'vanguard'] },
          { target: 'greater_crit', correct: ['lesser_crit', 'demon_edge'], wrong: ['claymore', 'mithril_hammer', 'ogre_axe'] },
          { target: 'sheepstick', correct: ['mystic_staff', 'tiara_of_selemene'], wrong: ['ultimate_orb', 'point_booster', 'staff_of_wizardry'] },
          { target: 'ethereal_blade', correct: ['ultimate_orb', 'ghost'], wrong: ['eagle', 'mystic_staff', 'cloak'] },
          { target: 'heart', correct: ['reaver', 'ring_of_tarrasque'], wrong: ['vitality_booster', 'platemail', 'ogre_axe'] },
          { target: 'disperser', correct: ['diffusal_blade', 'eagle'], wrong: ['yasha', 'ultimate_orb', 'blade_of_alacrity'] },
          { target: 'crimson_guard', correct: ['vanguard', 'helm_of_iron_will'], wrong: ['buckler', 'platemail', 'ring_of_health'] },
          { target: 'nullifier', correct: ['relic', 'splintmail'], wrong: ['demon_edge', 'platemail', 'ghost'] }
        ],
        names: {
          abyssal_blade: 'Abyssal Blade', basher: 'Skull Basher', blade_of_alacrity: 'Blade of Alacrity', buckler: 'Buckler', butterfly: 'Butterfly',
          chainmail: 'Chainmail', claymore: 'Claymore', cloak: 'Cloak', crimson_guard: 'Crimson Guard', demon_edge: 'Demon Edge',
          diffusal_blade: 'Diffusal Blade', disperser: 'Disperser', eagle: 'Eaglesong', energy_booster: 'Energy Booster', ethereal_blade: 'Ethereal Blade',
          ghost: 'Ghost Scepter', greater_crit: 'Daedalus', heart: 'Heart of Tarrasque', helm_of_iron_will: 'Helm of Iron Will', lesser_crit: 'Crystalys',
          lotus_orb: 'Lotus Orb', mithril_hammer: 'Mithril Hammer', mystic_staff: 'Mystic Staff', nullifier: 'Nullifier', ogre_axe: 'Ogre Axe',
          pers: 'Perseverance', platemail: 'Platemail', point_booster: 'Point Booster', reaver: 'Reaver', relic: 'Sacred Relic',
          ring_of_health: 'Ring of Health', ring_of_tarrasque: 'Ring of Tarrasque', sange: 'Sange', sheepstick: 'Scythe of Vyse', splintmail: 'Splintmail',
          staff_of_wizardry: 'Staff of Wizardry', talisman_of_evasion: 'Talisman of Evasion', tiara_of_selemene: 'Tiara of Selemene',
          ultimate_orb: 'Ultimate Orb', vanguard: 'Vanguard', vitality_booster: 'Vitality Booster', void_stone: 'Void Stone', yasha: 'Yasha'
        }
      }
    },
    {
      title: 'Темні силуети', reward: 100,
      intro: ['У Хроносфері все завмирає, і лишаються тільки тіні.', 'Шість тіней, у кожної шість схожих героїв, а деякі тіні ще й дзеркальні. Впізнай кожну.'],
      hint: 'Шукай деталі обрису: зброю, роги, плащ, звіра під героєм. Тінь може бути віддзеркалена.',
      trial: {
        type: 'silhouette',
        count: 6,        // скільки силуетів за раз — випадкові з пулу, у випадковому порядку
        mirror: true,    // іноді віддзеркалювати силует
        pool: [
          { hero: 'mirana', options: ['mirana', 'luna', 'templar_assassin', 'windrunner', 'drow_ranger', 'vengefulspirit'] },
          { hero: 'tiny', options: ['tiny', 'earth_spirit', 'elder_titan', 'tidehunter', 'tusk', 'ogre_magi'] },
          { hero: 'techies', options: ['techies', 'tinker', 'gyrocopter', 'rattletrap', 'sniper', 'alchemist'] },
          { hero: 'sniper', options: ['sniper', 'techies', 'tinker', 'kunkka', 'gyrocopter', 'meepo'] },
          { hero: 'earthshaker', options: ['earthshaker', 'elder_titan', 'tusk', 'beastmaster', 'magnataur', 'centaur'] },
          { hero: 'sven', options: ['sven', 'dragon_knight', 'legion_commander', 'abaddon', 'chaos_knight', 'kunkka'] },
          { hero: 'axe', options: ['axe', 'centaur', 'bristleback', 'mars', 'beastmaster', 'troll_warlord'] },
          { hero: 'crystal_maiden', options: ['crystal_maiden', 'lina', 'windrunner', 'drow_ranger', 'invoker', 'dark_willow'] },
          { hero: 'phantom_assassin', options: ['phantom_assassin', 'templar_assassin', 'riki', 'spectre', 'drow_ranger', 'queenofpain'] },
          { hero: 'kunkka', options: ['kunkka', 'sven', 'dragon_knight', 'sniper', 'tidehunter', 'slardar'] },
          { hero: 'tusk', options: ['tusk', 'ursa', 'magnataur', 'brewmaster', 'bristleback', 'earthshaker'] },
          { hero: 'ursa', options: ['ursa', 'lycan', 'brewmaster', 'tusk', 'beastmaster', 'lone_druid'] }
        ]
      }
    },
    {
      title: 'Голоси й імена', reward: 100,
      intro: ['Голоси героїв відлунюють крізь час, а їхні справжні імена пам\'ятають лише Древні.', 'Скажи мені, кому належать ці слова й імена.'],
      hint: 'Справжні імена — з історій героїв. Rylai — крижана, Traxex — лучниця, Mortred — убивця, а Darkterror — це я.',
      trial: {
        type: 'quote',
        count: 7,        // скільки раундів за раз — випадкові з пулу
        pool: [
          { text: 'Walrus PUNCH!', hero: 'tusk', options: ['tusk', 'ursa', 'magnataur', 'brewmaster'] },
          { text: 'Your soul is mine!', hero: 'nevermore', options: ['nevermore', 'doom_bringer', 'shadow_demon', 'lich'] },
          { text: 'I am a beacon of knowledge blazing out across a black sea of ignorance.', hero: 'invoker', options: ['invoker', 'rubick', 'storm_spirit', 'dark_willow'] },
          { name: 'Rylai', hero: 'crystal_maiden', options: ['crystal_maiden', 'lina', 'windrunner', 'drow_ranger'] },
          { name: 'Traxex', hero: 'drow_ranger', options: ['drow_ranger', 'windrunner', 'mirana', 'templar_assassin'] },
          { name: 'Mortred', hero: 'phantom_assassin', options: ['phantom_assassin', 'templar_assassin', 'spectre', 'riki'] },
          { name: 'Lyralei', hero: 'windrunner', options: ['windrunner', 'mirana', 'luna', 'enchantress'] },
          { name: 'Mogul Khan', hero: 'axe', options: ['axe', 'centaur', 'beastmaster', 'bristleback'] },
          { name: 'Darkterror', hero: 'faceless_void', options: ['faceless_void', 'void_spirit', 'spectre', 'enigma'] },
          { name: 'Raigor Stonehoof', hero: 'earthshaker', options: ['earthshaker', 'elder_titan', 'centaur', 'tusk'] },
          { name: 'Kardel Sharpeye', hero: 'sniper', options: ['sniper', 'techies', 'gyrocopter', 'tinker'] },
          { name: 'Tresdin', hero: 'legion_commander', options: ['legion_commander', 'mars', 'sven', 'dragon_knight'] },
          { name: 'Davion', hero: 'dragon_knight', options: ['dragon_knight', 'sven', 'legion_commander', 'kunkka'] },
          { name: 'Ulfsaar', hero: 'ursa', options: ['ursa', 'lycan', 'lone_druid', 'beastmaster'] },
          { name: 'Lanaya', hero: 'templar_assassin', options: ['templar_assassin', 'phantom_assassin', 'lina', 'luna'] }
        ]
      }
    },
    {
      title: 'Пам\'ять Древніх', reward: 100,
      intro: ['Минуле, теперішнє й майбутнє для мене — одне ціле.', 'Перевір, чи твоя пам\'ять така ж міцна.'],
      hint: 'Запам\'ятовуй, де лежить кожна відкрита картка.',
      trial: {
        type: 'memory',
        items: ['heart', 'manta', 'sheepstick', 'greater_crit', 'radiance', 'lotus_orb']
      }
    },
    {
      title: 'Дорожче чи дешевше?', reward: 100,
      intro: ['Кожна перемога має ціну в золоті.', 'Десять пар, ціни зовсім поруч. Одна помилка — і час повернеться на початок.'],
      hint: 'Ціни відрізняються лише на 50–700 золота. Згадай рецепти: що з чого збирається, те й дорожче.',
      trial: {
        type: 'higherLower',
        count: 10,          // скільки пар підряд треба вгадати
        minDiff: 50,        // різниця цін у парі, золото
        maxDiff: 700,
        // ціни з даних гри (OpenDota constants), предмети зі старого квесту не використовуються
        pool: [
          { key: 'wind_waker', name: 'Wind Waker', cost: 6800 },
          { key: 'abyssal_blade', name: 'Abyssal Blade', cost: 6250 },
          { key: 'disperser', name: 'Disperser', cost: 6100 },
          { key: 'skadi', name: 'Eye of Skadi', cost: 5900 },
          { key: 'silver_edge', name: 'Silver Edge', cost: 5700 },
          { key: 'mjollnir', name: 'Mjollnir', cost: 5500 },
          { key: 'butterfly', name: 'Butterfly', cost: 5450 },
          { key: 'heart', name: 'Heart of Tarrasque', cost: 5300 },
          { key: 'sheepstick', name: 'Scythe of Vyse', cost: 5200 },
          { key: 'greater_crit', name: 'Daedalus', cost: 5200 },
          { key: 'ethereal_blade', name: 'Ethereal Blade', cost: 5200 },
          { key: 'assault', name: 'Assault Cuirass', cost: 5125 },
          { key: 'octarine_core', name: 'Octarine Core', cost: 5100 },
          { key: 'satanic', name: 'Satanic', cost: 5050 },
          { key: 'monkey_king_bar', name: 'Monkey King Bar', cost: 5000 },
          { key: 'sphere', name: 'Linken\'s Sphere', cost: 4800 },
          { key: 'radiance', name: 'Radiance', cost: 4700 },
          { key: 'harpoon', name: 'Harpoon', cost: 4700 },
          { key: 'bloodstone', name: 'Bloodstone', cost: 4700 },
          { key: 'manta', name: 'Manta Style', cost: 4650 },
          { key: 'gungir', name: 'Gleipnir', cost: 4650 },
          { key: 'hurricane_pike', name: 'Hurricane Pike', cost: 4550 },
          { key: 'shivas_guard', name: 'Shiva\'s Guard', cost: 4500 },
          { key: 'guardian_greaves', name: 'Guardian Greaves', cost: 4450 },
          { key: 'nullifier', name: 'Nullifier', cost: 4350 },
          { key: 'boots_of_bearing', name: 'Boots of Bearing', cost: 4225 },
          { key: 'yasha_and_kaya', name: 'Yasha and Kaya', cost: 4200 },
          { key: 'sange_and_yasha', name: 'Sange and Yasha', cost: 4200 },
          { key: 'kaya_and_sange', name: 'Kaya and Sange', cost: 4200 },
          { key: 'eternal_shroud', name: 'Eternal Shroud', cost: 3900 },
          { key: 'bfury', name: 'Battle Fury', cost: 3900 },
          { key: 'lotus_orb', name: 'Lotus Orb', cost: 3850 },
          { key: 'pipe', name: 'Pipe of Insight', cost: 3725 },
          { key: 'crimson_guard', name: 'Crimson Guard', cost: 3725 },
          { key: 'desolator', name: 'Desolator', cost: 3500 },
          { key: 'relic', name: 'Sacred Relic', cost: 3400 },
          { key: 'revenants_brooch', name: 'Revenant\'s Brooch', cost: 3300 },
          { key: 'heavens_halberd', name: 'Heaven\'s Halberd', cost: 3300 },
          { key: 'invis_sword', name: 'Shadow Blade', cost: 3250 },
          { key: 'mage_slayer', name: 'Mage Slayer', cost: 3100 },
          { key: 'soul_booster', name: 'Soul Booster', cost: 3000 },
          { key: 'dagon', name: 'Dagon', cost: 3000 },
          { key: 'aeon_disk', name: 'Aeon Disk', cost: 3000 },
          { key: 'maelstrom', name: 'Maelstrom', cost: 2950 },
          { key: 'basher', name: 'Skull Basher', cost: 2875 },
          { key: 'meteor_hammer', name: 'Meteor Hammer', cost: 2850 },
          { key: 'ultimate_orb', name: 'Ultimate Orb', cost: 2800 },
          { key: 'reaver', name: 'Reaver', cost: 2800 },
          { key: 'mystic_staff', name: 'Mystic Staff', cost: 2800 },
          { key: 'eagle', name: 'Eaglesong', cost: 2800 },
          { key: 'witch_blade', name: 'Witch Blade', cost: 2775 },
          { key: 'spirit_vessel', name: 'Spirit Vessel', cost: 2725 },
          { key: 'echo_sabre', name: 'Echo Sabre', cost: 2700 },
          { key: 'phylactery', name: 'Phylactery', cost: 2600 },
          { key: 'cyclone', name: 'Eul\'s Scepter of Divinity', cost: 2600 },
          { key: 'solar_crest', name: 'Solar Crest', cost: 2575 },
          { key: 'helm_of_the_dominator', name: 'Helm of the Dominator', cost: 2550 },
          { key: 'travel_boots', name: 'Boots of Travel', cost: 2500 },
          { key: 'diffusal_blade', name: 'Diffusal Blade', cost: 2500 },
          { key: 'armlet', name: 'Armlet of Mordiggian', cost: 2500 },
          { key: 'blade_mail', name: 'Blade Mail', cost: 2400 },
          { key: 'aether_lens', name: 'Aether Lens', cost: 2275 },
          { key: 'rod_of_atos', name: 'Rod of Atos', cost: 2250 },
          { key: 'holy_locket', name: 'Holy Locket', cost: 2250 },
          { key: 'vladmir', name: 'Vladmir\'s Offering', cost: 2200 },
          { key: 'hand_of_midas', name: 'Hand of Midas', cost: 2200 },
          { key: 'force_staff', name: 'Force Staff', cost: 2200 },
          { key: 'demon_edge', name: 'Demon Edge', cost: 2200 },
          { key: 'glimmer_cape', name: 'Glimmer Cape', cost: 2150 },
          { key: 'yasha', name: 'Yasha', cost: 2100 },
          { key: 'sange', name: 'Sange', cost: 2100 },
          { key: 'kaya', name: 'Kaya', cost: 2100 },
          { key: 'lesser_crit', name: 'Crystalys', cost: 2000 },
          { key: 'dragon_lance', name: 'Dragon Lance', cost: 2000 },
          { key: 'mekansm', name: 'Mekansm', cost: 1775 },
          { key: 'veil_of_discord', name: 'Veil of Discord', cost: 1700 },
          { key: 'vanguard', name: 'Vanguard', cost: 1700 },
          { key: 'tiara_of_selemene', name: 'Tiara of Selemene', cost: 1700 },
          { key: 'ring_of_tarrasque', name: 'Ring of Tarrasque', cost: 1700 },
          { key: 'oblivion_staff', name: 'Oblivion Staff', cost: 1625 },
          { key: 'ancient_janggo', name: 'Drum of Endurance', cost: 1625 },
          { key: 'mithril_hammer', name: 'Mithril Hammer', cost: 1600 },
          { key: 'ghost', name: 'Ghost Scepter', cost: 1500 },
          { key: 'arcane_boots', name: 'Arcane Boots', cost: 1500 },
          { key: 'phase_boots', name: 'Phase Boots', cost: 1450 },
          { key: 'power_treads', name: 'Power Treads', cost: 1400 },
          { key: 'platemail', name: 'Platemail', cost: 1400 },
          { key: 'pers', name: 'Perseverance', cost: 1400 },
          { key: 'claymore', name: 'Claymore', cost: 1350 },
          { key: 'talisman_of_evasion', name: 'Talisman of Evasion', cost: 1300 },
          { key: 'point_booster', name: 'Point Booster', cost: 1200 },
          { key: 'falcon_blade', name: 'Falcon Blade', cost: 1125 },
          { key: 'orb_of_corrosion', name: 'Orb of Corrosion', cost: 1050 },
          { key: 'vitality_booster', name: 'Vitality Booster', cost: 1000 },
          { key: 'staff_of_wizardry', name: 'Staff of Wizardry', cost: 1000 },
          { key: 'ogre_axe', name: 'Ogre Axe', cost: 1000 },
          { key: 'blade_of_alacrity', name: 'Blade of Alacrity', cost: 1000 },
          { key: 'helm_of_iron_will', name: 'Helm of Iron Will', cost: 975 },
          { key: 'tranquil_boots', name: 'Tranquil Boots', cost: 900 },
          { key: 'shadow_amulet', name: 'Shadow Amulet', cost: 900 },
          { key: 'cloak', name: 'Cloak', cost: 900 },
          { key: 'urn_of_shadows', name: 'Urn of Shadows', cost: 825 },
          { key: 'soul_ring', name: 'Soul Ring', cost: 805 },
          { key: 'energy_booster', name: 'Energy Booster', cost: 800 },
          { key: 'void_stone', name: 'Void Stone', cost: 700 },
          { key: 'ring_of_health', name: 'Ring of Health', cost: 700 },
          { key: 'bottle', name: 'Bottle', cost: 675 },
          { key: 'voodoo_mask', name: 'Voodoo Mask', cost: 650 },
          { key: 'wraith_band', name: 'Wraith Band', cost: 505 },
          { key: 'null_talisman', name: 'Null Talisman', cost: 505 },
          { key: 'bracer', name: 'Bracer', cost: 505 },
          { key: 'chainmail', name: 'Chainmail', cost: 500 },
          { key: 'boots', name: 'Boots of Speed', cost: 500 },
          { key: 'magic_wand', name: 'Magic Wand', cost: 460 },
          { key: 'robe', name: 'Robe of the Magi', cost: 450 },
          { key: 'boots_of_elves', name: 'Band of Elvenskin', cost: 450 },
          { key: 'belt_of_strength', name: 'Belt of Strength', cost: 450 },
          { key: 'headdress', name: 'Headdress', cost: 425 },
          { key: 'buckler', name: 'Buckler', cost: 425 }
        ]
      }
    },
    {
      title: 'Здібності героїв', reward: 100,
      intro: ['Спершу назви мої сили. А потім — сили ще двох героїв, яких обере сам час.', 'Дванадцять здібностей, і кожна помилка коштує золота.'],
      hint: 'Ультімейти найпомітніші: Chronosphere, Laguna Blade, Assassinate, Coup de Grace. Решту зіставляй за формою й кольором іконки.',
      trial: {
        type: 'abilityMatch',
        first: 'faceless_void',   // завжди першим — Войд
        heroes: 3,                // скільки героїв за раз (Войд + 2 випадкові)
        pool: {
          faceless_void: [
            { key: 'faceless_void_time_walk', name: 'Time Walk' },
            { key: 'faceless_void_time_dilation', name: 'Time Dilation' },
            { key: 'faceless_void_time_lock', name: 'Time Lock' },
            { key: 'faceless_void_chronosphere', name: 'Chronosphere' }
          ],
          invoker: [
            { key: 'invoker_sun_strike', name: 'Sun Strike' },
            { key: 'invoker_chaos_meteor', name: 'Chaos Meteor' },
            { key: 'invoker_tornado', name: 'Tornado' },
            { key: 'invoker_emp', name: 'E.M.P.' }
          ],
          lina: [
            { key: 'lina_dragon_slave', name: 'Dragon Slave' },
            { key: 'lina_light_strike_array', name: 'Light Strike Array' },
            { key: 'lina_fiery_soul', name: 'Fiery Soul' },
            { key: 'lina_laguna_blade', name: 'Laguna Blade' }
          ],
          phantom_assassin: [
            { key: 'phantom_assassin_stifling_dagger', name: 'Stifling Dagger' },
            { key: 'phantom_assassin_phantom_strike', name: 'Phantom Strike' },
            { key: 'phantom_assassin_blur', name: 'Blur' },
            { key: 'phantom_assassin_coup_de_grace', name: 'Coup de Grace' }
          ],
          drow_ranger: [
            { key: 'drow_ranger_frost_arrows', name: 'Frost Arrows' },
            { key: 'drow_ranger_wave_of_silence', name: 'Gust' },
            { key: 'drow_ranger_multishot', name: 'Multishot' },
            { key: 'drow_ranger_marksmanship', name: 'Marksmanship' }
          ],
          sniper: [
            { key: 'sniper_shrapnel', name: 'Shrapnel' },
            { key: 'sniper_headshot', name: 'Headshot' },
            { key: 'sniper_take_aim', name: 'Take Aim' },
            { key: 'sniper_assassinate', name: 'Assassinate' }
          ]
        }
      }
    },
    {
      title: 'Хто це?', reward: 100,
      intro: ['Сила героя — у його здібностях.', 'Вісім героїв, по три іконки в кожного — і серед них зовсім нові. Впізнай власника.'],
      hint: 'Придивись до стихії й кольору: блискавки, лід, вода, отрута, вогонь, тіні. Порядок іконок випадковий — шукай спільну тему.',
      trial: {
        type: 'whoIsIt',
        count: 8,        // скільки раундів за раз — випадкові з пулу
        pool: [
          { hero: 'zuus', abilities: ['zuus_arc_lightning', 'zuus_lightning_bolt', 'zuus_thundergods_wrath'], options: ['zuus', 'razor', 'disruptor', 'storm_spirit'] },
          { hero: 'crystal_maiden', abilities: ['crystal_maiden_crystal_nova', 'crystal_maiden_frostbite', 'crystal_maiden_freezing_field'], options: ['crystal_maiden', 'lich', 'ancient_apparition', 'winter_wyvern'] },
          { hero: 'earthshaker', abilities: ['earthshaker_fissure', 'earthshaker_enchant_totem', 'earthshaker_echo_slam'], options: ['earthshaker', 'tiny', 'elder_titan', 'sand_king'] },
          { hero: 'lion', abilities: ['lion_impale', 'lion_voodoo', 'lion_finger_of_death'], options: ['lion', 'shadow_shaman', 'witch_doctor', 'lich'] },
          { hero: 'sven', abilities: ['sven_storm_bolt', 'sven_great_cleave', 'sven_gods_strength'], options: ['sven', 'dragon_knight', 'legion_commander', 'chaos_knight'] },
          { hero: 'tidehunter', abilities: ['tidehunter_gush', 'tidehunter_anchor_smash', 'tidehunter_ravage'], options: ['tidehunter', 'slardar', 'kunkka', 'magnataur'] },
          { hero: 'kunkka', abilities: ['kunkka_torrent', 'kunkka_tidebringer', 'kunkka_ghostship'], options: ['kunkka', 'tidehunter', 'slardar', 'naga_siren'] },
          { hero: 'enigma', abilities: ['enigma_malefice', 'enigma_demonic_conversion', 'enigma_black_hole'], options: ['enigma', 'faceless_void', 'void_spirit', 'abaddon'] },
          { hero: 'mirana', abilities: ['mirana_starfall', 'mirana_arrow', 'mirana_invis'], options: ['mirana', 'luna', 'windrunner', 'templar_assassin'] },
          { hero: 'axe', abilities: ['axe_berserkers_call', 'axe_battle_hunger', 'axe_culling_blade'], options: ['axe', 'centaur', 'mars', 'bristleback'] },
          { hero: 'viper', abilities: ['viper_poison_attack', 'viper_nethertoxin', 'viper_viper_strike'], options: ['viper', 'venomancer', 'slark', 'night_stalker'] },
          // нові й рідкісні герої (скіли звірені з dotaconstants hero_abilities)
          { hero: 'kez', abilities: ['kez_echo_slash', 'kez_grappling_claw', 'kez_raptor_dance'], options: ['kez', 'ember_spirit', 'bounty_hunter', 'riki'] },
          { hero: 'largo', abilities: ['largo_catchy_lick', 'largo_frogstomp', 'largo_amphibian_rhapsody'], options: ['largo', 'tidehunter', 'brewmaster', 'tusk'] },
          { hero: 'ringmaster', abilities: ['ringmaster_tame_the_beasts', 'ringmaster_impalement', 'ringmaster_wheel'], options: ['ringmaster', 'rubick', 'invoker', 'shadow_shaman'] },
          { hero: 'muerta', abilities: ['muerta_dead_shot', 'muerta_the_calling', 'muerta_pierce_the_veil'], options: ['muerta', 'sniper', 'drow_ranger', 'death_prophet'] },
          { hero: 'primal_beast', abilities: ['primal_beast_onslaught', 'primal_beast_trample', 'primal_beast_pulverize'], options: ['primal_beast', 'spirit_breaker', 'ursa', 'centaur'] },
          { hero: 'marci', abilities: ['marci_grapple', 'marci_companion_run', 'marci_unleash'], options: ['marci', 'tusk', 'monkey_king', 'brewmaster'] },
          { hero: 'dawnbreaker', abilities: ['dawnbreaker_fire_wreath', 'dawnbreaker_celestial_hammer', 'dawnbreaker_solar_guardian'], options: ['dawnbreaker', 'omniknight', 'legion_commander', 'phoenix'] },
          { hero: 'hoodwink', abilities: ['hoodwink_acorn_shot', 'hoodwink_bushwhack', 'hoodwink_sharpshooter'], options: ['hoodwink', 'windrunner', 'sniper', 'dark_willow'] },
          { hero: 'snapfire', abilities: ['snapfire_scatterblast', 'snapfire_firesnap_cookie', 'snapfire_mortimer_kisses'], options: ['snapfire', 'batrider', 'gyrocopter', 'techies'] },
          { hero: 'void_spirit', abilities: ['void_spirit_aether_remnant', 'void_spirit_dissimilate', 'void_spirit_astral_step'], options: ['void_spirit', 'storm_spirit', 'ember_spirit', 'earth_spirit'] },
          { hero: 'mars', abilities: ['mars_spear', 'mars_gods_rebuke', 'mars_arena_of_blood'], options: ['mars', 'legion_commander', 'sven', 'magnataur'] },
          { hero: 'grimstroke', abilities: ['grimstroke_dark_artistry', 'grimstroke_ink_creature', 'grimstroke_soul_chain'], options: ['grimstroke', 'shadow_demon', 'oracle', 'dark_willow'] },
          { hero: 'dark_willow', abilities: ['dark_willow_bramble_maze', 'dark_willow_shadow_realm', 'dark_willow_bedlam'], options: ['dark_willow', 'puck', 'enchantress', 'winter_wyvern'] },
          { hero: 'pangolier', abilities: ['pangolier_swashbuckle', 'pangolier_shield_crash', 'pangolier_gyroshell'], options: ['pangolier', 'earth_spirit', 'sand_king', 'phantom_lancer'] },
          { hero: 'arc_warden', abilities: ['arc_warden_flux', 'arc_warden_magnetic_field', 'arc_warden_tempest_double'], options: ['arc_warden', 'zuus', 'razor', 'invoker'] },
          { hero: 'elder_titan', abilities: ['elder_titan_echo_stomp', 'elder_titan_ancestral_spirit', 'elder_titan_earth_splitter'], options: ['elder_titan', 'earthshaker', 'tiny', 'sand_king'] },
          { hero: 'phoenix', abilities: ['phoenix_icarus_dive', 'phoenix_fire_spirits', 'phoenix_supernova'], options: ['phoenix', 'batrider', 'lina', 'jakiro'] },
          { hero: 'oracle', abilities: ['oracle_fortunes_end', 'oracle_fates_edict', 'oracle_false_promise'], options: ['oracle', 'dazzle', 'chen', 'keeper_of_the_light'] },
          { hero: 'winter_wyvern', abilities: ['winter_wyvern_arctic_burn', 'winter_wyvern_splinter_blast', 'winter_wyvern_winters_curse'], options: ['winter_wyvern', 'crystal_maiden', 'ancient_apparition', 'jakiro'] },
          { hero: 'visage', abilities: ['visage_grave_chill', 'visage_soul_assumption', 'visage_summon_familiars'], options: ['visage', 'death_prophet', 'necrolyte', 'bane'] },
          { hero: 'shadow_demon', abilities: ['shadow_demon_disruption', 'shadow_demon_shadow_poison', 'shadow_demon_demonic_purge'], options: ['shadow_demon', 'bane', 'oracle', 'rubick'] },
          { hero: 'abyssal_underlord', abilities: ['abyssal_underlord_firestorm', 'abyssal_underlord_pit_of_malice', 'abyssal_underlord_dark_portal'], options: ['abyssal_underlord', 'doom_bringer', 'warlock', 'chaos_knight'] },
          { hero: 'dark_seer', abilities: ['dark_seer_vacuum', 'dark_seer_ion_shell', 'dark_seer_wall_of_replica'], options: ['dark_seer', 'enigma', 'magnataur', 'faceless_void'] },
          { hero: 'keeper_of_the_light', abilities: ['keeper_of_the_light_illuminate', 'keeper_of_the_light_blinding_light', 'keeper_of_the_light_spirit_form'], options: ['keeper_of_the_light', 'oracle', 'chen', 'skywrath_mage'] },
          { hero: 'weaver', abilities: ['weaver_the_swarm', 'weaver_shukuchi', 'weaver_time_lapse'], options: ['weaver', 'broodmother', 'nyx_assassin', 'faceless_void'] },
          { hero: 'nyx_assassin', abilities: ['nyx_assassin_impale', 'nyx_assassin_spiked_carapace', 'nyx_assassin_vendetta'], options: ['nyx_assassin', 'weaver', 'broodmother', 'lion'] },
          { hero: 'broodmother', abilities: ['broodmother_spawn_spiderlings', 'broodmother_spin_web', 'broodmother_insatiable_hunger'], options: ['broodmother', 'weaver', 'nyx_assassin', 'viper'] },
          { hero: 'bane', abilities: ['bane_enfeeble', 'bane_brain_sap', 'bane_fiends_grip'], options: ['bane', 'shadow_demon', 'night_stalker', 'visage'] }
        ]
      }
    },
    {
      title: 'Справжній колір', reward: 100,
      intro: ['Дорогі речі легко підробити.', 'Перед тобою чотири версії одного скарбу — і лише одна справжня. Знайди оригінал.'],
      hint: 'Колір зазвичай пасує до стилю скіна: лід — блакитний, вогонь — помаранчевий, золото — золоте. Згадай, як цей предмет виглядає в грі.',
      trial: {
        type: 'trueColor',
        count: 5,          // скільки скінів за раз — випадкові з пулу
        dir: 'assets/skins/colors/',   // <id>-0.webp — оригінал, -1..-3 — перефарбовані (tools/make-colors.py)
        pool: ['hair-of-the-survivor', 'honey-heist-baby-roshan', 'moonrift', 'golden-origins-of-faith', 'crimson-flight-of-epiphany',
               'disciple-of-the-wyrmwrought-flame', 'golden-floodmask', 'golden-ornithomancer-mantle-of-the-benefactor',
               'golden-staff-of-perplex', 'genuine-ice-baby-roshan', 'pipe-of-dezun', 'gingerbread-baby-roshan']
      }
    },
    {
      title: 'Добий крипа', reward: 150,
      intro: ['Останнє випробування — на реакцію.', 'На арені спалахуватиме золоте поле — встигни клікнути по ньому, поки воно не згасло. П\'ять влучних ударів — і крип твій.'],
      hint: 'Тримай мишку ближче до центру арени: поле з\'являється будь-де, і кожне наступне менше й швидше гасне.',
      trial: {
        type: 'lastHit', need: 5, art: 'assets/img/creep.png',
        windows: [1000, 850, 750, 650, 550],   // скільки мс поле видно для 1-го…5-го удару
        sizes: [110, 96, 84, 74, 64],          // діаметр поля, px
        delayMin: 500, delayMax: 1600          // поле з'являється через випадковий час
      }
    }
  ],

  // ---------- СКІНИ ----------
  // Справжні предмети з DMarket лежать у js/skins-data.js (згенеровано tools/fetch-dmarket.ps1).
  // js/catalog.js збирає з них VQ.config.skins. Тут — лише ручні уточнення.
  skins: {},
  skinOverrides: {
    // подарунок: локальна копія картинки, щоб не залежати від CDN
    voidhammer: { img: 'assets/skins/dm/voidhammer.png' }
  },

  // ---------- ПІДРОБІТОК (у Скарбниці): міні-випробування, щоб заробити ₴ ----------
  // from — тип випробування (дані беруться з відповідного рівня), set — що змінити, reward — плата.
  // Помилки забирають 30% плати (мінімум 10%), як і в квесті. Можна грати скільки завгодно.
  jobs: [
    { id: 'shadows', title: 'Тіні на лінії', desc: '3 силуети героїв', from: 'silhouette', set: { count: 3 }, reward: 120 },
    { id: 'powers', title: 'Чиї це сили?', desc: '3 героя за здібностями', from: 'whoIsIt', set: { count: 3 }, reward: 120 },
    { id: 'names', title: 'Голоси й імена', desc: '4 раунди', from: 'quote', set: { count: 4 }, reward: 120 },
    { id: 'memory', title: 'Пам\'ять Древніх', desc: '6 пар іконок', from: 'memory', set: {}, reward: 150 },
    { id: 'prices', title: 'Ціна могутності', desc: '7 пар підряд без помилок, ціни зовсім поруч', from: 'higherLower', set: { count: 7, minDiff: 25, maxDiff: 250 }, reward: 200 },
    { id: 'farm', title: 'Фарм на лінії', desc: '5 золотих полів', from: 'lastHit', set: {}, reward: 250 }
  ],

  // ---------- КАЗИНО ----------
  casino: {
    // Кейси: вміст = справжні скіни героя з DMarket, від найдорожчого до найдешевшого.
    // Ціна кейса і шанси рахуються автоматично (js/casino/cases.js) — як на сайтах з кейсами.
    cases: [
      { id: 'time', name: 'Скарбниця Часу', art: 'chest', mix: true },
      { id: 'drow', name: 'Drow Ranger', hero: 'drow ranger', render: 'drow_ranger' },
      { id: 'invoker', name: 'Invoker', hero: 'invoker', render: 'invoker' },
      { id: 'lina', name: 'Lina', hero: 'lina', render: 'lina' },
      { id: 'pa', name: 'Phantom Assassin', hero: 'phantom assassin', render: 'phantom_assassin' },
      { id: 'sf', name: 'Shadow Fiend', hero: 'shadow fiend', render: 'nevermore' },
      { id: 'mk', name: 'Monkey King', hero: 'monkey king', render: 'monkey_king' },
      // дорогий кейс: Рошани-кур'єри й топові речі; відкритий одразу, шанси чесні
      { id: 'roshan', name: 'Скарбниця Рошана', art: 'roshan', premium: true, minPrice: 900, oddsPower: 1.5 }
    ],
    oddsPower: 0.9,        // шанс ∝ ціна^-0.9: дешеві падають часто, дорогі — рідко
    houseEdge: 0.82,       // ціна кейса = очікувана вартість / 0.82
    caseMinPrice: 20,      // у звичайні кейси не кладемо скіни дешевші за 20 ₴ (у Steam є речі по 1–5 ₴)
    giftId: 'voidhammer',
    // Мета: скін від 5 000 ₴ (з кейса чи з Кузні) відкриває таємну нагороду.
    // Страховка: після 3 невдалих спроб у Кузні на ціль від 5 000 ₴ наступна виграє, якщо шанс ≥ 5%.
    goal: { value: 5000, pityAfter: 3, pityMinChance: 5 },
    maxChance: 75,
    houseFactor: 0.9,
    ancientsAfterLosses: 5   // Дар Древніх (найдешевший скін) — лише коли все злито і з останнього дару минуло 5 невдалих спроб
    // casePrice (найдешевший кейс) виставляє cases.js
  }
};
