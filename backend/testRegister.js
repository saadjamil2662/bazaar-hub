const axios = require('axios');

(async () => {
  try {
    const r = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Test3',
      email: 'test3@example.com',
      password: 'pass'
    });
    console.log('status', r.status, r.data);
  } catch (e) {
    console.error('err', e.response ? e.response.status : e.message, e.response ? e.response.data : '');
  }
})();