
export type AmbientType = 'none' | 'rain' | 'static';

export class AmbientAudio {
  private ctx: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private source: AudioBufferSourceNode | null = null;
  private currentType: AmbientType = 'none';
  private volume: number = 0.5;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.ctx.createGain();
      this.gainNode.connect(this.ctx.destination);
      this.gainNode.gain.value = this.volume;
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(val: number) {
    this.volume = val;
    if (this.gainNode && this.ctx) {
        // Smooth transition
        this.gainNode.gain.setTargetAtTime(val, this.ctx.currentTime, 0.1);
    }
  }

  play(type: AmbientType) {
    if (this.currentType === type && this.source) return;
    this.stop();
    this.currentType = type;
    if (type === 'none') return;

    this.init();
    if (!this.ctx || !this.gainNode) return;

    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds loop
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (type === 'rain') {
       // Brown noise approximation for rain/rumble
       let lastOut = 0;
       for (let i = 0; i < bufferSize; i++) {
           const white = Math.random() * 2 - 1;
           data[i] = (lastOut + (0.02 * white)) / 1.02;
           lastOut = data[i];
           data[i] *= 3.5; // Compensate gain loss from integration
       }
    } else if (type === 'static') {
        // Pink-ish noise approximation
        let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
        for(let i=0; i<bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            data[i] *= 0.11; // Adjust gain
            b6 = white * 0.115926;
        }
    }

    this.source = this.ctx.createBufferSource();
    this.source.buffer = buffer;
    this.source.loop = true;
    this.source.connect(this.gainNode);
    this.source.start();
  }

  stop() {
    if (this.source) {
      try {
        this.source.stop();
        this.source.disconnect();
      } catch (e) {
        // Ignore if already stopped
      }
      this.source = null;
    }
    this.currentType = 'none';
  }
}

export const ambientPlayer = new AmbientAudio();
