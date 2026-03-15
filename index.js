const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.get('/', (req, res) => res.send('Wordle Duel Server Running ✅'));

// ── WORD POOL ──────────────────────────────────────────────────────────────
// Large pool of 5-letter words — same list as the app
const ALL_WORDS = [
  "ABOUT","ABOVE","ABUSE","ACUTE","ADMIT","ADOPT","ADULT","AFTER","AGAIN","AGENT",
  "AGREE","AHEAD","ALARM","ALBUM","ALERT","ALIKE","ALIVE","ALLEY","ALLOW","ALONE",
  "ALONG","ALTER","ANGEL","ANGER","ANGLE","ANGRY","APART","APPLE","APPLY","ARENA",
  "ARGUE","ARISE","ARMOR","ARRAY","ASIDE","ASSET","AVOID","AWARD","AWARE","AWFUL",
  "BAKER","BASIC","BASIS","BEACH","BEARD","BEAST","BEGIN","BEING","BELOW","BENCH",
  "BIRTH","BLACK","BLADE","BLANK","BLAST","BLEED","BLEND","BLESS","BLOCK","BLOOD",
  "BLOOM","BLOWN","BLUES","BOARD","BONUS","BOOST","BOOTH","BOUND","BRACE","BRAIN",
  "BRAVE","BREAK","BREED","BRICK","BRIDE","BRIEF","BRING","BROKE","BROOK","BROWN",
  "BRUSH","BUILD","BUILT","BUNCH","BURNT","BUYER","CABIN","CANDY","CARRY","CATCH",
  "CAUSE","CHAIN","CHAIR","CHAOS","CHECK","CHESS","CHEST","CHIEF","CHILD","CIVIC",
  "CIVIL","CLAIM","CLASS","CLEAN","CLEAR","CLERK","CLICK","CLIFF","CLIMB","CLOCK",
  "CLOSE","CLOUD","COACH","COAST","COLOR","COMET","COMIC","COUCH","COULD","COUNT",
  "COURT","COVER","CRACK","CRAFT","CRANE","CRASH","CRAVE","CRAZY","CREEK","CRIME",
  "CRISP","CROSS","CROWD","CROWN","CRUSH","CURVE","CYCLE","DAILY","DANCE","DELAY",
  "DELTA","DENSE","DEPOT","DEPTH","DIRTY","DOING","DONOR","DOUBT","DOUGH","DRAFT",
  "DRAIN","DRAWN","DREAD","DREAM","DRIFT","DRINK","DRIVE","DROVE","DRUGS","DRUMS",
  "DRUNK","DYING","EAGER","EARLY","EARTH","EIGHT","ELECT","EMPTY","ENEMY","ENJOY",
  "ENTER","ENTRY","EQUAL","ERROR","ESSAY","EVERY","EXACT","EXIST","EXTRA","FABLE",
  "FAITH","FALSE","FANCY","FATAL","FAULT","FEAST","FEVER","FIELD","FIFTH","FIFTY",
  "FIGHT","FINAL","FIRST","FIXED","FLAME","FLARE","FLASH","FLESH","FLICK","FLOCK",
  "FLOOD","FLOOR","FLOUR","FLUTE","FOCUS","FOLKS","FORCE","FRONT","FROST","FRUIT",
  "FULLY","FUNNY","GHOST","GIANT","GIVEN","GLASS","GLEAM","GLOBE","GLOOM","GLOSS",
  "GLOVE","GOING","GRACE","GRADE","GRAIN","GRAND","GRANT","GRASP","GRASS","GRAZE",
  "GREET","GRIEF","GRILL","GRIND","GROAN","GROUP","GROVE","GROWN","GUARD","GUESS",
  "GUIDE","GUILT","HABIT","HAPPY","HARSH","HASTE","HAVEN","HEART","HEAVY","HONOR",
  "HORSE","HOTEL","HOURS","HOUSE","HUMAN","HUMOR","HURRY","IDEAL","IMAGE","IMPLY",
  "INDEX","INNER","INPUT","ISSUE","JAPAN","JEWEL","JUDGE","JUICE","JUICY","JUMBO",
  "KNIFE","KNOCK","KNOWN","LABEL","LARGE","LASER","LATER","LAUGH","LAYER","LEARN",
  "LEASE","LEAST","LEAVE","LEGAL","LEMON","LEVEL","LIGHT","LIMIT","LOCAL","LOGIC",
  "LOOSE","LOVER","LOWER","LUCKY","LUNAR","LUNCH","LYING","MAGIC","MAJOR","MAKER",
  "MANOR","MAPLE","MARCH","MARRY","MATCH","MAYOR","MEANT","MEDIA","MERCY","MERIT",
  "METAL","MIGHT","MILES","MINOR","MINUS","MODEL","MONEY","MONTH","MORAL","MOUNT",
  "MOUSE","MOVIE","MUSIC","NAIVE","NAKED","NIGHT","NOBLE","NOISE","NORTH","NOTED",
  "NOVEL","NURSE","OCCUR","OFFER","OFTEN","OLIVE","OPERA","OTHER","OUGHT","OUTER",
  "OWNER","OZONE","PAINT","PANEL","PANIC","PAPER","PEACE","PEACH","PEARL","PENNY",
  "PHASE","PILOT","PITCH","PIXEL","PIZZA","PLACE","PLAIN","PLANE","PLANT","PLATE",
  "PLAZA","POINT","POKER","POLAR","PORCH","PRESS","PRICE","PRIDE","PRINT","PRONE",
  "PROOF","PROSE","PUNCH","PUPIL","PURSE","QUEEN","QUERY","QUEST","QUICK","QUIET",
  "QUOTA","QUOTE","RADAR","RAISE","RALLY","RANCH","RANGE","RAPID","RATIO","REACH",
  "READY","REALM","REBEL","RIGID","RISKY","RIVAL","RIVER","ROBOT","ROCKY","ROUGH",
  "ROUND","ROUTE","RULER","RURAL","RUSTY","SAINT","SALAD","SAUCE","SCALE","SCARY",
  "SCENE","SCORE","SCOUT","SEIZE","SENSE","SEVEN","SHADE","SHAFT","SHAKE","SHALL",
  "SHAME","SHAPE","SHARE","SHIFT","SHIRT","SHOCK","SHOOT","SHORE","SHORT","SHOUT",
  "SHOWN","SIGHT","SILLY","SINCE","SIXTY","SKILL","SKULL","SLATE","SLASH","SLEEP",
  "SLICE","SLIDE","SLIME","SMALL","SMART","SMELL","SMILE","SMOKE","SNACK","SNAIL",
  "SNAKE","SNARE","SNEAK","SOLAR","SOLID","SOLVE","SOUTH","SPACE","SPARE","SPEAK",
  "SPEED","SPEND","SPENT","SPICE","SPILL","SPINE","SPOKE","SPORT","SPRAY","SQUAD",
  "STAIN","STALE","STALL","STAMP","STAND","STARE","STARK","START","STEAM","STEEL",
  "STEEP","STERN","STICK","STIFF","STILL","STOCK","STONE","STORE","STOUT","STRAW",
  "STRAY","STRIP","STUCK","STUDY","STYLE","SUGAR","SUITE","SUPER","SURGE","SWAMP",
  "SWEEP","SWEET","SWIFT","SWING","SWORD","SYRUP","TABLE","TAUNT","TAXES","TEACH",
  "TENSE","TENTH","TERMS","THEFT","THEIR","THICK","THINK","THORN","THOSE","THREE",
  "THREW","THROW","TIGER","TIGHT","TIMER","TIRED","TITLE","TODAY","TOKEN","TOTAL",
  "TOUCH","TOUGH","TOWER","TRACE","TRAIL","TRAIN","TRAIT","TRASH","TREAT","TRIAL",
  "TRIBE","TRIED","TROLL","TROOP","TRUCK","TRULY","TRUST","TRUTH","TUMOR","TWICE",
  "TWIST","ULTRA","UNION","UNITY","UNTIL","UPPER","UPSET","URBAN","USAGE","USUAL",
  "UTTER","VALID","VALUE","VALVE","VAPOR","VAULT","VERSE","VIDEO","VIGOR","VIRAL",
  "VIRUS","VISIT","VISTA","VITAL","VOCAL","VOICE","VOTER","WAGON","WASTE","WATCH",
  "WATER","WEARY","WEAVE","WEIGH","WEIRD","WHALE","WHEAT","WHEEL","WHICH","WHILE",
  "WIDEN","WINDY","WOMAN","WOMEN","WOODS","WORLD","WORRY","WORSE","WORST","WORTH",
  "WRATH","WRIST","WRONG","YACHT","YEARN","YIELD","YOUNG","YOURS","YOUTH","ZESTY",
  "ZIPPY","BLAZE","BLAND","BLIND","BLOND","BLUNT","BLUSH","BOGUS","BORED","BOSSY",
  "BOXER","BRAID","BRAND","BRASH","BRAWN","BREAD","BRINE","BRINK","BRISK","BROIL",
  "BROOD","BROTH","BRUNT","BRUTE","BUDDY","BULGE","BULLY","BURLY","BURNS","BURST",
  "BUSHY","CAMEL","CAPER","CARGO","CAVES","CEDAR","CHALK","CHAMP","CHANT","CHARM",
  "CHASE","CHEAP","CHEAT","CHEEK","CHEER","CHICK","CHIDE","CHILL","CHIPS","CHOIR",
  "CHOKE","CHOMP","CHORE","CHOSE","CHUCK","CHUMP","CHUNK","CHURN","CIDER","CIGAR",
  "CINCH","CLAMP","CLANK","CLASH","CLASP","CLEFT","CLING","CLINK","CLOAK","CLONE",
  "CLOTH","CLOUT","CLUBS","CLUCK","CLUMP","CLUNG","COBRA","COCOA","CORAL","CORDS",
  "COVET","CRAMP","CRANK","CREAK","CREEP","CRIMP","CROAK","CRONE","CROOK","CROPS",
  "CRUDE","CRUEL","CRUMB","CRUST","CRYPT","CURLY","CURRY","CUSHY","CYNIC","DAISY",
  "DATUM","DEALS","DEALT","DECAY","DECOY","DERBY","DIGIT","DINGO","DISCO","DITCH",
  "DITTY","DIVER","DIZZY","DODGE","DOGMA","DOLLS","DOORS","DOWRY","DRAPE","DRAWL",
  "DROOL","DROOP","DROPS","DROSS","DROWN","DRYER","DUNCE","DUSTY","DWARF","EASEL",
  "ELITE","ELUDE","EMOTE","ENACT","EPOCH","EQUIP","EVADE","EVENT","EVICT","EVOKE",
  "EXERT","EXILE","EXUDE","FACET","FARCE","FAUNA","FERRY","FETUS","FIEND","FIERY",
  "FILET","FILTH","FINCH","FLAIR","FLASK","FLECK","FLING","FLINT","FLOSS","FOAMY",
  "FOGGY","FORAY","FORGE","FORTE","FORUM","FRAIL","FRAME","FRANK","FRAUD","FREAK",
  "FREED","FRIAR","FROZE","FUNGI","FLANK","FROTH","GAUGE","GAUZE","GAVEL","GECKO",
  "GENRE","GIDDY","GIRTH","GLAND","GLEAN","GLOAT","GLYPH","GNASH","GOUGE","GOURD",
  "GRAIL","GREED","GROIN","GROPE","GUILE","GUISE","GULCH","GUSTS","GYPSY","HEIST",
  "HIPPY","HOARY","HORDE","HORNS","HOVER","HOWLS","HUMID","HUNTS","HYENA","IGLOO",
  "INEPT","INFER","INLET","INSET","INTER","INTRO","IONIC","IRATE","IRONY","ITCHY",
  "IVORY","JAUNT","JAZZY","JERKY","JOUST","KNACK","KNAVE","KNEEL","KNELT","KNOBS",
  "KNOLL","KNOTS","LANKY","LAPEL","LAPSE","LATCH","LEAPT","LEAFY","LEAKY","LEASH",
  "LEDGE","LINER","LITHE","LOFTY","LOWLY","LUMPY","LUSTY","MANLY","MARSH","MEALY",
  "MELEE","MESSY","MIDST","MIRTH","MISER","MISTY","MOGUL","MOLDY","MONKS","MOSSY",
  "MOTIF","MOURN","MUDDY","MURKY","MUSTY","NASAL","NASTY","NERVY","NICHE","NIPPY",
  "NOMAD","NOTCH","NYMPH","OFFAL","OPTIC","ORBIT","ORGAN","OVARY","OVOID","PAGAN",
  "PARKA","PAUSE","PAVED","PEDAL","PENAL","PERCH","PERKY","PERIL","PETAL","PETTY",
  "PHONY","PIETY","PLAID","PLUMB","PLUME","PLUMP","PLUNK","PLUSH","POACH","POLKA",
  "POLYP","POPPY","POUTY","PRAWN","PROBE","PRONG","PROWL","PROXY","PSALM","PULPY",
  "PURGE","PYGMY","QUALM","QUIRK","RACER","RASPY","REEDY","REPAY","REPEL","RERUN",
  "RESET","RESIN","RETRO","RINSE","RIVET","ROOST","ROTOR","ROWDY","RUDDY","RUMOR",
  "RUNNY","SADLY","SANDY","SASSY","SAVOR","SAVVY","SCALD","SCALP","SCALY","SCAMP",
  "SCANT","SCOLD","SCONE","SCOOP","SCOUR","SCOWL","SCRAM","SCREW","SCRUB","SEEDY",
  "SERUM","SEVER","SEWER","SHADY","SHAKY","SHALE","SHARP","SHEEN","SHELF","SHELL",
  "SHINE","SHINY","SHIRE","SHONE","SHOWY","SHRUB","SHUCK","SHUNT","SIGMA","SILKY",
  "SINEW","SIREN","SIXTH","SLIMY","SLINK","SLOPE","SLOSH","SLOTH","SLUMP","SLURP",
  "SMACK","SMEAR","SMELT","SMIRK","SMITE","SNAKY","SNEER","SNIDE","SNIFF","SNORE",
  "SNORT","SNOWY","SNUCK","SOGGY","SOOTY","SORRY","SPANK","SPAWN","SPECK","SPIRE",
  "SPITE","SPOOK","SPOON","SPORE","SPOUT","SPUNK","SPURN","SQUAT","SQUID","STAID",
  "STOMP","STONY","STOIC","STORM","STRAP","STREP","STRUT","STUNG","STUNK","STUNT",
  "SUAVE","SUEDE","SULKY","SURLY","SWARM","SWATH","SWEPT","SWILL","SWIRL","SWOOP",
  "TABBY","TALON","TANGY","TAPIR","TARDY","TASTY","TAWNY","TEPID","THIEF","THROE",
  "TIMID","TIPSY","TITAN","TONIC","TOPAZ","TORSO","TOTEM","TOXIC","TREAD","TRUCE",
  "TRUMP","TRYST","TUBER","TULIP","TUNIC","TUTOR","TWEED","TWIRL","UNIFY","USURP",
  "VAPID","VENAL","VIGIL","VIPER","VIXEN","VOUCH","WACKY","WALTZ","WANED","XENON",
  "ABBEY","ABBOT","ABHOR","ABIDE","ABYSS","ADEPT","AFFIX","AFOOT","AGILE","AGLOW",
  "AISLE","ALGAE","ALIBI","ALOFT","ALOOF","ALOUD","ALPHA","ALTAR","AMAZE","AMBLE",
  "AMEND","AMISS","AMPLE","AMUSE","ANNEX","ANNOY","ANTIC","ANVIL","APTLY","ARDOR",
  "ARGOT","AROMA","ATONE","ATTIC","AUDIT","AUGUR","AVAIL","AVERT","BADGE","BARGE",
  "BARON","BASTE","BATCH","BATHE","BAYOU","BEEFY","BEIGE","BELLE","BELLY","BERTH",
  "BEVEL","BISON","BLOAT","BLOKE","BLUFF","BLURB","BLURT","BOUGH","BRAWL","BURRO",
  "BUTCH","BYLAW","CACHE","CADET","CAMEO","CARAT","CARVE","CATTY","CAVIL","CEASE",
  "CHAFE","CHAFF","CHASM","CHIME","CHIVE","CHOCK","CHOPS","CLANG","CLEAT","CLOWN",
  "COMBO","COMMA","COMFY","CONCH","CONDO","COPSE","COUPE","CROON","CUBIC","DAFFY",
  "DANDY","DECAL","DEIFY","DEITY","DETER","DETOX","DEUCE","DEVIL","DIODE","DIRGE",
  "DIVVY","DOWDY","DOWEL","DOWSE","DUVET","EDIFY","EERIE","EGRET","ELBOW","ELDER",
  "EMCEE","EMERY","ENVOY","EPOXY","ETHIC","ETUDE","EXALT","FAINT","FERAL","FETID",
  "FISHY","FLORA","FLOUT","FLUME","FLUNK","FOLIO","FOLLY","FROND","FUNKY","FURRY",
  "GABBY","GAUDY","GEEKY","GERMY","GIMPY","GLIDE","GLINT","GNOME","GOLEM","GOODY",
  "GORGE","GRUFF","GULLY","GUSTO","HAMMY","HANDY","HARPY","HASTY","HATCH","HAUNT",
  "HAVOC","HAZEL","HEFTY","HIPPO","HOBBY","HOMER","HOVEL","HOWDY","HUFFY","HUSKY",
  "HYPER","IMBUE","IMPEL","INANE","INCUR","INERT","INGOT","IRKED","JIFFY","JOLLY",
  "JUMPY","KAYAK","KINKY","KITTY","KNELL","LARVA","LINGO","LIVID","LOBBY","LOOPY",
  "LOUSY","LURID","MANGY","MATEY","MEATY","MILKY","MINTY","MUDDY","MUGGY","MUSHY",
  "NATTY","NERDY","NUBBY","NUTTY","OCTET","OTTER","PADDY","PANSY","PAPAL","PEAKY",
  "PESKY","PHAGE","PHOTO","PIANO","PIGGY","PINEY","PITHY","PIXIE","PODGY","POUTY",
  "PRICK","PRIMP","PRIVY","PRUDE","PSYCH","PUDGY","PUFFY","PUNKY","PUSHY","QUAFF",
  "QUASH","QUASI","QUEER","QUELL","RABID","RANDY","RATTY","RAVEN","RAYON","RELAX",
  "RETCH","RHYME","RITZY","SAGGY","SAPPY","SAUCY","SILKY","SOAPY","SOUPY","SPIKY",
  "SPINY","SUDSY","SUNNY","TACKY","TAFFY","TATTY","TECHY","TERSE","TOUCHY","TRITE",
  "TUBBY","TUMID","TUMMY","TWANG","UMBRA","UNCUT","UNFIT","UNLIT","VAGUE","VENOM",
  "VICAR","VIVID","VOGUE","VOMIT","WAGER","WANLY","WARTY","WAXEN","WEEDY","WHINY",
  "WIMPY","WITTY","WORDY","WORMY","WOOZY","YAPPY","YUCKY","ZINGY",
];

// ── WORD ROTATION ENGINE ───────────────────────────────────────────────────
// Deduplicates and shuffles the word list
const WORDS = [...new Set(ALL_WORDS.filter(w => w.length === 5))];

// Global rotation state — tracks which words have been used across ALL rooms
// Resets once all words are exhausted so it never truly runs out
let globalUsedWords = new Set();
let shuffledPool = [...WORDS].sort(() => Math.random() - 0.5);
let poolIndex = 0;

function getNextWord() {
  // If we've used all words, reset and reshuffle
  if (poolIndex >= shuffledPool.length) {
    globalUsedWords.clear();
    shuffledPool = [...WORDS].sort(() => Math.random() - 0.5);
    poolIndex = 0;
    console.log(`Word pool exhausted — reshuffled ${shuffledPool.length} words`);
  }

  // Skip any word used in the last 24h window (extra safety)
  let word = shuffledPool[poolIndex];
  while (globalUsedWords.has(word) && poolIndex < shuffledPool.length) {
    poolIndex++;
    word = shuffledPool[poolIndex];
  }

  globalUsedWords.add(word);
  poolIndex++;
  console.log(`Word assigned: ${word} (${poolIndex}/${shuffledPool.length} used)`);
  return word;
}

// Auto-clear used words every 24 hours so players can see words again
setInterval(() => {
  globalUsedWords.clear();
  shuffledPool = [...WORDS].sort(() => Math.random() - 0.5);
  poolIndex = 0;
  console.log('Daily word pool reset');
}, 24 * 60 * 60 * 1000);

// ── ROOMS ──────────────────────────────────────────────────────────────────
const rooms = {};

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do {
    code = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (rooms[code]);
  return code;
}

// ── SOCKET EVENTS ──────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('room:create', ({ playerName }) => {
    const roomCode = generateRoomCode();
    const word = getNextWord();

    rooms[roomCode] = {
      code: roomCode,
      word,
      players: [{ id: socket.id, name: playerName, guessCount: null, solved: null }],
      started: false,
      createdAt: Date.now(),
    };

    socket.join(roomCode);
    socket.roomCode = roomCode;
    socket.emit('room:joined', { roomCode, word });
    console.log(`Room ${roomCode} created by ${playerName} — word: ${word}`);
  });

  socket.on('room:join', ({ roomCode, playerName }) => {
    const room = rooms[roomCode];

    if (!room) {
      socket.emit('room:error', { message: 'Room not found. Check the code and try again.' });
      return;
    }
    if (room.players.length >= 2) {
      socket.emit('room:error', { message: 'Room is full.' });
      return;
    }
    if (room.started) {
      socket.emit('room:error', { message: 'Game already started.' });
      return;
    }

    room.players.push({ id: socket.id, name: playerName, guessCount: null, solved: null });
    socket.join(roomCode);
    socket.roomCode = roomCode;
    room.started = true;

    // Tell joiner their word + opponent name
    socket.emit('room:joined', { roomCode, word: room.word });
    socket.emit('game:start', { word: room.word, opponentName: room.players[0].name });

    // Tell creator opponent has arrived
    socket.to(roomCode).emit('room:opponent_joined', { name: playerName });

    console.log(`${playerName} joined room ${roomCode}`);
  });

  socket.on('game:submit_result', ({ roomCode, guessCount, solved }) => {
    const room = rooms[roomCode];
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    player.guessCount = guessCount;
    player.solved = solved;

    // Notify opponent this player finished
    socket.to(roomCode).emit('game:opponent_done', { guessCount, solved });

    // Check if both players are done
    const allDone = room.players.length === 2 && room.players.every(p => p.guessCount !== null);
    if (allDone) {
      const [p1, p2] = room.players;
      const g1 = p1.solved ? p1.guessCount : 99;
      const g2 = p2.solved ? p2.guessCount : 99;

      let winner = 'tie';
      if (g1 < g2) winner = p1.id;
      else if (g2 < g1) winner = p2.id;

      room.players.forEach(p => {
        const opp = room.players.find(x => x.id !== p.id);
        io.to(p.id).emit('game:result', {
          winner: winner === 'tie' ? 'tie' : winner === p.id ? 'me' : 'opponent',
          myGuesses: p.solved ? p.guessCount : null,
          opponentGuesses: opp?.solved ? opp.guessCount : null,
          word: room.word,
        });
      });

      // Clean up room after 60s
      setTimeout(() => {
        delete rooms[roomCode];
        console.log(`Room ${roomCode} cleaned up`);
      }, 60000);
    }
  });

  socket.on('disconnect', () => {
    const roomCode = socket.roomCode;
    if (roomCode && rooms[roomCode]) {
      socket.to(roomCode).emit('room:opponent_left');
      // Give 30s grace period before deleting (in case of reconnect)
      setTimeout(() => {
        const room = rooms[roomCode];
        if (room && !room.players.find(p => p.id !== socket.id && io.sockets.sockets.get(p.id))) {
          delete rooms[roomCode];
          console.log(`Room ${roomCode} deleted after disconnect`);
        }
      }, 30000);
    }
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// ── STATS ENDPOINT ─────────────────────────────────────────────────────────
app.get('/stats', (req, res) => {
  res.json({
    activeRooms: Object.keys(rooms).length,
    wordsUsed: globalUsedWords.size,
    totalWords: WORDS.length,
    poolRemaining: shuffledPool.length - poolIndex,
  });
});

// ── SERVER START ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Wordle Duel server running on port ${PORT}`);
  console.log(`Word pool loaded: ${WORDS.length} unique words`);
});

// Keep-alive ping for Render free tier (prevents spin-down)
const SELF_URL = process.env.RENDER_EXTERNAL_URL || null;
if (SELF_URL) {
  setInterval(async () => {
    try {
      await fetch(SELF_URL);
      console.log('Keep-alive ping sent');
    } catch (e) {
      console.log('Keep-alive ping failed:', e.message);
    }
  }, 10 * 60 * 1000);
}
