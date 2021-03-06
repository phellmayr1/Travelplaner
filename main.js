var isStorageSupported;
var map;

var placesNearby = [];
var service;


$(function () {
    $("#tabs").tabs();

    document.getElementById("findMoreButton").style.visibility = "hidden";

    if (typeof(Storage) !== "undefined") {
        isStorageSupported = true;
    } else {
        isStorageSupported = false;
        alert("Local Storage is not supported with this Browser, you can not pin Locations");
    }

    initPins();

});

function initPins() {

    var pinnedPlaces = JSON.parse(localStorage.getItem("savedPlaces"));

    $("#pinsTable").html("");

    if (pinnedPlaces != null) {

        for (var i = 0, place; place = pinnedPlaces[i]; i++) {

            var placeSelectedButtonStr = '<i class="fa fa-crosshairs cross" onclick="placeSelected(' + placesNearby.length + ')"/>';
            var infoButtonStr = '<i class="fa fa-info-circle infocircle" onclick="loadInfo(' + placesNearby.length + ')"/>';
            //   var addFavoriteButtonStr = '<id class="fa fa-thumb-tack star" onclick="addFavorite(' + placesNearby.length + ')"/>';

            $('#pinsTable').append('<tr id="' + placesNearby.length + '"><td>' + place.name + '</td><td>' + infoButtonStr + '</td><td>'
            + placeSelectedButtonStr + '</td> <td>' + '' + '</td> </tr>');

            placesNearby.push(place);
        }
    }
}

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
                Abbrechen: function () {
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

function initMap() {

    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 48.306940, lng: 14.285830},
        zoom: 10
    });

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            infoWindow = new google.maps.InfoWindow({map: map});
            infoWindow.setPosition(pos);
            infoWindow.setContent('You are here');
            map.setCenter(pos);


        }, function () {
            alert("locationerror, Chrome does not support Geolocation with local files due to security reasons");

            //Set default Coordinates to Linz if it is not possible to get current coordinates
            pos = {
                lat: 48.306940,
                lng: 14.285830
            };
        });
    } else {
        // Browser doesn't support Geolocation
        alert("no geolocation support");
    }


    var input = (document.getElementById('pac-input'));

    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);
    //
    var infowindow = new google.maps.InfoWindow();
    var marker = new google.maps.Marker({
        map: map,
        anchorPoint: new google.maps.Point(0, -29)
    });
    //

    autocomplete.addListener('place_changed', function () {
        infowindow.close();
        marker.setVisible(false);
        var place = autocomplete.getPlace();
        if (!place.geometry) {
            return;
        }
        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);
        }
        marker.setIcon(({
            url: place.icon,
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(35, 35)
        }));
        marker.setPosition(place.geometry.location);
        marker.setVisible(true);

        $('#searchActions').html("");

        var placeSelectedButtonStr = '<i class="fa fa-crosshairs fa-3x cross" onclick="placeSelected(' + placesNearby.length + ')"/>';
        var infoButtonStr = '<i class="fa fa-info-circle fa-3x infocircle" onclick="loadInfo(' + placesNearby.length + ')"/>';
        var addFavoriteButtonStr = '<i class="fa fa-thumb-tack fa-3x star" onclick="addFavorite(' + placesNearby.length + ')"/>';

        placesNearby.push(place);

        $('#searchActions').append("<br><br>");
        $('#searchActions').append(placeSelectedButtonStr);
        $('#searchActions').append(infoButtonStr);
        $('#searchActions').append(addFavoriteButtonStr);

    });
}

function processResults(results, status, pagination) {
    if (status !== google.maps.places.PlacesServiceStatus.OK) {
        return;
    } else {
        createMarkers(results);

        var moreButton = document.getElementById('findMoreButton');
        if (pagination.hasNextPage) {

            moreButton.disabled = false;

            moreButton.addEventListener('click', function () {
                moreButton.disabled = true;
                pagination.nextPage();
            });
        } else {
           moreButton.disabled = true;
        }
    }
}

function createMarkers(places) {
    var bounds = new google.maps.LatLngBounds();
    var placesList = document.getElementById('places');

    for (var i = 0, place; place = places[i]; i++) {

        //This hack is implemented, cause otherwise Eastern Europe is always the first entry in the list although its more than 50000m away, very strange
        if (place.name != "Eastern Europe") {

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

            var placeSelectedButtonStr = '<i class="fa fa-crosshairs cross" onclick="placeSelected(' + placesNearby.length + ')"/>';
            var infoButtonStr = '<i class="fa fa-info-circle infocircle" onclick="loadInfo(' + placesNearby.length + ')"/>';
            var addFavoriteButtonStr = '<i class="fa fa-thumb-tack star" onclick="addFavorite(' + placesNearby.length + ')"/>';


            $('#resultsTable').append('<tr id="' + placesNearby.length + '"><td>' + place.name + '</td><td>' + infoButtonStr + '</td><td>'
            + placeSelectedButtonStr + '</td> <td>' + addFavoriteButtonStr + '</td> </tr>');

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
    placesNearby = [];
    initPins();

    document.getElementById("findMoreButton").style.visibility = "visible";
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

    var place = placesNearby[id];

    service = new google.maps.places.PlacesService(map);

    var request = {reference: place.reference};
    service.getDetails(request, function (details, status) {

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
            position: details.geometry.location
        });

        //var marker = markersNearby[id];
        map.setZoom(17);
        map.panTo(marker.position);
    });
}

function addFavorite(id) {
    var savedPlaces = JSON.parse(localStorage.getItem("savedPlaces"));

    if (savedPlaces == null) {
        savedPlaces = [];
    }
    savedPlaces.push(placesNearby[id]);

    localStorage.setItem("savedPlaces", JSON.stringify(savedPlaces));

    var placeSelectedButtonStr = '<i class="fa fa-crosshairs cross" onclick="placeSelected(' + placesNearby.length + ')"/>';
    var infoButtonStr = '<i class="fa fa-info-circle infocircle" onclick="loadInfo(' + placesNearby.length + ')"/>';


    $('#pinsTable').append('<tr id="' + placesNearby.length + '"><td>' + placesNearby[id].name + '</td><td>' + infoButtonStr + '</td><td>'
    + placeSelectedButtonStr + '</td> <td>' + '' + '</td> </tr>');

    placesNearby.push(placesNearby[id]);

    //alert(savedPlaces.length);
}

function loadInfo(id) {

    $("#dialog").dialog("open", {width: 600, height: 500});
    var place = placesNearby[id];

    //alert(place.reference);
    var request = {reference: place.reference};
    service = new google.maps.places.PlacesService(map);

    service.getDetails(request, function (details, status) {
        $("#detailsTable").html("");
        $("#placeImage").html("");

        //alert(details.name);

        var photos = details.photos;
        if (photos) {
            for (var i = 0, photo; photo = photos[i]; i++) {

                $("#placeImage").append('<img src="' + photos[i].getUrl({
                    'maxWidth': 800,
                    'maxHeight': 800
                }) + '"></img>');
            }
        } else {
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