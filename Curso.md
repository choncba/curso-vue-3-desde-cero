# Curso Vue.js 3 oficial

https://escuelavue.es/cursos/curso-vue-3-desde-cero/que-vas-a-aprender

Repo: https://github.com/escuelavue/curso-vue-3-desde-cero

### [Docs](https://vuejs.org/guide/quick-start.html)
### [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) - Extensión Web Server para VS Code
### [Dev Tools](https://devtools.vuejs.org/) - Plugin para Chrome

## Manejo de eventos - Reactividad en 2 sentidos

Modelo --> Vista<br>
En el formulario de index.html hacemos
```html
<form class="search" v-on:submit.prevent="doSearch">
```
Donde:
- [v-on](https://vuejs.org/guide/essentials/event-handling.html): directiva para escuchar eventos del DOM (También se puede usar @submit)
- submit: evento al que voy a escuchar
- prevent: modificador que indica prevenir recargar la página con el botón submit del formulario
- doSearch: método que invoco (callback) al suceder el evento, definido en la instancia de Vue en main.js

Vista --> Modelo<br>
En index.html
```html
<input v-model="search" type="text" class="search__input" required placeholder="Search GitHub users">
```
Donde: 
- [v-model](https://vuejs.org/guide/components/v-model.html): Se utiliza para implementar two-way binding en un componente, lo que se ingrese en input es recibido en la variable **search** en main.js, y luego puede ser accedido desde el método **doSearch**
```js
const app = Vue.createApp({
    data(){
        return{
            search: null
        };
    },
    methods: {
        async doSearch(){  
            const response = await fetch(API + this.search);
            const data = await response.json();
            console.log(data);
        }
    }
});
```

## Renderizado Condicional
Utiliza estructuras [v-if / v-else](https://vuejs.org/guide/essentials/conditional.html) en los elementos para mostrar u ocultar partes de la vista condicionalmente.<br>
En index.html agregamos un widget para mostrar la información de usuario:
```html
    <!-- Result -->
    <div class="result" v-if="result">
        <h2 class="result__name">Juan Andrés Núñez</h2>
        <img src="https://avatars.githubusercontent.com/u/8166774?v=4" alt="" class="result__avatar">
        <p class="result__bio">Especialista en JavaScript y Vue.js. Formador profesional de desarrolladores/as
            Web. Practicante de estoicismo.
            <br>
            <a href="http://www.wmedia.es" class="result__blog">http://www.wmedia.es</a>
        </p>
    </div>

    <!-- Error -->
    <div class="result__error" v-if="error">Error found</div>
```
Y en main.js:
```js
    data(){
        return{
            // message: "Hola Vue!!",
            search: null,
            result: null,
            error: null,
        };
    },
    methods: {
        async doSearch(){  // Inserto la función de búsqueda como método
            this.result = this.error = null // Limpio los flags
            try {   // Utilizo una estructura try/catch para capturar errores
                const response = await fetch(API + this.search);
                if (!response.ok) throw new Error("User not Found") // Genero un error si el resultado de la búsqueda no es correcto
                const data = await response.json();
                console.log(data);
                this.result = true; // Seteo el flag si encuentro el resultado
            }catch(error){
                this.error = error // Asigno el error a la variable
            }finally{
                this.search = null // Limpio el flag para que desaparezca el texto de la búsqueda
            }
        }
    }
```

## Atributos dinámicos
Para actualizar el widget de usuario con la información obtenida con la búsqueda, usamos [templates](https://vuejs.org/guide/essentials/template-syntax.html)<br>

En main.js:
```js
this.result = data // Asignamos los valores de respuesta al resultado
```
Y en index.html:
```html
<div class="result" v-if="result">
    <h2 class="result__name">{{ result.name }}</h2>
    <img v-bind:src="result.avatar_url" :alt="result.name" class="result__avatar">
    <p class="result__bio"> {{result.bio}}
        <br>
        <a v-bind:href="result.blog" class="result__blog">{{result.blog}}</a>
    </p>
</div>
```
Donde:
- Utilizamos {{ result.name }} para asignar valores dinámicos al contenido de un componente, en este caso, los datos obtenidos de la respuesta
- v-bind:src : Permite asignar atributos dinámicos a los componentes, también se puede usar directamente :src

## Agregar favoritos

Almaceno los resultados de la búsqueda localmente en un [Map](https://es.javascript.info/map-set).<br>
En main.js, creo una variable del tipo Map, y un nuevo método para agregar valores
```js
    data(){
        return{
            ...
            favorites: new Map(),   // Map para almacenar los favoritos
            ...
        };
    },
    methods: {
        ...
        addFavorite(){  // Método para almacenar favoritos
            this.favorites.set(this.result.id, this.result) // Agrego al mapa de favoritos
        }
        ...
    }
```

En index.html, creo un botón con un v-on (@click) que registre el evento y llame a addFavorite
```html
<!-- Result - Widget para mostrar el resultado de la búsqueda -->
<div class="result" v-if="result">
    ...
    <a href="#" class="result__toggle-favorite" @click="addFavorite">Add Favorite ⭐️</a>
    ...
```

## Propiedades computadas
Se debe utilizar v-if / v-else etc. para operaciones simples, cuando se desea realizar lógica más compleja puede volverse difícil de mantener, para eso usamos [propiedades computadas](https://vuejs.org/guide/essentials/computed.html).<br>
Por ejemplo, si queremos agregar/eliminar un usuario a favoritos podemos hacer:
```html
<a v-if="favorites.has(result.id)" href="#" class="result__toggle-favorite" @click="removeFavorite">Remove Favorite ⭐️</a>
<a v-else href="#" class="result__toggle-favorite" @click="addFavorite">Add Favorite ⭐️</a>
```
La lógica en línea de los v-if/v-else puede reemplazarse con propiedades computadas, en main.js:
```js
const app = Vue.createApp({
    data(){
    ...
    },
    // Propiedades computadas
    computed:{
        isFavorite(){   // Verifica si el id del resultado ya se encuentra en favorites
            return this.favorites.has(this.result.id)
        }
    },
    methods: {
    ...
    }})
```
Y ahora podemos usar esta lógica directamente en el html:
```html
<a v-if="isFavorite" href="#" class="result__toggle-favorite" @click="removeFavorite">Remove Favorite ⭐️</a>
<a v-else href="#" class="result__toggle-favorite" @click="addFavorite">Add Favorite ⭐️</a>
```

## Iteración
Para mostrar los favoritos en la vista, debemos recorrer el Map **favorites** para agregar cada uno al DOM, para eso usamos [v-for](https://vuejs.org/guide/essentials/list.html)<br>

En index.html:
```html
<!-- Favorites -->
<div class="favorites">
    <div class="favorite" v-for="[,favorite] in favorites">
        <a href="#">
            <img v-bind:src="favorite.avatar_url" :alt="favorite.name" class="favorite__avatar">
        </a>
    </div>
</div>
```
De esta forma, combinando v-for / v-bind podemos mostrar todos.<br>
También con propiedades computadas:
```js
computed:{
    ...
    listFavorites(){    // Extrae la informacion de cada favorito en una lista
        return Array.from(this.favorites.values())
    }
}
```
y
```html
<div class="favorite" v-for="favorite in listFavorites">
    <a href="#">
        <img v-bind:src="favorite.avatar_url" :alt="favorite.name" class="favorite__avatar">
    </a>
</div>
```


