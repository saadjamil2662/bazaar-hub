const fs = require('fs');

const path = 'c:/Users/saadj/Downloads/front_yard_makeover_game.html';
let code = fs.readFileSync(path, 'utf8');

// Remove global CSS and add scoped
code = code.split("  * { box-sizing: border-box; margin: 0; padding: 0; }").join("");
code = code.split("  body { background: #f5f0e8; }").join("  .fy-game-shell * { box-sizing: border-box; }");

const ids = [
  "game-shell", "game-canvas-wrap", "yard", "hud", "score-bar-wrap",
  "score-bar-fill", "score-label", "hud-left", "toolbar", "result-overlay",
  "result-grade", "result-headline", "result-body", "result-stats",
  "rs-spent", "rs-score", "rs-items", "retry-btn", "score-btn-wrap",
  "score-btn", "undo-btn", "budget-display"
];

ids.forEach(id => {
  code = code.split("#" + id).join(".fy-" + id);
  code = code.split('id="' + id + '"').join('class="fy-' + id + '"');
  code = code.split("document.getElementById('" + id + "')").join("widget.querySelector('.fy-" + id + "')");
});

code = code.split("canvas.fy-yard").join(".fy-yard");
code = code.split("document.querySelectorAll('.tool-btn')").join("widget.querySelectorAll('.tool-btn')");

const jsStart = "(function() {\\n  document.querySelectorAll('.fy-game-shell').forEach(function(widget) {\\n    if (widget.dataset.initialized) return;\\n    widget.dataset.initialized = 'true';\\n";
const jsStartRn = "(function() {\\r\\n  document.querySelectorAll('.fy-game-shell').forEach(function(widget) {\\r\\n    if (widget.dataset.initialized) return;\\r\\n    widget.dataset.initialized = 'true';\\r\\n";

code = code.split("(function() {\\r\\n").join(jsStartRn);
code = code.split("(function() {\\n").join(jsStart);

const jsEnd = "  });\\n})();\\n</script>";
const jsEndRn = "  });\\r\\n})();\\r\\n</script>";

code = code.split("})();\\r\\n</script>").join(jsEndRn);
code = code.split("})();\\n</script>").join(jsEnd);

fs.writeFileSync(path, code);
console.log('Fixed front_yard_makeover_game.html');
