/**
 * HUD — thin DOM overlay layer (prompt + dialogue).
 * Deliberately framework-free for the vertical slice; when the old
 * ManzilCafe React components (Chat, OrderPanel, BartenderChat) are
 * ported over, mount React into #hud and retire this class piecemeal.
 */
export class HUD {
  dialogueOpen = false;

  private promptEl = document.getElementById('prompt')!;
  private promptText = document.getElementById('prompt-text')!;
  private dialogueEl = document.getElementById('dialogue')!;
  private dialogueName = document.getElementById('dialogue-name')!;
  private logEl = document.getElementById('dialogue-log')!;
  private form = document.getElementById('dialogue-form') as HTMLFormElement;
  private inputEl = document.getElementById('dialogue-input') as HTMLInputElement;

  private onSend: ((text: string) => Promise<string>) | null = null;

  constructor() {
    this.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = this.inputEl.value.trim();
      if (!text || !this.onSend) return;
      this.inputEl.value = '';
      this.pushMessage(text, 'player');

      const thinking = this.pushMessage('…', 'npc');
      try {
        const reply = await this.onSend(text);
        thinking.textContent = reply;
      } catch {
        thinking.textContent = "Sorry, the espresso machine's acting up. Try again?";
      }
      this.logEl.scrollTop = this.logEl.scrollHeight;
    });

    document.getElementById('dialogue-close')!.addEventListener('click', () => this.closeDialogue());
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Escape' && this.dialogueOpen) this.closeDialogue();
    });
  }

  showPrompt(text: string) {
    this.promptText.textContent = text;
    this.promptEl.classList.add('visible');
  }

  hidePrompt() {
    this.promptEl.classList.remove('visible');
  }

  openDialogue(name: string, onSend: (text: string) => Promise<string>) {
    this.dialogueOpen = true;
    this.dialogueName.textContent = name;
    this.onSend = onSend;
    this.logEl.innerHTML = '';
    this.dialogueEl.classList.add('open');
    this.hidePrompt();
    setTimeout(() => this.inputEl.focus(), 350);
  }

  closeDialogue() {
    this.dialogueOpen = false;
    this.dialogueEl.classList.remove('open');
    this.inputEl.blur();
  }

  pushNpcMessage(text: string) {
    this.pushMessage(text, 'npc');
  }

  private pushMessage(text: string, who: 'npc' | 'player'): HTMLElement {
    const div = document.createElement('div');
    div.className = `msg ${who}`;
    div.textContent = text;
    this.logEl.appendChild(div);
    this.logEl.scrollTop = this.logEl.scrollHeight;
    return div;
  }
}
