import proj4 from "proj4";
async function getBuurtenData() {
    const apiUrl = "http://localhost:8080/gemeente/Nieuwegein";
    try {
        const response = await fetch(apiUrl);
        if (response.ok) {
            const data = await response.json();
            console.log(data);
            return data;
        } else {
            console.error("Fout bij ophalen data:", response.status);
        }
    } catch (error) {
        console.error("Fout bij ophalen data:", error);
    }
}



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
export async function getLaaggeletterdheidGeoJson() {
    let buurten = await getBuurtenData();
    console.log(buurten)
    return new Promise((resolve, reject) => {
        loadGeoJSON(origineleGeojson).then(origineleGeojson => {
            const simplifiedGeoJson = {
                type: 'FeatureCollection',
                features: origineleGeojson.features.map(feature => {
                    const exteriorRing = feature.geometry.coordinates.map(polygon => polygon.map(point => convertCoordinatesTo4326(point)))
                    const buurtData = buurten.wijken.find(data => data.wijkCode === feature.properties.wijkcode);
                    let fill_color = getFillColor(buurtData);
                    feature.properties.fill_color = fill_color;
                    console.log(fill_color);
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

function getFillColor(buurtData) {
    let color = null;
    var totaal = buurtData.aantalInwoners * buurtData.wijkInfo.laagGeletterdheid.percentageTaalgroei;
    var afgerond = Math.round(totaal);
    console.log(totaal);
    if (afgerond <= 0) {
        color = "#008000";
    } else if (afgerond <= 20) {
        color = "#90EE90";
    } else if (afgerond <= 40) {
        color = "#FFFF00";
    } else if (afgerond <= 60) {
        color = "#FFD700";
    } else if (afgerond <= 80) {
        color = "#FFA500";
    } else if (afgerond <= 100) {
        color = "#FF6347";
    } else if (afgerond <= 120) {
        color = "#FF0000";
    } else {
        color = "#8B0000";
    }
    return color;
}


