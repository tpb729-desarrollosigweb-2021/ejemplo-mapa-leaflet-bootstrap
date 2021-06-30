// Mapa Leaflet
var mapa = L.map('mapid').setView([9.5, -84.10], 8);


// Definición de capas base
var capa_osm = L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?', 
  {
    maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }
).addTo(mapa);

var capa_cartoDB_darkMatter = L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', 
    {
	  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	  subdomains: 'abcd',
	  maxZoom: 19
    }
).addTo(mapa);


// Conjunto de capas base
var capas_base = {
  "OSM": capa_osm,
  "CartoDB Dark Matter": capa_cartoDB_darkMatter
};	    


// Ícono personalizado para carnivoros
const iconoCarnivoro = L.divIcon({
  html: '<i class="fas fa-paw fa-1x"></i>',
  className: 'estiloIconos'
});


// Control de capas
control_capas = L.control.layers(capas_base).addTo(mapa);	


// Control de escala
L.control.scale().addTo(mapa);
   

// Capa vectorial de registros agrupados de carnívoros
$.getJSON("https://tpb729-desarrollosigweb-2021.github.io/datos/gbif/carnivora-cr-wgs84.geojson", function(geodata) {
  // Capa de registros individuales
  var capa_carnivora = L.geoJson(geodata, {
    style: function(feature) {
	  return {'color': "#013220", 'weight': 3}
    },
    onEachFeature: function(feature, layer) {
      var popupText = "<strong>Especie</strong>: " + feature.properties.species + "<br>" + 
                      "<strong>Localidad</strong>: " + feature.properties.locality + "<br>" + 
                      "<strong>Fecha</strong>: " + feature.properties.eventDate + "<br>" + 
                      "<strong>Institución</strong>: " + feature.properties.institutionCode + "<br>" + 
                      "<br>" +
                      "<a href='" + feature.properties.occurrenceID + "'>Más información</a>";
      layer.bindPopup(popupText);
    },
    pointToLayer: function(getJsonPoint, latlng) {
        return L.marker(latlng, {icon: iconoCarnivoro});
    }
  });

  // Capa de calor (heatmap)
  coordenadas = geodata.features.map(feat => feat.geometry.coordinates.reverse());
  var capa_carnivora_calor = L.heatLayer(coordenadas, {radius: 30, blur: 1});

  // Capa de puntos agrupados
  var capa_carnivora_agrupados = L.markerClusterGroup({spiderfyOnMaxZoom: true});
  capa_carnivora_agrupados.addLayer(capa_carnivora);

  // Se añaden las capas al mapa y al control de capas
  capa_carnivora_calor.addTo(mapa);
  control_capas.addOverlay(capa_carnivora_calor, 'Mapa de calor');
  // capa_carnivora_agrupados.addTo(mapa);
  control_capas.addOverlay(capa_carnivora_agrupados, 'Registros agrupados');
  // capa_carnivora.addTo(mapa);
  control_capas.addOverlay(capa_carnivora, 'Registros individuales de carnívoros');
});
