<template>
  <div class="voice-translate animated-card">
    <header class="vt-header">
      <span class="vt-logo">🔊</span>
      <span class="vt-title">Voice Translate</span>
    </header>
    <div class="lang-select">
      <span>Перевести на:</span>
      <button v-for="lang in popularLangs" :key="lang.code" :class="{active: lang.code === selectedLang}" @click="selectLang(lang.code)">
        {{ lang.label }}
      </button>
      <button class="more" @click="showLangSheet = true">Ещё...</button>
    </div>
    <!-- Языковой ActionSheet -->
    <transition name="sheet-fade">
      <div v-if="showLangSheet" class="sheet-bg" @click.self="closeLangSheet">
        <div class="sheet sheet-lang" ref="langSheetRef" @touchstart="onLangTouchStart" @touchmove="onLangTouchMove" @touchend="onLangTouchEnd">
          <div class="sheet-drag"></div>
          <button class="sheet-close" @click="closeLangSheet">✕</button>
          <h3>Выберите язык</h3>
          <div class="sheet-list">
            <button v-for="lang in allLangs" :key="lang.code" :class="{active: lang.code === selectedLang}" @click="selectLang(lang.code); closeLangSheet()">
              {{ lang.label }}
            </button>
          </div>
        </div>
      </div>
    </transition>
    <!-- Основная кнопка действия -->
    <button v-if="!transcript && !loading && !recognizing" class="main-btn" @click="startRecognition()">
      <span class="mic-icon">🎤</span> Записать голос
    </button>
    <button v-if="recognizing" class="main-btn" @click="stopRecognition()">
      <span class="mic-icon">🎤</span> Закончить запись <span class="spinner"></span>
    </button>
    <button v-if="transcript && !loading && !translatedText" class="accent-btn" @click="translateText()">
      Перевести
    </button>
    <button v-if="loading" class="accent-btn" disabled>
      Переводим... <span class="spinner"></span>
    </button>
    <transition name="fade-slide">
      <p v-if="transcript && !translatedText" class="result-text">Распознанный текст: <b>{{ transcript }}</b></p>
    </transition>
    <transition name="fade-slide">
      <p v-if="translatedText" class="result-text">Перевод: <b>{{ translatedText }}</b></p>
    </transition>
    <!-- ActionSheet для действий с переводом -->
    <transition name="sheet-fade">
      <div v-if="showActionSheet" class="sheet-bg" @click.self="closeActionSheet">
        <div class="sheet sheet-action" ref="actionSheetRef" @touchstart="onActionTouchStart" @touchmove="onActionTouchMove" @touchend="onActionTouchEnd">
          <div class="sheet-drag"></div>
          <button class="sheet-close" @click="closeActionSheet">✕</button>
          <div class="sheet-list sheet-list-actions">
            <button @click="speakTranslation(); closeActionSheet()">🔊 Озвучить</button>
            <button @click="copyTranslation(); closeActionSheet()">📋 Скопировать</button>
            <button @click="shareTranslation(); closeActionSheet()">📤 Поделиться</button>
          </div>
        </div>
      </div>
    </transition>
    <button v-if="translatedText && !showActionSheet" class="accent-btn" @click="showActionSheet = true">Действия с переводом</button>
    <transition name="fade-slide">
      <div v-if="error" class="error-text"><span class="error-icon">❗</span> {{ error }}</div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const showLangSheet = ref(false)
const showActionSheet = ref(false)
function closeLangSheet() { showLangSheet.value = false }
function closeActionSheet() { showActionSheet.value = false }

const isMobile = computed(() => window.innerWidth <= 700)

// --- SWIPE TO CLOSE (LangSheet) ---
const langSheetRef = ref<HTMLElement | null>(null)
let langTouchStartY = 0
let langTouchCurrentY = 0
function onLangTouchStart(e: TouchEvent) {
  if (!isMobile.value) return
  langTouchStartY = e.touches[0].clientY
}
function onLangTouchMove(e: TouchEvent) {
  if (!isMobile.value) return
  langTouchCurrentY = e.touches[0].clientY
  const diff = langTouchCurrentY - langTouchStartY
  if (diff > 40) closeLangSheet()
}
function onLangTouchEnd() {}
// --- SWIPE TO CLOSE (ActionSheet) ---
const actionSheetRef = ref<HTMLElement | null>(null)
let actionTouchStartY = 0
let actionTouchCurrentY = 0
function onActionTouchStart(e: TouchEvent) {
  if (!isMobile.value) return
  actionTouchStartY = e.touches[0].clientY
}
function onActionTouchMove(e: TouchEvent) {
  if (!isMobile.value) return
  actionTouchCurrentY = e.touches[0].clientY
  const diff = actionTouchCurrentY - actionTouchStartY
  if (diff > 40) closeActionSheet()
}
function onActionTouchEnd() {}

const popularLangs = [
  { code: 'en', label: 'Английский' },
  { code: 'ru', label: 'Русский' },
  { code: 'de', label: 'Немецкий' },
  { code: 'fr', label: 'Французский' },
  { code: 'es', label: 'Испанский' },
  { code: 'zh', label: 'Китайский' },
  { code: 'it', label: 'Итальянский' },
]
const allLangs = [
  { code: 'en', label: 'Английский' },
  { code: 'ru', label: 'Русский' },
  { code: 'de', label: 'Немецкий' },
  { code: 'fr', label: 'Французский' },
  { code: 'es', label: 'Испанский' },
  { code: 'zh', label: 'Китайский' },
  { code: 'it', label: 'Итальянский' },
  { code: 'pt', label: 'Португальский' },
  { code: 'pl', label: 'Польский' },
  { code: 'uk', label: 'Украинский' },
  { code: 'ja', label: 'Японский' },
  { code: 'tr', label: 'Турецкий' },
  { code: 'ar', label: 'Арабский' },
  { code: 'ko', label: 'Корейский' },
  { code: 'nl', label: 'Голландский' },
  { code: 'sv', label: 'Шведский' },
  { code: 'fi', label: 'Финский' },
  { code: 'cs', label: 'Чешский' },
  { code: 'ro', label: 'Румынский' },
  { code: 'el', label: 'Греческий' },
  { code: 'he', label: 'Иврит' },
  { code: 'hi', label: 'Хинди' },
  { code: 'id', label: 'Индонезийский' },
  { code: 'th', label: 'Тайский' },
  { code: 'vi', label: 'Вьетнамский' },
]

const selectedLang = ref('en')

function selectLang(code: string) {
  selectedLang.value = code
}

const recognizing = ref(false)
const transcript = ref('')
const translatedText = ref('')
const loading = ref(false)
const error = ref('')

// Типизация для SpeechRecognition с поддержкой webkit
interface ISpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
}

declare global {
  interface Window {
    webkitSpeechRecognition?: {
      new (): ISpeechRecognition;
    };
    SpeechRecognition?: {
      new (): ISpeechRecognition;
    };
  }
  interface SpeechRecognitionEvent extends Event {
    results: ArrayLike<{ 0: { transcript: string; confidence: number } }>;
  }
}

const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition: ISpeechRecognition | null = null;
if (SpeechRecognitionCtor) {
  recognition = new SpeechRecognitionCtor();
  recognition.lang = 'ru-RU';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
}

type WakeLockSentinel = {
  release: () => Promise<void>;
  addEventListener: (type: string, listener: () => void) => void;
};
let wakeLock: WakeLockSentinel | null = null;

function vibrate(pattern: number[] = [60]) {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern)
  }
}

async function requestWakeLock() {
  try {
    const nav = navigator as Navigator & { wakeLock?: { request: (type: string) => Promise<WakeLockSentinel> } };
    if (nav.wakeLock && typeof nav.wakeLock.request === 'function') {
      wakeLock = await nav.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => {
        wakeLock = null;
      });
    }
  } catch {}
}
function releaseWakeLock() {
  if (wakeLock && typeof wakeLock.release === 'function') {
    wakeLock.release();
    wakeLock = null;
  }
}

function startRecognition() {
  if (!recognition) {
    error.value = 'SpeechRecognition API не поддерживается';
    return;
  }
  error.value = '';
  transcript.value = '';
  translatedText.value = '';
  recognizing.value = true;
  vibrate([40, 20, 40]);
  recognition.start();
  recognition.onresult = (event) => {
    transcript.value = event.results[0][0].transcript;
    recognizing.value = false;
    vibrate([120, 60, 120]); // Вибрация после распознавания
  };
  recognition.onend = () => {
    recognizing.value = false;
  };
  recognition.onerror = (e) => {
    error.value = 'Ошибка распознавания: ' + e.error;
    recognizing.value = false;
    vibrate([100, 50, 100, 50, 100, 50, 300]);
  };
}

function stopRecognition() {
  recognition?.stop()
  recognizing.value = false
}

async function translateText() {
  loading.value = true;
  error.value = '';
  vibrate([80, 30, 80]);
  await requestWakeLock();
  try {
    const response = await fetch('https://free-translate-api-c3oi.onrender.com/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: transcript.value, to: selectedLang.value })
    });
    const data = await response.json();
    translatedText.value = data.translatedText;
    vibrate([200, 80, 200, 80, 200]); // Вибрация после получения перевода
  } catch {
    error.value = 'Ошибка перевода';
    vibrate([100, 50, 100, 50, 100, 50, 300]);
  }
  loading.value = false;
  releaseWakeLock();
}

function speakTranslation() {
  if (!translatedText.value) return;
  const utter = new SpeechSynthesisUtterance(translatedText.value);
  utter.lang = selectedLang.value;
  window.speechSynthesis.speak(utter);
  vibrate([120, 60, 120]); // Вибрация при озвучке
}

function copyTranslation() {
  if (!translatedText.value) return
  navigator.clipboard?.writeText(translatedText.value)
  vibrate([80, 30, 80])
}
function shareTranslation() {
  if (!translatedText.value) return
  if (navigator.share) {
    navigator.share({ text: translatedText.value })
  } else {
    copyTranslation()
  }
}
</script>

<style scoped>
.voice-translate {
  display: flex;
  flex-direction: column;
  gap: 1.2em;
  align-items: center;
  margin-top: 2.5em;
  background: #fff;
  border-radius: 14px;
  border: 1.5px solid #e0e0e0;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
  padding: 2em 1em 1.5em 1em;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
}
.vt-header {
  display: flex;
  align-items: center;
  gap: 0.6em;
  margin-bottom: 0.5em;
  justify-content: center;
}
.vt-logo {
  font-size: 2em;
  background: #e0e0e0;
  border-radius: 50%;
  padding: 0.12em 0.28em;
  color: #222;
}
.vt-title {
  font-size: 1.2em;
  font-weight: 700;
  color: #222;
  letter-spacing: 0.01em;
}
.lang-select {
  display: flex;
  gap: 0.5em;
  align-items: center;
  margin-bottom: 0.7em;
  flex-wrap: wrap;
  justify-content: center;
}
.lang-select span {
  font-weight: 600;
  color: #222;
  font-size: 1em;
}
.lang-select button {
  padding: 0.5em 1.2em;
  border-radius: 8px;
  border: 1.5px solid #e0e0e0;
  background: #f7f7f7;
  color: #222;
  cursor: pointer;
  font-size: 1em;
  font-weight: 500;
  transition: background 0.15s, color 0.15s, border 0.15s;
  margin-bottom: 0.2em;
}
.lang-select button.active, .lang-select button:hover {
  background: #2563eb;
  color: #fff;
  border: 1.5px solid #2563eb;
}
.lang-select .more {
  background: #e0e0e0;
  color: #222;
}
.modal-bg {
  position: fixed;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.13);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal {
  background: #fff;
  padding: 1.5em 1em 1em 1em;
  border-radius: 10px;
  min-width: 260px;
  max-width: 95vw;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 2px 12px rgba(0,0,0,0.09);
  border: 1.5px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.modal h3 {
  margin-bottom: 1em;
  color: #222;
  font-size: 1.08em;
  font-weight: 700;
}
.modal-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
  margin-bottom: 1em;
  justify-content: center;
}
.modal-list button {
  padding: 0.4em 1em;
  border-radius: 8px;
  border: 1.5px solid #e0e0e0;
  background: #f7f7f7;
  color: #222;
  cursor: pointer;
  font-size: 1em;
  font-weight: 500;
  transition: background 0.15s, color 0.15s, border 0.15s;
  margin-bottom: 0.2em;
}
.modal-list button.active, .modal-list button:hover {
  background: #2563eb;
  color: #fff;
  border: 1.5px solid #2563eb;
}
.close {
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.7em 2em;
  cursor: pointer;
  font-size: 1em;
  font-weight: 600;
  margin-top: 0.5em;
  transition: background 0.15s;
}
.close:hover {
  background: #1e40af;
}
.main-btn, .accent-btn {
  font-size: 1.08em;
  padding: 1em 2em;
  border-radius: 10px;
  border: none;
  background: #2563eb;
  color: white;
  cursor: pointer;
  transition: background 0.15s, box-shadow 0.15s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.07);
  font-weight: 600;
  margin-bottom: 0.2em;
  letter-spacing: 0.01em;
  display: flex;
  align-items: center;
  gap: 0.7em;
}
.main-btn:active, .accent-btn:active {
  background: #1e40af;
}
.mic-icon {
  font-size: 1.2em;
}
.spinner {
  display: inline-block;
  width: 1.1em;
  height: 1.1em;
  border: 2.5px solid #fff;
  border-top: 2.5px solid #2563eb;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin-left: 0.7em;
  vertical-align: middle;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.result-text {
  font-size: 1.08em;
  color: #222;
  margin: 0.2em 0 0.2em 0;
  text-align: center;
  font-weight: 500;
  background: #f7f7f7;
  border-radius: 8px;
  padding: 0.6em 1em;
  box-shadow: 0 1px 4px rgba(0,0,0,0.07);
  max-width: 100%;
  word-break: break-word;
}
.voice-translate b {
  color: #2563eb;
  font-weight: 700;
}
.error-text {
  color: #d32f2f;
  background: #fff0f0;
  border-radius: 8px;
  padding: 0.6em 1em;
  font-weight: 700;
  box-shadow: 0 1px 4px #d32f2f11;
  margin: 0.2em 0 0.2em 0;
  text-align: center;
  display: flex;
  align-items: center;
  gap: 0.5em;
  font-size: 1.08em;
}
.error-icon {
  font-size: 1.1em;
}
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: opacity 0.25s, transform 0.25s;
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
.drawer-fade-enter-active, .drawer-fade-leave-active {
  transition: opacity 0.4s;
}
.drawer-fade-enter-from, .drawer-fade-leave-to {
  opacity: 0;
}
.drawer-bg {
  position: fixed;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.32);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.drawer {
  background: #fff;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  border-radius: 18px 18px 0 0;
  width: 100vw;
  max-width: 480px;
  min-height: 40vh;
  max-height: 80vh;
  padding: 0.7em 1em 1em 1em;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: drawerUp 0.4s cubic-bezier(.4,1.4,.6,1);
}
@keyframes drawerUp {
  from { transform: translateY(100%); }
  to { transform: none; }
}
.drawer-header {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 0.7em;
}
.drawer-drag {
  width: 44px;
  height: 6px;
  border-radius: 3px;
  background: #e0e0e0;
  margin: 0.3em 0 0.7em 0;
}
.drawer-header h3 {
  font-size: 1.18em;
  font-weight: 800;
  color: #222;
  text-shadow: 0 2px 8px #fff, 0 1px 4px #2563eb22;
  margin: 0;
  padding: 0.2em 0;
  letter-spacing: 0.01em;
}
.drawer-content-fade-enter-active, .drawer-content-fade-leave-active {
  transition: opacity 0.25s, transform 0.25s;
}
.drawer-content-fade-enter-from, .drawer-content-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
.drawer-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7em;
  margin-bottom: 1em;
  justify-content: center;
  max-height: 45vh;
  overflow-y: auto;
}
.drawer-list button {
  padding: 0.9em 1.5em;
  border-radius: 10px;
  border: none;
  background: #2563eb;
  color: #fff;
  cursor: pointer;
  font-size: 1.08em;
  font-weight: 700;
  transition: background 0.18s, color 0.18s, box-shadow 0.18s, transform 0.13s;
  box-shadow: 0 1px 4px #2563eb22;
  margin-bottom: 0.2em;
}
.drawer-list button.active, .drawer-list button:hover {
  background: #1e40af;
  color: #fff;
  box-shadow: 0 2px 8px #2563eb33;
  transform: translateY(-2px) scale(1.04);
}
.close {
  background: #fff;
  color: #2563eb;
  border: 2px solid #2563eb;
  border-radius: 8px;
  padding: 0.7em 2em;
  cursor: pointer;
  font-size: 1em;
  font-weight: 700;
  margin-top: 0.5em;
  transition: background 0.15s, color 0.15s;
}
.close:hover {
  background: #2563eb;
  color: #fff;
}
.drawer-mobile {
  position: fixed;
  left: 0; right: 0; bottom: 0;
  border-radius: 18px 18px 0 0;
  width: 100vw;
  max-width: 480px;
  min-height: 40vh;
  max-height: 80vh;
  animation: drawerUp 0.4s cubic-bezier(.4,1.4,.6,1);
}
.drawer-desktop {
  position: fixed;
  top: 0; right: 0; bottom: 0;
  left: auto;
  border-radius: 18px 0 0 18px;
  width: 50vw;
  min-width: 320px;
  max-width: 480px;
  min-height: 100vh;
  max-height: 100vh;
  animation: drawerLeft 0.4s cubic-bezier(.4,1.4,.6,1);
  box-shadow: -8px 0 32px rgba(0,0,0,0.18);
  padding-top: 2em;
}
@keyframes drawerLeft {
  from { transform: translateX(100%); }
  to { transform: none; }
}
@media (max-width: 700px) {
  .voice-translate {
    padding: 1em 0.1em 1em 0.1em;
    max-width: 100vw;
    min-height: 90vh;
    border-radius: 0;
    box-shadow: none;
    border: none;
  }
  .modal {
    min-width: 0;
    padding: 0.7em 0.1em 0.7em 0.1em;
    border-radius: 0;
    max-width: 100vw;
    max-height: 100vh;
    box-shadow: none;
    border: none;
  }
  .lang-select button, .modal-list button, .close, .main-btn, .accent-btn {
    font-size: 1em;
    padding: 1em 1.2em;
    border-radius: 8px;
  }
  .vt-header {
    margin-bottom: 0.2em;
  }
  .drawer-desktop {
    display: none;
  }
}
@media (min-width: 701px) {
  .drawer-mobile {
    display: none;
  }
}
.sheet-fade-enter-active, .sheet-fade-leave-active {
  transition: opacity 0.35s;
}
.sheet-fade-enter-from, .sheet-fade-leave-to {
  opacity: 0;
}
.sheet-bg {
  position: fixed;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.32);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.sheet {
  background: #fff;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  border-radius: 18px 18px 0 0;
  width: 100vw;
  max-width: 480px;
  min-height: 30vh;
  max-height: 80vh;
  padding: 0.7em 1em 1em 1em;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: sheetUp 0.35s cubic-bezier(.4,1.4,.6,1);
  position: relative;
}
@keyframes sheetUp {
  from { transform: translateY(100%); }
  to { transform: none; }
}
.sheet-drag {
  width: 44px;
  height: 6px;
  border-radius: 3px;
  background: #e0e0e0;
  margin: 0.3em 0 0.7em 0;
}
.sheet-close {
  position: absolute;
  top: 0.7em;
  right: 1em;
  background: none;
  border: none;
  font-size: 1.5em;
  color: #888;
  cursor: pointer;
  transition: color 0.18s;
  z-index: 2;
}
.sheet-close:hover {
  color: #2563eb;
}
.sheet-lang h3 {
  font-size: 1.18em;
  font-weight: 800;
  color: #222;
  text-shadow: 0 2px 8px #fff, 0 1px 4px #2563eb22;
  margin: 0 0 0.7em 0;
  padding: 0.2em 0;
  letter-spacing: 0.01em;
}
.sheet-list {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  width: 100%;
  align-items: stretch;
  max-height: 45vh;
  overflow-y: auto;
}
.sheet-list button {
  padding: 1em 1.5em;
  border-radius: 10px;
  border: none;
  background: #2563eb;
  color: #fff;
  cursor: pointer;
  font-size: 1.08em;
  font-weight: 700;
  transition: background 0.18s, color 0.18s, box-shadow 0.18s, transform 0.13s;
  box-shadow: 0 1px 4px #2563eb22;
  margin-bottom: 0.2em;
  text-align: left;
}
.sheet-list button.active, .sheet-list button:hover {
  background: #1e40af;
  color: #fff;
  box-shadow: 0 2px 8px #2563eb33;
  transform: translateY(-2px) scale(1.04);
}
.sheet-list-actions {
  gap: 0.7em;
  margin-top: 0.5em;
}
@media (min-width: 701px) {
  .sheet {
    border-radius: 18px;
    width: 420px;
    min-height: 30vh;
    max-height: 80vh;
    animation: sheetCenter 0.35s cubic-bezier(.4,1.4,.6,1);
    align-items: center;
    left: 0; right: 0; margin: auto;
  }
  @keyframes sheetCenter {
    from { transform: translateY(40px) scale(0.98); opacity: 0; }
    to { transform: none; opacity: 1; }
  }
}
</style> 