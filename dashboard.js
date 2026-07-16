document.addEventListener("DOMContentLoaded", async () => {
  const datos = await browser.runtime.sendMessage({ action: "obtenerMetricas" });

  if (!datos) {
    alert("No data found. Please run Forge Extension from a website.");
    window.close();
    return;
  }

  //Progress Bar Code, because we all love progress bars :)
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

      document.getElementById("lblDominio").textContent = datos.dominio;
      document.getElementById("lblEncontradas").textContent = datos.encontradas.toLocaleString();
      document.getElementById("lblUnicas").textContent = datos.unicas.toLocaleString();
      document.getElementById("lblEliminadas").textContent = datos.eliminadas.toLocaleString();
      document.getElementById("lblTiempo").textContent = `${datos.tiempo}s`;
      document.getElementById("lblTamaño").textContent = `${datos.unicas.toLocaleString()} words`;
     
      document.getElementById("pantallaResultados").classList.remove("hidden");
    }
  }, 50);

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

