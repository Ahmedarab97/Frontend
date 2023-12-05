import {bolletjesLayer} from "./javascript/layers/bolletjes";
import {getCoordinatenVanGoogleMaps} from "./javascript/openstreetmap/openstreetmapAPI";
import {or} from "ol/format/filter";
import proj4 from 'proj4';
import {getSimpleGeoJson} from "./javascript/layers/simplifiedGeoJson";
import {getLaaggeletterdheidGeoJson} from "./javascript/layers/laaggeltterdheidLayer";
import {getBeweegLayerGeoJson} from "./javascript/layers/beweegLayer";
import {getGezondheidLayerGeoJson} from "./javascript/layers/gezondheidLayer";

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

 const geojson1 = await getSimpleGeoJson()
  console.log(geojson1.features);
  map.on('load', function () {
    map.addSource('wijken-source', {
      type: 'geojson',
      data: geojson1,
    });

    // Voeg een laag toe voor de outlines van wijken
    map.addLayer({
      id: 'wijken-layer',
      type: 'line',
      source: 'wijken-source',
      layout: {},
      paint: {
        'line-color': 'black', // Kleur van de outline
        'line-width': 1.5, // Breedte van de outline
      },
    });
  })

window.addLayer =  async function() {
  const laagGeletterdHeidGeoJson = await getLaaggeletterdheidGeoJson()
  console.log(laagGeletterdHeidGeoJson.features[1]);
    map.addSource('laag-source', {
      type: 'geojson',
      data: laagGeletterdHeidGeoJson,
    });

    // Voeg een laag toe voor de outlines van wijken
    map.addLayer({
      id: 'laag-layer',
      type: 'fill',
      source: 'laag-source',
      layout: {},
      paint: {
        'fill-color': ['get', 'fill_color'], // Dynamische kleur gebaseerd op de waarde van fill_color
        'fill-opacity': 0.4, //pas de opaciteit van de vulling aan
        'fill-outline-color': 'black', // Kleur van de outline
        'fill-antialias': true,
      },
    });
}


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

window.addBeweegLayer = async function (e) {
  const beweegLayerGeoJson = await getBeweegLayerGeoJson()
  console.log(beweegLayerGeoJson.features[1]);
  map.addSource('beweeg-source', {
    type: 'geojson',
    data: beweegLayerGeoJson,
  });

  // Voeg een laag toe voor de outlines van wijken
  map.addLayer({
    id: 'beweeg-layer',
    type: 'fill',
    source: 'beweeg-source',
    layout: {},
    paint: {
      'fill-color': ['get', 'fill_color'], // Dynamische kleur gebaseerd op de waarde van fill_color
      'fill-opacity': 0.4, //pas de opaciteit van de vulling aan
      'fill-outline-color': 'black', // Kleur van de outline
      'fill-antialias': true,
    },
  });
}

window.addGezondheidLayer = async function(e) {
  const gezondheidLayerGeoJson = await getGezondheidLayerGeoJson()
  console.log(gezondheidLayerGeoJson.features[1]);
  map.addSource('gezondheid-source', {
    type: 'geojson',
    data: gezondheidLayerGeoJson,
  });

  // Voeg een laag toe voor de outlines van wijken
  map.addLayer({
    id: 'gezondheid-layer',
    type: 'fill',
    source: 'gezondheid-source',
    layout: {},
    paint: {
      'fill-color': ['get', 'fill_color'], // Dynamische kleur gebaseerd op de waarde van fill_color
      'fill-opacity': 0.4, //pas de opaciteit van de vulling aan
      'fill-outline-color': 'black', // Kleur van de outline
      'fill-antialias': true,
    },
  });
}
