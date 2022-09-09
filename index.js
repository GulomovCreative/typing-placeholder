class TypingPlaceholder {
  constructor (el, options = {}) {
    this.el = typeof el === 'string' ? document.querySelector(el) : el;

    this.options = Object.assign({
      typeSpeed: 100,
      backSpeed: 50,
      startDelay: 0,
      backDelay: 3000,
    }, options);

    if (
      !(
        (this.el instanceof HTMLInputElement && ['text', 'email', 'number', 'password', 'search', 'tel', 'url'].includes(this.el.type))
        || this.el instanceof HTMLTextAreaElement
      )
    ) {
      throw new Error('Неправильный элемент');
    }

    this.initPlaceholder = this.el.getAttribute('placeholder');

    if (!this.initPlaceholder) {
      throw new Error('Плейсхолдер пустой');
    }

    this.variantsMatched = this.initPlaceholder.match(/(?<=\[)([\s\S]+?)(?=\])/);

    if (!this.variantsMatched) {
      throw new Error('Нет вариантов');
    }

    this.variants = this.variantsMatched[0].split('|');
    this.prefix = this.initPlaceholder.substring(0, this.variantsMatched.index - 1);
    this.placeholder = this.prefix + (this.options.startDelay ? this.variants[0] : this.variants[this.variants.length - 1]);

    this.activeWordIndex = this.options.startDelay ? 1 : 0;

    this.init();
  }

  async init () {
    if (this.options.startDelay) {
      await this.sleep(this.options.startDelay);
    }

    await this.backspace();

    while (this.activeWordIndex < this.variants.length) {
      await this.process(this.variants[this.activeWordIndex]);

      this.activeWordIndex++;

      if (this.activeWordIndex === this.variants.length) {
        this.activeWordIndex = 0;
      }
    }
  }

  backspace () {
    return new Promise(resolve => {
      let extraWord = this.placeholder.substring(this.prefix.length);
      let i = extraWord.length;

      this.intervalBackspace = setInterval(() => {
        this.placeholder = this.placeholder.slice(0, -1);

        i--;

        if (i <= 0) {
          clearInterval(this.intervalBackspace);
          resolve();
        }
      }, this.options.backSpeed);
    })
  };

  type (string) {
    return new Promise(resolve => {
      let i = 0;

      this.typingInterval = setInterval(() => {
        this.placeholder = this.prefix + string.substring(0, i + 1);

        i++;

        if (i >= string.length) {
          clearInterval(this.typingInterval);
          resolve();
        }
      }, this.options.typeSpeed);
    })
  };

  process (string) {
    return new Promise(async (resolve) => {
      await this.type(string);

      await this.sleep();
      await this.backspace();

      resolve();
    });
  }

  async sleep (ms = this.options.backDelay) {
    return await new Promise(resolve => setTimeout(resolve, ms));
  }

  get placeholder () {
    return this.el.getAttribute('placeholder');
  }

  set placeholder (value) {
    this.el.setAttribute('placeholder', value);
  }
}

module.exports = TypingPlaceholder;
