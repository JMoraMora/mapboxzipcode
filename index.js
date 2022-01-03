import states from './states.js'

const btnSearch = document.getElementById('btnSearch');

mapboxgl.accessToken = 'pk.eyJ1IjoiZnJhbmNpc21hdGVvIiwiYSI6ImNreDlrdWYxODM4N3IydnA5bm01bGlweDYifQ.goniy8UjVIzOOOgSpuWcYQ';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-101.85115071117411, 39.540802411930834],
    zoom: 4,
});

btnSearch.addEventListener('click', zipCodeBoundaries);

async function zipCodeBoundaries() {
    try {
        let inpState = document.querySelector('#inpState').value;
        let inpZipCode = document.querySelector('#inpZipCode').value;
    
        let state = states.find(obj => obj.abbreviation == inpState)

        if(state == null) {
            throw new Error('Error en la busqueda');
        }

        if(!(state.hasOwnProperty('geoJson'))) {
            throw new Error('No existen zip codes para este estado');
        }

        const geoJsonState = await getGeoJsonState(state)
        const zipCodes = geoJsonState.features.map(obj => {
            return obj.properties.ZCTA5CE10
        })

        console.log(zipCodes)
        if(!(zipCodes.includes(inpZipCode))) {
            throw new Error('Codigo postal mal ingresado, no existe este codigo para este estado');
        }

        let features = geoJsonState.features.filter(obj => obj.properties.ZCTA5CE10 == inpZipCode);
        drawMap(features)
    } catch (error) {
        console.log(error)
    }
}

function getGeoJsonState(state) {
    let data = fetch(`states/${state.geoJson}`)
        .then(response => response.json())
        .then(response => {
            return response
        });  

    return data
}

function drawMap(features) {
    let mapLayer = map.getLayer('route');

    if(typeof mapLayer !== 'undefined') {
      map.removeLayer('route').removeSource('route');
    }

    map.addSource('route', {
        'type': 'geojson',
        'data': {
            'type': 'FeatureCollection',
            'features': features,
        }
    });
    
    map.addLayer({
        'id': 'route',
        'type': 'fill',
        'source': 'route', 
        'paint': {
            'fill-color': '#0080ff',
            'fill-opacity': 0.8
        }
    });

    const coordinates = features[0].geometry.coordinates[0];
    const bounds = new mapboxgl.LngLatBounds( coordinates[0], coordinates[0] );

    for (const coord of coordinates) {
        bounds.extend(coord);
    }
    
    map.fitBounds(bounds, { padding: 20 });
}