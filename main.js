$(function () {
    $("#tabs").tabs();
});

var map;

var placesNearby = [];
var service;

function initMap() {

    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -38.321, lng: 172.462},
        zoom: 10
    });
    infoWindow = new google.maps.InfoWindow({map: map});


    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            infoWindow.setPosition(pos);
            infoWindow.setContent('You are here');
            map.setCenter(pos);


        }, function () {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }
}

function processResults(results, status, pagination) {
    if (status !== google.maps.places.PlacesServiceStatus.OK) {
        return;
    } else {
        createMarkers(results);

        if (pagination.hasNextPage) {
            var moreButton = document.getElementById('more');

            moreButton.disabled = false;

            moreButton.addEventListener('click', function () {
                moreButton.disabled = true;
                pagination.nextPage();
            });
        }
    }
}

function createMarkers(places) {
    var bounds = new google.maps.LatLngBounds();
    var placesList = document.getElementById('places');

    for (var i = 0, place; place = places[i]; i++) {


        var image = {
            url: place.icon,
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(35, 35)
        };

        var marker = new google.maps.Marker({
            map: map,
            icon: image,
            title: place.name,
            position: place.geometry.location
        });

        var request = {reference: place.reference};
        service.getDetails(request, function (details, status) {

//                alert(details.website);

            //google.maps.event.addListener(marker, 'click', function() {
            //    alert(details.website);
            //    infowindow.setContent(details.name + "<br />" + details.formatted_address +"<br />" + details.website + "<br />" + details.rating + "<br />" + details.formatted_phone_number);
            //    infowindow.open(map, this);
            //});
        });

        var placeSelectedButtonStr = '<id class="fa fa-crosshairs cross" onclick="placeSelected(' + placesNearby.length + ')"/>';
        var infoButtonStr = '<id class="fa fa-info-circle infocircle" onclick="loadInfo(' + placesNearby.length + ')"/>';
        var addFavoriteButtonStr = '<id class="fa fa-star star" onclick="addFavorite(' + placesNearby.length + ')"/>';


        $('#resultsTable').append('<tr id="' + placesNearby.length + '"><td>' + place.name + '</td><td>' + infoButtonStr + '</td><td>'
        + placeSelectedButtonStr + '</td> <td>' + addFavoriteButtonStr + '</td> </tr>');

        placesNearby.push(marker);
        bounds.extend(place.geometry.location);
    }
    map.fitBounds(bounds);
}

function startNearbySearch() {
    var radius = ( $('#inputRadius').val());
    var isOpen;

    if (radius == "" || radius == 0) {
        radius = 10000;
    }

    if ($('#openNow').is(":checked")) {
        isOpen = true;
    } else {
        isOpen = false;
    }
    service = new google.maps.places.PlacesService(map);
    service.nearbySearch({
        location: {lat: pos.lat, lng: pos.lng},
        radius: radius,
        openNow: isOpen
    }, processResults);
}

function checkButtonVisible() {
    var radius = ( $('#inputRadius').val());
    var button = document.getElementById('searchNearby');
    if ((radius >= 1 && radius <= 50000) || radius == '') {
        button.disabled = false;
    } else {
        button.disabled = true;
    }
}
function placeSelected(id) {
    var marker = placesNearby[id];
    map.setZoom(17);
    map.panTo(marker.position);
}

function addFavorite(id) {
    alert("selected" + id);
}

function loadInfo(id) {

}