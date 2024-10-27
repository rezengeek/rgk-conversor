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

  // Chama a função inicialmente para definir o estado correto
  updateQualityOptions();

  document.getElementById('audio-form').addEventListener('submit', async function (event) {
      event.preventDefault(); // Evita o envio do formulário

      const inputFormat = document.getElementById('input-format').value;
      const outputFormat = document.getElementById('output-format').value;
      const quality = document.getElementById('quality').value;
      const files = document.getElementById('file').files;
      const resultDiv = document.getElementById('result');
      const loadingDiv = document.getElementById('loading');
      resultDiv.innerHTML = ''; // Limpa resultados anteriores

      if (files.length === 0 || files.length > 5) {
          showError('Por favor, selecione entre 1 e 5 arquivos.');
          return;
      }

      const zip = new JSZip();
      loadingDiv.style.display = 'block'; // Mostra o indicador de carregamento

      for (const file of files) {
          if (file.size > 30 * 1024 * 1024) { // 30 MB
              resultDiv.innerHTML += `<p>O arquivo ${file.name} excede o limite de 30MB.</p>`;
              continue;
          }

          // Verifica se o formato do arquivo é compatível com o formato de entrada selecionado
          if ((inputFormat === 'mp3' && !file.name.endsWith('.mp3')) ||
              (inputFormat === 'wav' && !file.name.endsWith('.wav'))) {
              showError(`O arquivo ${file.name} não é compatível com o formato de entrada selecionado.`);
              continue;
          }

          const reader = new FileReader();

          reader.onload = async (e) => {
              if (inputFormat === 'mp3' && outputFormat === 'wav') {
                  const audioBuffer = await new Promise((resolve) => {
                      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                      audioContext.decodeAudioData(e.target.result, resolve);
                  });

                  const wavData = audioBufferToWav(audioBuffer, quality);
                  const blob = new Blob([wavData], { type: 'audio/wav' });
                  const wavFileName = file.name.replace('.mp3', '.wav');

                  zip.file(wavFileName, blob);
                  resultDiv.innerHTML += `<p>${wavFileName} convertido com sucesso.</p>`;

              } else if (inputFormat === 'wav' && outputFormat === 'mp3') {
                  const wavArrayBuffer = new Uint8Array(e.target.result);
                  const mp3Encoder = new lamejs.Mp3Encoder(1, 44100, parseInt(quality)); // Conversão de acordo com a qualidade
                  const mp3Data = [];
                  const samples = new Int16Array(wavArrayBuffer);
                  let remaining = samples.length;

                  for (let i = 0; remaining >= 1152; i += 1152) {
                      const chunk = samples.subarray(i, i + 1152);
                      const mp3Chunk = mp3Encoder.encodeBuffer(chunk);
                      if (mp3Chunk.length > 0) {
                          mp3Data.push(mp3Chunk);
                      }
                      remaining -= 1152;
                  }
                  const mp3EndChunk = mp3Encoder.flush();
                  if (mp3EndChunk.length > 0) {
                      mp3Data.push(mp3EndChunk);
                  }

                  const mp3Blob = new Blob(mp3Data, { type: 'audio/mp3' });
                  const mp3FileName = file.name.replace('.wav', '.mp3');

                  zip.file(mp3FileName, mp3Blob);
                  resultDiv.innerHTML += `<p>${mp3FileName} convertido com sucesso.</p>`;
              }