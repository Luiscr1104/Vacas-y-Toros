import { Howl } from 'howler';

const SOUNDS = {
    click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
    lost: 'https://assets.mixkit.co/active_storage/sfx/2551/2551-preview.mp3'
};

class AudioService {
    private sounds: Record<string, Howl> = {};
    private _muted: boolean = false;
    private ctx: AudioContext | null = null;

    constructor() {
        if (typeof window !== 'undefined') {
            Object.entries(SOUNDS).forEach(([name, url]) => {
                this.sounds[name] = new Howl({
                    src: [url],
                    volume: 0.3,
                    preload: true,
                    html5: true
                });
            });

            // Inicializar AudioContext perezosamente ante interacción del usuario
            const initHandler = () => this.initCtx();
            document.addEventListener('mousedown', initHandler, { once: true });
            document.addEventListener('touchstart', initHandler, { once: true });
            document.addEventListener('keydown', initHandler, { once: true });
        }
    }

    private initCtx() {
        if (!this.ctx && typeof window !== 'undefined') {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            this.ctx = new AudioCtx();
        }
        if (this.ctx?.state === 'suspended') {
            this.ctx.resume();
        }
    }

    private playSynthesizedCow() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(880, this.ctx.currentTime); // agudo
        osc.frequency.exponentialRampToValueAtTime(660, this.ctx.currentTime + 0.12);

        gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    }

    private playSynthesizedBull() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(440, this.ctx.currentTime); // medio
        osc.frequency.exponentialRampToValueAtTime(330, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.12);
    }

    private playSynthesizedError() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, this.ctx.currentTime + 0.2);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
    }

    private playSynthesizedStart() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(440, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    }

    private playSynthesizedWin() {
        if (!this.ctx) return;
        const notes = [523.25, 659.25, 783.99]; // Do – Mi – Sol
        let time = this.ctx.currentTime;

        notes.forEach((freq) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = "triangle";
            osc.frequency.setValueAtTime(freq, time);

            gain.gain.setValueAtTime(0.35, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(time);
            osc.stop(time + 0.18);

            time += 0.16;
        });
    }

    play(name: keyof typeof SOUNDS | 'cow' | 'bull' | 'error' | 'start' | 'win') {
        if (this._muted) return;
        this.initCtx();

        if (name === 'cow') {
            this.playSynthesizedCow();
            return;
        }
        if (name === 'bull') {
            this.playSynthesizedBull();
            return;
        }
        if (name === 'error') {
            this.playSynthesizedError();
            return;
        }
        if (name === 'start') {
            this.playSynthesizedStart();
            return;
        }
        if (name === 'win') {
            this.playSynthesizedWin();
            return;
        }

        Object.values(this.sounds).forEach(s => s.stop());
        const sound = (this.sounds as any)[name];
        if (sound) {
            sound.play();
        }
    }

    setMuted(muted: boolean) {
        this._muted = muted;
    }

    get muted() {
        return this._muted;
    }
}

export const audio = new AudioService();
