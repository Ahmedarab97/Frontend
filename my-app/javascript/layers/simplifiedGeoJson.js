import proj4 from "proj4";

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

async function loadGeoJSON(filePath) {
    const response = await fetch(filePath);
    const geojson = await response.json();
    return geojson;
}
const origineleGeojson = '/data/WijkenNieuwegein.geojson'
export function getSimpleGeoJson() {
    return new Promise((resolve, reject) => {
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
            resolve(simplifiedGeoJson);
        }).catch(error => reject(error))
    })
}
