let isMobile;

function isMobileDevice() {
  if (navigator.userAgent.match(/iPhone/i) ||
    navigator.userAgent.match(/webOS/i) ||
    navigator.userAgent.match(/Android/i) ||
    navigator.userAgent.match(/iPad/i) ||
    navigator.userAgent.match(/iPod/i) ||
    navigator.userAgent.match(/BlackBerry/i) ||
    navigator.userAgent.match(/Windows Phone/i)
  ) {
    isMobile = true;
  } else {
    isMobile = false;
  }
}

isMobileDevice();

// fermer message d'erreur
const croixElt = document.getElementById('croix');
const boiteMessErreur = document.getElementById('message-boite');
croixElt.addEventListener('click', function () {
  boiteMessErreur.classList.toggle('goUp');
})

// fermer panneau latéral droit
const croixRightElt = document.getElementById('croix-right');
const panneauLatRight = document.getElementById('info-commune');
croixRightElt.addEventListener('click', function () {
  panneauLatRight.classList.toggle('show');
})

const communeDataVariables = {
  "CASTELNAU LE LEZ": castelnauLeLez,
  "CAZEVIEILLE": cazevieille,
  "CLAPIERS": clapiers,
  "COMBAILLAUX": combaillaux,
  "COURNONSEC": cournonsec,
  "COURNONTERRAL": cournonterral,
  "FABREGUES": fabregues,
  "GRABELS": grabels,
  "JUVIGNAC": juvignac,
  "LATTES": lattes,
  "LAVERUNE": laverune,
  "LE TRIADOU": leTriadou,
  "LES MATELLES": lesMatelles,
  "MIREVAL": mireval,
  "MONTARNAUD": montarnaud,
  "MONTFERRIER-SUR-LEZ": montferrierSurLez,
  "MONTPELLIER": montpellier,
  "MURLES": murles,
  "MURVIEL-LES-MONTPELLIER": murvielLesMontpellier,
  "PALAVAS-LES-FLOTS": palavasLesFlots,
  "PEROLS": perols,
  "PIGNAN": pignan,
  "PRADES-LE-LEZ": pradesLeLez,
  "SAUSSAN": saussan,
  "SAINT CLEMENT DE RIVIERE": saintClementDeRiviere,
  "SAINT GEORGES D ORQUES": saintGeorgesDorques,
  "SAINT-GELY-DU-FESC": saintGelyDuFesc,
  "SAINT-JEAN-DE-CUCULLES": saintJeanDeCuculles,
  "SAINT-JEAN-DE-VEDAS": saintJeanDeVedas,
  "SAINT-MATHIEU-DE-TREVIERS": saintMathieuDeTreviers,
  "VAILHAUQUES": vailhauques,
  "VALFLAUNES": valflaunes,
  "VIC-LA-GARDIOLE": vicLaGardiole,
  "VILLENEUVE-LES-MAGUELONE": villeneuveLesMaguelone,
};

// Je récupère la position de l'utilisateur si il est ok
let lat;
let lng;
let adresse;
let selectedCommune;
let communeIsCorrect = false;
let postaleCode;
let street;
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(function (position) {
    lat = position.coords.latitude;
    lng = position.coords.longitude;
    // Utilisez lat et lng pour afficher la position sur la carte Leaflet
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=' + lat + '&lon=' + lng);
    xhr.onload = function () {
      if (xhr.status === 200) {
        var result = JSON.parse(xhr.responseText);
        adresse = result.address.road + ', ' + result.address.postcode + ' ' + result.address.village;
        postaleCode = result.address.postcode;
        street = result.address.road;
        selectedCommune = result.address.village || result.address.city;
        selectedCommune = selectedCommune.toUpperCase();

        const communes = [
          "CASTELNAU LE LEZ", "CAZEVIEILLE", "CLAPIERS", "COMBAILLAUX", "COURNONSEC", "COURNONTERRAL",
          "FABREGUES", "GRABELS", "JUVIGNAC", "LATTES", "LAVERUNE", "LE TRIADOU", "LES MATELLES",
          "MIREVAL", "MONTARNAUD", "MONTFERRIER-SUR-LEZ", "MONTPELLIER", "MURLES", "MURVIEL-LES-MONTPELLIER",
          "PALAVAS-LES-FLOTS", "PEROLS", "PIGNAN", "PRADES-LE-LEZ", "SAUSSAN", "SAINT CLEMENT DE RIVIERE",
          "SAINT CLEMENT DE RIVIERE", "SAINT-GELY-DU-FESC", "SAINT-JEAN-DE-CUCULLES", "SAINT-JEAN-DE-VEDAS",
          "SAINT-MATHIEU-DE-TREVIERS", "VAILHAUQUES", "VALFLAUNES", "VIC-LA-GARDIOLE", "VILLENEUVE-LES-MAGUELONE"
        ];

        if (communes.includes(selectedCommune)) {
          let data = communeDataVariables[selectedCommune];

          if (data && data.features && data.features.length > 0) {
            let geoJSONLayer = L.geoJSON(data, {
              style: style,
              onEachFeature: onEachFeature,
              filter: function (feature, layer) {
                return feature.properties.nomcommune.toUpperCase() === selectedCommune;
              }
            }).addTo(map);

            geoJSONLayer.clearLayers();
            geoJSONLayer.addData(data);

            const houseDivElt = document.getElementById("choix-commune");
            houseDivElt.classList.toggle('isVisible');

            let bounds = geoJSONLayer.getBounds();
            if (bounds.isValid()) {
              map.fitBounds(bounds, {
                maxZoom: 16
              });
            } else {
              console.error("Bounds are not valid.");
            }

            communeIsCorrect = true;
          } else {
            console.error("Invalid or empty GeoJSON data.");
            boiteMessErreur.classList.toggle('goUp');
            communeIsCorrect = false;
          }
        } else {
          boiteMessErreur.classList.toggle('goUp');
          communeIsCorrect = false;
        }
      } else {
        choixCommune();
      }
    };
    xhr.send();

  });
} else {
  choixCommune();
}

const canvasRenderer = L.canvas();

const baseMaps = {
  "Rues": L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap France | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }),
  "Satellite": L.tileLayer(
    'https://wxs.ign.fr/decouverte/geoportail/wmts?service=WMTS&request=GetTile&version=1.0.0&tilematrixset=PM&tilematrix={z}&tilecol={x}&tilerow={y}&layer=ORTHOIMAGERY.ORTHOPHOTOS&format=image/jpeg&style=normal', {
      tileSize: 256,
      attribution: "IGN-F/Géoportail"
    })
}

let map = L.map('map', {
  dragging: !L.Browser.mobile,
  tap: !L.Browser.mobile,
  layers: [baseMaps["Satellite"]]
}).setView([44.384201382742944, 4.990312329391747], isMobile ? 9 : 12);

L.control.layers(baseMaps).addTo(map);

map.options.minZoom = isMobile ? 7 : 8;
map.options.maxZoom = 18;

function showMessageBoite(errorMessage) {
  const messageBoite = document.getElementById("message-boite");
  const messageText = messageBoite.querySelector("p");

  messageText.textContent = errorMessage;
  messageBoite.classList.toggle("goUp");
}

let geoJSONLayer;

function choixCommune() {
  const select = document.getElementById('select');
  select.addEventListener('change', function () {
    selectedCommune = select.options[select.selectedIndex].value;
    selectedCommune = selectedCommune.toUpperCase();
    // console.log("selectedCommune : ", selectedCommune);

    let data = communeDataVariables[selectedCommune];
    // console.log("data : ", data);

    if (geoJSONLayer) {
      geoJSONLayer.clearLayers();
    }

    if (data && data.features && data.features.length > 0) {
      geoJSONLayer = L.geoJSON(data, {
        style: style,
        onEachFeature: onEachFeature,
        filter: function (feature, layer) {
          return feature.properties.nomcommune.toUpperCase() === selectedCommune;
        },
        renderer: canvasRenderer,
      }).addTo(map);

      const houseDivElt = document.getElementById("choix-commune");
      houseDivElt.classList.toggle('isVisible');

      let bounds = geoJSONLayer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          maxZoom: 16
        });
      } else {
        console.error("Bounds are not valid.");
      }
    } else {
      console.error("Invalid or empty GeoJSON data.");
      boiteMessErreur.classList.toggle('goUp');
    }
  });
}

choixCommune();

function style(feature) {
  return {
    fillColor: 'black',
    weight: 1,
    opacity: 0.5,
    color: 'white',
    dashArray: '',
    fillOpacity: 0.2
  };
}

function toggleHouseBtn() {
  const houseElt = document.getElementById("house");
  const houseDivElt = document.getElementById("choix-commune");
  houseElt.addEventListener("click", function () {
    houseDivElt.classList.toggle('isVisible');
  })
}

toggleHouseBtn();

function onEachFeature(feature, layer) {
  let isEligible = feature.properties.Parc_Eligib;
  let batiInondable;
  if (feature.properties.Parc_Eligib === true) {
    batiInondable = 'Éligible et inondable';
  } else if (feature.properties.Parc_Eligib === false) {
    batiInondable = 'Non éligible';
  } else if (feature.properties.Parc_Eligib === null) {
    batiInondable = 'Éligible mais non inondable';
  } else {
    batiInondable = 'Données non disponibles';
  }
  let batiInondableSup20 = feature.properties.bati_dur_20m2_x_ppri == true ? 'Oui' : 'Non';
  let divElt = document.getElementById("info-commune");

  const popupElt = `
        ${
            isEligible === true 
            ? '<p class="eligible">Votre parcelle est dans le zonage inondable du PPRi (inondation par débordement de cours d\'eau)</p>'
            + `<p class="eligible">Pour vérifier votre éligibilité au dispositif Lez'Alabri et réaliser le diagnostic gratuit de votre bien :</p>`
            + '<p class="btn-2"><a href="#" id="prendre-rdv">Prendre rendez-vous</a></p>'
            : isEligible === null
            ? '<p>Votre parcelle n\'est pas dans le zonage inondable du PPRi (inondation par débordement de cours d\'eau).</p>'
            + '<p>Si votre bien a été impacté par une inondation, n\'hésitez pas à nous contacter pour signaler votre situation et obtenir davantage d\'informations.</p>'
            + '<p>Pour plus d\'informations sur le dispositif Lez\'Alabri</p>'
            + '<p class="btn-1"><a href="mailto:inondation@lezalabri.fr">Nous contacter</a></p>'
            + '<p>Mon bien est concerné par une problématique de ruissellement pluvial :</p>'
            + '<p>Un dispositif dédié est en cours de déploiement.</p>'
            + '<p>Pour plus d\'information et signaler ma situation :</p>'
            + '<p class="btn-2"><a href="mailto:inondation@lezalabri.fr">Nous contacter</a></p>'
            : '<p>Le dispositif Lez\'Alabri n\'est pas encore déployé sur votre commune. Des interventions seront programmées d\'ici 2027.</p>'
            + '<p>Pour plus d\'informations sur le dispositif Lez\'Alabri</p>'
            + '<p class="btn-1"><a href="mailto:inondation@lezalabri.fr">Nous contacter</a></p>'
            + '<p>Pour consulter le Plan de Prévention du Risque (PPRi) de votre commune :</p>'
            + '<p class="btn-2"><a href="http://www.herault.gouv.fr/">Consulter le PPRi</a></p>'
            + '<p class="info-italique">Rubrique > Actions de l\'Etat > Risques naturels et technologiques > Les Plans de Prévention des Risques approuvés > Dossiers des PPR approuvés au format PDF</p>'
        }
    `;

  layer.bindPopup(popupElt);
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature
  });

  layer.on('popupopen', function () {
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.addedNodes.length) {
          let btnPrendreRdv = document.getElementById("prendre-rdv");
          if (btnPrendreRdv) {
            btnPrendreRdv.addEventListener("click", function () {
              divElt.classList.add('show');
            });
            observer.disconnect(); // Arrête d'observer une fois que l'élément est trouvé et l'événement est ajouté
          }
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}

function highlightFeature(e) {
  var layer = e.target;
  layer.setStyle({
    weight: 2,
    color: '#666',
    dashArray: '',
    fillOpacity: 0.2,
    fillColor: '#FEB24C',
  });
  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }
  layer.bringToFront();

}

function resetHighlight(e) {
  e.target.setStyle({
    fillColor: 'black',
    weight: 1,
    opacity: 0.5,
    color: 'white',
    dashArray: '',
    fillOpacity: 0.2
  });
}

function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());

  e.target.openPopup();

  let isEligible = e.target.feature.properties.Parc_Eligib;

  let cadastre = e.target.feature.geo_parcel;

  let batiInondable;
  if (e.target.feature.properties.Parc_Eligib === true) {
    batiInondable = 'Éligible et inondable';
  } else if (e.target.feature.properties.Parc_Eligib === false) {
    batiInondable = 'Non éligible';
  } else if (e.target.feature.properties.Parc_Eligib === null) {
    batiInondable = 'Éligible mais non inondable';
  } else {
    batiInondable = 'Données non disponibles';
  }
  let batiInondableSup20 = e.target.feature.properties.bati_dur_20m2_x_ppri == true ? 'Oui' : 'Non';

  let commune = e.target.feature.properties.nomcommune;
  let parentElt = document.getElementById("liens");

  parentElt.innerHTML = `
        <div>
          <h2>2. Je suis éligible, je complète le formulaire</h2>  
          <form action="/success.html" method="POST" data-netlify="true" name="contact-eligibilite" netlify-honeypot="bot-field">
            <p class="hidden" hidden>
                <label>
                    Don’t fill this out if you’re human: <input name="bot-field" />
                </label>
            </p>
            <input type="hidden" name="form-name" value="contact-eligibilite">
            <div class="form-group">
                <label for="nom">Nom*</label>
                <input type="text" id="nom" name="nom" placeholder="votre nom" required>
            </div>
            <div class="form-group">
                <label for="prenom">Prénom*</label>
                <input type="text" id="prenom" name="prenom" placeholder="votre prénom" required>
            </div>
            <input type="text" id="cadastre" name="cadastre" value="${cadastre}" hidden>
            <input type="text" id="batiInondable" name="batiInondable" value="${batiInondable}" hidden>
            <div class="form-group adresse">
                <label for="adresse">Adresse*</label>
                <input type="text" id="adresse" name="adresse" placeholder="votre adresse" value="${communeIsCorrect ? street : "" }" required>
            </div>
            <div class="form-group">
                <label for="codePostal">Code postal*</label>
                <input type="text" id="codePostal" name="codePostal" placeholder="votre code postal" value="${communeIsCorrect ? postaleCode : ""}" required>
            </div>
            <div class="form-group">
                <label for="commune">Commune*</label>
                <input type="text" id="commune" name="commune" value="${commune}" required>
            </div>
            <div class="form-group">
                <label for="telephone">Numéro de téléphone</label>
                <input type="text" id="telephone" name="telephone" placeholder="votre numéro de téléphone">
            </div>
            <div class="form-group">
                <label for="email">Email*</label>
                <input type="email" id="email" name="email" placeholder="votre email" required>
            </div>
            <input type="submit" value="Envoyer">
          </form>
        </div>
        `;
}

let searchControl = L.Control.geocoder({
  position: 'topleft',
  placeholder: 'Rechercher une adresse ou un lieu',
  geocoder: L.Control.Geocoder.nominatim()
}).addTo(map);

searchControl.on('markgeocode', function (e) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=' + e.geocode.center.lat + '&lon=' + e.geocode.center.lng);
  xhr.onload = function () {
    if (xhr.status === 200) {
      var result = JSON.parse(xhr.responseText);
      postaleCode = result.address.postcode;
      street = result.address.road;

      selectedCommune = result.address.city || result.address.village;
      selectedCommune = selectedCommune.toUpperCase();

      const communes = [
        "CASTELNAU LE LEZ", "CAZEVIEILLE", "CLAPIERS", "COMBAILLAUX", "COURNONSEC", "COURNONTERRAL",
        "FABREGUES", "GRABELS", "JUVIGNAC", "LATTES", "LAVERUNE", "LE TRIADOU", "LES MATELLES",
        "MIREVAL", "MONTARNAUD", "MONTFERRIER-SUR-LEZ", "MONTPELLIER", "MURLES", "MURVIEL-LES-MONTPELLIER",
        "PALAVAS-LES-FLOTS", "PEROLS", "PIGNAN", "PRADES-LE-LEZ", "SAUSSAN", "SAINT CLEMENT DE RIVIERE",
        "SAINT CLEMENT DE RIVIERE", "SAINT-GELY-DU-FESC", "SAINT-JEAN-DE-CUCULLES", "SAINT-JEAN-DE-VEDAS",
        "SAINT-MATHIEU-DE-TREVIERS", "VAILHAUQUES", "VALFLAUNES", "VIC-LA-GARDIOLE", "VILLENEUVE-LES-MAGUELONE"
      ];

      if (communes.includes(selectedCommune)) {
        let data = communeDataVariables[selectedCommune];

        if (data && data.features && data.features.length > 0) {
          let geoJSONLayer = L.geoJSON(data, {
            style: style,
            onEachFeature: onEachFeature,
            filter: function (feature, layer) {
              return feature.properties.nomcommune.toUpperCase() === selectedCommune;
            }
          }).addTo(map);

          geoJSONLayer.clearLayers();
          geoJSONLayer.addData(data);

          const houseDivElt = document.getElementById("choix-commune");
          houseDivElt.classList.toggle('isVisible');

          let bounds = geoJSONLayer.getBounds();
          if (bounds.isValid()) {
            map.fitBounds(bounds, {
              maxZoom: 16
            });
          } else {
            console.error("Bounds are not valid.");
          }

          communeIsCorrect = true;
        } else {
          console.error("Invalid or empty GeoJSON data.");
          boiteMessErreur.classList.toggle('goUp');
          communeIsCorrect = false;
        }
      } else {
        boiteMessErreur.classList.toggle('goUp');
        communeIsCorrect = false;
      }

    } else {
      choixCommune();
    }
  };
  xhr.send();
});

document.addEventListener('DOMContentLoaded', function () {
  const geocoderDiv = document.querySelector('.leaflet-control-geocoder.leaflet-bar.leaflet-control');
  geocoderDiv.classList.toggle('leaflet-control-geocoder-expanded');
});