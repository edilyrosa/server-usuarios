import { supabase } from "./supabaseClient.js";
import express from "express";
import cors from "cors";

//todo: ejecuta: ✅npm install jsonwebtoken express-jwt
import expressJwt from 'express-jwt'; //TODO 1: usada como parametro en el middleware para proteger ruta
import jwt from 'jsonwebtoken';//TODO 2: con jwt.sign() crearemos el token
import 'dotenv/config'; //TODO 3: para usar las var de entorno
const  jwtSecret= process.env.JWT_SECRET//TODO 4 clave secreta que se usa para firmar y verificar los tokens, tu la defines 

const app = express();
const PORT = 3000;
app.use(express.json());
//app.use(cors()); //Mejorar la seguridad

//!para cambiar de puerto del front: npx live-server --port=5502
const allowedOrigins = [
'http://127.0.0.1:5501',
'https://practica-crud-academia.vercel.app'
]

//Middleware para estanlecer los origins permitidos para consumir este back
app.use(cors(
  {origin:(origin, callback)=> {
    if(!origin || allowedOrigins.includes(origin)) callback(null, true) //✅Permite acceso
      else callback(new Error('Origin no permitido por CORS')) //❌ Bloquea acceso
  }
  }//unico front permitido para consumir este server
)); 

//Middleware para registrar logs en Supabase
app.use( async(req, res, next)=> {
  const log = {
    fecha: new Date().toISOString(), // Momento exacto de la petición: YYYY-MM-DDTHH:mm:ss.sssZ
    ip: req.ip, // IP del cliente que hace la petición
    metodo: req.method, // Método HTTP usado (GET, POST, PUT, DELETE, etc.)
    ruta: req.originalUrl, // Ruta completa solicitada por el cliente
    origen: req.headers.origin || 'directo', // Origen de la petición (CORS) o 'directo' si no hay origen
    user_agent: req.headers['user-agent'] || '', // Información del navegador o cliente HTTP
  }
  try {
    await supabase.from('logs').insert([log])
  } catch (error) {
    console.log('Error al guardar logs', error);
    
  }
  next()
})

//TODO: 6. Agregar los setters de ejs al inicio de tu archivo principal (antes de las rutas)
//!quitar
app.set('view engine', 'ejs');
app.set('views', './views'); // Carpeta donde pondrás tus templates
//!


// Ruta raíz para comprobar servidor activo
app.get("/", (req, res) => {
  res.send("<h1>Servidor up</h1>");
});




//TODO 5: LOGIN QUE CREA EL TOKEN DE AUTENTICACION POR CREDENCIALES CORRECTAS
const usuario = { nombre: "alumno", clave: "1234" };//deberia ser obtenido de la BBDD
app.post('/login', (req, res) => {
  const { nombre, clave } = req.body;//credenciales enviadas por cliente
  if (nombre === usuario.nombre && clave === usuario.clave) { //comparamos credenciales de la BBDD
    // Generar token
    const token = jwt.sign({ nombre }, jwtSecret, { expiresIn: '1h' });
    res.json({ token });  // Envías el token al cliente, para que lo use en futuras peticiones protegidas.
  } else {
    res.status(401).json({ mensaje: "Credenciales incorrectas" });
  }
});







//todo: 1. add async & await
//Ruta para ver logs (protégela en producción)
app.get('/logs', async (req, res)=>{
  const {data, error} = await supabase.from('logs').select('*').order('fecha', {ascending:false}).limit(100)
  if(error) return res.status(500).json({error:'Error al obtener logs'})
  res.json(data)
})




//todo: 2. Crear el template HTML de la tabla de los logs, para servirlos desde el backend.
//todo: 3. npm install ejs
//todo: 4. Crear en raíz de tu proyecto, "views"/"logtabla.ejs" con el codigo HTML

//todo: 5. Crea la ruta en Express para mostrar el template HTML de la tabla de logs
//!quitar
// app.get('/logtabla', async (req, res) => {
//   const { data: logs, error } = await supabase
//     .from('logs')
//     .select('*')
//     .order('fecha', { ascending: false })
//     .limit(100);

//   if (error) return res.status(500).send('Error al obtener logs');

//   res.render('logtabla', { logs }); //! Renderiza el template y pasa la res "logs" obtenida
// });
// //!
// res.render() es un método de Express.js que sirve para renderizar (mostrar) una vista 
// o plantilla al usuario. En este caso, está renderizando la plantilla logtabla.ejs.
//Además, le pasa un objeto con los datos de los logs: { logs }. Para que dentro de  'logtabla' 
// se pueda acceder a esta y mostrar la información que contiene.





app.get( //TODO 6: RUTA PROTEGIDA CON TOKEN
  '/logtabla',
  expressJwt({ secret: jwtSecret, algorithms: ['HS256'] }),
  async (req, res) => {
    const { data: logs, error } = await supabase
      .from('logs')
      .select('*')
      .order('fecha', { ascending: false })
      .limit(100);

    if (error) return res.status(500).send('Error al obtener logs');
    res.render('logtabla', { logs });
  }
);










//COMO ESTABA app.get("/usuarios"...) sin req.query
// app.get("/usuarios", async (req, res) => {
//   const { data, error } = await supabase.from("usuarios").select("*");

//   if (error) {
//     console.error("Error al obtener usuarios:", error);
//     return res.status(500).send("Error al obtener usuarios");
//   }
//   res.json(data);
// });

//Get mejorado para capturar parametros de busqueda pasados por URL
app.get("/usuarios", async (req, res) => {
  const {edad, genero} = req.query

  const query = supabase.from("usuarios").select("*");
  
  //?aplicamos filtros si existen
  if(edad !== undefined) query.eq('edad', Number(edad))
  
    if(genero !== undefined) {
      const generoBool = genero === 'true'
      query.eq('genero', generoBool)
  }
  

  const { data, error } = await query; //!cadena de query lista 

  if (error) {
    console.error("Error al obtener usuarios:", error);
    return res.status(500).send("Error al obtener usuarios");
  }
  res.json(data);
});


//Obtener usuario por ID
app.get("/usuarios/:id", async (req, res) => {
    const id = parseInt(req.params.id)
   const {data, error} = await supabase.from('usuarios').select('*').eq('id', id).single()
    //const {data, error} = await supabase.from('usuarios').select('*').eq('id', id)
    if(error) return res.status(500).json({error:'Error la obtener al usuario'})
    if(!data) return res.status(404).json({error:'Error para encontrar al usuario'})
    res.json(data)
})


//Crear nuevo usuario CON LOS CHICOS
app.post("/usuarios", async (req, res )=> {
    const usuario = req.body
    if(
        !usuario.nombre ||
        !usuario.email ||
        !usuario.foto ||
        usuario.edad === undefined ||
        usuario.aceptacion === undefined ||
        usuario.genero === undefined
    ) return res.status(400).json({error:'Faltan datos para hacer post de usuario'})

    //TODO: AGREGAR {}, const {data, error} = await supabase.from('usuarios').insert([...usuario]).select()
    const {data, error} = await supabase.from('usuarios').insert([{...usuario}]).select()

    if(error) return res.status(500).json({error:'Error al crear/postear nuevo uusario'})

    res.json(data[0])
})


//Actualizar usuario por ID
app.put("/usuarios/:id", async (req, res)=>{
  const id =  parseInt(req.params.id)
  const usuario = req.body

  //*Si el frontend envía explícitamente null, tu backend lo aceptaría y enviaria a la BBDD
  //*lo cual normalmente no quieres para campos obligatorios o booleanos.
    if( //Aqui debemos validad que al menos un campo del obj usuario traiga data validad, para actualizar
        usuario.nombre === undefined &&
        usuario.email === undefined &&
        usuario.foto === undefined &&
        usuario.genero === undefined &&
        usuario.aceptacion === undefined  || usuario.aceptacion === null && 
        usuario.edad === undefined || usuario.edad === null
    ) return res.status(400).json({error: 'Almenos un campo debe ser enviado para actualizar/put'})
    //Creamos el Obj a enviar para actualizar el resgistro del ID.
    const camposActualizar = {}
    if(usuario.nombre !== undefined) camposActualizar.nombre = usuario.nombre;
    if(usuario.edad !== undefined && usuario.edad !== null)  camposActualizar.edad = usuario.edad;
    if(usuario.email !== undefined) camposActualizar.email = usuario.email;
    if(usuario.foto !== undefined) camposActualizar.foto = usuario.foto;
    if(usuario.aceptacion !== undefined && usuario.aceptacion !== null) camposActualizar.aceptacion = usuario.aceptacion;
    if(usuario.genero !== undefined) camposActualizar.genero = usuario.genero;

    const {data, error} = await supabase.from('usuarios').update(camposActualizar).eq('id', id).select()

    if(error) res.status(500).json({error:'Error al actualizar el usuario'})
    if(data.length === 0) res.status(404).json({error:'Usuario no encontrado'})
      res.json(data[0]) //? Enviamos el usuario actualizado
})

// Eliminar usuario por ID
app.delete("/usuarios/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  const { data, error } = await supabase
    .from("usuarios")
    .delete()
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error al eliminar usuario", error);
    return res.status(500).json({ error: "Error al eliminar usuario" });
  }

  if (data.length === 0) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }

  res.status(200).send();
});



app.use((err, req, res, next) => { //TODO 7: ERROR POR TOKEN INVALIDO
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ mensaje: 'Token inválido o no proporcionado' });
  } else {
    next(err);
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});































