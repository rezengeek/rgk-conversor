// RGK CONVERSOR ONLINE - VUE CARDS

new Vue({
  el: '#app',
  data() {
    return {
      cards: [
        {
          id: 1,
          title: 'MP3 & WAV',
          description: 'Converta arquivos MP3 para WAV, e vice-versa.',
          image: 'img/bg.png',
          link: 'mp3-wav.html'  
        },
        {
          id: 2,
          title: 'YouTube',
          description: 'Baixe vídeos e áudios do youtube gratuitamente.',
          image: 'img/bgdark.png',
          link: 'youtube-downloader.html'  
        },
        {
          id: 3,
          title: 'PDF',
          description: 'Converta arquivos diversos para PDF, e vice-versa',
          image: 'img/bg.png',
          link: 'pdf-converter.html'  
        },
        {
          id: 4,
          title: 'Lakes',
          description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
          image: 'img/bgdark.png',
          link: 'lakes.html'  
        }
      ]
    };
  }
});