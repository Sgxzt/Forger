browser.runtime.onMessage.addListener(async (mensaje) => {
  if (mensaje.action === "iniciarEscaneo") {
    const tiempoInicio = performance.now();
    const opciones = mensaje.opciones;
    const textoPagina = document.body.innerText;
    const htmlPagina = document.documentElement.innerHTML; // For Detecting Hiding Technologies

    // Initialize the filter engine before processing page words
    try {
      await globalThis.ForgeFilterEngine?.initialize?.("es");
      globalThis.ForgeEntityStore.clear();
      
      //TEMP LOG FROM HERE //////////////////
      const headings = document.querySelectorAll("h1");

      for (const heading of headings) {
        console.log(
          "[FORGER] Context Test:",
          globalThis.ForgeContextAnalyzer.analyze(
            heading,
            heading.textContent
          )
        );
      }

      const contextObservations = 
        globalThis.ForgeContextAnalyzer.collect();

      console.log(
        "[FORGER] Context observations:",
        contextObservations
      );
      // TO HERE ////////////////////////////////

      function observeContextTag({
        tag,
        confidence,
        reason
    }) {
        const matchingObservations =
            contextObservations.filter(
                observation =>
                    observation.element?.tagName
                        ?.toLowerCase() === tag
            );
    
        for (const observation of matchingObservations) {
            const words =
                globalThis.ForgeObservationCleaner.clean(
                    observation.text
                );
                    
    
            for (const word of words) {
                globalThis.ForgeEntityStore.observe({
                    text: word,
                    element: observation.element,
                    type: "contextual",
                    confidence,
                    reason
                });
            }
        }
    }
    
    observeContextTag({
        tag: "title",
        confidence: 0.45,
        reason: "title_observation"
    });
    
    observeContextTag({
        tag: "h1",
        confidence: 0.50,
        reason: "heading_h1_observation"
    });
    
    observeContextTag({
        tag: "meta",
        confidence: 0.60,
        reason: "meta_observation"
    });

    observeContextTag({
      tag: "h2",
      confidence: 0.45,
      reason: "heading_h2_observation"
    });

    observeContextTag({
      tag: "button",
      confidence: 0.35,
      reason: "button_observation"
    });

    observeContextTag({
      tag: "h3",
      confidence: 0.40,
      reason: "heading_h3_observation"
    });

    observeContextTag({
      tag: "label",
      confidence: 0.35,
      reason: "label_observation"
    });

    observeContextTag({
      tag: "input",
      confidence: 0.40,
      reason: "input_observation"
    });

    observeContextTag({
      tag: "textarea",
      confidence: 0.35,
      reason: "textarea_observation"
    });

    observeContextTag({
      tag: "a",
      confidence: 0.35,
      reason: "link_observation"
    });

    observeContextTag({
      tag: "img",
      confidence: 0.30,
      reason: "image_observation"
    });

    observeContextTag({
      tag: "script",
      confidence: 0.55,
      reason: "script_source_observation"
    });

    observeContextTag({
      tag: "link",
      confidence: 0.50,
      reason: "link_resource_observation"
    });

    observeContextTag({
      tag: "select",
      confidence: 0.35,
      reason: "select_observation"
    });

    observeContextTag({
      tag: "option",
      confidence: 0.35,
      reason: "option_observation"
    });

    observeContextTag({
      tag: "form",
      confidence: 0.45,
      reason: "form_observation"
    });

    } catch (error) {
      // Preserve previous Forge behavior if a filter source cannot be loaded
      console.error("Forge FilterEngine initialization failed:", error);
    }

    // Inteligent Structure Sorting  v1.4v
    // In this update some const and lines were moved and organised
    const clasificacion = {
      empresas: [],
      productos: [],
      ubicaciones: [],
      fechas: [],
      correos: [],
      dominios: [],
      acronimos: [],
      usuarios: [],
      tecnologias: [],
      //Temp solution for words that do not match a special category yet
      contextuales: [],
    };


    // 1. Advanced Regex Extraction (emails and domains)
    const emails = textoPagina.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    clasificacion.correos = [...new Set(emails.map(e => e.toLowerCase()))];

    const dominiosDetectados = textoPagina.match(/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,30}[a-z]/g) || [];
    clasificacion.dominios = [...new Set(dominiosDetectados.map(d => d.toLowerCase()).filter(d => !d.includes('@')))];

    // 2. Process individuals words using heuristic
    const todasLasPalabras = textoPagina.match(/[a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ_-]+/g) || [];

    // Local Dictionary
    const palabrasUbicaciones = ['madrid', 'barcelona', 'london', 'paris', 'tokyo', 'miami', 'mexico', 'bogota', 'lima', 'santiago', 'valencia', 'sevilla'];
    const palabrasProductos = ['sentinel', 'guardian', 'protect', 'platform', 'suite', 'software', 'firewall', 'antivirus', 'scanner', 'cloud'];
    const palabrasTecnologias = ['wordpress', 'apache', 'nginx', 'docker', 'kubernetes', 'react', 'angular', 'php', 'python', 'node', 'mysql', 'aws', 'azure'];

    todasLasPalabras.forEach(palabra => {
      const palabraMinuscula = palabra.toLowerCase();

      // Apply whitelist, blacklist and stopwords using the shared FilterEngine
      if (globalThis.ForgeFilterEngine?.shouldIgnore?.(palabra)) {
        return;
      }

      // Acronyms length bypass (2 - 5)
      if (/^[A-ZÑÁÉÍÓÚÜ]{2,5}$/.test(palabra)) {
        clasificacion.acronimos.push(palabra);
        return; 
      }

      // General length filter for the rest common categories
      if (palabra.length <= 3) return;

      // Sort by dates
      if (/^(19|20)\d{2}$/.test(palabra)) {
        clasificacion.fechas.push(palabra);
        return;
      }

      // Sort locations
        if (palabrasUbicaciones.includes(palabraMinuscula)) {
        clasificacion.ubicaciones.push(opciones.minusculas ? palabraMinuscula : palabra);
        return;
      }

      // Sort products
      if (palabrasProductos.includes(palabraMinuscula)) {
        clasificacion.productos.push(opciones.minusculas ? palabraMinuscula : palabra);
        return;
      }

      // Sort technologies
        if (palabrasTecnologias.includes(palabraMinuscula)) {
        globalThis.ForgeEntityStore.register({
          text: palabra,
          type: "technology",
          source: "page_text",
          context: null,
          confidence: 0.75,
          reason: "technology_dictionary_match"
        });

        clasificacion.tecnologias.push(
          opciones.minusculas
          ? palabraMinuscula
          : palabra
        );

        return;
      }

      // Detect possible usernames
      if (/^(admin|root|guest|user|support|test|info|sys|manager)$/.test(palabraMinuscula) || /^[a-z]{3,8}\d{1,4}$/.test(palabraMinuscula)) {
        clasificacion.usuarios.push(palabraMinuscula);
        return;
      }

      // Basis Heuristic in common texts
      if (/^[A-Z][a-z0-9ñáéíóúü]{3,15}$/.test(palabra) && !opciones.minusculas) {
        if (!palabrasUbicaciones.includes(palabraMinuscula) && !palabrasProductos.includes(palabraMinuscula)) {
          clasificacion.empresas.push(palabra);
        }
      }

      globalThis.ForgeEntityStore.register({
        text: palabra,
        type: "contextual",
        source: "page_text",
        confidence: 0.25
      });

      //Preserve valid words that were not categorized like (contextuales:) MUST REMAIN AS THE FINAL FALLBACK CLASSIFICATION
      clasificacion.contextuales.push(
        opciones.minusculas ? palabraMinuscula : palabra
      );
    });

    // 3. Sort dupes and optional sorting by categories 
    Object.keys(clasificacion).forEach(categoria => {
      let listaUnica = [...new Set(clasificacion[categoria])];
      if (opciones.ordenar) {
        listaUnica.sort();
      }
      clasificacion[categoria] = listaUnica;
    });

    // 4. Compress the dictionary and unify
    const todasLasKeywords = Object.values(clasificacion).flat();
    let diccionarioTotal = [...new Set(todasLasKeywords)];
    if (opciones.ordenar) diccionarioTotal.sort();

    // 5. Final step of rendering and sending
    const tiempoTotal = ((performance.now() - tiempoInicio) / 1000).toFixed(2);
    const dominioActual = window.location.hostname;

    if (diccionarioTotal.length > 0) {

      //TEMP LOG FROM HERE
      console.log (
        "[FORGER] Entity Snapshot:",
        globalThis.ForgeEntityStore.getAll()
      );
      //TO HERE

      browser.runtime.sendMessage({
        action: "abrirDashboard",
        datos: {
          lista: diccionarioTotal.join("\n"),
          dominio: dominioActual,
          tiempo: tiempoTotal,
          categorizado: clasificacion, 
          totalUnicas: diccionarioTotal.length,
          //New Entities Module 
          entities: globalThis.ForgeEntityStore.getAll()
        }
      });
    } else {
      alert("No elements found with the current filters");
    }
  }
});
