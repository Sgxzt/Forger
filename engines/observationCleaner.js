(() => {
    "use strict";

    const NOISE_TOKENS = new Set([
        "null",
        "undefined",
        "javascript",
        "stylesheet",
        "manifest",
        "favicon",
        "image",
        "images"
    ]);

    const FILE_EXTENSIONS = new Set([
        "js",
        "css",
        "json",
        "png",
        "jpg",
        "jpeg",
        "gif",
        "svg",
        "webp",
        "ico",
        "woff",
        "woff2",
        "ttf"
    ]);

    function normalizeSeparators(text) {
        return String(text || "")
            .replace(/[\\/._-]+/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    function tokenize(text) {
        return normalizeSeparators(text)
            .split(/\s+/)
            .map(token => token.trim())
            .filter(Boolean);
    }

    function isNoiseToken(token) {
        const normalizedToken = token.toLowerCase();

        return (
            NOISE_TOKENS.has(normalizedToken) ||
            FILE_EXTENSIONS.has(normalizedToken)
        );
    }

    function clean(text) {
        const seen = new Set();

        return tokenize(text)
            .filter(token => token.length >= 2)
            .filter(token => !isNoiseToken(token))
            .filter(token => {
                const normalizedToken = token.toLowerCase();

                if (seen.has(normalizedToken)) {
                    return false;
                }

                seen.add(normalizedToken);
                return true;
            });
    }

    globalThis.ForgeObservationCleaner = Object.freeze({
        clean
    });

    console.log(
        "[FORGER] Observation Cleaner loaded correctly"
    );
})();