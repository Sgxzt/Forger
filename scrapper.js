browser.runtime.onMessage.addListener((mensaje) => {
  if (mensaje.action === "iniciarEscaneo") {
    const tiempoInicio = performance.now();
    const opciones = mensaje.opciones;
    const textoPagina = document.body.innerText;
    const htmlPagina = document.documentElement.innerHTML; // For Detecting Hiding Technologies

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
      tecnologias: []
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
        clasificacion.tecnologias.push(palabraMinuscula);
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
      browser.runtime.sendMessage({
        action: "abrirDashboard",
        datos: {
          lista: diccionarioTotal.join("\n"),
          dominio: dominioActual,
          tiempo: tiempoTotal,
          categorizado: clasificacion, 
          totalUnicas: diccionarioTotal.length
        }
      });
    } else {
      alert("No elements found with the current filters");
    }
  }
});
