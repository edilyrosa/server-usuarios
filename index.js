import { supabase } from "./supabaseClient.js";
import express from "express";
import cors from "cors";

const app = express();
const PORT = 3000;
app.use(express.json());
//app.use(cors()); //TODO: Mejorar la seguridad

//!para cambiar de pierto del front: npx live-server --port=5502
const allowedOrigins = [
'http://127.0.0.1:5501',
'https://practica-crud-academia.vercel.app'
]


app.use(cors(
  {origin:(origin, callback)=> {
    if(!origin || allowedOrigins.includes(origin)) callback(null, true) //✅Permite acceso
      else callback(new Error('Origin no permitido por CORS')) //❌ Bloquea acceso
  }
  }//unico front permitido para consumir este server
)); 





// TODO: Middleware para registrar logs en Supabase
app.use(async (req, res, next) => {
  // Prepara el log
  const log = {
    fecha: new Date().toISOString(),//Momento exacto de la petición:YYYY-MM-DDTHH:mm:ss.sssZ
    ip: req.ip, //IP del cliente que hace la petición                         |
    metodo: req.method, //Método HTTP usado (GET, POST, PUT, DELETE, etc.)            |
    ruta: req.originalUrl, //Ruta completa solicitada por el cliente                     |
    origen: req.headers.origin || 'directo', //Origen de la petición (CORS) o 'directo' si no hay origen
    user_agent: req.headers['user-agent'] || '',//Información del navegador o cliente HTTP
  };

  // Guarda el log en Supabase
  try {
    await supabase.from('logs').insert([log]);

    // Muestra en consola (para Render)
    console.log(`[LOG] ${log.fecha} - ${log.metodo} ${log.ruta} desde ${log.origen} (${log.ip}) UA:${log.user_agent}`);
  
  } catch (error) {
    console.error('Error guardando log en Supabase:', error);
    // No detenemos la petición si falla el log
  }

  next(); //next(); // Si no hay error, continuamos con la siguiente función de middleware
  //hecha la inserción continuamos con la petición que es un get a /log, para mostrar los logs

});


//TODO
app.set('view engine', 'ejs');
app.set('views', './views'); // Carpeta donde pondrás tus templates






// Ruta raíz para comprobar servidor activo
app.get("/", (req, res) => {
  res.send("<h1>Servidor up</h1>");
});







//TODO: Ruta para ver logs (protégela en producción)
app.get("/logs", async (req, res) => {
  const { data, error } = await supabase
    .from("logs")
    .select("*")                          //os registros más recientes aparecen primero en los resultados.
    .order("fecha", { ascending: false })//Ordena los resultados por la columna fecha de forma descendente.
    .limit(100); //Solo trae los primeros 100 resultados de la consulta. Evita traer demasiados registros.

  if (error) {
    console.error("Error al obtener logs:", error);
    return res.status(500).json({ error: "Error al obtener logs" });
  }
  
  res.json(data);
});



//TODO: Crea la ruta en Express usando el template
app.get('/logtabla', async (req, res) => {
  const { data: logs, error } = await supabase
    .from('logs')
    .select('*')
    .order('fecha', { ascending: false })
    .limit(100);

  if (error) return res.status(500).send('Error al obtener logs');

  res.render('logtabla', { logs }); // Renderiza el template y pasa los logs
});










//TODO: Get mejorado para capturar parametros de busqueda pasados por URL
//! COMO ESTABA: Obtener todos los usuarios
// app.get("/usuarios", async (req, res) => {
//   const { data, error } = await supabase.from("usuarios").select("*");

//   if (error) {
//     console.error("Error al obtener usuarios:", error);
//     return res.status(500).send("Error al obtener usuarios");
//   }
//   res.json(data);
// });

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
app.post("/usuarios", async (req, res )=> {  //TODO: AGREGAR {}
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


//*Porque si el frontend envía explícitamente null, tu backend lo aceptaría y podrías guardar un valor nulo en la base de datos, 
//*lo cual normalmente no quieres para campos obligatorios o booleanos.
//TODO TERMINAR: Actualizar usuario por ID
app.put("/usuarios/:id", async (req, res)=>{
    const id =  parseInt(req.params.id)
    const usuario = req.body
    if( //Aqui debemos validad que al menos un campo del obj usuario traiga data validad, para actualizar
        usuario.nombre === undefined &&
        usuario.email === undefined &&
        usuario.foto === undefined &&
        usuario.genero === undefined &&
        usuario.aceptacion === undefined  || usuario.aceptacion === null && 
        usuario.edad === undefined || usuario.edad === null

       //TODO .... Haz el resto de las validaciones
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

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
