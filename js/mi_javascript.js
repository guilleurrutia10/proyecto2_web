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




function iniciarDrawingManager(){
  // var mapOptions = {
  //   center: new google.maps.LatLng(-43.25333333, -65.30944),
  //   zoom: 16
  // };
  // //var mapaDWM = new google.maps.Map(new google.maps.Map(document.getElementById('map_canvas'),mapOptions));
  //   var mapaDWM = new google.maps.Map(document.getElementById('map_canvas'),
  //    mapOptions);
  // var drawingManager = new google.maps.drawing.DrawingManager({
  //   drawingMode: google.maps.drawing.OverlayType.MARKER,
  //   drawingControl: true,
  //   drawingControlOptions: {
  //     position: google.maps.ControlPosition.TOP_CENTER,
  //     drawingModes: [
  //       google.maps.drawing.OverlayType.RECTANGLE
  //     ]
  //   }
  // });
  // //drawingManager.setMap(mapaDWM);
  // drawingManager.setMap(document.getElementById('map_canvas'));

}


//Variables globales
var seEstaExportando=false;

//Metodo que es llamado cuando se determina qeu se debe 
//dibujar un rectangulo en el mapa
function dibujarRect(event){
 $("#map_canvas").gmap3({
  rectangle:{
    options:{
      fillColor : "#F4AFFF",
      strokeColor : "#CB53DF",
      clickable: true,
      map: map
    },
    events:{
      dragend: function(rectangle){
        rectangle.setOptions({
          fillColor : "#FFAF9F",
          strokeColor : "#FF512F",  
          bounds: {n:40.780, e:-73.932, s:40.742, w:-73.967}
        });
      }
    },
    callback: function(){
      $(this).gmap3('get').setZoom(16);
    }
  }
});
}


//Variable empleada para almacenar la referencia  a la herramienta de dibujo
var drawingManager;
//Funcion de modificacion del boton de expotracion de baches
function exportarBaches(){
  //debugger;
  //Se reestablece el icono de la estrella
  var icono= $("#exportarBaches").children("i");
  $(icono).attr("class","glyphicon glyphicon-star-empty");

  if(seEstaExportando==false){
      seEstaExportando=true;
      $("#exportarBaches").text("Cancelar exportacion"); 
      //Se añade antes del texto el icono
      $("#exportarBaches").prepend(icono);
      //Se establece la herramienta de dibujo de rectangulos
      drawingManager.setDrawingMode(google.maps.drawing.OverlayType.RECTANGLE);
  }else{
      seEstaExportando=false;
      $("#exportarBaches").text("Exportar baches");     
      //Se añade antes del texto el icono
      $("#exportarBaches").prepend(icono);
      drawingManager.setDrawingMode(null);    
  }
}


var geocoder;
var map;
//var marcadores=[];
var marcadores={};
var marcadorSeleccionado;


//Referencia al marcador que se eliminará cuando se raelice click derecho.
var idMarcadorAEliminar;

//referencia al cluster;
var mycluster=null;

//Se registra el evento click de verBaches
$(function () {
  $("#verBaches").on("click", obtenerBaches);
  $("#exportarBaches").click(exportarBaches);
  $("#cancelarExportacion").click(reestablecerMenuExport);
  //Se detecta la ubicacion actual
  detectarUbicacionAct();


  //TODO: Descomentar esto si no funciona
  //$("#eliminarMarcador").click(borrarMarcador);


  //mostrarModal(); 
  //Utilizando Geocomplete
   $("#inputGeoComplete").geocomplete();  // Option 1: Call on element.
   //$.fn.geocomplete("#inputGeoComplete"); // Option 2: Pass element as argument.
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



//Metodo utilizado para restablecer la opcion de exportar marcadores de la navbar
function reestablecerMenuExport(){
    // debugger;
    seEstaExportando=false;
    var icono= $("#exportarBaches").children("i");
    $("#exportarBaches").text("Exportar baches");     
    //Se añade antes del texto el icono
    $("#exportarBaches").prepend(icono);
    drawingManager.setDrawingMode(null);    
}


//Funcion utilizada para mostrar el modal y la tabla con los elementos
function mostrarDialogoExportMark(marcadoresAExportar){
    //Se cargan los marcadores en el Modal
    $('#modalRodrigo').modal('show');
    //Se vacia la tabla con los elementos anteriores
    $("#tablaElementos").empty();

    var encabezado='<tr>'+'<th>Nombre de bache</th>'+'<th>Descripcion</th>'+'<th>Latitud</th>'+'<th> Longitud</th>'+'<th>Calle</th>'+'</tr>';
    $("#tablaElementos").append($(encabezado));

    //Se utiliza para almacenar las direcciones correspondientes a los marcadores seleccionados
    var direcciones=[];
    // var filasTabla=[];
    //var cantPeticiones=0;


    //Se emplea indiceMarkers para generar identificadores de los spinners y, para luego
    //eliminarlos de la tabla y reemplazarlos por las tablas   
    var indiceMarkers=marcadoresAExportar.length;
    //Se añaden los marcadores al modal de boostrap
    $.each(marcadoresAExportar,function(i,elem){
      
      var lat = parseFloat($(elem).attr("latitud"));
      var lng = parseFloat($(elem).attr("longitud"));
      var latlng = new google.maps.LatLng(lat, lng);
      var geocoder = new google.maps.Geocoder();
      //Se añade a la tabla el icono giratorio  
      filaCarga='<tr><td></td><td></td><td><center><i id="ic_carga_'+indiceMarkers+'" class="fa fa-spinner fa-spin"></i></center></td><td></td><td></td><td></td></tr>';
      $("#tablaElementos").append(filaCarga);
      indiceMarkers=indiceMarkers- 1;
      geocoder.geocode({'latLng': latlng}, function(results, status) {
          debugger;          
          indiceMarkers=indiceMarkers + 1;
          //Se remueve el icono de carga añadido anteriormente a la tabla
          var a1="#ic_carga_"+indiceMarkers;
          $($("#tablaElementos").find(a1)).parents("tr").remove();
          if (status == google.maps.GeocoderStatus.OK) {
            if (results[0]) {
              var fila='<tr>'+'<td>'+ $(elem).attr("nombre") +'</td>'+'<td>'+ $(elem).attr("descripcion") +'</td>'+'<td>'+ $(elem).attr("latitud") +'</td>'+'<td>'+ $(elem).attr("latitud") +'</td>'+ '<td>'+ results[0].formatted_address+'</td>'+'</tr>';
               $("#tablaElementos").append($(fila));
               direcciones[i]=results[0].formatted_address;
            } else {
              var fila='<tr>'+'<td>'+ $(elem).attr("nombre") +'</td>'+'<td>'+ $(elem).attr("descripcion") +'</td>'+'<td>'+ $(elem).attr("latitud") +'</td>'+'<td>'+ $(elem).attr("latitud") +'</td>'+ '<td>'+ "Direccion no disponible"+'</td>'+'</tr>';
              $("#tablaElementos").append($(fila));              
              direcciones[i]="Direccion no disponible";
              //  alert('No se encontraron resultados para la direccion');
            }
          } else {            
            var fila='<tr>'+'<td>'+ $(elem).attr("nombre") +'</td>'+'<td>'+ $(elem).attr("descripcion") +'</td>'+'<td>'+ $(elem).attr("latitud") +'</td>'+'<td>'+ $(elem).attr("latitud") +'</td>'+ '<td>'+ "Direccion no disponible"+'</td>'+'</tr>';
            $("#tablaElementos").append($(fila));
            direcciones[i]="Direccion no disponible";
            //alert('El Geocoder fallo debeido al error: ' + status);
          }
      });      
    });
    //Se asocia el evento de click con un guardarJSON.php que escribe un archivo aleatorio
    //en el disco del server y redige al cliente hacia el JSON
   $("#guardarJSON").click(function(e){
    debugger;
      if($($("#tablaElementos").find("tr i")).size()==0){ //Si se cargaron todos los elementos en la tabla 
                                                          //se habilita la descarga de los marcadores cargados en el mapa en formato JSON
        //Se crea el objeto JSON para uno de los marcadores seleccionados
        var objetoJSON=[];
        $.each(marcadoresAExportar,function(i,elem){
          objetoJSON[i]= { "nombre": $(elem).attr("nombre"), "descripcion" : $(elem).attr("descripcion"), "latitud" : $(elem).attr("latitud"), "longitud" :$(elem).attr("longitud") ,"direccion": direcciones[i] };
        });
        //Se emplea un plugin generateFile para genrar un iframe oculto e insertar un form
        //dentro de él, que a su vez esta insertado en el body de la pagina.
        var cad=JSON.stringify(objetoJSON);
        $.generateFile({
            filename  : 'marcadoresJSON.txt',
            content   :  cad,
            script    : 'guardarJSON.php'
        });
        e.preventDefault();
      }     
      });
    }

        // console.log("Datos enviados desde cliente: "+jQuery.param(JSON.stringify(objetoJSON)));
        // $.ajax({
        //     url: "guardarJSON.php",
        //     context: document.body,
        //     data: JSON.stringify(objetoJSON),
        //      type: "POST"

        //     // dataType:"text",
        //     // contents: "application/octet-stream",
        //     // dataType: "text",
        //     // mimeType:"application/octet-stream",
        //     // complete: function(jqxhr,estado){
        //     //     if(estado== "success"){
        //     //       //alert("Estado: "+estado+"jqxhr"+jqxhr.getAllResponseHeaders());
        //     //       //jqxhr.overrideMimeType( "application/octet-stream; charset=x-user-defined" );
        //     //     }
        //     // }
        // // }).done(function() {
        //   //alert("obtenidos");
        // });

        // $("#guardarJSON").attr("formaction","guardarJSON.php");
        // $.post("guardarJSON.php", JSON.stringify(objetoJSON),function(data){
        //    // $(location).attr('href',"https://www.youtube.com");
        //   //window.open("nombreUsr.txt");
        // });
    //});
//}


//Cosas utilizadas para el menu contextual del mapa
var menuMapa;
var eventoBorrarBache;
function initialize() {
  //var myLatlng = new google.maps.LatLng(-43.25333333, -65.30944);
  var myLatlng = [-43.25333333, -65.30944];
  mapOptions = {
    zoom: 16,
    center: myLatlng,
    streetViewControl: true,
    //mapTypeId: google.maps.MapTypeId.HYBRID
    mapTypeId: google.maps.MapTypeId.ROADMAP
  }

  var selectorMap = $('#map_canvas').gmap3({
   map:{
      options:{
       center: myLatlng,
       zoom: 16,
       mapTypeId: google.maps.MapTypeId.ROADMAP,
       mapTypeControl: true,
       mapTypeControlOptions: {
         style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
       },
       navigationControl: true,
       scrollwheel: true,
       streetViewControl: true
      },
       events:{
        click: agregarMarcador
        //BACKUP DEL CODIGO
        //Se asocia el evento de click derecho para cargar el menu
        //   rightclick:function(map, event){
        //       eventoBorrarBache = event;
        //       menuMapa.open(eventoBorrarBache);
        // }
      }
   }
  });
  map = selectorMap[0];   //map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

  //Se añade el menu para eliminar los baches del mapa
  menuMapa=new Gmap3Menu($("#map_canvas"));
  menuMapa.add("Borrar bache", "opcionesMenu", 
  function(){
     borrarMarcador();
    //Se selecciona el marcador seleccioando
    //alert("Se quiso borrar el bache! ");
    //Se cierra el menu
    menuMapa.close();
  });
  $('#map_canvas').gmap3({
    marker:{
      //latLng: myLatlng,
      values: [myLatlng],
      data: 'Plaza Independencia',
      events:{
            rightclick:function(marker,event,context){
              //debugger;
              var m= $("#map_canvas").gmap3("get");
              //Se obtiene la posicion del mapa y se reaiza una transormacion por medio del metodo
              //fromLatLngToPoint() que reotrna un punto con las posiciones X e Y actuales del cursor en pixeles
              var pos= marker.getPosition();
              var point= m.getProjection().fromLatLngToPoint(pos);
              eventoBorrarBache = event;
              marcadorSeleccionado=marker;
             //Se busca idDelMarcador a eliminar dentro de la coleccion, comparando latitud y longitud del marcador seleccionado
              var p=marcadorSeleccionado.getPosition();
              $.each(marcadores,function(i,elem){
                if(elem.latitud==String(p.lat()) && elem.longitud==String(p.lng())){
                      idMarcadorAEliminar=elem.id;
                }
              });
              menuMapa.open(eventoBorrarBache,point.x,point.y);              
            }
      },

      cluster:{ // cuando se crea el primer marker se inicializa el cluster!
        radius: 350,
        maxZoom: 18,
          events:{ // events trigged by clusters 
            mouseover: function(cluster){
              $(cluster.main.getDOMElement()).css("border", "1px solid red");
            },
            mouseout: function(cluster){
              $(cluster.main.getDOMElement()).css("border", "0px");
            },
            click: function(cluster,event,posicion){
              //debugger;
              var pos=posicion.data.latLng;
              var mp=$("#map_canvas").gmap3("get");
              mp.panTo(pos);  
              mp.setZoom(mp.getZoom() + 3);
            }
          },
          0: {
            content: "<div class='cluster cluster-3' ><center>CLUSTER_COUNT</center></div>",
            width: 53,
            height: 52
          },
          20: {
            content: "<div class='cluster cluster-2' ><center>CLUSTER_COUNT</center></div>",
            width: 56,
            height: 55
          },
          50: {
            content: "<div class='cluster cluster-1' ><center>CLUSTER_COUNT</center></div>",
            width: 66,
            height: 65
          }
       },

      callback:function(clust){
        //debugger;
        mycluster=clust;
      }
    }
  });
  drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: google.maps.drawing.OverlayType.MARKER,
    drawingControl: false,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: [
        google.maps.drawing.OverlayType.RECTANGLE
      ]
    }
  });
  //Se establece la herramienta de desplazamiento del mapa por defecto
  drawingManager.setDrawingMode(null);

 //Se obtiene un mapa por medio de un direct GET!
  var m=$("#map_canvas").gmap3("get");
  //debugger;
  drawingManager.setMap(m);
  //Se registra el listener para el evento de finalizacion de dibujado del rectangulo
  google.maps.event.addListener(drawingManager, 'rectanglecomplete', function(rectangle) {
      //Se desdibuja el rectangulo creado anteriormente
      //alert("Se ha terminado de dibujar el rectangulo");
      //Se obtienen los marcadores que estan contenidos en el area del rectangulo
      var limites=rectangle.getBounds();
      var marcadoresAExportar=[];
      //TODO REVISAR ESTO: MARCADORES ¿ARREGLO DE ARREGLO?
      $.each(marcadores[0],function(i, elem){
          //Se compara si cada uno de los marcadores esta dentro de los limites del elemento
          debugger;
          var posicion= new google.maps.LatLng($(elem).attr("latitud"),$(elem).attr("longitud"),true);
          if(limites.contains(posicion) == true){
              marcadoresAExportar.push(elem);
          }
      });
      //Se muestra el dialogo si existen marcadores a exportar
      if(marcadoresAExportar.length >0){
          mostrarDialogoExportMark(marcadoresAExportar);
          //Se desdibuja el rectangulo del mapa
          rectangle.setMap(null);
          var icono= $("#exportarBaches").children("i");
          $(icono).attr("class","glyphicon glyphicon-star-empty");
          $("#exportarBaches").text("Exportar marcadores");
          //Se añade antes del texto el icono
          $("#exportarBaches").prepend(icono);
          seEstaExportando=false;
      }
      rectangle.setMap(null);
});

  // var marker = new google.maps.Marker({
  //     position: myLatlng,
  //     map: map,
  //     title: 'Plaza Independencia'
  // });
  // var infowindow = new google.maps.InfoWindow({
  //       //content: 'La Bombonera'
  //       content: marker.title
  //   });
  // google.maps.event.addListener(marker, 'rightclick', function() {
  //     infowindow.open(map,marker);
  //     });
  //Se inicializa el consultor direccion a latlng y latlong a direccion
  geocoder = new google.maps.Geocoder();

  // google.maps.event.addListener(marker, 'click', function () {
  //   // body...
  //   marcadorSeleccionado = marker;
  //   mostrarModalMarcador();
  // });

  // //Placing position 
  // google.maps.event.addListener(map, 'click', function(event) {
  //   agregarMarcador(event.latLng);
  //   alert(event.latLng);
  // });

  $("#inputGeoComplete").geocomplete({
    map: map
  });
  // //Se añade el menu para eliminar los baches del mapa
  // menuMapa=new Gmap3Menu($("#map_canvas"));
  // menuMapa.add("Borrar bache", "opcionesMenu", 
  // function(){
  //   //Se selecciona el marcador seleccioando
  //   alert("Se quiso borrar el bache! ");
  //   menuMapa.close();
  // });



}



//Agregar marcador del usuario
function agregarMarcador (map, event) {
  //Si se esta exportando un marcador se llama a al funcion de dibujar rectangulo
  if(seEstaExportando){
    dibujarRect(event);
    return; 
  }
  alert(event.latLng);
  $('#map_canvas').gmap3({
    marker: {
      latLng: event.latLng,
      events: {
        click: function (marker, event, context) {
          marcadorSeleccionado = marker;
          mostrarModalMarcador();
          //AGREGADO RODIRGO!!!
          //marcadores.push(marker);
        },
        rightclick:function(marker,event,context){
          //debugger;
          var m= $("#map_canvas").gmap3("get");
          //Se obtiene la posicion del mapa y se reaiza una transormacion por medio del metodo
          //fromLatLngToPoint() que reotrna un punto con las posiciones X e Y actuales del cursor en pixeles
          var pos= marker.getPosition();
          var point= m.getProjection().fromLatLngToPoint(pos);
          eventoBorrarBache = event;
          marcadorSeleccionado=marker;
          //Se busca idDelMarcador a eliminar dentro de la coleccion, comparando latitud y longitud del marcador seleccionado
          var p=marcadorSeleccionado.getPosition();
          $.each(marcadores,function(i,elem){
              debugger;
              if(elem.latitud==String(p.lat()) && elem.longitud==String(p.lng())){
                    idMarcadorAEliminar=elem.id;
              }
          });
          menuMapa.open(eventoBorrarBache,point.x,point.y);              
        }
      },
      cluster: mycluster
    }
   });
  } //FIn de agregarMarcador
  
  // var infowindow = new google.maps.InfoWindow({
  //       content: marker.title
  //   });
  // google.maps.event.addListener(marker, 'rightclick', function() {
  //     infowindow.open(map,marker);
  //     });


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
     // debugger;

     //AÑADIDO PARA PROPOSITOS DE DEBUG
     $('#my-modal').find('.modal-content').find('#titulo').val("Bache de condarco 1100");
     $('#my-modal').find('.modal-content').find('#descripcion').val("bache exageradamente grande");


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


//Variable empleada para mantener la referencia  a los marcadores
// var clusterMarkerer;
// function inicializarClusters(listadoMarcadores){
//   debugger;
//   $.gmap3({
//   action: 'addMarkers',
//   radius: 100,
//   markers: listadoMarcadores,
//   clusters: {
//     10: {
//       content: '<div class="cluster-1">CLUSTER_COUNT</div>',
//       width: 56,
//       height: 55
//     }
//   },
//     callback: function(cl) {
//       clusterMarkerer = cl
//     }
//   });

 //   var marcadoresList= $("#map_canvas").gmap3({ get : { name:"marker" , callback: function(cluster){
 //      cluster;
 //   }
 // }});
   //Crear lista de marcadores en JSON
   // var listadoMarcadoresJSON=[];

   // $("#map_canvas").gmap3({
   //  marker: {
   //    values: marcadoresList,
   //    cluster:{
   //      radius:40,
   //      // This style will be used for clusters with more than 0 markers
   //      0: {
   //        content: "<div class='cluster cluster-1'>CLUSTER_COUNT</div>",
   //        width: 53,
   //        height: 52
   //      },
   //      // This style will be used for clusters with more than 20 markers
   //      20: {
   //        content: "<div class='cluster cluster-2'>CLUSTER_COUNT</div>",
   //        width: 56,
   //        height: 55
   //      },
   //      // This style will be used for clusters with more than 50 markers
   //      50: {
   //        content: "<div class='cluster cluster-3'>CLUSTER_COUNT</div>",
   //        width: 66,
   //        height: 65
   //      }
   //    }
   //  }
   // });


   // console.log("Se inicializo correctamente el cluster con los marcadores!");
   // debugger;
    // var marker=[$(listadoMarcadores[0]).attr("latitud"),$(listadoMarcadores[0]).attr("latitud")];
    // var mapGoogle=$("#map_canvas").gmap3({ get : "map"});
    // clusterMarkerer= new MarkerClusterer(mapGoogle,marker);
// }

function obtenerBaches () {
  // fire off the request to localhost/my_examples/obtener_bache.php
  $.get( "obtener_bache.php", function( data ) {
    debugger;
    var lista_marcadores = JSON.parse(data);
    lista_marcadores.forEach(agregarMarcadores);
  });

}

//Agregar marcadores del servidor
function agregarMarcadores (marcador) { 
  var claves = [];
  for (var key in marcadores)
  {
    claves.push(key);
  }
  // marcadores.forEach(function (mark, key) {
  //   claves.push(key);
  // });
  //Verificamos si ya existe el marcador obtenido de la bd en la lista
  //que mantiene el cliente se sus marcadores.
  var result = $.inArray(marcador.id, claves);
  //var result = $.inArray(parseInt(marcador.id), claves);
  if (result>=0)
    return;

  $('#map_canvas').gmap3({
    marker: {
      latLng: [marcador.latitud, marcador.longitud],
      title: marcador.nombre,
      options: {
        icon: "http://maps.google.com/mapfiles/marker_green.png"
      },
      events: {
        click: function (marker, event, context) {
          marcadorSeleccionado = marker;
          mostrarModalMarcador();
        },
        rightclick:function(marker,event,context){
          var m= $("#map_canvas").gmap3("get");
          //Se obtiene la posicion del mapa y se reaiza una transormacion por medio del metodo
          //fromLatLngToPoint() que reotrna un punto con las posiciones X e Y actuales del cursor en pixeles
          var pos= marker.getPosition();
          var point= m.getProjection().fromLatLngToPoint(pos);
          eventoBorrarBache = event;
          //Se añade el titulo al marcador
          marker.setTitle(marcador.nombre);
          //Se establece el marcador seleccioando que será eliminado
          marcadorSeleccionado=marker;
          //Se busca idDelMarcador a eliminar dentro de la coleccion, comparando latitud y longitud del marcador seleccionado
          //var p=marcadorSeleccionado.getPosition();
              $.each(marcadores,function(i,elem){
                debugger;
                if(elem.latitud==(String(marcadorSeleccionado.getPosition().lat())).slice(0,17) && elem.longitud==(String(marcadorSeleccionado.getPosition().lng())).slice(0,17)){
                      idMarcadorAEliminar=elem.id;
                }
              });
          menuMapa.open(eventoBorrarBache,point.x,point.y);              
        }
      },
      cluster: mycluster
    }
  });
  marcadores[marcador.id] = marcador;
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
  //datos['nombre'] =   $('#my-modal').find('.modal-content').find('#titulo').val();
  datos['descripcion'] =$('#my-modal').find('.modal-content').find('#descripcion').val();
  datos['latitud']  = $('#my-modal').find('.modal-content').find('#latitud').val();
  datos['longitud'] = $('#my-modal').find('.modal-content').find('#longitud').val();


  // datos['nombre'] = $(dialog).find('#titulo').val();
  // datos['descripcion'] = $(dialog).find('#descripcion').val();
  // datos['latitud'] = $(dialog).find('#latitud').val();
  // datos['longitud'] = $(dialog).find('#longitud').val();
  debugger;
  var unArray = $.makeArray(datos);
  //Se envian los datos por ajax
  $.ajax({
    type:'GET',
    //url: '/my_examples/cargar_bache.php',
    url: 'cargar_bache.php',
    data: unArray[0],
    succes: function (data) {
      // body...
      alert('Se agregó el marcador exitosamente: ' + data);
    }
  }).done(function(data) {
    $('#my-modal').modal('hide');
    // debugger;
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
  // if(navigator.geolocation) {
  //   navigator.geolocation.getCurrentPosition(function(position) {
  //     var ubicacionAct = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
  //     var marker = new google.maps.Marker({
  //         position: ubicacionAct,
  //         map: map,
  //         title: 'Mi posicion actual'
  //     });
  //     marker.setMap(map);
  //       map.setCenter(ubicacionAct);
  //     });
  // }else {// Browser doesn't support Geolocation
  //   alert("Tu navegador no soporta la geolicacion para detectar tu ubicación actual");
  // }
} 

//Este metodo borra los marcadores tanto del mapa en el webbrowser, como en la base de datos!
function borrarMarcador(){
  //Se borra el marcador del mapa y de la coleccion de marcadores
  //mantenida en el navegador
  debugger; 
  marcadorSeleccionado.setMap(null);
  delete marcadores[idMarcadorAEliminar];
  /*$.each(marcadores,function(i,marcador){
    var index= marcadores.indexOf(marcadorSeleccionado);
    if(index > -1){
       marcadores.splice(index, 1);
    }
  });*/
  //Se envia un ID existente- en la BD, REEMPLAZAR POR el ID de la variable tipo IdMarcador!
  //var id=13;
  // var pos=marcadorSeleccionado.getPosition();
  // var latitudMark=String(pos.lat());
  // var longitudMark=String(pos.lng());
  //Se realiza una peticion AJAX al servidor para realizar la 
  //var nomb=marcadorSeleccionado.getTitle();



  // $.get( "borrarBache.php", {"latitud" : latitudMark, "longitud": longitudMark} ,function(data) {
  //$.get( "borrarBache.php", {"nombreBache":nomb} ,function(data) { 
  $.get( "borrarBache.php", {"idbache":idMarcadorAEliminar} ,function(data) { 
      alert( "Se borro el bache de la BD");
  });

  //BACKUP de Version anterior de borrar marcador
  //Se envia un ID existente- en la BD, REEMPLAZAR POR el ID de la variable tipo IdMarcador!
  // var id=13;
  // //Se realiza una peticion AJAX al servidor para realizar la 
  // $.get( "borrarBache.php", {"idBache": id } ,function(data) {
  //   alert( "Se borro el bache de la BD");
  // });


}