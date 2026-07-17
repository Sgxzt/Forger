(() => {
  "use strict";

  const BLACKLIST_PATH = "data/blacklist/blacklist.json";

  const state = {
    initialized: false,
    words: new Set(),
    sourcePath: BLACKLIST_PATH,
    version: null,
    lastUpdate: null
  };

  /**
   * Normalizes a word before it is stored or compared.
   * Uses StopwordsManager normalization when available to avoid duplicated logic.
   *
   * @param {string} word Word to normalize.
   * @returns {string} Normalized word.
   */
  function normalizeWord(word) {
    if (globalThis.ForgeStopwordsManager?.normalizeWord) {
      return globalThis.ForgeStopwordsManager.normalizeWord(word);
    }

    if (typeof word !== "string") {
      return "";
    }

    return word
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ");
  }

  /**
   * Extracts words from the supported JSON formats.
   *
   * @param {object|string[]} data Parsed JSON data.
   * @returns {string[]} Words contained in the file.
   */
  function getWordsFromData(data) {
    if (Array.isArray(data)) {
      return data;
    }

    if (data && Array.isArray(data.words)) {
      return data.words;
    }

    throw new Error("Invalid blacklist file: expected an array or a words property");
  }

  /**
   * Loads the blacklist file into a Set.
   *
   * @returns {Promise<object>} Current manager statistics.
   */
  async function load() {
    const sourceUrl = browser.runtime.getURL(BLACKLIST_PATH);
    const response = await fetch(sourceUrl, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Unable to load blacklist file: ${BLACKLIST_PATH} (${response.status})`);
    }

    const data = await response.json();
    const normalizedWords = getWordsFromData(data)
      .map(normalizeWord)
      .filter(Boolean);

    state.words = new Set(normalizedWords);
    state.initialized = true;
    state.version = data?.version || null;
    state.lastUpdate = data?.lastUpdate || null;

    return getStats();
  }

  /**
   * Initializes the manager once.
   *
   * @returns {Promise<object>} Current manager statistics.
   */
  async function initialize() {
    if (state.initialized) {
      return getStats();
    }

    return load();
  }

  /**
   * Checks whether a word belongs to the blacklist.
   *
   * @param {string} word Word to check.
   * @returns {boolean} True when the word is blacklisted.
   */
  function isBlacklisted(word) {
    if (!state.initialized) {
      return false;
    }

    const normalizedWord = normalizeWord(word);
    return normalizedWord !== "" && state.words.has(normalizedWord);
  }

  /**
   * Forces the blacklist file to be loaded again.
   *
   * @returns {Promise<object>} Current manager statistics.
   */
  async function reload() {
    state.initialized = false;
    state.words = new Set();

    return load();
  }

  /**
   * Returns information about the current manager state.
   *
   * @returns {object} Blacklist manager statistics.
   */
  function getStats() {
    return {
      initialized: state.initialized,
      totalWords: state.words.size,
      sourcePath: state.sourcePath,
      version: state.version,
      lastUpdate: state.lastUpdate
    };
  }

  globalThis.ForgeBlacklistManager = Object.freeze({
    initialize,
    load,
    normalizeWord,
    isBlacklisted,
    reload,
    getStats
  });
})();
