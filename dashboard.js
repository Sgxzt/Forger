document.addEventListener("DOMContentLoaded", async () => {
  const datos = await browser.runtime.sendMessage({ action: "obtenerMetricas" });

  if (!datos) {
    alert("No data found. Please run Forge Extension from a website.");
    window.close();
    return;
  }

  const barra = document.getElementById("barraProgreso");
  let porcentaje = 0;

  const intervaloCarga = setInterval(() => {
    porcentaje += 5;

    const totalBarras = Math.floor(porcentaje / 5);
    const espaciosVacios = 20 - totalBarras;
    const barrasTxt = "/".repeat(totalBarras);
    const espaciosTxt = " ".repeat(espaciosVacios);

    barra.textContent = `[${barrasTxt}${espaciosTxt}] ${porcentaje}%`;

    if (porcentaje >= 100) {
      clearInterval(intervaloCarga);

      document.getElementById("pantallaCarga").classList.add("hidden");

      // Inyectar datos Meta generales
      document.getElementById("lblDominio").textContent = datos.dominio;
      document.getElementById("lblTiempo").textContent = `${datos.tiempo}s`;
      document.getElementById("lblTamaño").textContent = `${datos.totalUnicas} words`;

      // Mapear colecciones categorizadas a las cajas visuales de forma ordenada
      const cat = datos.categorizado;
      
      const mapeo = [
        { box: "boxEmpresas", count: "countEmpresas", arr: cat.empresas },
        { box: "boxProductos", count: "countProductos", arr: cat.productos },
        { box: "boxUbicaciones", count: "countUbicaciones", arr: cat.ubicaciones },
        { box: "boxAcronimos", count: "countAcronimos", arr: cat.acronimos },
        { box: "boxCorreos", count: "countCorreos", arr: cat.correos },
        { box: "boxDominios", count: "countDominios", arr: cat.dominios },
        { box: "boxFechas", count: "countFechas", arr: cat.fechas },
        { box: "boxUsuarios", count: "countUsuarios", arr: cat.usuarios },
        { box: "boxTecnologias", count: "countTecnologias", arr: cat.tecnologias }
      ];

      mapeo.forEach(target => {
        document.getElementById(target.count).textContent = target.arr.length;
        if (target.arr.length > 0) {
          document.getElementById(target.box).textContent = target.arr.join("\n");
        }
      });
     
      document.getElementById("pantallaResultados").classList.remove("hidden");
    }
  }, 30);

  document.getElementById("btnExportar").addEventListener("click", () => {
    browser.runtime.sendMessage({
      action: "descargarLista",
      texto: datos.lista
    });
  });

  document.getElementById("btnCerrar").addEventListener("click", () => {
    window.close();
  });
});

