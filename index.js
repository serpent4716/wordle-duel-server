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
const ALL_WORDS = [
  "HELLO","DOLLY","HOLLY","JOLLY","MOLLY","BULLY","FULLY","JELLY","BELLY","TELLY",
  "SILLY","BILLY","WILLY","BOBBY","HOBBY","LOBBY","TABBY","ABBEY","HUBBY","TUBBY",
  "DADDY","PADDY","CADDY","TEDDY","BUDDY","MUDDY","RUDDY","FUNNY","BUNNY","RUNNY",
  "SUNNY","PENNY","JENNY","BINNY","TINNY","BONNY","SONNY","HONEY","PHONY","CORNY",
  "TACKY","LUCKY","DUCKY","YUCKY","WACKY","COCKY","ROCKY","DICKY","NICKY","PICKY",
  "FUZZY","JAZZY","FIZZY","DIZZY","TIZZY","WOOZY","DAFFY","TAFFY","JIFFY","PUFFY",
  "HUFFY","PANSY","DAISY","NOISY","POPPY","HAPPY","SAPPY","NAPPY","YAPPY","ZIPPY",
  "NIPPY","SIPPY","PUPPY","GUPPY","MUGGY","BUGGY","DUGGY","SOGGY","BOGGY","DOGGY",
  "FOGGY","SAGGY","BAGGY","LEGGY","PIGGY","TUBBY","FISHY","MUSHY","CUSHY","PUSHY",
  "GOOFY","LEAFY","BEEFY","NERVY","CURVY","KINKY","DINKY","FINKY","PINKY","FUNKY",
  "HUNKY","LANKY","PERKY","JERKY","DORKY","PORKY","MURKY","MILKY","SILKY","SULKY",
  "BALMY","PALMY","FILMY","HORSE","MOUSE","TIGER","SHEEP","MOOSE","SNAKE","EAGLE",
  "WHALE","SHARK","SQUID","TROUT","BISON","HYENA","HIPPO","RHINO","PANDA","KOALA",
  "CAMEL","RAVEN","CRANE","STORK","FINCH","ROBIN","QUAIL","SWIFT","SNAIL","COBRA",
  "VIPER","ADDER","OTTER","STOAT","VIXEN","PERCH","PRAWN","KITTY","BUNNY","DOGGY",
  "PIZZA","PASTA","BREAD","SUGAR","CREAM","SAUCE","GRAVY","SALAD","STEAK","ROAST",
  "BROTH","BAGEL","SCONE","DONUT","WAFER","CRISP","JUICE","LEMON","APPLE","MANGO",
  "GRAPE","PEACH","OLIVE","ONION","BASIL","THYME","CUMIN","CLOVE","CHILI","CAPER",
  "CURRY","KEBAB","SUSHI","RAMEN","CREPE","SYRUP","TODDY","PUNCH","TONIC","VODKA",
  "CIDER","STOUT","LAGER","SHIRT","PANTS","JEANS","SKIRT","DRESS","SCARF","GLOVE",
  "BOOTS","SHOES","SOCKS","BOXER","BERET","VISOR","TIARA","CROWN","SHAWL","CLOAK",
  "TUNIC","APRON","SMOCK","FROCK","KILT","STORM","FLOOD","FROST","STEAM","CLOUD",
  "SOLAR","LUNAR","COMET","ORBIT","TIDAL","CREEK","BROOK","RIVER","DELTA","FJORD",
  "GORGE","RIDGE","BLUFF","CLIFF","MARSH","SWAMP","BAYOU","OASIS","ATOLL","SHOAL",
  "RUGBY","CHESS","DARTS","BOWLS","RODEO","SUMO","JUDO","KAYAK","CANOE","SKATE",
  "PITCH","FIELD","COURT","TRACK","BLUES","JAZZ","SOUL","FUNK","DISCO","INDIE",
  "OPERA","CHOIR","TEMPO","CHORD","NOTES","ABOUT","ABOVE","ABUSE","ACUTE","ADMIT",
  "ADOPT","ADULT","AFTER","AGAIN","AGENT","AGREE","AHEAD","ALARM","ALBUM","ALERT",
  "ALIKE","ALIVE","ALLEY","ALLOW","ALONE","ALONG","ALTER","ANGEL","ANGER","ANGLE",
  "ANGRY","APART","APPLE","APPLY","ARENA","ARGUE","ARISE","ARMOR","ARRAY","ASIDE",
  "ASSET","AVOID","AWARD","AWARE","AWFUL","BAKER","BASIC","BASIS","BEACH","BEARD",
  "BEAST","BEGIN","BEING","BELOW","BENCH","BIBLE","BIRTH","BLACK","BLADE","BLANK",
  "BLAST","BLEED","BLEND","BLESS","BLOCK","BLOOD","BLOOM","BLOWN","BLUES","BOARD",
  "BONUS","BOOST","BOOTH","BOUND","BRACE","BRAIN","BRAVE","BREAK","BREED","BRICK",
  "BRIDE","BRIEF","BRING","BROKE","BROOK","BROWN","BRUSH","BUILD","BUILT","BUNCH",
  "BURNT","BUYER","CABIN","CANDY","CARRY","CATCH","CAUSE","CHAIN","CHAIR","CHAOS",
  "CHECK","CHESS","CHEST","CHIEF","CHILD","CIVIC","CIVIL","CLAIM","CLASS","CLEAN",
  "CLEAR","CLERK","CLICK","CLIFF","CLIMB","CLOCK","CLOSE","CLOUD","COACH","COAST",
  "COLOR","COMET","COMIC","COUCH","COULD","COUNT","COURT","COVER","CRACK","CRAFT",
  "CRANE","CRASH","CRAVE","CRAZY","CREEK","CRIME","CRISP","CROSS","CROWD","CROWN",
  "CRUSH","CURVE","CYCLE","DAILY","DANCE","DELAY","DELTA","DENSE","DEPOT","DEPTH",
  "DIRTY","DOING","DONOR","DOUBT","DOUGH","DRAFT","DRAIN","DRAWN","DREAD","DREAM",
  "DRIFT","DRINK","DRIVE","DROVE","DRUGS","DRUMS","DRUNK","DYING","EAGER","EARLY",
  "EARTH","EIGHT","ELECT","EMPTY","ENEMY","ENJOY","ENTER","ENTRY","EQUAL","ERROR",
  "ESSAY","EVERY","EXACT","EXIST","EXTRA","FABLE","FAITH","FALSE","FANCY","FATAL",
  "FAULT","FEAST","FEVER","FIELD","FIFTH","FIFTY","FIGHT","FINAL","FIRST","FIXED",
  "FLAME","FLARE","FLASH","FLESH","FLICK","FLOCK","FLOOD","FLOOR","FLOUR","FLUTE",
  "FOCUS","FOLKS","FORCE","FRONT","FROST","FRUIT","FULLY","FUNNY","GHOST","GIANT",
  "GIVEN","GLASS","GLEAM","GLOBE","GLOOM","GLOSS","GLOVE","GOING","GRACE","GRADE",
  "GRAIN","GRAND","GRANT","GRASP","GRASS","GRAZE","GREET","GRIEF","GRILL","GRIND",
  "GROAN","GROUP","GROVE","GROWN","GUARD","GUESS","GUIDE","GUILT","HABIT","HAPPY",
  "HARSH","HASTE","HAVEN","HEART","HEAVY","HONOR","HORSE","HOTEL","HOURS","HOUSE",
  "HUMAN","HUMOR","HURRY","IDEAL","IMAGE","IMPLY","INDEX","INNER","INPUT","ISSUE",
  "JAPAN","JEWEL","JUDGE","JUICE","JUICY","JUMBO","KNIFE","KNOCK","KNOWN","LABEL",
  "LARGE","LASER","LATER","LAUGH","LAYER","LEARN","LEASE","LEAST","LEAVE","LEGAL",
  "LEMON","LEVEL","LIGHT","LIMIT","LOCAL","LOGIC","LOOSE","LOVER","LOWER","LUCKY",
  "LUNAR","LUNCH","LYING","MAGIC","MAJOR","MAKER","MANOR","MAPLE","MARCH","MARRY",
  "MATCH","MAYOR","MEANT","MEDIA","MERCY","MERIT","METAL","MIGHT","MILES","MINOR",
  "MINUS","MODEL","MONEY","MONTH","MORAL","MOUNT","MOUSE","MOVIE","MUSIC","NAIVE",
  "NAKED","NIGHT","NOBLE","NOISE","NORTH","NOTED","NOVEL","NURSE","OCCUR","OFFER",
  "OFTEN","OLIVE","OPERA","OTHER","OUGHT","OUTER","OWNER","OZONE","PAINT","PANEL",
  "PANIC","PAPER","PEACE","PEACH","PEARL","PENNY","PHASE","PILOT","PITCH","PIXEL",
  "PIZZA","PLACE","PLAIN","PLANE","PLANT","PLATE","PLAZA","POINT","POKER","POLAR",
  "PORCH","PRESS","PRICE","PRIDE","PRINT","PRONE","PROOF","PROSE","PUNCH","PUPIL",
  "PURSE","QUEEN","QUERY","QUEST","QUICK","QUIET","QUOTA","QUOTE","RADAR","RAISE",
  "RALLY","RANCH","RANGE","RAPID","RATIO","REACH","READY","REALM","REBEL","RIGID",
  "RISKY","RIVAL","RIVER","ROBOT","ROCKY","ROUGH","ROUND","ROUTE","RULER","RURAL",
  "RUSTY","SAINT","SALAD","SAUCE","SCALE","SCARY","SCENE","SCORE","SCOUT","SEIZE",
  "SENSE","SEVEN","SHADE","SHAFT","SHAKE","SHALL","SHAME","SHAPE","SHARE","SHIFT",
  "SHIRT","SHOCK","SHOOT","SHORE","SHORT","SHOUT","SHOWN","SIGHT","SILLY","SINCE",
  "SIXTY","SKILL","SKULL","SLATE","SLASH","SLEEP","SLICE","SLIDE","SLIME","SMALL",
  "SMART","SMELL","SMILE","SMOKE","SNACK","SNAIL","SNAKE","SNARE","SNEAK","SOLAR",
  "SOLID","SOLVE","SOUTH","SPACE","SPARE","SPEAK","SPEED","SPEND","SPENT","SPICE",
  "SPILL","SPINE","SPOKE","SPORT","SPRAY","SQUAD","STAIN","STALE","STALL","STAMP",
  "STAND","STARE","STARK","START","STEAM","STEEL","STEEP","STERN","STICK","STIFF",
  "STILL","STOCK","STONE","STORE","STOUT","STRAW","STRAY","STRIP","STUCK","STUDY",
  "STYLE","SUGAR","SUITE","SUPER","SURGE","SWAMP","SWEEP","SWEET","SWIFT","SWING",
  "SWORD","SYRUP","TABLE","TAUNT","TAXES","TEACH","TENSE","TENTH","TERMS","THEFT",
  "THEIR","THICK","THINK","THORN","THOSE","THREE","THREW","THROW","TIGER","TIGHT",
  "TIMER","TIRED","TITLE","TODAY","TOKEN","TOTAL","TOUCH","TOUGH","TOWER","TRACE",
  "TRAIL","TRAIN","TRAIT","TRASH","TREAT","TRIAL","TRIBE","TRIED","TROLL","TROOP",
  "TRUCK","TRULY","TRUST","TRUTH","TUMOR","TWICE","TWIST","ULTRA","UNION","UNITY",
  "UNTIL","UPPER","UPSET","URBAN","USAGE","USUAL","UTTER","VALID","VALUE","VALVE",
  "VAPOR","VAULT","VERSE","VIDEO","VIGOR","VIRAL","VIRUS","VISIT","VISTA","VITAL",
  "VOCAL","VOICE","VOTER","WAGON","WASTE","WATCH","WATER","WEARY","WEAVE","WEIGH",
  "WEIRD","WHALE","WHEAT","WHEEL","WHICH","WHILE","WIDEN","WINDY","WOMAN","WOMEN",
  "WOODS","WORLD","WORRY","WORSE","WORST","WORTH","WRATH","WRIST","WRONG","YACHT",
  "YEARN","YIELD","YOUNG","YOURS","YOUTH","ZESTY","ZIPPY","BLAZE","BLAND","BLIND",
  "BLOND","BLUNT","BLUSH","BOGUS","BORED","BOSSY","BOXER","BRAID","BRAND","BRASH",
  "BRAWN","BREAD","BRINE","BRINK","BRISK","BROIL","BROOD","BROTH","BRUNT","BRUTE",
  "BUDDY","BULGE","BULLY","BURLY","BURNS","BURST","BUSHY","CAMEL","CAPER","CARGO",
  "CHARM","CHASE","CHEAP","CHEAT","CHEEK","CHEER","CHICK","CHILL","CHIPS","CHOKE",
  "CHOMP","CHORE","CHUCK","CHUNK","CIDER","CIGAR","CINCH","CLAMP","CLASH","CLEFT",
  "CLING","CLINK","CLOAK","CLONE","CLOTH","CLOUT","CLUCK","CLUMP","COBRA","COCOA",
  "CORAL","COVET","CRAMP","CRANK","CREAK","CREEP","CROAK","CROOK","CROPS","CRUDE",
  "CRUEL","CRUMB","CRUST","CRYPT","CURLY","CURRY","CUSHY","CYNIC","DAISY","DECAY",
  "DERBY","DIGIT","DINGO","DISCO","DITCH","DIVER","DIZZY","DODGE","DUNCE","DUSTY",
  "DWARF","ELITE","ELUDE","EMOTE","EPOCH","EVADE","EVENT","EVOKE","EXILE","FACET",
  "FARCE","FAUNA","FERRY","FIEND","FIERY","FILTH","FINCH","FLAIR","FLASK","FLECK",
  "FLING","FLINT","FOAMY","FOGGY","FORAY","FORGE","FORTE","FORUM","FRAIL","FRAME",
  "FRANK","FRAUD","FREAK","FRIAR","FROZE","FUNGI","FROTH","GAUGE","GAUZE","GECKO",
  "GENRE","GIDDY","GIRTH","GLAND","GLEAN","GLOAT","GNASH","GOURD","GRAIL","GREED",
  "GROIN","GUILE","GUISE","GULCH","GYPSY","HEIST","HIPPY","HORDE","HOVER","HUMID",
  "HYENA","IGLOO","INEPT","INFER","INLET","INTER","INTRO","IRATE","IRONY","ITCHY",
  "IVORY","JAUNT","JAZZY","JERKY","JOUST","KNACK","KNAVE","KNEEL","KNOBS","KNOLL",
  "LANKY","LAPEL","LAPSE","LATCH","LEAPT","LEAFY","LEASH","LEDGE","LINER","LITHE",
  "LOFTY","LOWLY","LUMPY","LUSTY","MANLY","MARSH","MEALY","MELEE","MESSY","MIDST",
  "MIRTH","MISER","MISTY","MOGUL","MOLDY","MOSSY","MOTIF","MOURN","MUDDY","MURKY",
  "MUSTY","NASAL","NASTY","NERVY","NICHE","NOMAD","NOTCH","NYMPH","OPTIC","ORBIT",
  "ORGAN","OVOID","PARKA","PAUSE","PAVED","PEDAL","PERCH","PERKY","PERIL","PETAL",
  "PETTY","PHONY","PLAID","PLUMB","PLUME","PLUMP","PLUNK","PLUSH","POACH","POLKA",
  "POLYP","POPPY","POUTY","PRAWN","PROBE","PRONG","PROWL","PROXY","PULPY","PURGE",
  "QUALM","QUIRK","RASPY","REEDY","REPAY","REPEL","RESET","RESIN","RETRO","RINSE",
  "RIVET","ROOST","ROWDY","RUMOR","RUNNY","SADLY","SANDY","SASSY","SAVOR","SAVVY",
  "SCALD","SCALP","SCALY","SCAMP","SCANT","SCOLD","SCONE","SCOOP","SCOUR","SCOWL",
  "SCREW","SCRUB","SEEDY","SERUM","SEVER","SEWER","SHADY","SHAKY","SHALE","SHARP",
  "SHEEN","SHELF","SHELL","SHINE","SHINY","SHIRE","SHONE","SHOWY","SHRUB","SHUCK",
  "SIGMA","SINEW","SIREN","SLIMY","SLINK","SLOPE","SLOSH","SLOTH","SLUMP","SLURP",
  "SMACK","SMEAR","SMELT","SMIRK","SMITE","SNAKY","SNEER","SNIDE","SNIFF","SNORE",
  "SNORT","SNOWY","SNUCK","SOOTY","SPANK","SPAWN","SPECK","SPIRE","SPITE","SPOOK",
  "SPOON","SPORE","SPOUT","SPUNK","SPURN","SQUAT","SQUID","STAID","STOMP","STONY",
  "STOIC","STORM","STRAP","STRUT","STUNG","STUNK","STUNT","SUAVE","SUEDE","SULKY",
  "SURLY","SWARM","SWATH","SWEPT","SWIRL","SWOOP","TABBY","TALON","TANGY","TAPIR",
  "TARDY","TASTY","TAWNY","TEPID","THIEF","THROE","TIMID","TIPSY","TITAN","TONIC",
  "TOPAZ","TORSO","TOTEM","TOXIC","TREAD","TRUCE","TRUMP","TRYST","TUBER","TULIP",
  "TUNIC","TUTOR","TWEED","TWIRL","UNIFY","USURP","VAPID","VENAL","VIGIL","VIPER",
  "VIXEN","VOUCH","WACKY","WALTZ","WANED","XENON","ABBEY","ABHOR","ABIDE","ABYSS",
  "ADEPT","AFOOT","AGILE","AISLE","ALGAE","ALIBI","ALOFT","ALOOF","ALPHA","ALTAR",
  "AMAZE","AMBLE","AMEND","AMISS","AMPLE","AMUSE","ANNEX","ANNOY","ANTIC","ANVIL",
  "APTLY","ARDOR","ARGOT","AROMA","ATONE","ATTIC","AUGUR","AVAIL","AVERT","BADGE",
  "BARGE","BARON","BASTE","BATCH","BATHE","BAYOU","BEIGE","BELLE","BELLY","BERTH",
  "BEVEL","BISON","BLOAT","BLOKE","BLUFF","BLURB","BLURT","BOUGH","BRAWL","BURRO",
  "BYLAW","CACHE","CADET","CAMEO","CARAT","CARVE","CATTY","CAVIL","CEASE","CHAFE",
  "CHASM","CHIME","CHIVE","CHOPS","CLANG","CLEAT","CLOWN","COMBO","COMFY","CONCH",
  "CONDO","COPSE","COUPE","CROON","CUBIC","DAFFY","DANDY","DECAL","DEIFY","DEITY",
  "DETER","DETOX","DEUCE","DEVIL","DIODE","DIRGE","DIVVY","DOWDY","DOWEL","DUVET",
  "EERIE","EGRET","ELBOW","ELDER","EMCEE","EMERY","ENVOY","EPOXY","ETHIC","ETUDE",
  "EXALT","FAINT","FERAL","FETID","FISHY","FLORA","FLOUT","FLUME","FLUNK","FOLIO",
  "FOLLY","FROND","FUNKY","FURRY","GAUDY","GIMPY","GLIDE","GLINT","GNOME","GOLEM",
  "GORGE","GRUFF","GULLY","GUSTO","HAMMY","HANDY","HASTY","HATCH","HAUNT","HAVOC",
  "HAZEL","HEFTY","HIPPO","HOBBY","HOMER","HOVEL","HOWDY","HUFFY","HYPER","IMBUE",
  "IMPEL","INANE","INCUR","INERT","INGOT","IRKED","JIFFY","KITTY","KNELL","LARVA",
  "LINGO","LIVID","LOBBY","LOOPY","LOUSY","LURID","MANGY","MATEY","MEATY","MINTY",
  "MOLDY","NATTY","NERDY","NUBBY","NUTTY","OCTET","OTTER","PAPAL","PEAKY","PESKY",
  "PHAGE","PHOTO","PIANO","PINEY","PITHY","PIXIE","PODGY","POUTY","PRICK","PRIVY",
  "PRUDE","PSYCH","PUDGY","PUNKY","QUAFF","QUASH","QUASI","QUEER","QUELL","RABID",
  "RANDY","RATTY","RAVEN","RAYON","RELAX","RETCH","RHYME","RITZY","SAGGY","SAPPY",
  "SAUCY","SOAPY","SOUPY","SPIKY","SPINY","SUDSY","SUNNY","TACKY","TAFFY","TATTY",
  "TECHY","TERSE","TRITE","TUMID","TUMMY","TWANG","UMBRA","UNCUT","UNFIT","UNLIT",
  "VAGUE","VENOM","VICAR","VIVID","VOGUE","VOMIT","WAGER","WANLY","WARTY","WAXEN",
  "WEEDY","WHINY","WIMPY","WITTY","WORDY","WORMY","WOOZY","YAPPY","YUCKY","ZINGY",
];

const WORDS = [...new Set(ALL_WORDS.filter(w => w.length === 5))];
let shuffledPool = [...WORDS].sort(() => Math.random() - 0.5);
let poolIndex = 0;
let globalUsed = new Set();

function getNextWord() {
  if (poolIndex >= shuffledPool.length) {
    globalUsed.clear();
    shuffledPool = [...WORDS].sort(() => Math.random() - 0.5);
    poolIndex = 0;
  }
  const word = shuffledPool[poolIndex++];
  globalUsed.add(word);
  return word;
}

setInterval(() => {
  globalUsed.clear();
  shuffledPool = [...WORDS].sort(() => Math.random() - 0.5);
  poolIndex = 0;
  console.log('Daily word pool reset');
}, 24 * 60 * 60 * 1000);

// ── ROOMS ──────────────────────────────────────────────────────────────────
const rooms = {};

function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do { code = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''); }
  while (rooms[code]);
  return code;
}

// ── SOCKET ─────────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('Connect:', socket.id);

  socket.on('room:create', ({ playerName }) => {
    const roomCode = genCode();
    const word = getNextWord();
    rooms[roomCode] = {
      code: roomCode, word,
      players: [{ id: socket.id, name: playerName, number: 1 }],
      currentTurn: 1,
      guesses: [],
      rematchVotes: {},
      started: false,
    };
    socket.join(roomCode);
    socket.roomCode = roomCode;
    socket.emit('room:joined', { roomCode, word, playerNumber: 1 });
    console.log(`Room ${roomCode} created by ${playerName} — ${word}`);
  });

  socket.on('room:join', ({ roomCode, playerName }) => {
    const room = rooms[roomCode];
    if (!room) { socket.emit('room:error', { message: 'Room not found.' }); return; }
    if (room.players.length >= 2) { socket.emit('room:error', { message: 'Room is full.' }); return; }
    if (room.started) { socket.emit('room:error', { message: 'Game already started.' }); return; }

    room.players.push({ id: socket.id, name: playerName, number: 2 });
    socket.join(roomCode);
    socket.roomCode = roomCode;
    room.started = true;

    // Tell joiner: their word + player number + opponent name
    socket.emit('room:joined', { roomCode, word: room.word, playerNumber: 2 });
    socket.emit('game:start', { word: room.word, opponentName: room.players[0].name, playerNumber: 2 });

    // Tell creator: opponent joined
    socket.to(roomCode).emit('room:opponent_joined', { name: playerName });
    console.log(`${playerName} joined room ${roomCode}`);
  });

  // A player made a guess — broadcast to opponent
  socket.on('game:guess', ({ roomCode, guess, result, won, nextTurn }) => {
    const room = rooms[roomCode];
    if (!room) return;
    room.guesses.push({ guess, result, player: room.players.find(p => p.id === socket.id)?.number });
    room.currentTurn = nextTurn;

    // Send guess to opponent
    socket.to(roomCode).emit('game:opponent_guess', { guess, result, nextTurn });

    if (won) {
      const winner = room.players.find(p => p.id === socket.id);
      const loser = room.players.find(p => p.id !== socket.id);
      const myGuesses = room.guesses.filter(g => g.player === winner.number).length;
      const oppGuesses = room.guesses.filter(g => g.player !== winner.number).length;

      io.to(winner.id).emit('game:result', { winner: 'me', word: room.word, myGuesses, opponentGuesses: oppGuesses });
      io.to(loser.id).emit('game:result', { winner: 'opponent', word: room.word, myGuesses: oppGuesses, opponentGuesses: myGuesses });
    }
  });

  // A player's turn timed out
  socket.on('game:turn_timeout', ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room) return;
    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;
    const nextTurn = player.number === 1 ? 2 : 1;
    room.currentTurn = nextTurn;
    socket.to(roomCode).emit('game:opponent_timeout', { nextTurn });
  });

  // Rematch vote
  socket.on('game:rematch', ({ roomCode, accept }) => {
    const room = rooms[roomCode];
    if (!room) return;
    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    if (!accept) {
      socket.to(roomCode).emit('room:opponent_left');
      delete rooms[roomCode];
      return;
    }

    room.rematchVotes[socket.id] = true;
    const allVoted = room.players.every(p => room.rematchVotes[p.id]);

    if (allVoted) {
      const newWord = getNextWord();
      room.word = newWord;
      room.guesses = [];
      room.currentTurn = 1;
      room.rematchVotes = {};
      io.to(roomCode).emit('game:rematch_accepted', { word: newWord });
      console.log(`Rematch in room ${roomCode} — new word: ${newWord}`);
    } else {
      socket.to(roomCode).emit('game:rematch_requested', { name: player.name });
    }
  });

  socket.on('disconnect', () => {
    const roomCode = socket.roomCode;
    if (roomCode && rooms[roomCode]) {
      socket.to(roomCode).emit('room:opponent_left');
      setTimeout(() => { delete rooms[roomCode]; }, 5000);
    }
    console.log('Disconnect:', socket.id);
  });
});

// ── STATS ──────────────────────────────────────────────────────────────────
app.get('/stats', (req, res) => {
  res.json({
    activeRooms: Object.keys(rooms).length,
    totalWords: WORDS.length,
    wordsUsed: globalUsed.size,
    poolRemaining: shuffledPool.length - poolIndex,
  });
});

// ── START ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Wordle Duel server running on port ${PORT}`);
  console.log(`Word pool: ${WORDS.length} unique words`);
});

// Keep-alive for Render free tier
const SELF_URL = process.env.RENDER_EXTERNAL_URL || null;
if (SELF_URL) {
  setInterval(async () => {
    try { await fetch(SELF_URL); console.log('Keep-alive ping'); }
    catch (e) { console.log('Ping failed:', e.message); }
  }, 10 * 60 * 1000);
}
