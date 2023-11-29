import {bolletjesLayer} from "./javascript/layers/bolletjes";
import {getCoordinatenVanGoogleMaps} from "./javascript/openstreetmap/openstreetmapAPI";
import {or} from "ol/format/filter";
import proj4 from 'proj4';

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

proj4.defs('EPSG:28992', '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.2369,50.0087,465.658,-0.406857330322398,0.350732676542563,-1.8703473836068,4.0812 +units=m +no_defs');
proj4.defs('EPSG:4326', '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs');

const convertCoordinatesTo4326 = (coordinates) => {
  // Controleer of de coördinaten array is en minimaal 2 punten bevat
  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    throw new Error('Ongeldige coördinaten');
  }

  // Loop door de coördinaten en converteer elk punt
  const convertedCoordinates = coordinates.map(point => {
    // Controleer of de coördinaten van het punt geldige getallen zijn
    if (!point || point.length !== 2 || !isFinite(point[0]) || !isFinite(point[1])) {
      throw new Error('Ongeldige coördinaten voor punt');
    }

    // Converteer de coördinaten naar EPSG:4326
    const transformedPoint = proj4('EPSG:28992', 'EPSG:4326', point);

    // Retourneer het geconverteerde punt
    return transformedPoint;
  });

  // Retourneer de array met geconverteerde coördinaten
  return convertedCoordinates;
};

console.log(getCoordinatenVanGoogleMaps("nieuwegein"))

async function loadGeoJSON(filePath) {
  const response = await fetch(filePath);
  const geojson = await response.json();
  return geojson;
}
const origineleGeojson = '/data/WijkenNieuwegein.geojson'

loadGeoJSON(origineleGeojson).then(origineleGeojson => {
  const simplifiedGeoJson = {
    type: 'FeatureCollection',
    features: origineleGeojson.features.map(feature => {
      const exteriorRing = feature.geometry.coordinates.map(polygon => polygon.map(point => convertCoordinatesTo4326(point)))
      console.log(exteriorRing);
      return {
        type: 'Feature',
        properties: feature.properties,
        geometry: {
          type: 'Polygon',
          coordinates: exteriorRing[0],
        },
      };
    })
  }

  console.log(simplifiedGeoJson.features);
  map.on('load', function () {
    map.addSource('wijken-source', {
      type: 'geojson',
      data: simplifiedGeoJson,
    });

    // Voeg een laag toe voor de outlines van wijken
    map.addLayer({
      id: 'wijken-layer',
      type: 'line',
      source: 'wijken-source',
      layout: {},
      paint: {
        'line-color': 'blue', // Kleur van de outline
        'line-width': 2, // Breedte van de outline
      },
    });
  })
})


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
