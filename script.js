'use strict';



const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');



//daddy class
class Workout{
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords, distance, duration){
    this.coords = coords; // [lat, lng]
    this.distance = distance; // in Km
    this.duration = duration; // in min
    

  }

  _setDescription(){
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
  }
}

//child class
class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace(){
    // min / km
    this.pace = this.duracion / this.distance;
    return this.pace;
  }
}

//chils class
class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed(){
    // Km/h
    this.speed = this.distance / (this.duracion / 60);
    return this.speed;
  }
}


// const run1 = new Running([39, -12], 5.6, 24, 178);
// const cycling1 = new Cycling([39, -12], 27, 95, 523);
// console.log(run1, cycling1);


//Mi primera clase de js cool.......😍
// APPLICATION ARCHITECTURE
class App {
  #map;
  #mapEvent;
  #workouts = [];

  constructor() {
    this._getPosition();
    //Ten en cuenta que al pasar las funciones dentro de un manejador de eventos "this" estara adjunta al objeto que trae ese manejador, por eso es necesario setear this con bid(), para que apunte a la clase y podamos usar las propiedades y metodos dentro de ella. OJO ok.S
    form.addEventListener('submit', this._newWorkout.bind(this));

    //draw donw botton: cambio de cadence a elevation.
    inputType.addEventListener('change', this._toggleElevationField);
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Could not get your position.');
        }
      );
    }
  }

  _loadMap(position) {

    // console.log(position);
    const { latitude, longitude } = position.coords;
    console.log(`https://www.google.com/maps/@${latitude}{longitude}`);
    const coords = [latitude, longitude];
    //Guarda un objeto en map de leaflet.
    //console.log(this);
    this.#map = L.map('map').setView(coords, 13);
    //console.log(map);
    //el canva del mapa.
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    //Handling clicks on map.
    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toggleElevationField() {
    //Selecionamos el padre al hijo mas cercano.
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(event) {
    //Valida si cada numero en el array es un entero. Estas cunciones pueden ser realmente cool para verificar multiples valores dentro de un if o alguna condicion que desees probar. 🤩
    const validInputs = (...inputs) => {
      return inputs.every(inp => Number.isFinite(inp));
    };

    const allPositive = (...inputs) => {
      return inputs.every(inp => inp > 0);
    };

    event.preventDefault();

    //Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value; // lo vulve un numero
    const duration = +inputDuration.value; //lo hace un numero
    //console.log(this.#mapEvent.latlng);
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    //If workuot running, create running object
    if (type === 'running') {
      const cadence = +inputCadence.value;
      //Check if data is valid
      if (
        /* !Number.isFinite(distance) ||
        !Number.isFinite(duration) ||
        !Number.isFinite(cadence) */
        !validInputs(distance, duration, cadence) || !allPositive(distance, duration, cadence)
      ) {
        return alert('Inputs have to be positive numbers');
      }
        

      workout = new Running([lat, lng], distance, duration, cadence);
      console.log('Estas corriendo');
    }

    //If workuot cycling, create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      //Check if data is valid
      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      ){
        return alert('Inputs have to be positive numbers');
      }
      workout = new Cycling([lat, lng], distance, duration, elevation);
      console.log('Estas en bicy');
    }

    //Add new object to workout array
    this.#workouts.push(workout);
    console.log(workout);

    //Render workout on map marker
    this._renderWorkoutMarker(workout);

    //Render workout on list.
    this._renderWorkkout(workout)

    //Hide from + clear input fields
    //console.log(this);
    //Clear input fields
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputDuration.value =
        '';

    
  }

  _renderWorkoutMarker(workout){
    //Display marker
    console.log('Hola entrenaste.');
    //Esto crea un marcador en el mapa
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent('workout')
      .openPopup();
  }

  _renderWorkkout(workout){
    //Dom manpulacion, crearemos un markout y lo insertaremos en el DOM.

    let html = `
      <li class="workout workout--${workout.type}" data-id="${workout.id}">
        <h2 class="workout__title">${workout.description}</h2>
        <div class="workout__details">
          <span class="workout__icon">${workout.type === 'runniing' ? '🏃‍♂️' : '🚴‍♀️'}</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>
    `;

    if(workout.type === 'running'){
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.pace.toFixed(1)}</span>
          <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🦶🏼</span>
          <span class="workout__value">${workout.cadence}</span>
          <span class="workout__unit">spm</span>
        </div>
      </li>
      `;

      if(workout.type === 'cycling'){
        html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>
        
        `;
      }
    }

    form.insertAdjacentHTML('afterend',html);

  }


};

const app = new App();






