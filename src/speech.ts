export class Speech {
  unspokenStreamWords: string[] = [];
  speakingStream: boolean = false;

  constructor() {
    // Ensure the voiceschanged event handler is properly set up
    window.speechSynthesis.onvoiceschanged = this.onVoicesChangeHandler.bind(this);

    // Get available voices initially (optional for logging or inspection)
    const voices = window.speechSynthesis.getVoices();
    console.log(voices);
  }

  onVoicesChangeHandler() {
    // This function is called when the list of available voices changes.
    console.log("Speech synthesis voices changed.");
    // Refresh voice selection logic if needed (e.g., for dynamic updates)
  }

  speak(message: string, lang: string): Promise<void> {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = lang; // Set utterance language to the provided parameter

      // Dynamically select the voice for the specified language when available
      const voiceForLang = window.speechSynthesis.getVoices().find((voice) =>
        voice.lang.startsWith(lang)
      );
      utterance.voice = voiceForLang || undefined; // Use specific voice if found, otherwise default

      utterance.onend = () => {
        console.log("Speech synthesis finished.");
        resolve();
      };

      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event.error);
        resolve(); // Resolve the promise on error to avoid hanging
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  startStream() {
    this.unspokenStreamWords = [];
    this.speakingStream = false;
  }

  addToStream(message: string, lang: string) {
    this.unspokenStreamWords.push({ message, lang });
    if (!this.speakingStream) {
      this.speakStream();
    }
  }

  speakStream() {
    if (this.unspokenStreamWords.length > 0 && !this.speakingStream) {
      this.speakingStream = true;
      const { message, lang } = this.unspokenStreamWords.shift(); // Assuming each item is now an object with message and lang
      this.speak(message, lang).then(() => {
        this.speakingStream = false;
        if (this.unspokenStreamWords.length > 0) {
          this.speakStream();
        }
      });
    }
  }

  speakStreamIsDone() {
    return this.unspokenStreamWords.length === 0 && !this.speakingStream;
  }
}
