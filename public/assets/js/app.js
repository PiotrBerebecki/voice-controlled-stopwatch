// *******************************************************************
// State
// *******************************************************************
let isRunning = false;
let startTime;
let passedTime = 0;
let animationRequestId;



// *******************************************************************
// Control
// *******************************************************************
function startTimer(runTimer, getCurrentMs) {
  if (isRunning) { return; }
  isRunning = true;
  startTime = getCurrentMs() - passedTime;
  runTimer();
}


function runTimer() {
  passedTime = getCurrentMs() - startTime;
  showTimer(passedTime);
  animationRequestId = window.requestAnimationFrame(runTimer);
}


function stopTimer() {
  if (!isRunning) { return; }
  isRunning = false;
  window.cancelAnimationFrame(animationRequestId);
}


function resetTimer(stopTimer, showTimer) {
  stopTimer();
  passedTime = 0;
  startTime = 0;
  showTimer(startTime);
}


function getCurrentMs() {
  return Date.now();
}



// *******************************************************************
// View
// *******************************************************************
const startDOM = document.querySelector('.controls__btn--start');
const stopDOM = document.querySelector('.controls__btn--stop');
const resetDOM = document.querySelector('.controls__btn--reset');


// Run only in browser, not in Jest testig
if (startDOM) {
  (function addEventListeners() {

    const controlsDOM = document.querySelector('.controls');

    startDOM.addEventListener('click', startTimer.bind(null, runTimer, getCurrentMs));
    stopDOM.addEventListener('click', stopTimer);
    resetDOM.addEventListener('click', resetTimer.bind(null, stopTimer, showTimer));

    ['focusin', 'focusout', 'mouseover'].forEach(event => {
      if (event === 'mouseover') {
        controlsDOM.addEventListener(event, removeFocus);
      } else {
        controlsDOM.addEventListener(event, handleFocus);
      }
    });
  }());
}


function handleFocus(e) {
  if (e.target.nodeName === 'BUTTON') {
    e.target.classList.toggle('controls__btn--focus');
  }
}


function removeFocus(e) {
  this.removeEventListener('focusin', handleFocus);
  this.removeEventListener('focusout', handleFocus);
}


const timeDisplayDOM = document.querySelector('.display__time');

function showTimer(miliSec) {
  timeDisplayDOM.textContent = formatDisplay(miliSec);
}


function formatDisplay(miliSec) {
  const centiSec = Math.floor((miliSec / 10) % 100);
  const sec      = Math.floor((miliSec / 1000) % 60);
  const min      = Math.floor((miliSec / (1000 * 60)) % 60);
  const hour     = Math.floor((miliSec / (1000 * 60 * 60)) % 100);
  return `${pad(hour)}:${pad(min)}:${pad(sec)}.${pad(centiSec)}`;
}


function pad(n) {
  return n < 10 ? `0${n}` : n;
}



// *******************************************************************
// Speech
// *******************************************************************
if (window.SpeechRecognition || window.webkitSpeechRecognition) {
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  var recognition = new SpeechRecognition();
  recognition.lang = 'en-gb';
  recognition.interimResults = true;


  recognition.addEventListener('result', e => {
    let transcript = Array.from(e.results)
      .map(result => result[0])
      .map(result => result.transcript)
      .join('');

    showSpeech(transcript);

    if (e.results[0].isFinal) {
      analyseSpeech(transcript);
    }
  });


  var isRecognitionActive = false;
  var voiceButtonDOM = document.querySelector('.voice__btn');
  var speechDemoDOM = document.querySelector('.speech-demo');
  voiceButtonDOM.addEventListener('click', toggleRecognition);
}



function toggleRecognition() {
  isRecognitionActive = !isRecognitionActive;
  voiceButtonDOM.classList.toggle('voice__btn--active');

  if (isRecognitionActive) {
    recognition.start();
    recognition.addEventListener('end', recognition.start);
  } else {
    recognition.removeEventListener('end', recognition.start);
    recognition.stop();
    toggleSpeechDemo();
  }
}


function toggleSpeechDemo() {
  speechDemoDOM.style.opacity = '0';
  setTimeout(() => {
    showSpeech('');
    speechDemoDOM.style.opacity = '1';
  }, 1000);
}


function showSpeech(transcript) {
  speechDemoDOM.textContent = transcript;
  speechDemoDOM.scrollTop = speechDemoDOM.scrollTop + 400;
}

const startCommands = ['start', 'begin', 'go'];
const stopCommands  = ['stop', 'break', 'pause'];
const resetCommands = ['reset', 'end', 'finish'];

function analyseSpeech(transcript) {
  if (startCommands.some(command => isInTranscript(command, transcript))) {
    startTimer(runTimer, getCurrentMs);
    highlightIfCommand(startDOM);
  } else if (stopCommands.some(command => isInTranscript(command, transcript))) {
    stopTimer();
    highlightIfCommand(stopDOM);
  } else if (resetCommands.some(command => isInTranscript(command, transcript))) {
    resetTimer(stopTimer, showTimer);
    highlightIfCommand(resetDOM);
  } else if (isInTranscript('thank you', transcript)) {
    timeDisplayDOM.textContent = '🌺 🦋 🙊 🌼 🌻 🦄 🐥 🌸';
  }
}


function isInTranscript(command, transcript) {
  const needle = new RegExp(`(^|\\s)${command}(?![a-z])`, 'i');
  return needle.test(transcript);
}


function highlightIfCommand(button) {
  button.classList.toggle('controls__btn--focus');
  setTimeout(() => {
    button.classList.toggle('controls__btn--focus');
  }, 200);
}



// *******************************************************************
// Exports
// *******************************************************************
// Below will only run in node so we will not get
// module is not defined error
if (!timeDisplayDOM) {
  module.exports = {
    getCurrentMs,
    pad,
    formatDisplay,
    startTimer,
    resetTimer
  };
}
