/* ==========================================================================
   Portfolio assistant
   A small, dependency-free chat widget. It answers from a curated knowledge
   base — no network calls, no API key, no data leaves the page.

   To change what it knows, edit KB below. Each intent is:
     { id, keys: [[phrase, weight], ...], answer, chips: [...] }
   Higher weights win ties; answers support **bold** and [label](url).
   ========================================================================== */

(function () {
  'use strict';

  var root = document.getElementById('chat-root');
  if (!root) return;

  var launch = document.getElementById('chat-launch');
  var panel = document.getElementById('chat-panel');
  var closeBtn = document.getElementById('chat-close');
  var log = document.getElementById('chat-log');
  var chipRow = document.getElementById('chat-chips');
  var form = document.getElementById('chat-form');
  var input = document.getElementById('chat-input');

  var started = false;
  var busy = false;

  var GREETING =
    "Hey — I'm Ali's portfolio assistant. Ask me about his background, his Student Management System, his stack, or whether he's open to an internship.";

  var FALLBACK =
    "I don't have that one in the portfolio. Try asking about his **education**, the **Student Management System**, his **skills**, or his **availability** — or reach him on GitHub: [github.com/AliAsger007](https://github.com/AliAsger007).";

  var DEFAULT_CHIPS = [
    "What's the Student Management System?",
    'What are his skills?',
    'Is he available for internships?'
  ];

  var KB = [
    {
      id: 'identity',
      keys: [
        ['are you ai', 7], ['are you a bot', 7], ['are you real', 7], ['are you ali', 7],
        ['is this ali', 7], ['chatbot', 6], ['robot', 5], ['are you him', 6],
        ['real person', 6], ['human', 4], ['bot', 3]
      ],
      answer:
        "I'm a script that answers from Ali's portfolio — not Ali, and not a general AI.\n\nEverything I say comes from this page. If you need him directly, [GitHub](https://github.com/AliAsger007) is the fastest route.",
      chips: ['What does he do?', 'What are his skills?']
    },
    {
      id: 'greeting',
      keys: [
        ['hello', 4], ['hi', 4], ['hey', 4], ['namaste', 4], ['good morning', 4],
        ['good evening', 4], ['yo', 3], ['hi there', 4]
      ],
      answer:
        "Hi. I can tell you about Ali's background, the Student Management System he built, his skills, or whether he's available for an internship.\n\nWhat would you like to know?",
      chips: ['Tell me about the project', 'What are his skills?', 'Is he available?']
    },
    {
      id: 'howitworks',
      keys: [
        ['how does it work', 9], ['how it works', 9], ['how does the system work', 9],
        ['how does the portal', 8], ['steps', 4], ['flow', 4], ['process', 3]
      ],
      answer:
        "Four steps:\n1. **Register** — a new student submits their details.\n2. **Generate** — the system issues a unique student ID and roll number.\n3. **Admin** — staff record courses, exams and backlogs.\n4. **Student portal** — the student sees their courses, exams and backlogs.\n\nThe interesting part is what the database refuses to allow: a roll number stays unique, and a backlog belongs to both a student and a subject.",
      chips: ['What did he build it with?', 'What are the features?']
    },
    {
      id: 'features',
      keys: [
        ['feature', 5], ['what does it do', 6], ['functions', 4], ['modules', 4],
        ['what can students see', 6], ['backlog', 3], ['roll number', 3]
      ],
      answer:
        "It's two modules.\n**Student portal** — the student's ID and roll number, enrolled course details, upcoming exams, and backlog papers awaiting re-examination.\n**Admin dashboard** — creates and updates students, courses, exam schedules and backlogs.\n\nThe portal only shows what the admin side has recorded.",
      chips: ['How does it work?', 'What did he build it with?']
    },
    {
      id: 'build',
      keys: [
        ['built with', 6], ['build it with', 6], ['tech stack', 5], ['which technology', 5],
        ['what technology', 5], ['database', 4], ['sql server', 5], ['backend', 2]
      ],
      answer:
        "HTML, CSS and JavaScript for the interface, and **Microsoft SQL Server** for the database. It was a solo build — schema, logic and UI.",
      chips: ['How does it work?', 'What are his skills?']
    },
    {
      id: 'project',
      keys: [
        ['student management', 7], ['project', 5], ['sms', 4], ['portal', 4],
        ['built', 3], ['system', 2], ['final year', 3], ['college project', 5]
      ],
      answer:
        "His main project is a **Student Management System** — a BCA final-year project, built solo in 2025.\n\nA new student registers and the system generates a unique student ID and roll number. Their **student portal** then shows enrolled courses, upcoming exams and backlog papers. An admin dashboard maintains the students, courses, exam schedules and backlogs behind it.\n\nFrontend in HTML, CSS and JavaScript; records in Microsoft SQL Server.",
      chips: ['How does it work?', 'What did he build it with?']
    },
    {
      id: 'experience',
      keys: [
        ['internship experience', 7], ['work experience', 7], ['experience', 5],
        ['worked', 4], ['company', 4], ['employ', 4], ['fresher', 4], ['job', 3]
      ],
      answer:
        "No professional experience yet — he's a student.\n\nWhat he does have is a solo project taken through the whole cycle: schema, admin side, student side, and the edge cases. That's the gap an internship is meant to close.",
      chips: ['Is he available for internships?', 'What are his strengths?']
    },
    {
      id: 'availability',
      keys: [
        ['available', 6], ['availability', 6], ['hire', 5], ['hiring', 4],
        ['internship', 4], ['opportunity', 4], ['open to', 4], ['recruit', 5]
      ],
      answer:
        "Yes — he's looking for an **internship in data engineering or backend development**, in Pune, hybrid or remote.\n\nStart dates and details are best discussed with him directly — email or GitHub.",
      chips: ['What is he looking for?', 'How do I contact him?']
    },
    {
      id: 'contact',
      keys: [
        ['contact', 6], ['email', 6], ['reach', 5], ['github', 4], ['linkedin', 4],
        ['phone', 6], ['number', 3], ['get in touch', 6], ['connect', 3], ['mail', 5]
      ],
      answer:
        "**Email** — [aliudaipur5312@gmail.com](mailto:aliudaipur5312@gmail.com)\n**GitHub** — [github.com/AliAsger007](https://github.com/AliAsger007)\n\nBoth reach him directly. The Contact section has buttons for email and GitHub, and a CV you can print.",
      chips: ['Download the CV', 'Is he available?']
    },
    {
      id: 'resume',
      keys: [
        ['resume', 6], ['cv', 6], ['download', 4], ['pdf', 4], ['one page', 4]
      ],
      answer:
        "Hit **View CV** anywhere on the page — it opens in an overlay, no download needed. From there you can open it in a tab or print it to PDF.",
      chips: ['How do I contact him?', 'What are his skills?']
    },
    {
      id: 'education',
      keys: [
        ['education', 5], ['college', 4], ['mca', 4], ['bca', 4], ['degree', 4],
        ['university', 3], ['studying', 4], ['study', 3], ['graduate', 4],
        ['school', 3], ['imped', 5], ['bharati', 5], ['qualification', 4],
        ['cgpa', 4], ['percentage', 3], ['course', 3]
      ],
      answer:
        "Two computer-application degrees:\n**MCA** — Bharati Vidyapeeth (Deemed University), IMED Pune. Started 2026, ongoing.\n**BCA** — Aishwarya College of Education Sansthan, Udaipur. Graduated 2025.\n\nHis BCA final-year project was the Student Management System.",
      chips: ['What is his project?', 'Where is he based?']
    },
    {
      id: 'about',
      keys: [
        ['who are you', 6], ['yourself', 5], ['introduce', 5], ['background', 4],
        ['about ali', 6], ['about him', 5], ['bio', 4], ['tell me about', 4]
      ],
      answer:
        "Ali Asger is an MCA student at **Bharati Vidyapeeth's IMED in Pune** (started 2026), and a 2025 BCA graduate from Aishwarya College of Education Sansthan in Udaipur.\n\nHe builds web applications end to end — the interface, the database, and the logic in between.",
      chips: ['What is his project?', 'What are his skills?']
    },
    {
      id: 'name',
      keys: [['your name', 6], ['name', 4], ['called', 4], ['who is he', 5]],
      answer: 'Ali Asger — that\'s the short version. On paper, Ali Asger, based in Pune.',
      chips: ['What does he do?', 'How do I contact him?']
    },
    {
      id: 'location',
      keys: [
        ['where is he', 6], ['where does he live', 6], ['located', 5], ['location', 5],
        ['based', 4], ['hometown', 5], ['pune', 4], ['udaipur', 4], ['from', 2], ['live', 3]
      ],
      answer:
        "**Pune, Maharashtra** — he's studying at IMED.\n\nHe's from Udaipur, Rajasthan, and grew up in Salumber before that. Open to internships in Pune, hybrid or remote.",
      chips: ['Is he available for internships?', 'What is his education?']
    },
    {
      id: 'skills',
      keys: [
        ['skill', 6], ['stack', 4], ['language', 4], ['python', 4], ['c++', 4],
        ['cpp', 4], ['javascript', 4], ['html', 3], ['css', 3], ['sql', 3],
        ['tools', 3], ['what does he know', 6], ['technologies', 4],
        ['dotnet', 5], ['net', 3]
      ],
      answer:
        "**Languages:** Python, C, C++, JavaScript, SQL (T-SQL)\n**Framework:** .NET\n**Web:** HTML, CSS\n**Database:** Microsoft SQL Server\n**Tools:** Git, GitHub\n\nNo percentages on the portfolio — it lists what he can actually do today, not what sounds good.",
      chips: ['What is his project?', 'What is he learning?']
    },
    {
      id: 'goals',
      keys: [
        ['goal', 6], ['future', 4], ['aim', 4], ['career', 5], ['data engineer', 6],
        ['want to be', 5], ['ambition', 5], ['plan', 3], ['next few years', 5]
      ],
      answer:
        "He's aiming at **backend and data** work — the part where correctness matters. Longer term, data engineering.\n\nThat's why the project leans on schema design rather than screens.",
      chips: ['What are his skills?', 'What is he looking for?']
    },
    {
      id: 'strengths',
      keys: [
        ['strength', 6], ['good at', 5], ['why hire', 7], ['why should', 6],
        ['advantage', 5], ['best at', 5]
      ],
      answer:
        "Two things stand out. He finishes what he starts — the Student Management System went from schema to admin screens, solo. And he's honest about level: the portfolio lists what he can do today, not a wall of logos.\n\nShort version: he'll tell you what he doesn't know yet.",
      chips: ['What is his project?', 'Is he available?']
    },
    {
      id: 'weakness',
      keys: [
        ['weakness', 7], ['weak', 6], ['improve', 4], ['not good at', 6],
        ['limitation', 5], ['struggle', 4]
      ],
      answer:
        "He'd say it himself: no professional experience yet, no team code review, no production systems.\n\nWhich is a fair description of any first internship — and the reason he's applying.",
      chips: ['What are his strengths?', 'Is he available?']
    },
    {
      id: 'salary',
      keys: [
        ['salary', 7], ['ctc', 7], ['stipend', 6], ['compensation', 7],
        ['package', 4], ['pay', 4], ['money', 4]
      ],
      answer:
        "That's not something the portfolio covers — best to ask Ali directly: [GitHub](https://github.com/AliAsger007).",
      chips: ['How do I contact him?']
    },
    {
      id: 'hobbies',
      keys: [['hobby', 7], ['hobbies', 7], ['free time', 6], ['for fun', 5], ['fun', 3]],
      answer:
        "Not on the portfolio either — ask him directly: [GitHub](https://github.com/AliAsger007).",
      chips: ['What is his project?']
    },
    {
      id: 'thanks',
      keys: [['thank', 5], ['thanks', 5], ['thx', 4], ['appreciate', 5]],
      answer: 'Anytime. Anything else you\'d like to know?',
      chips: DEFAULT_CHIPS
    },
    {
      id: 'bye',
      keys: [
        ['bye', 6], ['goodbye', 6], ['see you', 5], ['good night', 5], ['later', 2]
      ],
      answer:
        "Thanks for stopping by. If you'd like to talk to Ali directly: [GitHub](https://github.com/AliAsger007).",
      chips: []
    }
  ];

  /* ---------- Matching ---------------------------------------------------- */

  function normalize(text) {
    return ' ' + text.toLowerCase()
      .replace(/[\u2018\u2019\u0060\u00b4]/g, "'")
      .replace(/[^a-z0-9+#\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() + ' ';
  }

  function scoreIntent(intent, padded, tokens) {
    var score = 0;
    for (var i = 0; i < intent.keys.length; i++) {
      var phrase = intent.keys[i][0];
      var weight = intent.keys[i][1];

      if (phrase.indexOf(' ') > -1) {
        if (padded.indexOf(' ' + phrase + ' ') > -1) score += weight;
        continue;
      }

      for (var j = 0; j < tokens.length; j++) {
        var token = tokens[j];
        if (token === phrase) { score += weight; break; }
        if (phrase.length >= 4 && token.indexOf(phrase) === 0 && token.length <= phrase.length + 3) {
          score += weight * 0.8;
          break;
        }
      }
    }
    return score;
  }

  function answerFor(raw) {
    var padded = normalize(raw);
    var tokens = padded.trim().split(' ');
    var best = null;
    var bestScore = 0;

    for (var i = 0; i < KB.length; i++) {
      var score = scoreIntent(KB[i], padded, tokens);
      if (score > bestScore) { bestScore = score; best = KB[i]; }
    }

    if (!best || bestScore < 3) {
      return { text: FALLBACK, chips: DEFAULT_CHIPS };
    }
    return { text: best.answer, chips: best.chips || DEFAULT_CHIPS };
  }

  /* ---------- Rendering --------------------------------------------------- */

  function appendInline(parent, line) {
    var parts = line.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
    for (var i = 0; i < parts.length; i++) {
      var part = parts[i];
      if (!part) continue;

      if (part.slice(0, 2) === '**' && part.slice(-2) === '**') {
        var strong = document.createElement('strong');
        strong.textContent = part.slice(2, -2);
        parent.appendChild(strong);
        continue;
      }

      var link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link && /^(https?:\/\/|resume\.html)/.test(link[2])) {
        var a = document.createElement('a');
        a.textContent = link[1];
        a.href = link[2];
        if (link[2].indexOf('http') === 0) {
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
        }
        parent.appendChild(a);
        continue;
      }

      parent.appendChild(document.createTextNode(part));
    }
  }

  function renderRich(text, el) {
    var paragraphs = String(text).split('\n\n');
    for (var p = 0; p < paragraphs.length; p++) {
      if (!paragraphs[p]) continue;
      var node = document.createElement('p');
      var lines = paragraphs[p].split('\n');
      for (var l = 0; l < lines.length; l++) {
        if (l > 0) node.appendChild(document.createElement('br'));
        appendInline(node, lines[l]);
      }
      el.appendChild(node);
    }
  }

  function scrollDown() {
    log.scrollTop = log.scrollHeight;
  }

  /* Pin after paint and again after webfonts settle — long answers otherwise
     stop a line or two short of the bottom. */
  function pinToBottom() {
    scrollDown();
    requestAnimationFrame(scrollDown);
    setTimeout(scrollDown, 140);
  }

  function addMessage(who, text) {
    var wrap = document.createElement('div');
    wrap.className = 'msg msg-' + who;

    if (who === 'bot') {
      var avatar = document.createElement('div');
      avatar.className = 'msg-avatar';
      avatar.setAttribute('aria-hidden', 'true');
      avatar.textContent = 'AA';
      wrap.appendChild(avatar);
    }

    var body = document.createElement('div');
    body.className = 'msg-body';
    renderRich(text, body);
    wrap.appendChild(body);

    log.appendChild(wrap);
    pinToBottom();
  }

  function showTyping() {
    var wrap = document.createElement('div');
    wrap.className = 'msg msg-bot typing';

    var avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = 'AA';

    var body = document.createElement('div');
    body.className = 'msg-body';
    for (var i = 0; i < 3; i++) body.appendChild(document.createElement('span'));

    wrap.appendChild(avatar);
    wrap.appendChild(body);
    log.appendChild(wrap);
    pinToBottom();
    return wrap;
  }

  function setChips(list) {
    chipRow.textContent = '';
    if (!list || !list.length) return;
    for (var i = 0; i < list.length; i++) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip-btn';
      btn.textContent = list[i];
      chipRow.appendChild(btn);
    }
  }

  /* ---------- Conversation ------------------------------------------------ */

  function send(raw) {
    var text = String(raw || '').trim().slice(0, 200);
    if (!text || busy) return;

    addMessage('user', text);
    input.value = '';
    busy = true;
    setChips([]);

    var pending = showTyping();
    var reply = answerFor(text);
    var delay = 420 + Math.min(reply.text.length * 5, 900);

    setTimeout(function () {
      pending.remove();
      addMessage('bot', reply.text);
      setChips(reply.chips);
      busy = false;
      if (window.matchMedia('(min-width: 481px)').matches) input.focus();
    }, delay);
  }

  /* ---------- Open / close ----------------------------------------------- */

  function openChat() {
    panel.hidden = false;
    root.classList.add('is-open');
    launch.setAttribute('aria-expanded', 'true');
    launch.setAttribute('aria-label', 'Close chat');

    if (!started) {
      started = true;
      addMessage('bot', GREETING);
      setChips(DEFAULT_CHIPS);
    }

    setTimeout(function () { input.focus(); }, 80);
  }

  function closeChat() {
    panel.hidden = true;
    root.classList.remove('is-open');
    launch.setAttribute('aria-expanded', 'false');
    launch.setAttribute('aria-label', 'Ask about Ali — open chat');
    launch.focus();
  }

  launch.addEventListener('click', function () {
    if (panel.hidden) openChat(); else closeChat();
  });

  closeBtn.addEventListener('click', closeChat);

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !panel.hidden) closeChat();
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    send(input.value);
  });

  chipRow.addEventListener('click', function (event) {
    var btn = event.target.closest('.chip-btn');
    if (btn) send(btn.textContent);
  });

  /* Re-pin once webfonts have swapped in and changed the text metrics. */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(scrollDown).catch(function () {});
  }
})();
