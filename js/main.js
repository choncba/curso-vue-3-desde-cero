const API = "https://api.github.com/users/";

// Función que llama a la API de Github consultando un usuario
// async function doSearch(){
//     const response = await fetch(API + 'choncba');
//     // console.log(response);
//     const data = await response.json();
//     console.log(data);
// }

// Creo una instancia de Vue
const app = Vue.createApp({
    data(){
        // Variables del modelo
        return{
            // message: "Hola Vue!!",
            search: null,
            result: null,
            error: null,
            favorites: new Map(),   // Map para almacenar los favoritos
        };
    },
    // Propiedades computadas
    computed:{
        isFavorite(){   // Verifica si el id del resultado ya se encuentra en favorites
            return this.favorites.has(this.result.id)
        },
        listFavorites(){    // Extrae la informacion de cada favorito en una lista
            return Array.from(this.favorites.values())
        },
    },
    // Métodos
    methods: {
        async doSearch(){  // Inserto la función de búsqueda como método
            // const response = await fetch(API + 'choncba');
            this.result = this.error = null // Limpio los flags
            try {   // Utilizo una estructura try/catch para capturar errores
                const response = await fetch(API + this.search);
                if (!response.ok) throw new Error("User not Found") // Genero un error si el resultado de la búsqueda no es correcto
                const data = await response.json();
                console.log(data);
                // this.result = true; // Seteo el flag si encuentro el resultado
                this.result = data // Asignamos los valores de respuesta al resultado
            }catch(error){
                this.error = error // Asigno el error a la variable
            }finally{
                this.search = null // Limpio el flag para que desaparezca el texto de la búsqueda
            }
        },
        addFavorite(){  // Método para almacenar favoritos
            this.favorites.set(this.result.id, this.result) // Agrego al mapa de favoritos
        },
        removeFavorite(){  // Método para almacenar favoritos
            this.favorites.delete(this.result.id)
        }
    }
});

// app.mount("#app");