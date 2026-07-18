/**
 * Forger - EntityStore
 *
 * Stores and merges entities created during the current analysis.
 *
 * Responsibilities:
 * - Register new entities.
 * - Avoid duplicates.
 * - Merge occurrences, sources and contexts.
 * - Improve type and confidence when stronger data appears.
 *
 * This module does not classify, score, filter or persist entities.
 */

(() => {
    "use strict";

    const entities = new Map();

    /**
     * Register or update an entity.
     *
     * @param {Object} data
     * @param {string} data.text
     * @param {string} [data.type]
     * @param {string} [data.source]
     * @param {string} [data.context]
     * @param {number} [data.confidence]
     *
     * @returns {Object|null}
     */
    function register({
        text,
        type = "unknown",
        source = "page_text",
        context = null,
        confidence = 0,
        reason = null
    } = {}) {
        if (!globalThis.ForgeEntityFactory) {
            throw new Error(
                "[FORGER] EntityFactory is not available."
            );
        }

        const normalizedText =
            globalThis.ForgeEntityFactory.normalizeText(text);

        if (!normalizedText) {
            return null;
        }

        const existingEntity = entities.get(normalizedText);

        if (existingEntity) {
            existingEntity.occurrences += 1;

            if (
                source &&
                !existingEntity.sources.includes(source)
            ) {
                existingEntity.sources.push(source);
            }

            if (
                context &&
                !existingEntity.contexts.includes(context)
            ) {
                existingEntity.contexts.push(context);
            }

            const hasStrongerEvidence =
                type !== "unknown" &&
                confidence > existingEntity.confidence;

            if (hasStrongerEvidence) {
                existingEntity.type = type;
                existingEntity.confidence = confidence;
            }

            if (
                reason &&
                (
                    !existingEntity.reason ||
                    hasStrongerEvidence
                )
            )   {
                existingEntity.reason = reason;
            }

            return existingEntity;
        }

        const entity =
            globalThis.ForgeEntityFactory.create({
                text,
                type,
                confidence,
                sources: source ? [source] : [],
                contexts: context ? [context] : [],
                reason
            });

        entities.set(normalizedText, entity);

        return entity;
    }

    /**
     * Get one entity by text.
     *
     * @param {string} text
     * @returns {Object|null}
     */
    function get(text) {
        const normalizedText =
            globalThis.ForgeEntityFactory.normalizeText(text);

        if (!normalizedText) {
            return null;
        }

        return entities.get(normalizedText) || null;
    }

    /**
     * Get all stored entities.
     *
     * @returns {Object[]}
     */
    function getAll() {
        return Array.from(entities.values());
    }

    /**
     * Remove all entities from the current analysis.
     */
    function clear() {
        entities.clear();
    }

    /**
     * Return the number of unique entities.
     *
     * @returns {number}
     */
    function size() {
        return entities.size;
    }

    globalThis.ForgeEntityStore = Object.freeze({
        register,
        get,
        getAll,
        clear,
        size
    });

    console.log(
        "[FORGER] Entity Store loaded correctly"
    );
})();
