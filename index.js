import { supabase } from "./supabaseClient.js";
import express from "express";
import cors from "cors";

const app = express();
const PORT = 3000;
app.use(express.json());
app.use(cors()); //TODO: Mejorar la seguridad




// Ruta raíz para comprobar servidor activo
app.get("/", (req, res) => {
  res.send("<h1>Servidor up</h1>");
});

// Obtener todos los usuarios
app.get("/usuarios", async (req, res) => {
  const { data, error } = await supabase.from("usuarios").select("*");

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




//TODO TERMINAR: Actualizar usuario por ID
app.put("/usuarios/:id", (req, res)=>{
    const id =  parseInt(req.params.id)
    const usuario = req.body
    if( //Aqui debemos validad que al menos un campo del obj usuario traiga data validad, para actualizar
        usuario.nombre === undefined &&
        usuario.edad
       //TODO .... Haz el resto de las validaciones
    ) return res.status(400).json({error: 'Almenos un campo debe ser enviado para actualizar/put'})
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





















//! Obtener usuario por ID
// app.get("/usuarios/:id", async (req, res) => {
//   const id = parseInt(req.params.id);
//   const { data, error } = await supabase
//    .from("usuarios").select("*").eq("id", id).single();

//   if (error) return res.status(500).json({ error: "Error al obtener usuario" });
  
//   if (!data) return res.status(404).json({ error: "Usuario no encontrado" });
  
//   res.json(data);
// });

//! Crear nuevo usuario
// app.post("/usuarios", async (req, res) => {//cliente con REQ, apunta y envio la data del form
//   const usuario = req.body;                //Servidor hara insert y enviara RES

//   //?Si un dato viene vacio o indefinido, lanzamos un 400
//   //! Validar campos obligatorios (permitiendo 0 y false)
//   if (
//     !usuario.nombre ||
//     usuario.edad === undefined || //!Usuario podria digitar 0
//     !usuario.email ||
//     !usuario.foto ||
//     usuario.aceptacion === undefined || //!Usuario podria digitar 0
//     usuario.genero === undefined //!Usuario podria ser genero===false
  
// ) return res.status(400).json({ error: "Faltan datos obligatorios" });
  
//   //?si data esta completa enviamos a BBDD
//   const { data, error } = await supabase
//     .from("usuarios").insert([{ ...usuario }]).select();

//   if (error) {
//     console.error("Error al crear usuario:", error);
//     return res.status(500).json({ error: "Error al crear usuario" });
//   }
//   res.status(201).json(data[0]);
// });

//! Actualizar usuario por ID
// app.put("/usuarios/:id", async (req, res) => {
//   const id = parseInt(req.params.id);
//   const usuario = req.body;

//   //? Validacion: BODY debe traer algo, al menos un campo para actualizar
//   //!si TODOS dan TRUE es pq NO trajo nada
//   if (
//     usuario.nombre === undefined &&
//     (usuario.edad === undefined || usuario.edad === null) &&
//     usuario.email === undefined &&
//     usuario.foto === undefined &&
//     (usuario.aceptacion === undefined || usuario.aceptacion === null) &&
//     usuario.genero === undefined
//   ) return res.status(400).json({ error: "Debes enviar al menos un campo para actualizar" });
  
//   //Creamos el obj que enviaremos a la BBDD
//   const camposActualizar = {}; //!campos que no venga vacio, va a la BBDD
//   if (usuario.nombre !== undefined) camposActualizar.nombre = usuario.nombre;
//   if (usuario.edad !== undefined && usuario.edad !== null) camposActualizar.edad = usuario.edad;
//   if (usuario.email !== undefined) camposActualizar.email = usuario.email;
//   if (usuario.foto !== undefined) camposActualizar.foto = usuario.foto;
//   if (usuario.aceptacion !== undefined && usuario.aceptacion !== null)
//     camposActualizar.aceptacion = usuario.aceptacion;
//   if (usuario.genero !== undefined) camposActualizar.genero = usuario.genero;

//   const { data, error } = await supabase
//     .from("usuarios").update(camposActualizar).eq("id", id).select();

//   if (error) {
//     console.error("Error al actualizar usuario:", error);
//     return res.status(500).json({ error: "Error al actualizar usuario" });
//   }

//   if (data.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });
  
//   res.json(data[0]);
// });