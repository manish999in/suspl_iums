import { useEffect } from "react";

/**
 * Custom hook to listen for keyboard shortcuts with modifiers.
 *
 * @param {string} keyCombination - The key to listen for (e.g., "d", "ArrowRight").
 * @param {Function} callback - The function to execute when the key combination is detected.
 * @param {Object} modifiers - Optional modifiers (e.g., { ctrl: true, alt: false, shift: false, meta: false }).
 */
const useKeyboardShortcut = (
  keyCombination,
  callback,
  modifiers = { ctrl: false, alt: false, shift: false, meta: false }
) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const { ctrlKey, altKey, shiftKey, metaKey, key } = event;

      // Normalize the key
      const pressedKey = key.toLowerCase();
      const targetKey = keyCombination.toLowerCase();

      // Match key and modifiers
      const isMatchingKey = pressedKey === targetKey;
      const isMatchingModifiers =
        (modifiers.ctrl ? ctrlKey : true) &&
        (modifiers.alt ? altKey : true) &&
        (modifiers.shift ? shiftKey : true) &&
        (modifiers.meta ? metaKey : true);

      // Trigger callback if all conditions match
      if (isMatchingKey && isMatchingModifiers) {
        event.preventDefault();
        callback(event);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [keyCombination, callback, modifiers]);
};

export default useKeyboardShortcut;
