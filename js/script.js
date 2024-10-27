// RGK CONVERSOR ONLINE - ONLINE CONVERTER SCRIPT

document.addEventListener('DOMContentLoaded', function () {
  // Atualiza as opções de qualidade com base nos formatos selecionados
  document.getElementById('input-format').addEventListener('change', updateQualityOptions);
  document.getElementById('output-format').addEventListener('change', updateQualityOptions);

  function updateQualityOptions() {
      const inputFormat = document.getElementById('input-format').value;
      const outputFormat = document.getElementById('output-format').value;
      const qualitySelect = document.getElementById('quality');

      qualitySelect.innerHTML = ''; // Limpa as opções anteriores

      if ((inputFormat === 'wav' && outputFormat === 'mp3') || (inputFormat === 'mp3' && outputFormat === 'mp3')) {
          // Opções em kbps para WAV para MP3 e MP3 para MP3
          qualitySelect.innerHTML += '<option value="128">128 kbps</option>';
          qualitySelect.innerHTML += '<option value="192">192 kbps</option>';
          qualitySelect.innerHTML += '<option value="256">256 kbps</option>';
          qualitySelect.innerHTML += '<option value="320" selected>320 kbps</option>';
      } else {
          // Opções em bits para MP3 para WAV
          qualitySelect.innerHTML += '<option value="8">8 bits</option>';
          qualitySelect.innerHTML += '<option value="16">16 bits</option>';
          qualitySelect.innerHTML += '<option value="24">24 bits</option>';
          qualitySelect.innerHTML += '<option value="32" selected>32 bits</option>';
      }
  }