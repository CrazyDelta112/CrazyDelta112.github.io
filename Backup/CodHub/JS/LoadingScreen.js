const messages = [
    "Connecting To GitHub...",
    "Connecting To GitHub...",
    "Initializing systems...",
    "Synchronizing data...",
    "Loading Links...",
    "Site Ready!"
];

let index = 0;
const text = document.getElementById("status-text");

const totalTime = 8000; // 8 segundos

const textInterval = setInterval(() => {
    index++;
    if (index < messages.length) {
        text.textContent = messages[index];
    }
}, totalTime / messages.length);

setTimeout(() => {
    clearInterval(textInterval);

    document.body.style.opacity = "0";

    setTimeout(() => {
        window.location.href = "SelectScreen.html";
    }, 500);

}, totalTime);
