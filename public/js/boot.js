(function () {
  var d = document.documentElement, calm = false;
  d.classList.add('js');
  try { calm = localStorage.getItem('bv-calm') === '1'; } catch (e) {}
  if (!calm && !matchMedia('(prefers-reduced-motion: reduce)').matches) d.classList.add('motion-ok');
  setTimeout(function () { if (!d.classList.contains('motion-ready')) d.classList.remove('motion-ok'); }, 3000);
})();
