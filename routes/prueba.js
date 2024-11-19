const bcrypt = require('bcrypt');

(async () => {
    // Registro
    const password = 'contraseña123';
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Contraseña encriptada:', hashedPassword);

    // Login
    const isMatch = await bcrypt.compare(password, hashedPassword);
    console.log('¿Coinciden las contraseñas?:', isMatch);
})();
