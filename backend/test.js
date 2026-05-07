const axios = require('axios');
axios.post('http://localhost:5000/api/auth/signup', {
  name: "Test", email: "testx@test.com", password: "password123"
}).then(res => console.log(res.data)).catch(err => console.error(err.response ? err.response.data : err.message));
