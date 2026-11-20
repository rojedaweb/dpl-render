module.exports = async (req, res) => {
  try {
    const url = "https://meteto.ciclofp.es/dpl/";

    const respuesta = await fetch(url);

    if (!respuesta.ok) {
      const detalle = await respuesta.text();

      throw new Error(
        `Open-Meteo: HTTP ${respuesta.status} - ${detalle}`
      );
    }

    const datos = await respuesta.json();
    const tiempo = datos.current;

    const consulta = new Date().toLocaleString("es-ES", {
      timeZone: "Atlantic/Canary"
    });

    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>El tiempo - DPL</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: #eef3f8;
            text-align: center;
            padding: 50px;
          }
          .tarjeta {
            background: white;
            max-width: 450px;
            margin: auto;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 4px 15px #0002;
          }
          h1 { color: #24578a; }
          .temperatura {
            font-size: 55px;
            color: #e67e22;
          }
        </style>
      </head>
      <body>
        <div class="tarjeta">
          <h1>El tiempo en Las Palmas</h1>
          <div class="temperatura">
            ${tiempo.temperature_2m} °C
          </div>
          <p>Humedad: ${tiempo.relative_humidity_2m} %</p>
          <p>Viento: ${tiempo.wind_speed_10m} km/h</p>
          <p>Datos meteorológicos: ${tiempo.time}</p>
          <p>Consulta realizada: ${consulta}</p>
          <hr>
          <p>Aplicación Node.js - DPL</p>
          <a href="/">Volver al inicio</a>
        </div>
      </body>
      </html>
    `);

  } catch (error) {
    console.error(error);
    res.status(502).send("No se pudo obtener el tiempo meteorológico");
  }
};