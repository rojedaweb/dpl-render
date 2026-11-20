
const pool = require("./db");

module.exports = async (req, res) => {
  try {

    // 1. Consultar la API meteorológica de nuestro VPS
    const url = "https://meteo.ciclofp.es/dpl/";

    const respuesta = await fetch(url);

    if (!respuesta.ok) {
      throw new Error(
        `Error al consultar la API meteorológica: HTTP ${respuesta.status}`
      );
    }

    const datos = await respuesta.json();
    const tiempo = datos.current;

    // 2. Crear la tabla de visitas si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS visitas (
        id SERIAL PRIMARY KEY,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ruta VARCHAR(100) NOT NULL
      )
    `);

    // 3. Registrar la visita actual
    await pool.query(
      "INSERT INTO visitas (ruta) VALUES ($1)",
      ["/weather"]
    );

    // 4. Obtener el número total de visitas
    const resultado = await pool.query(
      "SELECT COUNT(*) AS total FROM visitas"
    );

    const visitas = resultado.rows[0].total;

    // 5. Obtener la fecha y hora de la consulta
    const consulta = new Date().toLocaleString("es-ES", {
      timeZone: "Atlantic/Canary"
    });

    // 6. Mostrar la página meteorológica
    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>El tiempo - DPL</title>

        <style>
          body {
            font-family: Arial, sans-serif;
            background: #eef3f8;
            text-align: center;
            padding: 50px 15px;
          }

          .tarjeta {
            background: white;
            max-width: 450px;
            margin: auto;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 4px 15px #0002;
          }

          h1 {
            color: #24578a;
          }

          .temperatura {
            font-size: 55px;
            color: #e67e22;
            font-weight: bold;
          }

          .visitas {
            margin-top: 20px;
            padding: 15px;
            background: #eef3f8;
            border-radius: 10px;
            color: #24578a;
            font-size: 20px;
          }

          .pie {
            font-size: 13px;
            color: #666;
            margin-top: 20px;
          }

          a {
            color: #24578a;
          }
        </style>
      </head>

      <body>
        <div class="tarjeta">

          <h1>El tiempo en Las Palmas - Render</h1>

          <div class="temperatura">
            ${tiempo.temperature_2m} °C
          </div>

          <p>Humedad: ${tiempo.relative_humidity_2m} %</p>
          <p>Viento: ${tiempo.wind_speed_10m} km/h</p>

          <p>Datos meteorológicos: ${tiempo.time}</p>
          <p>Consulta realizada: ${consulta}</p>

          <div class="visitas">
            Visitas registradas: <strong>${visitas}</strong>
          </div>

          <hr>

          <p class="pie">
            Aplicación Node.js + Express + PostgreSQL<br>
            Desplegada en Render<br>
            Datos meteorológicos: Open-Meteo
          </p>

          <a href="/">Volver al inicio</a>

        </div>
      </body>
      </html>
    `);

  } catch (error) {
    console.error(error);

    res.status(500).send(
      "No se pudo obtener la información meteorológica o registrar la visita."
    );
  }
};
