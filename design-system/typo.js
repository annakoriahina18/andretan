/* ANDRE TAN — типографіка переносів.
   Короткі прийменники, сполучники й частки «прив'язуються» нерозривним пробілом
   до наступного слова, тож ніколи не лишаються в кінці рядка
   («Корсет з / фігурним» → «Корсет / з фігурним»).
   Працює для всіх текстів усередині макетів (.canvas) — у постах, сторіс і шаблонах.
   Підключається в кінці <body>, до app.js. */
(() => {
  'use strict';
  const WORDS = [
    // прийменники
    'в', 'у', 'з', 'зі', 'із', 'зо', 'о', 'об', 'до', 'за', 'на', 'по', 'від', 'для', 'без', 'над', 'під', 'при', 'про', 'між', 'крізь', 'через', 'біля', 'поза',
    // сполучники й частки
    'і', 'й', 'а', 'та', 'чи', 'не', 'ні', 'як', 'що', 'бо', 'аж', 'ж', 'же', 'б', 'би',
    // англійські (у назвах на кшталт «Last days of»)
    'a', 'an', 'the', 'of', 'in', 'on', 'at', 'to', 'by', 'for', 'and',
  ];
  const NB = String.fromCharCode(160); // нерозривний пробіл
  // слово стоїть на початку тексту або після пробілу / дужки / лапок
  const re = new RegExp(`(^|[\\s\\u00A0(«"„'—–-])(${WORDS.join('|')})[ \\t\\n\\r]+`, 'giu');
  const bind = s => { let prev; do { prev = s; s = s.replace(re, (m, before, word) => before + word + NB); } while (s !== prev); return s; };

  function fix(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n; (n = walker.nextNode());) {
      const v = n.nodeValue; if (!v.trim()) continue;
      const out = bind(v); if (out !== v) n.nodeValue = out;
    }
  }
  const run = () => document.querySelectorAll('.canvas').forEach(fix);
  run();
  window.ATtypo = { fix, bind }; // для сторінок, що додають макети пізніше
})();
