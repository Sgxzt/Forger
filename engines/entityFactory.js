/**
 * Forger - EntityFactory
 *
 * Creates normalized entity objects used by the internal analysis pipeline.
 *
 * Responsibilities:
 * - Validate incoming entity data.
 * - Normalize entity text.
 * - Create a consistent entity structure.
 *
 * This module does not classify, score, store or filter entities.
 */

(() => {
    "use strict";

    const DEFAULT_TYPE = "unknown";
    const DEFAULT_CONFIDENCE = 0;
    const MIN_CONFIDENCE = 0;
    const MAX_CONFIDENCE = 1;

    /**
     * Normalize text so entities can be compared consistently.
     *
     * @param {string} text
     * @returns {string}
     */
    function normalizeText(text) {
        if (typeof text !== "string") {
            return "";
        }

        return text
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, " ");
    }

    /**
     * Normalize an entity type.
     *
     * Examples:
     * "Possible User" -> "possible_user"
     * "TECHNOLOGY"    -> "technology"
     *
     * @param {string} type
     * @returns {string}
     */
    function normalizeType(type) {
        if (typeof type !== "string" || !type.trim()) {
            return DEFAULT_TYPE;
        }

        return type
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "_")
            .replace(/[^a-z0-9_-]/g, "");
    }

    /**
     * Ensure confidence remains between 0 and 1.
     *
     * @param {number} confidence
     * @returns {number}
     */
    function normalizeConfidence(confidence) {
        const numericConfidence = Number(confidence);

        if (!Number.isFinite(numericConfidence)) {
            return DEFAULT_CONFIDENCE;
        }

        return Math.min(
            MAX_CONFIDENCE,
            Math.max(MIN_CONFIDENCE, numericConfidence)
        );
    }

    /**
     * Normalize and deduplicate string arrays.
     *
     * @param {unknown} values
     * @returns {string[]}
     */
    function normalizeStringArray(values) {
        if (!Array.isArray(values)) {
            return [];
        }

        return [
            ...new Set(
                values
                    .filter(value => typeof value === "string")
                    .map(value => value.trim())
                    .filter(Boolean)
            )
        ];
    }

    /**
     * Create an entity object.
     *
     * @param {Object} data
     * @param {string} data.text
     * @param {string} [data.type]
     * @param {number} [data.score]
     * @param {number} [data.confidence]
     * @param {number} [data.occurrences]
     * @param {string[]} [data.sources]
     * @param {string[]} [data.contexts]
     * @param {string[]} [data.possibleMutations]
     * @param {boolean} [data.ignored]
     * @param {string|null} [data.reason]
     *
     * @returns {Object}
     */
    function create(data = {}) {
        if (!data || typeof data !== "object") {
            throw new TypeError(
                "ForgeEntityFactory.create expects an object."
            );
        }

        const text = typeof data.text === "string"
            ? data.text.trim()
            : "";

        const normalizedText = normalizeText(text);

        if (!normalizedText) {
            throw new TypeError(
                "ForgeEntityFactory.create requires a valid text value."
            );
        }

        const score = Number(data.score);
        const occurrences = Number(data.occurrences);

        return {
            id: normalizedText,

            text,
            normalizedText,

            type: normalizeType(data.type),

            score: Number.isFinite(score)
                ? score
                : 0,

            confidence: normalizeConfidence(data.confidence),

            occurrences:
                Number.isInteger(occurrences) && occurrences > 0
                    ? occurrences
                    : 1,

            sources: normalizeStringArray(data.sources),

            contexts: normalizeStringArray(data.contexts),

            possibleMutations: normalizeStringArray(
                data.possibleMutations
            ),

            ignored: data.ignored === true,

            reason:
                typeof data.reason === "string" && data.reason.trim()
                    ? data.reason.trim()
                    : null,

            metadata:
                data.metadata &&
                typeof data.metadata === "object" &&
                !Array.isArray(data.metadata)
                    ? { ...data.metadata }
                    : {},

            createdAt:
                typeof data.createdAt === "string"
                    ? data.createdAt
                    : new Date().toISOString()
        };
    }

    /**
     * Check whether a value has the minimum entity structure.
     *
     * @param {unknown} entity
     * @returns {boolean}
     */
    function isEntity(entity) {
        return Boolean(
            entity &&
            typeof entity === "object" &&
            typeof entity.text === "string" &&
            typeof entity.normalizedText === "string" &&
            typeof entity.type === "string" &&
            Number.isInteger(entity.occurrences) &&
            Array.isArray(entity.sources)
        );
    }

    globalThis.ForgeEntityFactory = Object.freeze({
        create,
        isEntity,
        normalizeText
    });

    console.log(
        "[FORGER] Entity Factory load correctly",
        globalThis.ForgeEntityFactory
    );
})();
