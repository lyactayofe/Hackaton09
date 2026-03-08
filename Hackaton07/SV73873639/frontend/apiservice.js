// apiService.js (ESTO ES NODEJS - BACKEND)
const axios = require('axios'); // Asegúrate de haber instalado axios: npm install axios

class ApiService {
  
  // 1. Consultar GitHub
  async obtenerUsuarioGithub(username) {
    try {
      const response = await axios.get(`https://api.github.com/users/${username}`);
      return response.data;
    } catch (error) {
      throw new Error('Error al consultar GitHub');
    }
  }

  // 3. Consultar Tipo de Cambio (Usando la alternativa para que funcione con PEN)
  async obtenerCambioDolarSoles() {
    try {
      const response = await axios.get('https://open.er-api.com/v6/latest/USD');
      return { 
        moneda_base: "USD",
        moneda_destino: "PEN",
        tasa: response.data.rates.PEN 
      };
    } catch (error) {
      throw new Error('Error al consultar el tipo de cambio');
    }
  }

  // ... Aquí agregarías los métodos para Pokemones, Rick & Morty, etc. ...
}

module.exports = ApiService;