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

## Local Storage

Nos permite almacenar localmente, para que al recargar, o cerrar el navegador, se mantengan los favoritos.<br>
Para eso usamos [LocalStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)<br>
En main.js agregamos el método, y actualizamos addFavorites y RemoveFavorites para que se actualice al hacer click:
```js
        addFavorite(){      // Método para almacenar favoritos
            this.favorites.set(this.result.id, this.result) // Agrego al mapa de favoritos
            this.updateStorage()
        },
        removeFavorite(){   // Método para almacenar favoritos
            this.favorites.delete(this.result.id)
            this.updateStorage()
        },
        updateStorage(){    // Almacena los favoritos en el LocalStorage
            window.localStorage.setItem('favorites', JSON.stringify(this.listFavorites)) // Localstorage permite solo string, por eso usamos JSON.stringify
        }
```

## [Ciclo de vida en Vue](https://vuejs.org/guide/essentials/lifecycle.html)

![lifecycle](./lifecycle.MuZLBFAS.png)

La API de Vue nos da a disposición acceso a los distintos puntos del ciclo de vida del componente.<br>
Para poder mostrar los favoritos al recargar la página, necesitamos leerlos del localstorage antes de que se cargue el DOM, para esto ingresamos en el momento que se crea el componente.<br>
En main.js:
```js
created(){
    const savedFavorites = JSON.parse(window.localStorage.getItem("favorites")) // Leo el localstorage y convierto a json
    if(savedFavorites?.length){  // Si hay entradas, y savedFavorites existe
        const favorites = new Map(savedFavorites.map(favorite => [favorite.id, favorite])) // Genero un mapa igual que en data
        this.favorites = favorites  // Asigno el valor al mapa
    }
    console.log(savedFavorites)
},
```
> * **Operador Optional chaining ?**<br>
> *savedFavorites?.length*<br>
> The optional chaining (?.) operator accesses an object's property or calls a function. If the object accessed or function called using this operator is undefined or null, the expression short circuits and evaluates to undefined instead of throwing an error.

Y con esto automáticamente se muestran los favoritos al recargar.<br>
Ahora para ver los favoritos al hacer click en la foto, agregamos un método en main.js:
```js
showFavorite(favorite){
    this.result = favorite
}
```
Y lo invocamos desde index.html:
```html
<div class="favorites">
    <div class="favorite" v-for="favorite in listFavorites">
        <a href="#" target="_blank" @click.prevent="showFavorite(favorite)">
            <img v-bind:src="favorite.avatar_url" :alt="favorite.name" class="favorite__avatar">
        </a>
    </div>
</div>
```

## Transiciones

Vue nos permite generar animaciones de transición en las vistas fácilmente.<br>
![transition](./transition-classes.DYG5-69l.png)
Utiliza 6 clases base, que podemos invocar en nuestro CSS, y simplemente englobar el elemento al que deseamos aplicarla con `<Transition></Transition>` [(Ver)](https://vuejs.org/guide/built-ins/transition.html) para elementos que entran o salen del DOM *(v-if / v-show)*, o `<TransitionGroup></TransitionGroup>` [(Ver)](https://vuejs.org/guide/built-ins/transition-group.html) para elementos que seon recorridos con un *v-for*.<br>
En ambos casos podemos usar el atributo `<Transition name="">`para identificar la transición a usar, si no usamos por defecto.<br>

Para *Transition*, podemos agregar a main.css:
```css
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
```
Ejemplo:
```html
<button @click="show = !show">Toggle</button>
<Transition>
  <p v-if="show">hello</p>
</Transition>
```

Para *TransitionGroup* tenemos algunos requisitos:
- La propiedad *tag* es opcional, para indicar qué tipo de elemento usa al agregar la animación (Usa *div* por defecto)
- Es obligatorio el uso de la propiedad *key* en el elemento que posee el v-for
Ejemplo:
```html
<TransitionGroup name="list" tag="ul">
  <li v-for="item in items" :key="item">
    {{ item }}
  </li>
</TransitionGroup>
```

## Cachear favoritos (Opcional)
Hacemos esto para evitar ir a buscar nuevamente la información de un usuario al servidor si ya está almacenado en favoritos. De esta forma optimizamos la aplicación. Ver main.js

## Clases dinámicas
Vue permite modificar las clases CSS de un elemento de forma dinámica utilizando *v-bind* sobre la propiedad *class* de un elemento [Ver](https://vuejs.org/guide/essentials/class-and-style.html)<br>
Ej:
```html
<div :class="{ active: isActive }"></div>
```
Donde **active** es la clase a aplicar si la valuación de isActive es true<br>

En este caso, queremos que si realizamos una búsqueda de un usuario y este está en favoritos, aparezca destacado, para eso en main.js creamos un método que indique si *result* está en favoritos
```js
checkFavorite(id){  //
    return this.result?.login === id
}
```
Y aplicamos una clase de forma dinámica
```html
<transition-group name="list">
    <div 
    class="favorite" 
    :class="{'favorite--selected':checkFavorite(favorite.login)}"
    v-for="favorite in listFavorites" :key="favorite.id">
        <!-- <a :href="favorite.blog" target="_blank"> -->
        <a href="#" target="_blank" @click.prevent="showFavorite(favorite)">
            <img v-bind:src="favorite.avatar_url" :alt="favorite.name" class="favorite__avatar">
        </a>
    </div>
</transition-group>
```

## Componentes
Vue permite crear componentes, son plantillas con bloques de html, pero donde también se almacenan los métodos y propiedades inherentes a la misma, de esta forma se pueden reutilizar.<br>
Como vamos a hacer cambios grandes en index.html, copiamos desde este punto a index_componets.html.






