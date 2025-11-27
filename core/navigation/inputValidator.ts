type InputValidatorOptions = {
  onlyNumbers?: boolean; // allow digits only
  onlyAlphabets?: boolean; // allow alphabets only
  allowSpace?: boolean; // allow spaces (after start)
  noSpace?: boolean; // block all spaces
  allowAlphanumeric?: boolean; // allow A-Z + 0-9
  allowSpecial?: boolean; // allow special symbols
  maxDigits?: number; // limit number of digits (for numeric fields)
};

export const inputValidator = (options: InputValidatorOptions = {}) => {
  return (e: React.KeyboardEvent<HTMLInputElement>) => {
    const value = (e.target as HTMLInputElement).value;

    const controlKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
    ];
    if (controlKeys.includes(e.key)) return;

    // 🚫 DEFAULT RULE → Block starting space (always)
    if (e.key === " " && value.length === 0) {
      e.preventDefault();
      return;
    }

    // 🚫 BLOCK ALL SPACES
    if (options.noSpace && e.key === " ") {
      e.preventDefault();
      return;
    }

    // ✔ ALLOW SPACES (after something typed)
    if (options.allowSpace && e.key === " " && value.length > 0) return;

    // ✔ ONLY ALPHABETS
    if (options.onlyAlphabets && /^[a-zA-Z]$/.test(e.key)) return;

    // ✔ ONLY NUMBERS
    if (options.onlyNumbers && /^[0-9]$/.test(e.key)) return;

    // ✔ ALPHANUMERIC (A-Z, a-z, 0-9)
    if (options.allowAlphanumeric && /^[a-zA-Z0-9]$/.test(e.key)) return;

    // ✔ SPECIAL SYMBOLS
    if (options.allowSpecial && /[^a-zA-Z0-9 ]/.test(e.key)) return;

    // 🚫 DIGIT LIMIT
    if (options.maxDigits) {
      if (value.length >= options.maxDigits && /^[0-9]$/.test(e.key)) {
        e.preventDefault();
        return;
      }
    }

    // 🚫 BLOCK EVERYTHING ELSE
    e.preventDefault();
  };
};
