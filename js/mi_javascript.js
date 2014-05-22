$(function(){
  $(".dropdown-menu > li > a.trigger").on("click",function(e){
    var current=$(this).next();
    var grandparent=$(this).parent().parent();
    if($(this).hasClass('left-caret')||$(this).hasClass('right-caret'))
     $(this).toggleClass('right-caret left-caret');
    grandparent.find('.left-caret').not(this).toggleClass('right-caret left-caret');
    grandparent.find(".sub-menu:visible").not(current).hide();
    current.toggle();
    e.stopPropagation();
  });
  $(".dropdown-menu > li > a:not(.trigger)").on("click",function(){
    var root=$(this).closest('.dropdown');
    root.find('.left-caret').toggleClass('right-caret left-caret');
    root.find('.sub-menu:visible').hide();
  });
});


var geocoder;
var map;
var marcadores=[];
var marcadorSeleccionado;
//Se registra el evento click de verBaches
$(function () {
  $("#verBaches").on("click", obtenerBaches);
  //Se detecta la ubicacion actual
  detectarUbicacionAct();
  $("#eliminarMarcador").click(borrarMarcador);
  //mostrarModal(); 
  $("#inputGeoComplete").geocomplete();  // Option 1: Call on element.
  $.fn.geocomplete("#inputGeoComplete"); // Option 2: Pass element as argument.
});


var formularioString='<form id="add-point" method="post" onsubmit= "return registrarBache(this)">'+
                        '<div class="form-mapa">'+
                          '<label for="nombreBache">Nombre</label>'+
                          '<input type="text" class="form-control" id="nombre" placeholder="Ingrese nombre del bache"/>'+

                          '<label for="descripcion">Descripcion</label>'+
                          '<input type="text" class="form-control" id="descripcion" placeholder="Ingrese descripcion"/>'+
                          '<label for="latitud">Latitud</label>'+
                          '<input type="text" class="form-control" id="latitud" placeholder="Ingrese latitud"/>'+

                          '<label for="longitud">Longitud</label>'+
                          '<input type="text" class="form-control" id="longitud" placeholder="Ingrese longitud"/>'+

                          '<label for="calle">Dirección</label>'+
                          '<input type="text" class="form-control" id="direccion" placeholder="Ingrese la dirección"/>'+
                        '</div>'+
                        '<button type="submit" class="btn btn-default">Enviar</button>'+
                    '</form>';


function initialize() {
  var myLatlng = new google.maps.LatLng(-43.25333333, -65.30944);
  mapOptions = {
    zoom: 16,
    center: myLatlng,
    streetViewControl: true,
    //mapTypeId: google.maps.MapTypeId.HYBRID
    mapTypeId: google.maps.MapTypeId.ROADMAP
  }
  map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
  var marker = new google.maps.Marker({
      position: myLatlng,
      map: map,
      title: 'Alberto J. Armando'
  });
  var infowindow = new google.maps.InfoWindow({
        //content: 'La Bombonera'
        content: marker.title
    });
  google.maps.event.addListener(marker, 'rightclick', function() {
      infowindow.open(map,marker);
      });
  //Se inicializa el consultor direccion a latlng y latlong a direccion
  geocoder = new google.maps.Geocoder();

  google.maps.event.addListener(marker, 'click', function () {
    // body...
    marcadorSeleccionado = marker;
    mostrarModalMarcador();
  });

  //Placing position 
  google.maps.event.addListener(map, 'click', function(event) {
    agregarMarcador(event.latLng);
    alert(event.latLng);
  });

  $("#inputGeoComplete").geocomplete({
    map: map
  });
}

function agregarMarcador (latLng) {
  alert(latLng);
  var marker = new google.maps.Marker({
       position: latLng,
       map: map,
       title: 'Nuevo'
   });
  var infowindow = new google.maps.InfoWindow({
        content: marker.title
    });
  google.maps.event.addListener(marker, 'rightclick', function() {
      infowindow.open(map,marker);
      });
  google.maps.event.addListener(marker, 'click', function () {
    marcadorSeleccionado = marker;
    mostrarModalMarcador();
  });
}

function mostrarModal () {
  //$('.modal-content').append(formularioString);
  // $('.modal-content').load('document/formulario_ingresar_bache.html');
  // $('#my-modal').modal('show');
  // $('#my-modal').on('hidden.bs.modal',function (e) {
  //   $('.modal-content').remove();
  // });
  $('#small-modal').find('.modal-content').append(alertHtml);
  $('#small-modal').modal('show');
  $('#small-modal').on('hidden.bs.modal',function (e) {
    $('#small-modal').find('.row clearfix').remove();
  });
}

function mostrarModalMarcador() {
  //$('.modal-content').append(formularioString);
  $('#my-modal').find('.modal-content').load('document/formulario_ingresar_bache.html', function () {
    $('#my-modal').find('#cancelarBache').on('click', function () {
      $('#my-modal').modal('hide');
    });
    $('#my-modal').find('#aceptarBache').on('click', registrarBache);
  });
  
  geocoder.geocode({'location':marcadorSeleccionado.position}, function (results, status) {
    if (status == google.maps.GeocoderStatus.OK) 
    {
      var latLng = results[0].geometry.location;
      var longitude = results[0].geometry.location.lng;
      var address = results[0].formatted_address;
      debugger;
      $('#my-modal').find('.modal-content').find('#latitud').val(marcadorSeleccionado.position.k);
      $('#my-modal').find('.modal-content').find('#latitud').attr({'readOnly':true});
      $('#my-modal').find('.modal-content').find('#longitud').val(marcadorSeleccionado.position.A);
      $('#my-modal').find('.modal-content').find('#longitud').attr({'readOnly':true});
      //alert(address);
      $('#my-modal').find('.modal-content').find('#direccion').val(address);
      $('#my-modal').find('.modal-content').find('#direccion').attr({'readOnly':true});
      $('#my-modal').modal('show');
    } 
    else 
    {
      //Ver intentar volver a consultar la direccion.
      result = "Unable to find address: " + status;
      alert('result');
    }
  });
  $('#my-modal').on('hidden.bs.modal',function (e) {
    $('#my-modal').find('.form-horizontal').remove();
  });
}

function obtenerBaches () {
  // fire off the request to localhost/my_examples/obtener_bache.php
  $.get( "/my_examples/obtener_bache.php", function( data ) {
    var lista_marcadores = JSON.parse(data);
    //alert(lista_marcadores);
    lista_marcadores.forEach(agregarMarcadores);
  });
}

function agregarMarcadores (marcador) { 

  var claves = [];
  marcadores.forEach(function (mark, key) {
    claves.push(key);
  });
  //Verificamos si ya existe el marcador obtenido de la bd en la lista
  //que mantiene el cliente se sus marcadores.
  var result = $.inArray(parseInt(marcador.id), claves);
  if (result>=0)
    return;

  var latLng = new google.maps.LatLng(marcador.latitud, marcador.longitud);
  var marker = new google.maps.Marker({
       position: latLng,
       map: map,
       title: marcador.nombre
   });
  var infowindow = new google.maps.InfoWindow({
        content: marcador.nombre
    });
  google.maps.event.addListener(marker, 'click', function () {
    // body...
    marcadorSeleccionado = marker;
    mostrarModalMarcador();
  });
  google.maps.event.addListener(marker, 'rightclick', function() {
      infowindow.open(map,marker);
      });
  marcadores[marcador.id] = marker;
}

var alertHtml =''+ 
      '<div class="alert alert-success alert-dismissable">'+
         '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>'+
        '<h4>'+
          '<i class="fa fa-check-circle-o"></i> Alert!'+
        '</h4> <strong>Succes!!</strong> El marcador ha sido enviado con éxito. <a href="#" class="alert-link">alert link</a>'+
      '</div>'

function registrarBache (dialog) {
  //alert(marcadorSeleccionado.title + ' Long: ' + $(dialog).find('#longitud').val());
  var datos = {};
  //Se obtiene del objeto Marcador
  datos['nombre'] = $(dialog).find('#titulo').val();
  datos['descripcion'] = $(dialog).find('#descripcion').val();
  datos['latitud'] = $(dialog).find('#latitud').val();
  datos['longitud'] = $(dialog).find('#longitud').val();
  var unArray = $.makeArray(datos);
  //Se envian los datos por ajax
  $.ajax({
    type:'GET',
    url: '/my_examples/cargar_bache.php',
    data: unArray[0],
    succes: function (data) {
      // body...
      alert('Se agregó el marcador exitosamente: ' + data);
    }
  }).done(function(data) {
    $('#my-modal').modal('hide');
    debugger;
    $('#small-modal').find('.modal-content').append(alertHtml);
    $('#small-modal').on('hidden.bs.modal', function () {
       $('#small-modal').find('.alert').remove();
     });
    $('#small-modal').modal('show');
  }).fail(function() {
    alert( "error" );
  }).always(function() {
    //alert( "complete" );
  });

  return false;
}

function Marcador () {
  // body...
  //this.idMarcador;
  this.latitud;
  this.longitud;
  this.nombre;
  this.descripcion;
  //Marker de la Api
}

function detectarUbicacionAct(){
  //apoximacion de la W3C para la deteccion de la ubicación
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var ubicacionAct = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
      var marker = new google.maps.Marker({
          position: ubicacionAct,
          map: map,
          title: 'Mi posicion actual'
      });
      marker.setMap(map);
        map.setCenter(ubicacionAct);
      });
  }else {// Browser doesn't support Geolocation
    alert("Tu navegador no soporta la geolicacion para detectar tu ubicación actual");
  }
} 

function borrarMarcador(){
  marcadorSeleccionado.setMap(null);
  $.each(marcadores,function(i,marcador){
    var index= marcadores.indexOf(marcadorSeleccionado);
    if(index > -1){
       marcadores.splice(index, 1);
    }
  });
}