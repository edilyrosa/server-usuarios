// import { supabase } from "./supabaseClient.js";
// import express from "express"
// import cors from 'cors'
// const app = express()
// const PORT = 3000;
// app.use(express.json())
// app.use(cors())


// app.get('/', (req, res)=>{
//     res.send('<h1>servidor up</h1>')
// }) 

// app.get('/usuarios', async (req, res) => {
// const {data, error} = await supabase
// .from('usuarios')
// .select('*')

// if(error){
//     console.error('Error al obtener usuarios:', error)
//     return res.status(500).send('Error al obtener usuarios')
// }
// res.json(data)
// })

//  app.delete('/usuarios/:id', async (req, res) =>{
//     const id = parseInt(req.params.id);
    
//     const { data, error } = await supabase
//     .from('usuarios')
//     .delete()
//     .eq('id',id)
//     .select()

//     if(error){
//         console.error('Error al eliminar usuario', error)
//         return res.status(500).json({error: 'usuario no encontrado'})
//     }

//     if(data.length === 0){
//         return res.status(404).json({error: 'usuario no encontrado'})
//     }
//     res.status(200).send()
//  } )




 
//  app.get('/usuarios/:id', async (req, res) => {//?NEVESARIA PARA HACER PUT PQ FRONT VALIDA SU EXISTENCIA ANTES
//      const id = parseInt(req.params.id);
//      const { data, error } = await supabase
//        .from('usuarios')
//        .select('*')
//        .eq('id', id)
//        .single(); //!.single() para q la consulta retorne un registro TDD Objeto en lugar de un arry con 1 ele
   
//      if (error) {
//        return res.status(500).json({ error: 'Error al obtener usuario' });
//      }
//      if (!data) {//!si la consulta retorna folsy no fue exitosa. 
//        return res.status(404).json({ error: 'Usuario no encontrado' });
//      }
//      res.json(data);
//    });
 
 
//    app.post('/usuarios', async (req, res) => {
//      const usuario = req.body; //! 1. traemos el cuerpo de la peticion (form) { nombre, edad, profesion }
  
//      //!2. validamos que esten todos los campos, evitando data corrupta.
//      if (!usuario.nombre || !usuario.edad ||  !usuario.email || !usuario.foto || !usuario.aceptacion || usuario.genero === undefined){
//        return res.status(400).json({ error: 'Faltan datos obligatorios' })
//        console.log('faltan datos obligatorios')
//      }
 
//      const { data, error } = await supabase
//        .from('usuarios')
//        .insert([{ ...usuario }])//! 3 .insert() espera un arry de Objs, incluso si se inserte un solo registro.
//        .select();
   
//      if (error) {
//        console.error('Error al crear usuario:', error);
//        return res.status(500).json({ error: 'Error al crear usuario' });
//      }
   
//      res.status(201).json(data[0]); //!pasamos el registro creado
//    });
 
 
//    app.put('/usuarios/:id', async (req, res) => {
//      const id = parseInt(req.params.id); //! id para saber a quien voy a UPDATE
//      const usuario = req.body; //!Data a UPDATE
   
//      // Validar que al menos un campo venga para actualizarm NO TODOS PUEDEN DAR TRUE
//     if (
//   usuario.nombre === undefined &&
//   usuario.edad === undefined &&
//   usuario.email === undefined &&
//   usuario.foto === undefined &&
//   usuario.aceptacion === undefined &&
//   usuario.genero === undefined
// ) {
//   return res.status(400).json({ error: 'Debes enviar al menos un campo para actualizar' });
// }
   
//      //! Construir objeto con la UPDATE data enviada desde front
//      const camposActualizar = {};
//      if (usuario.nombre) camposActualizar.nombre = usuario.nombre;
//      if (usuario.edad) camposActualizar.edad = usuario.edad;
//      if (usuario.email) camposActualizar.email = usuario.email;
//      if (usuario.foto) camposActualizar.foto = usuario.foto;
//      if (usuario.aceptacion) camposActualizar.aceptacion = usuario.aceptacion;
//      if (usuario.genero) camposActualizar.genero = usuario.genero;

   
//      const { data, error } = await supabase
//        .from('usuarios')
//        .update(camposActualizar) //!simplemente pasamos el Obj
//        .eq('id', id)
//        .select();//!obtenemos el ele update
   
//      if (error) {
//        console.error('Error al actualizar usuario:', error);
//        return res.status(500).json({ error: 'Error al actualizar usuario' });
//      }
   
//      if (data.length === 0) {
//        return res.status(404).json({ error: 'Usuario no encontrado' });
//      }
   
//      res.json(data[0]); //! enviamos Usuario actualizado
//    });
 




// app.listen(PORT, ()=>{
//     console.log(`Servidor corriendo en http://localhost:${PORT}`);
// })


import { supabase } from "./supabaseClient.js";
import express from "express";
import cors from "cors";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

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

// Obtener usuario por ID
app.get("/usuarios/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return res.status(500).json({ error: "Error al obtener usuario" });
  }
  if (!data) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }
  res.json(data);
});

// Crear nuevo usuario
app.post("/usuarios", async (req, res) => {
  const usuario = req.body;

  // Validar campos obligatorios (permitiendo 0 y false)
  if (
    !usuario.nombre ||
    usuario.edad === undefined ||
    !usuario.email ||
    !usuario.foto ||
    usuario.aceptacion === undefined ||
    usuario.genero === undefined
  ) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  const { data, error } = await supabase
    .from("usuarios")
    .insert([{ ...usuario }])
    .select();

  if (error) {
    console.error("Error al crear usuario:", error);
    return res.status(500).json({ error: "Error al crear usuario" });
  }

  res.status(201).json(data[0]);
});

// Actualizar usuario por ID
app.put("/usuarios/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const usuario = req.body;

  // Validar que al menos un campo venga para actualizar
  if (
    usuario.nombre === undefined &&
    (usuario.edad === undefined || usuario.edad === null) &&
    usuario.email === undefined &&
    usuario.foto === undefined &&
    (usuario.aceptacion === undefined || usuario.aceptacion === null) &&
    usuario.genero === undefined
  ) {
    return res.status(400).json({ error: "Debes enviar al menos un campo para actualizar" });
  }

  const camposActualizar = {};
  if (usuario.nombre !== undefined) camposActualizar.nombre = usuario.nombre;
  if (usuario.edad !== undefined && usuario.edad !== null) camposActualizar.edad = usuario.edad;
  if (usuario.email !== undefined) camposActualizar.email = usuario.email;
  if (usuario.foto !== undefined) camposActualizar.foto = usuario.foto;
  if (usuario.aceptacion !== undefined && usuario.aceptacion !== null)
    camposActualizar.aceptacion = usuario.aceptacion;
  if (usuario.genero !== undefined) camposActualizar.genero = usuario.genero;

  const { data, error } = await supabase
    .from("usuarios")
    .update(camposActualizar)
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error al actualizar usuario:", error);
    return res.status(500).json({ error: "Error al actualizar usuario" });
  }

  if (data.length === 0) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }

  res.json(data[0]);
});

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
