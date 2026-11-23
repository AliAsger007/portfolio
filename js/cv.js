/* ==========================================================================
   CV viewer — opens résumé in an overlay so one click shows it in place.
   ========================================================================== */

(function () {
  'use strict';

  var modal = document.getElementById('cv-modal');
  if (!modal) return;

  var panel = document.getElementById('cv-panel');
  var body = document.getElementById('cv-body');
  var closeBtn = document.getElementById('cv-close');
  var backdrop = modal.querySelector('.cv-backdrop');
  var lastFocus = null;

  function open(trigger) {
    lastFocus = trigger || document.activeElement;

    modal.hidden = false;
    document.body.classList.add('cv-locked');

    if (body) body.scrollTop = 0;
    closeBtn.focus();
  }

  function close() {
    modal.hidden = true;
    document.body.classList.remove('cv-locked');

    if (lastFocus && typeof lastFocus.focus === 'function') {
      lastFocus.focus();
    }
  }

  document.addEventListener('click', function (event) {
    var trigger = event.target.closest ? event.target.closest('[data-cv]') : null;
    if (trigger) {
      event.preventDefault();
      open(trigger);
    }
  });

  closeBtn.addEventListener('click', close);
  if (backdrop) backdrop.addEventListener('click', close);
  if (panel) panel.addEventListener('click', function (e) { e.stopPropagation(); });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !modal.hidden) close();
  });
})();
