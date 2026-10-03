/**
 * Web Audio API Ringtone Synth for Incoming Voice Calls
 */
class RingtoneController {
  private audioCtx: AudioContext | null = null;
  private isRinging: boolean = false;
  private intervalId: any = null;

  public startRingtone() {
    if (this.isRinging) return;
    this.isRinging = true;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      this.audioCtx = new AudioContextClass();

      const playBurst = () => {
        if (!this.audioCtx || !this.isRinging) return;

        const now = this.audioCtx.currentTime;
        const osc1 = this.audioCtx.createOscillator();
        const osc2 = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        // Authentic Indian telephone ring frequency dual-tone: 400Hz + 450Hz
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(440, now);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(480, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
        gain.gain.setValueAtTime(0.15, now + 1.2);
        gain.gain.linearRampToValueAtTime(0, now + 1.3);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.3);
        osc2.stop(now + 1.3);
      };

      playBurst();
      this.intervalId = setInterval(playBurst, 2500);
    } catch (e) {
      console.warn('Ringtone sound generator not allowed before user interaction:', e);
    }
  }

  public stopRingtone() {
    this.isRinging = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch (e) {
        // ignore
      }
      this.audioCtx = null;
    }
  }
}

export const ringtoneController = new RingtoneController();
