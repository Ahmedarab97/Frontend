import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import { Point } from 'ol/geom';
import { Vector } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import {Heatmap} from 'ol/layer'
import {getCoordinatenVanOpenStreetMap} from "../openstreetmap/openstreetmapAPI";
import {forEach} from "ol/geom/flat/segments";
import {Fill, Stroke, Style} from "ol/style";
import CircleStyle from "ol/style/Circle";

export async function laaggeletterdheidLayer(postcodes) {
    try{
        let coordinates =  await Promise.all(postcodes.map(postcode => getCoordinatenVanOpenStreetMap(postcode)));
        console.log(coordinates);
        // if(postcode in jutphaas){
        //     switch(buurt) {
        //         case buurt > 10:
        //     }
        // }

        var heatmapLayer = new Heatmap({
            source: new Vector({
                features: coordinates.map(function(coord) {
                    return new Feature({
                        geometry: new Point(coord)
                    });
                }),
            }),
            blur: 15,
            radius: 10,
            fill: new Fill({
               color: 'green'
            }),
            gradient: [
                'rgba(33,102,172,0)',
                'rgba(178,24,43,1)',
                'rgba(209,229,240,1)',
                'rgba(253,219,199,1)',
                'rgba(239,138,98,1)',
                'rgba(178,24,43,1)',
                'rgba(103,0,31,1)',
            ],
        });
        return heatmapLayer;
    }
    catch {
        console.error("er gaat wel iets fout in dit stukje code");
    }
}


