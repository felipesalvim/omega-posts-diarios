(async () => {
  await document.fonts.ready;
  const area = document.querySelector('.area-texto');
  const texto = area.querySelector('.texto');
  let tamanho = parseFloat(texto.dataset.max);
  const minimo = parseFloat(texto.dataset.min);
  const limite = area.clientHeight - (parseFloat(texto.dataset.reserva) || 0);
  texto.style.fontSize = tamanho + 'px';
  while (tamanho > minimo && texto.offsetHeight > limite) {
    tamanho -= 2;
    texto.style.fontSize = tamanho + 'px';
  }
  document.body.dataset.pronto = '1';
})();
