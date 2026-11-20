const express = require("express");
const weather = require("./weather");

const app = express();

// Ruta principal de la aplicación
app.get("/", (req, res) => {
  res.json({
    app: "API DPL",
    status: "OK",
    time: new Date().toISOString()
  });
});

// Ruta meteorológica
app.get("/weather", weather);

// Configuración del puerto para Render
const PORT = process.env.PORT || 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Escuchando en el puerto ${PORT}`);
});