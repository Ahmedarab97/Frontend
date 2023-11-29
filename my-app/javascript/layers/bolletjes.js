import Feature from 'ol/Feature';
import {getCoordinatenVanGoogleMaps, getCoordinatenVanOpenStreetMap} from "../openstreetmap/openstreetmapAPI";


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

export async function bolletjesLayer() {
    var buurten = await getBuurtenData();
    console.log(buurten);
    var points = [];

    for (const buurt of buurten.wijken) {
        if (buurt.wijkInfo !== null && buurt.wijkInfo.laagGeletterdheid.percentageTaalgroei !== null) {
            console.log(buurt.wijkInfo.laagGeletterdheid.percentageTaalgroei);
            var coordinates = await getCoordinatenVanGoogleMaps(buurt.naam + " Nieuwegein");
            let coordinatesCijferObject = {
                coord: coordinates,
                cijfer: buurt.wijkInfo.laagGeletterdheid.percentageTaalgroei,
                totaleHuishoudens: buurt.aantalInwoners,
                naam: buurt.naam
            };
            points.push(coordinatesCijferObject);
            // This pushes something like [{coord: [1, 1.00012], cijfer: 5}]
        }
    }

    console.log(points);

    var geojson = {
        type: 'FeatureCollection',
        features: []
    };

    for (const point of points) {
        var totaal = point.totaleHuishoudens * point.cijfer;
        var afgerond = Math.round(totaal);
        var color = "";
        console.log(totaal);
        if (point.coord === undefined) {
            continue;
        }
        let size = 0;
        if (afgerond <= 0) {
            size += 5;
            color = "#008000";
        } else if (afgerond <= 20) {
            size += 7;
            color = "#90EE90";
        } else if (afgerond <= 40) {
            size += 9;
            color = "#FFFF00";
        } else if (afgerond <= 60) {
            size += 12;
            color = "#FFD700";
        } else if (afgerond <= 80) {
            size += 15;
            color = "#FFA500";
        } else if (afgerond <= 100) {
            size += 18;
            color = "#FF6347";
        } else if (afgerond <= 120) {
            size += 20;
            color = "#FF0000";
        } else {
            size += 22;
            color = "#8B0000";
        }

        console.log(color);

        geojson.features.push({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: point.coord
            },
            properties: {
                label: afgerond.toString(),
                size: size,
                color: color,
                naam: point.naam,
                aantal: afgerond,
                wijkInfo: {
                    laagGeletterdheid: {
                        percentageTaalgroei: point.cijfer
                    }
                },
                aantalInwoners: point.totaleHuishoudens
            }
        });
    }
    return geojson;

}


