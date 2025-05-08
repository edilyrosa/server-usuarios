//TODO 
import { supabase } from "./supabaseClient.js";
import express from "express"
import cors from 'cors'
const app = express()
const PORT = 3000;
app.use(express.json())
app.use(cors())


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


  app.post('/usuarios', async (req, res) => { //NEVESARIA PARA HACER PUT PQ FRONT VALIDA SU EXISTENCIA
    const usuario = req.body; // { nombre, edad, profesion }
 
    if (!usuario.nombre || !usuario.edad ||  !usuario.email || !usuario.foto || !usuario.aceptacion || !usuario.genero){
      return res.status(400).json({ error: 'Faltan datos obligatorios' })
      console.log('faltan datos obligatorios')
    }

  
    const { data, error } = await supabase
      .from('usuarios')
      .insert([{ ...usuario }])
      .select();
  
    if (error) {
      console.error('Error al crear usuario:', error);
      return res.status(500).json({ error: 'Error al crear usuario' });
    }
  
    res.status(201).json(data[0]);
  });


  app.delete('/usuarios/:id', async (req, res) => {
    const id = parseInt(req.params.id);
  
    const { data, error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id)
      .select();
  
    if (error) {
      console.error('Error al eliminar usuario:', error);
      return res.status(500).json({ error: 'Error al eliminar usuario' });
    }
  
    if (data.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
  
    res.status(204).send(); // Eliminación exitosa, sin contenido
  });
  

  app.get('/usuarios/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single();
  
    if (error) {
      return res.status(500).json({ error: 'Error al obtener usuario' });
    }
    if (!data) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(data);
  });
  

  app.put('/usuarios/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const usuario = req.body;
  
    // Validar que al menos un campo venga para actualizar
    if (
      !usuario.nombre &&
      !usuario.edad &&
      !usuario.email &&
      !usuario.foto &&
      !usuario.aceptacion &&
      !usuario.genero
    ) {
      return res.status(400).json({ error: 'Debes enviar al menos un campo para actualizar' });
    }
  
    // Construir objeto con solo los campos definidos para actualizar
    const camposActualizar = {};
    if (usuario.nombre) camposActualizar.nombre = usuario.nombre;
    if (usuario.edad) camposActualizar.edad = usuario.edad;
    if (usuario.email) camposActualizar.email = usuario.email;
    if (usuario.foto) camposActualizar.foto = usuario.foto;
    if (usuario.aceptacion !== undefined) camposActualizar.aceptacion = usuario.aceptacion;
    if (usuario.genero) camposActualizar.genero = usuario.genero;
  
    const { data, error } = await supabase
      .from('usuarios')
      .update(camposActualizar)
      .eq('id', id)
      .select();
  
    if (error) {
      console.error('Error al actualizar usuario:', error);
      return res.status(500).json({ error: 'Error al actualizar usuario' });
    }
  
    if (data.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
  
    res.json(data[0]); // Usuario actualizado
  });
  



app.listen(PORT, ()=>{
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
})
