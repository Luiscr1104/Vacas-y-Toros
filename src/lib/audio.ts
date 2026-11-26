type Sound = 'click' | 'lost' | 'cow' | 'bull' | 'error' | 'start' | 'win';

/** Small, local sound effects: no downloads and no audio until a user gesture. */
class AudioService {
    private ctx: AudioContext | null = null;
    private _muted = false;

    play(name: Sound) {
        if (this._muted || typeof window === 'undefined') return;
        try {
            const Audio = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
            if (!Audio) return;
            this.ctx ??= new Audio();
            const ctx = this.ctx;
            if (ctx.state === 'suspended') void ctx.resume().catch(() => {});
            const notes: Record<Sound, number[]> = {
                click: [580],
                cow: [660, 880],
                bull: [440, 660],
                error: [180, 130],
                start: [440, 660, 880],
                win: [523, 659, 784, 1047],
                lost: [392, 330, 262],
            };
            notes[name].forEach((frequency, index) => {
                const time = ctx.currentTime + index * .11;
                const oscillator = ctx.createOscillator();
                const gain = ctx.createGain();
                oscillator.type = name === 'bull' || name === 'win' ? 'triangle' : 'sine';
                oscillator.frequency.setValueAtTime(frequency, time);
                gain.gain.setValueAtTime(.0001, time);
                gain.gain.exponentialRampToValueAtTime(name === 'click' ? .04 : .1, time + .008);
                gain.gain.exponentialRampToValueAtTime(.0001, time + .14);
                oscillator.connect(gain);
                gain.connect(ctx.destination);
                oscillator.start(time);
                oscillator.stop(time + .15);
                oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
            });
        } catch {
            // Audio is enhancement only; restricted browsers can always play silently.
        }
    }

    setMuted(muted: boolean) { this._muted = muted; }
    get muted() { return this._muted; }
}

export const audio = new AudioService();
