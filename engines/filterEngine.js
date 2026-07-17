(() => {
  "use strict";

  const state = {
    initialized: false
  };

  /**
   * Initializes every filter data source.
   * Each manager remains responsible only for its own file.
   *
   * @param {string} language Stopwords language code.
   * @returns {Promise<object>} Filter engine statistics.
   */
  async function initialize(language = "es") {
    const initializers = [
      globalThis.ForgeStopwordsManager?.initialize?.(language),
      globalThis.ForgeBlacklistManager?.initialize?.(),
      globalThis.ForgeWhitelistManager?.initialize?.()
    ].filter(Boolean);

    const results = await Promise.allSettled(initializers);

    results.forEach(result => {
      if (result.status === "rejected") {
        console.error("Forge FilterEngine source initialization failed:", result.reason);
      }
    });

    state.initialized = true;
    return getStats();
  }

  /**
   * Evaluates a word using the mandatory priority order:
   * whitelist, blacklist, stopwords.
   *
   * @param {string} word Word to evaluate.
   * @returns {{ignored: boolean, reason: string|null, normalizedWord: string}}
   */
  function evaluate(word) {
    const normalizedWord = globalThis.ForgeStopwordsManager?.normalizeWord?.(word) || "";

    if (!normalizedWord) {
      return {
        ignored: true,
        reason: "invalid",
        normalizedWord
      };
    }

    if (globalThis.ForgeWhitelistManager?.isWhitelisted?.(normalizedWord)) {
      return {
        ignored: false,
        reason: "whitelisted",
        normalizedWord
      };
    }

    if (globalThis.ForgeBlacklistManager?.isBlacklisted?.(normalizedWord)) {
      return {
        ignored: true,
        reason: "blacklisted",
        normalizedWord
      };
    }

    if (globalThis.ForgeStopwordsManager?.isStopword?.(normalizedWord)) {
      return {
        ignored: true,
        reason: "stopword",
        normalizedWord
      };
    }

    return {
      ignored: false,
      reason: null,
      normalizedWord
    };
  }

  /**
   * Convenience method for current consumers that only need a boolean.
   *
   * @param {string} word Word to evaluate.
   * @returns {boolean} True when the word should be ignored.
   */
  function shouldIgnore(word) {
    return evaluate(word).ignored;
  }

  /**
   * Reloads every filter data source.
   *
   * @param {string} language Stopwords language code.
   * @returns {Promise<object>} Filter engine statistics.
   */
  async function reload(language = "es") {
    const reloaders = [
      globalThis.ForgeStopwordsManager?.reload?.(language),
      globalThis.ForgeBlacklistManager?.reload?.(),
      globalThis.ForgeWhitelistManager?.reload?.()
    ].filter(Boolean);

    const results = await Promise.allSettled(reloaders);

    results.forEach(result => {
      if (result.status === "rejected") {
        console.error("Forge FilterEngine source reload failed:", result.reason);
      }
    });

    state.initialized = true;
    return getStats();
  }

  /**
   * Returns aggregated statistics without exposing the internal Sets.
   *
   * @returns {object} Filter engine statistics.
   */
  function getStats() {
    return {
      initialized: state.initialized,
      stopwords: globalThis.ForgeStopwordsManager?.getStats?.() || null,
      blacklist: globalThis.ForgeBlacklistManager?.getStats?.() || null,
      whitelist: globalThis.ForgeWhitelistManager?.getStats?.() || null
    };
  }

  globalThis.ForgeFilterEngine = Object.freeze({
    initialize,
    evaluate,
    shouldIgnore,
    reload,
    getStats
  });
})();
