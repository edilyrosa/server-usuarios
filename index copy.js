//TODO 
import { supabase } from "./supabaseClient.js";
import express from "express"
import cors from 'cors'
const app = express()
const PORT = 3000;
app.use(express.json())


//para evitar el error por CORS que se lanzara, porque el origen de back y front usan puertos diferentes. CORS es: Cross-Origin Resource Sharing.
//!app.use(cors()); //Permite que cualquier origen FRONT, lo consuma.
app.use(cors({
    origin:'http://127.0.0.1:5500'//Permite solo este origen FRONT, que lo consuma
}));










app.get('/', (req, res)=>{
    res.send('<h1>servidor up</h1>')
}) 


app.get('/usuarios', async (req, res) => {//TODO
    const { data, error } = await supabase //****AQUIIIII!!*****
      .from('usuarios')
      .select('*')  // Selecciona todas las columnas
  
    if (error) {
      console.error('Error al obtener usuarios:', error)
      return res.status(500).send('Error al obtener usuarios')
    }
  
    res.json(data) // Envía los usuarios como JSON
})


app.delete('/usuarios/:id', async (req, res) => {
    const id = parseInt(req.params.id);//!Capturamos id q fue enviado como parametro dinamico. 
  
    const { data, error } = await supabase //! .select() después de .delete() devuelve los registros eliminados en "data"
      .from('usuarios')
      .delete()
      .eq('id', id)
      .select();
  
    if (error) {
      console.error('Error al eliminar usuario:', error);
      return res.status(500).json({ error: 'Error al eliminar usuario' });
    }
  
    if (data.length === 0) { //!Confirmar la eliminacion, data trae el ele eliminado, false y no entra
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
  
    res.status(204).send(); // Eliminación exitosa, sin contenido
});



app.get('/usuarios/:id', async (req, res) => {//?NEVESARIA PARA HACER PUT PQ FRONT VALIDA SU EXISTENCIA ANTES
    const id = parseInt(req.params.id);
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single(); //!.single() para q la consulta retorne un registro TDD Objeto en lugar de un arry con 1 ele
  
    if (error) {
      return res.status(500).json({ error: 'Error al obtener usuario' });
    }
    if (!data) {//!si la consulta retorna folsy no fue exitosa. 
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(data);
  });


  app.post('/usuarios', async (req, res) => {
    const usuario = req.body; //! 1. traemos el cuerpo de la peticion (form) { nombre, edad, profesion }
 
    //!2. validamos que esten todos los campos, evitando data corrupta.
    if (!usuario.nombre || !usuario.edad ||  !usuario.email || !usuario.foto || !usuario.aceptacion || !usuario.genero){
      return res.status(400).json({ error: 'Faltan datos obligatorios' })
      console.log('faltan datos obligatorios')
    }

    const { data, error } = await supabase
      .from('usuarios')
      .insert([{ ...usuario }])//! 3 .insert() espera un arry de Objs, incluso si se inserte un solo registro.
      .select();
  
    if (error) {
      console.error('Error al crear usuario:', error);
      return res.status(500).json({ error: 'Error al crear usuario' });
    }
  
    res.status(201).json(data[0]); //!pasamos el registro creado
  });


  app.put('/usuarios/:id', async (req, res) => {
    const id = parseInt(req.params.id); //! id para saber a quien voy a UPDATE
    const usuario = req.body; //!Data a UPDATE
  
    if ( // Validar que al menos un campo venga para actualizarm NO TODOS PUEDEN DAR TRUE
      !usuario.nombre &&
      !usuario.edad &&
      !usuario.email &&
      !usuario.foto &&
      !usuario.aceptacion &&
      !usuario.genero
    ) {
      return res.status(400).json({ error: 'Debes enviar al menos un campo para actualizar' });
    }
  
    //! Construir objeto con la UPDATE data enviada desde front
    const camposActualizar = {};
    if (usuario.nombre) camposActualizar.nombre = usuario.nombre;
    if (usuario.edad) camposActualizar.edad = usuario.edad;
    if (usuario.email) camposActualizar.email = usuario.email;
    if (usuario.foto) camposActualizar.foto = usuario.foto;
    if (usuario.aceptacion !== undefined) camposActualizar.aceptacion = usuario.aceptacion;
    if (usuario.genero) camposActualizar.genero = usuario.genero;
  
    const { data, error } = await supabase
      .from('usuarios')
      .update(camposActualizar) //!simplemente pasamos el Obj
      .eq('id', id)
      .select();//!obtenemos el ele update
  
    if (error) {
      console.error('Error al actualizar usuario:', error);
      return res.status(500).json({ error: 'Error al actualizar usuario' });
    }
  
    if (data.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
  
    res.json(data[0]); //! enviamos Usuario actualizado
  });
  

app.listen(PORT, ()=>{
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
})
