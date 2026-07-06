/**
 * CharacterMenu — framework-free live avatar editor (same shape as HUD.ts).
 * A "Customize" button opens a panel of gender / skin / hair / outfit choices;
 * any change fires onChange(config) so the player avatar is rebuilt in place.
 * While open, App3D freezes gameplay input (see the isOpen flag).
 */
import {
  AvatarConfig,
  Gender,
  HairStyle,
  SKINS,
  HAIR_COLORS,
  OUTFITS,
  HAIR_STYLES,
  defaultConfig,
} from '../avatars/Avatar';

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'neutral', label: 'Neutral' },
];

const HAIR_LABELS: Record<HairStyle, string> = {
  short: 'Short', bob: 'Bob', ponytail: 'Ponytail', spiky: 'Spiky', bun: 'Bun',
};

export class CharacterMenu {
  isOpen = false;
  private config: AvatarConfig = defaultConfig();

  private panel = document.getElementById('character-menu')!;
  private btn = document.getElementById('customize-btn')!;

  constructor(private onChange: (cfg: AvatarConfig) => void) {
    this.buildOptions('cm-gender', GENDERS.map((g) => ({ label: g.label, value: g.value })),
      () => this.config.gender, (v) => (this.config.gender = v as Gender));

    this.buildSwatches('cm-skin', SKINS,
      () => this.config.skin, (v) => (this.config.skin = v));

    this.buildOptions('cm-hairstyle', HAIR_STYLES.map((s) => ({ label: HAIR_LABELS[s], value: s })),
      () => this.config.hairStyle, (v) => (this.config.hairStyle = v as HairStyle));

    this.buildSwatches('cm-hair', HAIR_COLORS,
      () => this.config.hair, (v) => (this.config.hair = v));

    this.buildSwatches('cm-outfit', OUTFITS,
      () => this.config.outfit, (v) => (this.config.outfit = v));

    this.btn.addEventListener('click', () => this.toggle());
    document.getElementById('character-close')!.addEventListener('click', () => this.close());
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Escape' && this.isOpen) this.close();
    });
  }

  private toggle() { this.isOpen ? this.close() : this.open(); }

  open() {
    this.isOpen = true;
    this.panel.classList.add('open');
    this.btn.classList.add('active');
  }

  close() {
    this.isOpen = false;
    this.panel.classList.remove('open');
    this.btn.classList.remove('active');
  }

  private commit() {
    this.onChange({ ...this.config });
  }

  /** Build a row of labelled text options (gender, hair style). */
  private buildOptions(
    containerId: string,
    opts: { label: string; value: string }[],
    get: () => string,
    set: (v: string) => void,
  ) {
    const el = document.getElementById(containerId)!;
    const buttons: HTMLButtonElement[] = [];
    for (const opt of opts) {
      const b = document.createElement('button');
      b.className = 'cm-chip';
      b.textContent = opt.label;
      if (opt.value === get()) b.classList.add('sel');
      b.addEventListener('click', () => {
        set(opt.value);
        buttons.forEach((x) => x.classList.remove('sel'));
        b.classList.add('sel');
        this.commit();
      });
      buttons.push(b);
      el.appendChild(b);
    }
  }

  /** Build a row of colour swatches (skin, hair, outfit). */
  private buildSwatches(
    containerId: string,
    colors: number[],
    get: () => number,
    set: (v: number) => void,
  ) {
    const el = document.getElementById(containerId)!;
    const buttons: HTMLButtonElement[] = [];
    for (const hex of colors) {
      const b = document.createElement('button');
      b.className = 'cm-swatch';
      b.style.background = '#' + hex.toString(16).padStart(6, '0');
      if (hex === get()) b.classList.add('sel');
      b.addEventListener('click', () => {
        set(hex);
        buttons.forEach((x) => x.classList.remove('sel'));
        b.classList.add('sel');
        this.commit();
      });
      buttons.push(b);
      el.appendChild(b);
    }
  }
}
