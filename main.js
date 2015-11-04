var isStorageSupported;

$(function () {
    $("#tabs").tabs();

    document.getElementById("findMoreButton").style.visibility="hidden";

    if(typeof(Storage) !== "undefined") {
     isStorageSupported=true;
    } else {
     isStorageSupported=false;
        alert("Local Storage is not supported with this Browser, you can not pin Locations");
    }
});

$(document).ready(function () {
    $(function () {
        $("#dialog").dialog({
            autoOpen: false,
            //maxWidth: 1000,
            //maxHeight: 1000,
            width: 850,
            height: 850,
            modal: true,
            buttons: {
                Cancel: function () {
                    $(this).dialog("close");
                }
            }
        });
    });
});

$(function () {
    $("#dialog").dialog({
        autoOpen: false,
        show: {
            effect: "blind",
            duration: 1000
        },
        hide: {
            effect: "explode",
            duration: 1000
        }
    });
});

var map;

var markersNearby = [];
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
            var moreButton = document.getElementById('findMoreButton');

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

        //This hack is implemented, cause otherwise Eastern Europe is always the first entry in the list although its more than 50000m away
        if(place.name!="Eastern Europe") {

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

            var placeSelectedButtonStr = '<id class="fa fa-crosshairs cross" onclick="placeSelected(' + markersNearby.length + ')"/>';
            var infoButtonStr = '<id class="fa fa-info-circle infocircle" onclick="loadInfo(' + markersNearby.length + ')"/>';
            var addFavoriteButtonStr = '<id class="fa fa-thumb-tack star" onclick="addFavorite(' + markersNearby.length + ')"/>';


            $('#resultsTable').append('<tr id="' + markersNearby.length + '"><td>' + place.name + '</td><td>' + infoButtonStr + '</td><td>'
            + placeSelectedButtonStr + '</td> <td>' + addFavoriteButtonStr + '</td> </tr>');

            markersNearby.push(marker);
            placesNearby.push(place)
            bounds.extend(place.geometry.location);
        }
    }
    map.fitBounds(bounds);
}

function startNearbySearch() {
    var radius = ( $('#inputRadius').val());
    var isOpen;

    if (radius == "" || radius == 0) {
        radius = 50000;
    }

    if ($('#openNow').is(":checked")) {
        isOpen = true;
    } else {
        isOpen = false;
    }

    $('#resultsTable').html("");
    markersNearby = [];
    placesNearby = [];

    document.getElementById("findMoreButton").style.visibility="visible";
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
    var marker = markersNearby[id];
    map.setZoom(17);
    map.panTo(marker.position);
}

function addFavorite(id) {
    alert("selected" + id);
}

function loadInfo(id) {

    $("#dialog").dialog("open", {width: 600, height: 500});
    var place = placesNearby[id];

    var request = {reference: place.reference};
    service.getDetails(request, function (details, status) {
        $("#detailsTable").html("");
        $("#placeImage").html("");

        var photos = details.photos;
        if (photos){
            for (var i = 0, photo; photo = photos[i]; i++) {

                $("#placeImage").append('<img src="' + photos[i].getUrl({
                    'maxWidth': 800,
                    'maxHeight': 800
                }) + '"></img>');
            }
        }else{
            $("#placeImage").append("<br><br>Für diese Location sind leider keine Fotos verfügbar.");
        }
        if (details.name != null) {
            $("#detailsTable").append("<tr><td>Name:</td><td>" + details.name + "</td></tr>");
        }

        if (details.website != null) {
            $("#detailsTable").append('<tr><td>Website:</td><td><a href="' + details.website + '">' + details.website + '</a></td></tr>');
        }

        if (details.formatted_address != null) {
            $("#detailsTable").append("<tr><td>Adresse:</td><td>" + details.formatted_address + "</td></tr>");
        }

        if (details.formatted_phone_number != null) {
            $("#detailsTable").append("<tr><td>Telefon:</td><td>" + details.formatted_phone_number + "</td></tr>");
        }

        if (details.rating != null) {
            $("#detailsTable").append("<tr><td>Bewertung:</td><td>" + details.rating + "</td></tr>");
        }

        if (details.text != null) {
            $("#detailsTable").append("<tr><td>Text:</td><td>" + details.text + "</td></tr>");
        }
    });


}