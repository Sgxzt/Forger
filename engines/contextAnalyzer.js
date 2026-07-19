(() => {
    "use strict";

    /**
     * ContextAnalyzer
     *
     * Observes the HTML context where a term appears.
     *
     * Responsibilities:
     * - Detect the HTML element type.
     * - Detect a meaningful source.
     * - Extract nearby text.
     * - Extract relevant attributes.
     *
     * It does not:
     * - Classify entities.
     * - Assign scores.
     * - Store entities.
     */

    const DEFAULT_SELECTORS = Object.freeze ([
        "title",
        "h1",
        "h2",
        "h3",
        "a",
        "button",
        "label",
        "input",
        "textarea",
        "meta",
        "img",
        "script",
        "link",
        "select",
        "option",
        "form"
    ]);

    function normalizeText(value) {
        if (typeof value !== "string") {
            return "";
        }

        return value
            .replace(/\s+/g, " ")
            .trim();
    }

    function getElementTag(element) {
        if (!(element instanceof Element)) {
            return null;
        }

        return element.tagName.toLowerCase();
    }

    function detectSource(element) {
        if (!(element instanceof Element)) {
            return "page_text";
        }

        const tag = getElementTag(element);

        switch (tag) {
            case "title":
                return "title";

            case "h1":
                return "heading_h1";

            case "h2":
                return "heading_h2";

            case "h3":
                return "heading_h3";

            case "a":
                return "link";

            case "button":
                return "button";

            case "input":
                return "input";

            case "textarea":
                return "textarea";

            case "form":
                return "form";

            case "meta":
                return "meta";

            case "footer":
                return "footer";

            case "header":
                return "header";

            case "nav":
                return "navigation";

            case "script":
                return "script";

            default:
                return "body";
        }
    }

    function extractAttributes(element) {
        if (!(element instanceof Element)) {
            return {};
        }

        const relevantAttributes = [
            "id",
            "class",
            "name",
            "type",
            "href",
            "src",
            "content",
            "property",
            "placeholder",
            "aria-label",
            "title",
            "value"
        ];

        const attributes = {};

        for (const attributeName of relevantAttributes) {
            const value = element.getAttribute(attributeName);

            if (value) {
                attributes[attributeName] = normalizeText(value);
            }
        }

        return attributes;
    }

    function getNearbyText(element, maxLength = 250) {
        if (!(element instanceof Element)) {
            return "";
        }

        const text = normalizeText(
            element.innerText ||
            element.textContent ||
            ""
        );

        if (text.length <= maxLength) {
            return text;
        }

        return `${text.slice(0, maxLength)}...`;
    }

    function extractElementText(element) {
        if (!(element instanceof Element)) {
            return "";
        }

        const tag = getElementTag(element);

        if (tag === "input" || tag === "textarea") {
            const safeValue =
                tag === "input" &&
                element.type?.toLowerCase() === "password"
                    ? ""
                    : element.value
            return normalizeText(
                [
                    element.getAttribute("placeholder"),
                    element.getAttribute("aria-label") ,
                    element.getAttribute("name"),
                    safeValue 
                ]
                .filter(Boolean)
                .join(" ")
            );
        }

        if (tag === "meta") {
            return normalizeText(
                element.getAttribute("content") || ""
            );
        }

        if (tag === "img") {
            return normalizeText(
                [
                    element.getAttribute("alt"),
                    element.getAttribute("title"),
                    element.getAttribute("aria-label")
                ]
                .filter(Boolean)
                .join(" ")
            );
        }

        if (tag === "script") {
            return normalizeText(
                [
                    element.getAttribute("src"),
                    element.getAttribute("type"),
                    element.getAttribute("id")
                ]
                .filter(Boolean)
                .join(" ")
            );
        }

        if (tag === "link") {
            return normalizeText(
                [
                    element.getAttribute("href"),
                    element.getAttribute("rel"),
                    element.getAttribute("type"),
                    element.getAttribute("title")
                ]
                .filter(Boolean)
                .join(" ")
            );
        }

        if (tag === "select") {
            return normalizeText(
                [
                    element.getAttribute("name"),
                    element.getAttribute("id"),
                    element.getAttribute("aria-label"),
                    element.getAttribute("title")
                ]
                .filter(Boolean)
                .join(" ")
            );
        }

        if (tag === "option") {
            return normalizeText(
                [
                    element.textContent,
                    element.getAttribute("value"),
                    element.getAttribute("label")
                ]
                .filter(Boolean)
                .join(" ")
            );
        }

        if (tag === "form") {
            return normalizeText(
                [
                    element.getAttribute("name"),
                    element.getAttribute("id"),
                    element.getAttribute("action"),
                    element.getAttribute("aria-label"),
                    element.getAttribute("tlte")
                ]
                .filter(Boolean)
                .join(" ")
            );
        }

        return normalizeText(
            element.innerText ||
            element.textContent ||
            ""
        );
    }

    function collect({
        root = document,
        selectors = DEFAULT_SELECTORS
    } = {}) {
        if (
            !root ||
            typeof root.querySelectorAll !== "function"
        ) {
            return [];
        }

        const observations = [];
        const processedElements = new Set();

        for (const selector of selectors) {
            const elements = root.querySelectorAll(selector);

            for (const element of elements) {
                if (processedElements.has(element)) {
                    continue;
                }

                processedElements.add(element);

                const text = extractElementText(element);

                if (!text) {
                    continue;
                }
                observations.push({
                    text,
                    element
                });
            }
        }
        return observations;
    }

    function analyze(element, term = "") {
        const normalizedTerm = normalizeText(term);

        if (!(element instanceof Element)) {
            return {
                source: "page_text",
                tag: null,
                text: normalizedTerm,
                nearbyText: "",
                attributes: {},
                element
            };
        }

        return {
            source: detectSource(element),
            tag: getElementTag(element),
            text: normalizedTerm,
            nearbyText: getNearbyText(element) || normalizedTerm,
            attributes: extractAttributes(element),
            element
        };
    }

    globalThis.ForgeContextAnalyzer = Object.freeze({
        collect,
        analyze,
        detectSource,
        extractAttributes,
        extractElementText,
        getNearbyText
    });

    console.log(
        "[FORGER] Context Analyzer loaded correctly"
    );
})();