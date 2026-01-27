// Get game elements
const gameElements = document.querySelectorAll('[data-id="game"]');

const hoverSound = new Audio('/CodHub/Sounds/IW8/hover3.wav');
const clickSound = new Audio('/CodHub/Sounds/IW8/iw8_blades_right_bo.wav'); // som do clique

Array.from(gameElements).forEach((gameElement) => {
  gameElement.addEventListener('mouseover', () => {
    // Play hover sound
    hoverSound.currentTime = 0;
    hoverSound.play().catch(e => console.log("Audio play failed:", e));

    gameElement.classList.add('is-active');
    Array.from(gameElements)
      .filter((globalGameElement) => {
        return globalGameElement !== gameElement;
      })
      .forEach((otherGameElemenet) => {
        otherGameElemenet.classList.remove('is-active');
      });
  });
});

const playButtons = document.querySelectorAll('.play-button');

playButtons.forEach(button => {

  // som ao passar o mouse
  button.addEventListener('mouseover', () => {
    hoverSound.currentTime = 0;
    hoverSound.play().catch(e => console.log("Audio play failed:", e));
  });

  // som ao clicar
  button.addEventListener('click', () => {
    clickSound.currentTime = 0;
    clickSound.play().catch(e => console.log("Audio play failed:", e));
  });

});

const bgMusic = document.getElementById('bg-music');
if (bgMusic) {
  bgMusic.volume = 0.1;

  const playPromise = bgMusic.play();

  if (playPromise !== undefined) {
    playPromise.catch(error => {
      console.log("Autoplay prevented. Waiting for user interaction.");
      const startMusic = () => {
        bgMusic.play();
        document.removeEventListener('click', startMusic);
        document.removeEventListener('keydown', startMusic);
      };
      document.addEventListener('click', startMusic);
      document.addEventListener('keydown', startMusic);
    });
  }
}

[hoverSound, clickSound].forEach(sound => {
  sound.muted = true;
  sound.play().then(() => {
    sound.pause();
    sound.currentTime = 0;
    sound.muted = false;
  }).catch(() => {
  });
});