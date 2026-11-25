(async () => {
  await document.fonts.ready;
  const area = document.querySelector('.area-texto');
  const texto = area.querySelector('.texto');
  let tamanho = parseFloat(texto.dataset.max);
  const minimo = parseFloat(texto.dataset.min);
  texto.style.fontSize = tamanho + 'px';
  while (tamanho > minimo && texto.offsetHeight > area.clientHeight) {
    tamanho -= 2;
    texto.style.fontSize = tamanho + 'px';
  }
  document.body.dataset.pronto = '1';
})();
