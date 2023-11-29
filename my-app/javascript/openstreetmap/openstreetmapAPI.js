import { fromLonLat } from 'ol/proj';

export async function getCoordinatenVanOpenStreetMap(postcode) {
    const geocodingUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${postcode}`;
    const response = await fetch(geocodingUrl);
    const data = await response.json();
    let coordinates = null;
    if (data.length !== 0) {
        const result = data[0];
        coordinates = fromLonLat([parseFloat(result.lon), parseFloat(result.lat)]);
        return coordinates
    }
}

export async function getCoordinatenVanGoogleMaps(buurtnaam) {
    return new Promise((resolve, reject) => {
        var apiKey = 'AIzaSyBNGXGaZGz4G7Pqz4SWctcSDKMnJ4kpaoc';

        var geocoder = new google.maps.Geocoder();

        geocoder.geocode({'address': buurtnaam}, function(results, status) {
            if (status == 'OK') {
                var location = results[0].geometry.location;
                var latitude = location.lat();
                var longitude = location.lng();
                var coord = [longitude, latitude];
                var transformedCoord = coord;
                console.log('Transformed Coordinates:', transformedCoord);
                resolve(transformedCoord);
            } else {
                console.error(`Geen coördinaten gevonden voor ${buurtnaam}`);
                reject(null);
            }
        });
    });
}