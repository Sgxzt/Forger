(() => {
  "use strict";

  const DEFAULT_LANGUAGE = "es";
  const STOPWORDS_BASE_PATH = "data/stopwords";

  const state = {
    initialized: false,
    language: DEFAULT_LANGUAGE,
    stopwords: new Set(),
    sourcePath: null,
    version: null,
    lastUpdate: null
  };

  /**
   * Normalizes a word before it is stored or compared.
   * New normalization rules can be added here without changing consumers.
   *
   * @param {string} word Word to normalize.
   * @returns {string} Normalized word.
   */
  function normalizeWord(word) {
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
   * Extracts the words array from the supported stopwords JSON formats.
   *
   * @param {object|string[]} data Parsed JSON data.
   * @returns {string[]} Stopwords contained in the file.
   */
  function getWordsFromData(data) {
    if (Array.isArray(data)) {
      return data;
    }

    if (data && Array.isArray(data.words)) {
      return data.words;
    }

    throw new Error("Invalid stopwords file: expected an array or a words property");
  }

  /**
   * Loads and normalizes a stopwords file for the selected language.
   *
   * @param {string} language Language code matching a JSON filename.
   * @returns {Promise<object>} Current manager statistics.
   */
  async function load(language = DEFAULT_LANGUAGE) {
    const normalizedLanguage = normalizeWord(language).replace(/\s/g, "");

    if (!normalizedLanguage) {
      throw new Error("A valid stopwords language is required");
    }

    const sourcePath = `${STOPWORDS_BASE_PATH}/${normalizedLanguage}.json`;
    const sourceUrl = browser.runtime.getURL(sourcePath);
    const response = await fetch(sourceUrl, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Unable to load stopwords file: ${sourcePath} (${response.status})`);
    }

    const data = await response.json();
    const words = getWordsFromData(data);
    const normalizedWords = words
      .map(normalizeWord)
      .filter(Boolean);

    state.stopwords = new Set(normalizedWords);
    state.initialized = true;
    state.language = normalizeWord(data?.language || normalizedLanguage);
    state.sourcePath = sourcePath;
    state.version = data?.version || null;
    state.lastUpdate = data?.lastUpdate || null;

    return getStats();
  }

  /**
   * Initializes the manager once. Repeated calls reuse the loaded Set.
   *
   * @param {string} language Language code matching a JSON filename.
   * @returns {Promise<object>} Current manager statistics.
   */
  async function initialize(language = DEFAULT_LANGUAGE) {
    const normalizedLanguage = normalizeWord(language).replace(/\s/g, "");

    if (state.initialized && state.language === normalizedLanguage) {
      return getStats();
    }

    return load(normalizedLanguage);
  }

  /**
   * Checks whether a word exists in the loaded stopwords Set.
   *
   * @param {string} word Word to check.
   * @returns {boolean} True when the word is a stopword.
   */
  function isStopword(word) {
    if (!state.initialized) {
      return false;
    }

    const normalizedWord = normalizeWord(word);
    return normalizedWord !== "" && state.stopwords.has(normalizedWord);
  }

  /**
   * Forces the selected stopwords file to be loaded again.
   *
   * @param {string} language Language code matching a JSON filename.
   * @returns {Promise<object>} Current manager statistics.
   */
  async function reload(language = state.language || DEFAULT_LANGUAGE) {
    state.initialized = false;
    state.stopwords = new Set();

    return load(language);
  }

  /**
   * Returns non-sensitive information about the current manager state.
   *
   * @returns {object} Stopwords manager statistics.
   */
  function getStats() {
    return {
      initialized: state.initialized,
      language: state.language,
      totalWords: state.stopwords.size,
      sourcePath: state.sourcePath,
      version: state.version,
      lastUpdate: state.lastUpdate
    };
  }

  globalThis.ForgeStopwordsManager = Object.freeze({
    initialize,
    load,
    normalizeWord,
    isStopword,
    reload,
    getStats
  });
})();
