import {bolletjesLayer} from "./javascript/layers/bolletjes";
import {getCoordinatenVanGoogleMaps} from "./javascript/openstreetmap/openstreetmapAPI";
// import Control from "ol/control";

mapboxgl.accessToken = 'pk.eyJ1IjoibmllbHMtc3R1ZGVudCIsImEiOiJjbHA5cmJ1NTIwMDYxMmlybGFrZWRjbDZ6In0.8VO7uezdXrrfBqeZpyYXDA';

const popupStyles = {
  position: 'absolute',
  backgroundColor: 'white',
  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.2)',
  padding: '15px',
  borderRadius: '10px',
  border: '1px solid #cccccc',
  bottom: '12px',
  left: '-50px',
  minWidth: '180px'
};

const popupArrowStyles = {
  top: '100%',
  border: 'solid transparent',
  content: ' ',
  height: '0',
  width: '0',
  position: 'absolute',
  pointerEvents: 'none'
};

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: await getCoordinatenVanGoogleMaps("nieuwegein"),
  zoom: 12,
});

const popup = new mapboxgl.Popup({
  closeButton: false,
  closeOnClick: false,
  offset: 25
});

map.on('load', () => {
  // Add the 3D building layer
  map.addLayer({
    id: '3d-buildings',
    source: 'composite',
    'source-layer': 'building',
    filter: ['==', 'extrude', 'true'],
    type: 'fill-extrusion',
    minzoom: 5,
    paint: {
      'fill-extrusion-color': '#aaa',
      'fill-extrusion-height': ['get', 'height'],
      'fill-extrusion-base': ['get', 'min_height'],
      'fill-extrusion-opacity': 0.6
    }
  });
  // Add checkboxes dynamically
  const checkboxesContainer = document.createElement('div');
  checkboxesContainer.id = 'checkboxes-container';
  map.getContainer().appendChild(checkboxesContainer);

  const checkbox1 = createCheckbox('checkbox1', '3d-gebouwen', '3d-buildings');
  const checkbox2 = createCheckbox('checkbox2', 'Laaggeletterdheid', 'laag-layer');
  const checkbox3 = createCheckbox('checkbox3', 'Wijken', 'another-layer'); // Replace 'another-layer' with the actual layer ID

  checkboxesContainer.appendChild(checkbox1);
  checkboxesContainer.appendChild(checkbox2);
  checkboxesContainer.appendChild(checkbox3);

  function createCheckbox(id, label, layerId) {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = id;

    checkbox.addEventListener('change', function () {
      const layer = map.getLayer(layerId);

      if (layer) {
        if (checkbox.checked) {
          map.setLayoutProperty(layerId, 'visibility', 'visible');
        } else {
          map.setLayoutProperty(layerId, 'visibility', 'none');
        }
      }
    });

    const checkboxLabel = document.createElement('label');
    checkboxLabel.setAttribute('for', id);
    checkboxLabel.innerText = label;

    const checkboxWrapper = document.createElement('div');
    checkboxWrapper.appendChild(checkbox);
    checkboxWrapper.appendChild(checkboxLabel);

    return checkboxWrapper;
  }
});

map.addControl(new mapboxgl.NavigationControl());


window.addMarker = async function() {
  const geojson = await bolletjesLayer();
  map.addSource('bolletjes-source', {
    type: 'geojson',
    data: geojson
  });
  map.addLayer({
    id: 'bolletjes-layer',
    type: 'circle',
    source: 'bolletjes-source',
    paint: {
      'circle-radius': ['get', 'size'],
      'circle-color': ['get', 'color'],
      'circle-stroke-color': 'black',
      'circle-stroke-width': 2
    }
  });
  map.on('click', 'bolletjes-layer', function (e) {
    const features = e.features;

    if(!features || features.lenght === 0) {
      console.log("yo mensen er is niks he matsko");
    }

    const clickedFeature = features[0];
    const coordinates = e.features[0].geometry.coordinates.slice();
    const properties = clickedFeature.properties;
    const description = `Wijk: ${properties.naam}<br>Laag geletterdheid: ${properties.wijkInfo}%<br>Aantal inwoners: ${properties.aantalInwoners}<br> Totaal laaggeletterd: ${properties.aantal}`;
    new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(description)
        .addTo(map);
  });

  map.on('mouseenter', 'bolletjes-layer', function () {
    map.getCanvas().style.cursor = 'pointer';
  });

  map.on('mouseleave', 'bolletjes-layer', function () {
    map.getCanvas().style.cursor = '';
  });
}


// // Create a container div for checkboxes
// const checkboxesContainer = document.createElement('div');
// checkboxesContainer.id = 'checkboxes-container';
//
// // Create checkboxes and add them to the container
// const checkbox1 = createCheckbox('Checkbox 1');
// const checkbox2 = createCheckbox('Checkbox 2');
//
// checkboxesContainer.appendChild(checkbox1);
// checkboxesContainer.appendChild(checkbox2);
//
// // Create a custom control
// const checkboxesControl = new mapboxgl.Control({ position: 'top-left' });
//
// // Add the checkboxes container to the control
// checkboxesControl.onAdd = function() {
//   return checkboxesContainer;
// };
//
// // Add the control to the map
// map.addControl(checkboxesControl);
//
// // Function to create a checkbox
// function createCheckbox(label) {
//   const checkbox = document.createElement('input');
//   checkbox.type = 'checkbox';
//   checkbox.id = label.toLowerCase().replace(/\s/g, '-');
//
//   const checkboxLabel = document.createElement('label');
//   checkboxLabel.htmlFor = checkbox.id;
//   checkboxLabel.appendChild(document.createTextNode(label));
//
//   const checkboxContainer = document.createElement('div');
//   checkboxContainer.appendChild(checkbox);
//   checkboxContainer.appendChild(checkboxLabel);
//
//   return checkboxContainer;
// }