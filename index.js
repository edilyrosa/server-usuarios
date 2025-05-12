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


app.get('/usuarios', async (req, res) => {

const {data, error} = await supabase
.from('usuarios')
.select('*')

if(error){
    console.error('Error al obtener usuarios:', error)
    return res.status(500).send('Error al obtener usuarios')
}
res.json(data)
})


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


app.listen(PORT, ()=>{
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
})
