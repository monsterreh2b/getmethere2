// variable declerations
// CONSTANTS
var UBER_CLIENT_ID = "EXXhWDBwoKsEKb3G2txwmcj2KPYj7S36";
var UBER_CLIENT_SECRET = "9ZXBLO69GUquVf21nduWTjyO4Auniw2Ri7NoZLia";
var startLat;
var startLong;
var endLat;
var endLong;


function deleteMarkers(markersArray) {
    for (var i = 0; i < markersArray.length; i++) {
        markersArray[i].setMap(null);
    }
    markersArray = [];
}
// FUNCTION DECLERATIONS.
//getting geo location 
function getLocation() {
    return new Promise(function(resolve, reject) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                var geoObj = {};
                console.log(position);
                geoObj.lat = position.coords.latitude;
                geoObj.lng = position.coords.longitude;
                resolve(geoObj);
            });
        } else {
            reject("geolocation not supported");
        }
    });
}

function startAddressGeo() {
    $("#startAddress").val("current address");
};

function endAddressGeo() {
    $("#endAddress").val("current address");
};

function addressToGeo(inputAddress) {
    return new Promise(function(resolve, reject) {
        console.log(inputAddress);

        var key = "AIzaSyAuk1rhKmWAY0bAmGK_4ygL6oApCSadGQg";
        var queryURL = "http://maps.googleapis.com/maps/api/geocode/json?address=" + inputAddress + "&" + key;

        axios({
                url: queryURL,
                method: "GET"
            })
            .then(function(response) {
                console.log(response);
                var geoObj = {};
                geoObj = response.data.results[0].geometry.location;
                resolve(geoObj);
            })
            .catch(function(error) {
                reject(error);
            });
    })
};




//lyft



var LYFT_CLIENT_ID = "4VUhVhVOSdP8";
var SECRET = "EghRc_w20qL6BntxutRQxDr1MMpB-Y3g";
var LYFT_TOKEN;



function authenticateLyft() {
    return axios({
        url: 'https://api.lyft.com/oauth/token',
        method: 'POST',
        data: {
            grant_type: 'client_credentials',
            scope: 'public'
        },
        headers: {
            "Authorization": "Basic " + btoa(LYFT_CLIENT_ID + ":" + SECRET)
        }
    })
}

function getLyftPrices(geoObj) {
    return axios({
        url: "https://api.lyft.com/v1/cost?start_lat=" + geoObj.start.lat + "&start_lng=" + geoObj.start.lng + "&end_lat=" + geoObj.end.lat + "&end_lng=" + geoObj.end.lng,
        method: 'GET',
        headers: {
            "Authorization": "Bearer " + LYFT_TOKEN
        }
    })
}

function convert(value) {
    return Math.floor(value / 60) + ":" + (value % 60 ? value % 60 : '00')
}

function dollar(value) {


    return ((value / 100).toFixed(2));
}


// $(document).ready(function() {
//     console.log("hi");
//     $("#target").submit(function(event) {
//         event.preventDefault();
//         var inputAddress = $("#startAddress").val();
//         console.log(inputAddress);


//         var key = "AIzaSyAmoeeVA0-TiJTpH5tOGpwKGpPtryW51oY"
//         var queryURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + inputAddress + key;

//         $.ajax({
//                 url: queryURL,
//                 method: "GET"
//             })
//             .done(function(response) {
//                 console.log(response);


//             });
//     });
// });






//main logic here.
// function getUberTimeEstimate(geoObj) {
//     return new Promise(function(resolve, reject) {
//         var uber_token = "uWfUgG1yE-FroJRj4JzPsi9DSmefcgIK2MjoMajR";
//         axios({
//                 url: 'https://login.uber.com/oauth/v2/token',
//         		method: 'POST',
//         		data: {
//             		grant_type: 'authorization_code',
//             		redirect_uri: 'http://localhost:3000'
//         		},
//         		client_sercret: 
//         		headers: {
//             		Authorization: "Token " + uber_token
//         		}
//             	})
//             	.then(function(response) {
//                 	resolve(response);
//             	})
//             	.catch(function(error) {
//                 	reject(error);
//             	});

//     })
// }

function getUberTimeEstimate(geoObj) {
    return new Promise(function(resolve, reject) {
        var uber_token = "uWfUgG1yE-FroJRj4JzPsi9DSmefcgIK2MjoMajR";
        axios({
                method: 'GET',
                url: "https://api.uber.com/v1.2/estimates/price?start_latitude=" + geoObj.start.lat + "&start_longitude=" + geoObj.start.lng + "&end_latitude=" + geoObj.end.lat + "&end_longitude=" + geoObj.end.lng,
                headers: {
                    Authorization: "Token " + uber_token
                }
            })
            .then(function(response) {
                resolve(response);
                console.log(response);
            })
            .catch(function(error) {
                reject(error);
            });

    })
}


function initMap(geoObj) {
    var bounds = new google.maps.LatLngBounds;
    var markersArray = [];
    console.log(geoObj);
    var origin2 = geoObj.start.lat + "," + geoObj.start.lng;
    console.log(origin2);

    var destinationA = 'Irvine, California';


    var destinationIcon = 'https://chart.googleapis.com/chart?' +
        'chst=d_map_pin_letter&chld=D|FF0000|000000';
    var originIcon = 'https://chart.googleapis.com/chart?' +
        'chst=d_map_pin_letter&chld=O|FFFF00|000000';
    var map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 34.05, lng: 118.2 },
        zoom: 10
    });
    var geocoder = new google.maps.Geocoder;

    var service = new google.maps.DistanceMatrixService;

    service.getDistanceMatrix({
            origins: [origin2],
            destinations: [destinationA],
            travelMode: 'TRANSIT',
            unitSystem: google.maps.UnitSystem.IMPERIAL,
            avoidHighways: false,
            avoidTolls: false

        },

        function(response, status) {
            if (status !== 'OK') {
                alert('Error was: ' + status);
            } else {
                var originList = response.originAddresses;
                var destinationList = response.destinationAddresses;
                var outputDiv = document.getElementById('output');
                outputDiv.innerHTML = '';
                deleteMarkers(markersArray);
                
                var showGeocodedAddressOnMap = function(asDestination) {
                    var icon = asDestination ? destinationIcon : originIcon;
                    return function(results, status) {
                        if (status === 'OK') {
                            map.fitBounds(bounds.extend(results[0].geometry.location));
                            markersArray.push(new google.maps.Marker({
                                map: map,
                                position: results[0].geometry.location,
                                icon: icon
                            }));
                        } else {
                            alert('Geocode was not successful due to: ' + status);
                        }
                    };
                };

                for (var i = 0; i < originList.length; i++) {
                    var results = response.rows[i].elements;
                    geocoder.geocode({ 'address': originList[i] },
                        showGeocodedAddressOnMap(false));
                    for (var j = 0; j < results.length; j++) {
                        geocoder.geocode({ 'address': destinationList[j] },
                            showGeocodedAddressOnMap(true));
                        outputDiv.innerHTML += originList[i] + ' to ' + destinationList[j] +
                            ': ' + results[j].distance.text + '<br>' + ' Transit: ' +
                            results[j].duration.text + '<br>' + 'Fare: ' + results[j].fare.text;
                        console.log(results);
                    }
                }
            }
        });

}
window.onload = function() {



    function callback(response, status) {
        console.log(response);
    }
    $("#useGeoStart").click(function(event) {
        event.preventDefault();
        console.log("eyy")
        startAddressGeo();
    })
    $("#useGeoEnd").click(function(event) {
        event.preventDefault();
        endAddressGeo();
    })

    $("#submitAddress").click(function(event) {
        //check errors

        event.preventDefault();
        var startAddress = $("#startAddress").val();
        var endAddress = $("#endAddress").val();
        //check errors here
        authenticateLyft()
            .then(function(response) {
                LYFT_TOKEN = response.data.access_token;
                return handleAllGeolocation(startAddress, endAddress)
            })
            .then(function(resp) {
                //get fare stuff here
                console.log(resp);
                getAllFareData(resp)
            })


    });
}

function getAllFareData(geoData) {

    var fareInfo = {}
    getLyftPrices(geoData)
        .then(function(resp) {
            console.log(resp);
            fareInfo.lyft = resp;
            console.log(fareInfo.lyft.data.cost_estimates[1].estimated_cost_cents_min);
            console.log(fareInfo.lyft.data.cost_estimates[1].estimated_duration_seconds);
            $("#lyft").append("<br>" + "Lyft average cost: $" + dollar(fareInfo.lyft.data.cost_estimates[1].estimated_cost_cents_min)+ " dollars");
            $("#lyft").append("<br>" + "Lyft average duration: " + convert(fareInfo.lyft.data.cost_estimates[1].estimated_duration_seconds)+ " minutes");
            return getUberTimeEstimate(geoData);
        })
        .then(function(resp) {
            fareInfo.uber = resp;
            initMap(geoData);
            console.log(fareInfo);
        })
        .catch(function(err) {
            console.error(err);
        })



}

function handleAllGeolocation(startAdr, endAdr) {
    var finalGeoObj = {};
    return new Promise(function(resolve, reject) {
        if (startAdr == "current address" && endAdr == "current address") {
            getLocation()
                .then(function(resp) {
                    finalGeoObj.start = resp;
                    finalGeoObj.end = resp;
                })
                .catch(function(err) {
                    reject(err);
                })

        } else if (startAdr == "current address") {
            getLocation()
                .then(function(resp) {
                    finalGeoObj.start = resp;
                    return addressToGeo(endAdr);
                })
                .then(function(resp) {
                    finalGeoObj.end = resp;
                    resolve(finalGeoObj);
                })
                .catch(function(err) {
                    reject(err);
                })
        } else if (endAdr == "current address") {
            getLocation()
                .then(function(resp) {
                    finalGeoObj.end = resp;
                    return addressToGeo(startAdr);
                })
                .then(function(resp) {
                    finalGeoObj.start = resp;
                    resolve(finalGeoObj);
                })
                .catch(function(err) {
                    reject(err);
                })
        }

    })
}





//calling info from google for public transit
//make sure to "return Promise" as seen above, this is basically making the function "thenable"
// axios({
// 	    url: "https://maps.googleapis.com/maps/api/distancematrix/json?origins=Vancouver+BC|Seattle&destinations=San+Francisco|Victoria+BC&mode=bicycling&language=fr-FR&key=AIzaSyAjPgmTYG8Vy8uKfuoLDqwT70xOijQkiTo",
//         method: 'GET',
//     }).then(function(response) {
//         console.log(response.data);

//      $(".col-md-4 google").append("Google transit duration: " + response.data.rows[0].elements[0].duration.text);

//         console.log(response.data.rows[0].elements[0].duration.text);


//     $(".col-md-4 google").append("Google transit cost: " + response.data.rows[0].elements[0].fare.text);

//         console.log(response.data.rows[0].elements[0].fare.text);
//     })
//     .catch(function(error) {
//         console.error(error);
//     });
