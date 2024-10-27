// RGK CONVERSOR ONLINE - ONLINE CONVERTER SCRIPT

function toggleMenu() {
  const menu = document.getElementById('side-menu');
  menu.classList.toggle('active');
} // Menu Hamburguer


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

              // Atualiza o link de download após todas as conversões
              if (Object.keys(zip.files).length === files.length) {
                  const zipBlob = await zip.generateAsync({ type: 'blob' });
                  const downloadLink = document.getElementById('downloadLink');

                  // Obtém o nome do primeiro arquivo sem a extensão
                  const firstFileName = files[0].name.split('.').slice(0, -1).join('.');
                  downloadLink.href = URL.createObjectURL(zipBlob);

                  // Define o nome do arquivo ZIP
                  downloadLink.download = `audios-convertidos-${firstFileName}.zip`;
                  downloadLink.style.display = 'block';
                  loadingDiv.style.display = 'none'; // Esconde o indicador de carregamento
              }
          };

          reader.readAsArrayBuffer(file);
      }
  });

  function audioBufferToWav(buffer, quality) {
      const numChannels = buffer.numberOfChannels;
      const sampleRate = buffer.sampleRate;
      const format = 1; // PCM
      const bitDepth = quality === '8' ? 8 : quality === '16' ? 16 : quality === '24' ? 24 : 32;
      const result = new Uint8Array(44 + buffer.length * numChannels * (bitDepth / 8));
      const dataView = new DataView(result.buffer);

      let offset = 0;

      const writeString = (str) => {
          for (let i = 0; i < str.length; i++) {
              dataView.setUint8(offset++, str.charCodeAt(i));
          }
      };

      writeString('RIFF');
      dataView.setUint32(offset, 36 + buffer.length * numChannels * (bitDepth / 8), true);
      offset += 4;
      writeString('WAVE');
      writeString('fmt ');
      dataView.setUint32(offset, 16, true);
      offset += 4;
      dataView.setUint16(offset, format, true);
      offset += 2;
      dataView.setUint16(offset, numChannels, true);
      offset += 2;
      dataView.setUint32(offset, sampleRate, true);
      offset += 4;
      dataView.setUint32(offset, sampleRate * numChannels * (bitDepth / 8), true);
      offset += 4;
      dataView.setUint16(offset, (bitDepth / 8) * numChannels, true);
      offset += 2;
      dataView.setUint16(offset, bitDepth, true);
      offset += 2;
      writeString('data');
      dataView.setUint32(offset, buffer.length * numChannels * (bitDepth / 8), true);
      offset += 4;

      // Processa o áudio
      for (let channel = 0; channel < numChannels; channel++) {
          const channelData = buffer.getChannelData(channel);
          for (let i = 0; i < channelData.length; i++) {
              const sample = Math.max(-1, Math.min(1, channelData[i]));
              let intSample;
              if (bitDepth === 8) {
                  // Para 8 bits, converte o valor para o intervalo 0-255
                  intSample = Math.floor((sample + 1) * 127.5);
                  dataView.setUint8(offset++, intSample);
              } else {
                  // Para 16, 24, ou 32 bits
                  intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
                  dataView.setInt16(offset, intSample, true);
                  offset += 2;
              }
          }
      }

      return result;
  }

  function showError(message) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error';
      errorDiv.innerText = message;
      document.getElementById('result').appendChild(errorDiv);
  }
});