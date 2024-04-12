const API = "https://api.github.com/users/";

// Función que llama a la API de Github consultando un usuario
// async function doSearch(){
//     const response = await fetch(API + 'choncba');
//     // console.log(response);
//     const data = await response.json();
//     console.log(data);
// }

const requestMaxTimeMs = 3000   // Tiempo máximo para refrescar la caché

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
    // Código a ejecutar en el punto que es creado el componente Vue, antes de que se renderiza el DOM
    created(){
        const savedFavorites = JSON.parse(window.localStorage.getItem("favorites")) // Leo el localstorage y convierto a json
        if(savedFavorites?.length){  // Si hay entradas, y savedFavorites existe
            const favorites = new Map(savedFavorites.map(favorite => [favorite.login, favorite])) // Genero un mapa igual que en data
            this.favorites = favorites  // Asigno el valor al mapa
        }
        console.log(savedFavorites)
    },
    // Propiedades computadas
    computed:{
        isFavorite(){   // Verifica si el login del resultado ya se encuentra en favorites
            return this.favorites.has(this.result.login)
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

            const foundInFavorites = this.favorites.get(this.search)    // Verifico si el usuario de la búsqueda está en favoritos
                       
            const shouldRequestAgain = (() => {                         // Verifica si expiró el tiempo de cahce para volver a pedir los datos al servidor
                if(!!foundInFavorites){                                 // Si está en favoritos        
                    const { lastRequestTime } = foundInFavorites        // Extrae el valor de lastRequestTime
                    const now = Date.now()
                    return (now - lastRequestTime) > requestMaxTimeMs   // Si excede, retorna true
                }
                return false                                            // Si no, retorna false
            })()                                                        // IIFE, función de js que se llama inmediatamente (como una lambda en python)    
            
            // Si está en favoritos, y no se venció el tiempo de caché, devuelve true sin hacer la llamada http y asignando el favorito a resultado
            if(!!foundInFavorites && !shouldRequestAgain)  return this.result = foundInFavorites

            try {   // Utilizo una estructura try/catch para capturar errores
                const response = await fetch(API + this.search);
                if (!response.ok) throw new Error("User not Found") // Genero un error si el resultado de la búsqueda no es correcto
                const data = await response.json();
                console.log(data);
                // this.result = true; // Seteo el flag si encuentro el resultado
                this.result = data // Asignamos los valores de respuesta al resultado
                foundInFavorites.lastRequestTime = Date.now()   // Reseteo el contador de cache
            }catch(error){
                this.error = error // Asigno el error a la variable
            }finally{
                this.search = null // Limpio el flag para que desaparezca el texto de la búsqueda
            }
        },
        addFavorite(){      // Método para almacenar favoritos
            this.result.lastRequestTime = Date.now()            // Agrego el tiempo en que se agregó a favoritos para poder refrescar la caché
            this.favorites.set(this.result.login, this.result)  // Agrego al mapa de favoritos
            this.updateStorage()
        },
        removeFavorite(){   // Método para borrar favoritos
            this.favorites.delete(this.result.login)
            this.updateStorage()
        },
        showFavorite(favorite){
            this.result = favorite
        },
        checkFavorite(id){  //
            return this.result?.login === id
        },
        updateStorage(){    // Almacena los favoritos en el LocalStorage
            window.localStorage.setItem('favorites', JSON.stringify(this.listFavorites))
        }
    }
});

// app.mount("#app");