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

//Referencia al marcador que se eliminará cuando se raelice click derecho.
var idMarcadorAEliminar;


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




//referencia al cluster;
var mycluster=null;
// toolTipMarker initialize
var tooltip = new PNotify({
    title: "Marker",
    text: "Haga click sobre el marcador para editarlo",
    hide: false,
    buttons: {
    closer: false,
    sticker: false
    },
    history: {
    history: false
    },
    animate_speed: 100,
    opacity: .9,
    icon: "ui-icon ui-icon-comment",
    // Setting stack to false causes PNotify to ignore this notice when positioning.
    stack: false,
    auto_display: false
  });
  // Remove the notice if the user mouses over it.
  tooltip.get().mouseout(function() {
    tooltip.remove();
  });

//Se registra el evento click de verBaches
$(function () {
  $("#verBaches").on("click", obtenerBaches);
  $("#exportarBaches").click(exportarBaches);
  $("#cancelarExportacion").click(reestablecerMenuExport);
  //Utilizando Geocomplete
  $("#inputGeoComplete").geocomplete();  // Option 1: Call on element.
  // Se registra el evento click de agregarMarcador
  $('#agregarMarcador').click(agregarMarcador_clcik);
  // Se registra el evento hidden de my-modal
  $('#my-modal').on('hidden.bs.modal',function (e) {
    // Se elimina el contenido al ocultarse el mismo.
    $(this).removeData('modal');
  });
  $('#botonBuscar').click(function (event) {
    onClickBotonBuscar(event, $("#inputGeoComplete").get());
  });
  $('#comentarioSlider').click(clickComentario);
  $('#modalComentario').on('hidden.bs.modal',function (e) {
    // Se elimina el contenido al ocultarse el mismo.
    $(this).removeData('modal');
    $("#cabeceraComentario").children('p').remove();
  });


});

function onClickBotonBuscar(event, elem) {
  $("#map_canvas").gmap3({
    clear:{
      name:"marker",
      tag: ['centrado'],
      all: true
    }
  });
  var dir = $(elem).val();
  $('#map_canvas').gmap3({
    getlatlng:{
        address: dir,
        callback: function(results, status){
          if (status==google.maps.GeocoderStatus.OK){
            var latitud = results[0].geometry.location.lat();
            var longitud = results[0].geometry.location.lng();
            $('#map_canvas').gmap3({
              map: {
                options:{
                  center: [latitud, longitud],
                  zoom: 18 
                }
              },
              marker:{
                latLng: [latitud, longitud],
                options:{
                  icon: "imagenes/direction_down.png"
                },
                tag: ['centrado']
              }
            });
          }else{
            new PNotify({
              title: 'Oh No!',
              text: 'Error al centrar el mapa.',
              type: 'error',
              icon: "ui-icon ui-icon-comment"
            });
          }
        }
    }
  });
  return false;
}

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

    //var encabezado='<tr>'+'<th>Nombre de bache</th>'+'<th>Descripcion</th>'+'<th>Latitud</th>'+'<th> Longitud</th>'+'<th>Calle</th>'+'</tr>';
    var encabezado='<tr>'+'<th>Latitud</th>'+'<th> Longitud</th>'+'<th>Calle</th>'+'</tr>';
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
      //filaCarga='<tr><td></td><td></td><td><center><i id="ic_carga_'+indiceMarkers+'" class="fa fa-spinner fa-spin"></i></center></td><td></td><td></td><td></td></tr>';
      filaCarga='<tr><td></td><td><center><i id="ic_carga_'+indiceMarkers+'" class="fa fa-spinner fa-spin"></i></center></td><td></td><td></td><td></td></tr>';
      $("#tablaElementos").append(filaCarga);
      indiceMarkers=indiceMarkers- 1;
      geocoder.geocode({'latLng': latlng}, function(results, status) {
          indiceMarkers=indiceMarkers + 1;
          //Se remueve el icono de carga añadido anteriormente a la tabla
          var a1="#ic_carga_"+indiceMarkers;
          $($("#tablaElementos").find(a1)).parents("tr").remove();
          if (status == google.maps.GeocoderStatus.OK) {
            if (results[0]) {
              // var fila='<tr>'+'<td>'+ $(elem).attr("nombre") +'</td>'+'<td>'+ $(elem).attr("descripcion") +'</td>'+'<td>'+ $(elem).attr("latitud") +'</td>'+'<td>'+ $(elem).attr("latitud") +'</td>'+ '<td>'+ results[0].formatted_address+'</td>'+'</tr>';
              var fila='<tr>'+'<td>'+ $(elem).attr("latitud") +'</td>'+'<td>'+ $(elem).attr("latitud") +'</td>'+ '<td>'+ results[0].formatted_address+'</td>'+'</tr>';
               $("#tablaElementos").append($(fila));
               direcciones[i]=results[0].formatted_address;
            } else {
             // var fila='<tr>'+'<td>'+ $(elem).attr("nombre") +'</td>'+'<td>'+ $(elem).attr("descripcion") +'</td>'+'<td>'+ $(elem).attr("latitud") +'</td>'+'<td>'+ $(elem).attr("latitud") +'</td>'+ '<td>'+ "Direccion no disponible"+'</td>'+'</tr>';
              var fila='<tr>'+'<td>'+ $(elem).attr("latitud") +'</td>'+'<td>'+ $(elem).attr("latitud") +'</td>'+ '<td>'+ "Direccion no disponible"+'</td>'+'</tr>';
              $("#tablaElementos").append($(fila));              
              direcciones[i]="Direccion no disponible";
              //  alert('No se encontraron resultados para la direccion');
            }
          } else {            
           // var fila='<tr>'+'<td>'+ $(elem).attr("nombre") +'</td>'+'<td>'+ $(elem).attr("descripcion") +'</td>'+'<td>'+ $(elem).attr("latitud") +'</td>'+'<td>'+ $(elem).attr("latitud") +'</td>'+ '<td>'+ "Direccion no disponible"+'</td>'+'</tr>';
           var fila='<tr>'+'<td>'+ $(elem).attr("latitud") +'</td>'+'<td>'+ $(elem).attr("latitud") +'</td>'+ '<td>'+ "Direccion no disponible"+'</td>'+'</tr>';
            $("#tablaElementos").append($(fila));
            direcciones[i]="Direccion no disponible";
            //alert('El Geocoder fallo debeido al error: ' + status);
          }
      });      
    });
    //Se asocia el evento de click con un guardarJSON.php que escribe un archivo aleatorio
    //en el disco del server y redige al cliente hacia el JSON
   $("#guardarJSON").click(function(e){
      if($($("#tablaElementos").find("tr i")).size()==0){ //Si se cargaron todos los elementos en la tabla 
                                                          //se habilita la descarga de los marcadores cargados en el mapa en formato JSON
        //Se crea el objeto JSON para uno de los marcadores seleccionados
        var objetoJSON=[];
        $.each(marcadoresAExportar,function(i,elem){
          objetoJSON[i]= { "latitud" : $(elem).attr("latitud"), "longitud" :$(elem).attr("longitud") ,"direccion": direcciones[i] };
          //objetoJSON[i]= { "nombre": $(elem).attr("nombre"), "descripcion" : $(elem).attr("descripcion"), "latitud" : $(elem).attr("latitud"), "longitud" :$(elem).attr("longitud") ,"direccion": direcciones[i] };
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
      }
   }
  });
  map = $('#map_canvas').gmap3('get');   //map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

  //Se añade el menu para eliminar los baches del mapa
  menuMapa=new Gmap3Menu($("#map_canvas"));
  menuMapa.add('<img src="imagenes/cancel_icono.png" width="19px" hspace="8" />Borrar bache', "opcionesMenu", 
  function(){
     borrarMarcador();
    //Se selecciona el marcador seleccioando
    //Se cierra el menu
    menuMapa.close();
  });
  $('#map_canvas').gmap3({
    marker:{
      values: [myLatlng],
      data: 'Plaza Independencia',
      tag: ['centrado'],
      events:{
            rightclick:function(marker,event,context){
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
              mp.setZoom(mp.getZoom() + 1);
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
  drawingManager.setMap(m);
  //Se registra el listener para el evento de finalizacion de dibujado del rectangulo
  google.maps.event.addListener(drawingManager, 'rectanglecomplete', function(rectangle) {
      //Se desdibuja el rectangulo creado anteriormente
      //alert("Se ha terminado de dibujar el rectangulo");
      //Se obtienen los marcadores que estan contenidos en el area del rectangulo
      var limites=rectangle.getBounds();
      var marcadoresAExportar=[];
      $.each(marcadores,function(i, elem){
          //Se compara si cada uno de los marcadores esta dentro de los limites del elemento
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

  //Se inicializa el consultor direccion a latlng y latlong a direccion
  geocoder = new google.maps.Geocoder();

  $("#inputGeoComplete").geocomplete({
    map: map
  });

  //Se inicializa la opcion para detectar la ubicacion actual con el mapa
  $('#verUbicacionAct').click(detectarUbicacionAct);
}

function agregarMarcador_clcik(event) {
  // Función que es llamada al hacer click sobre la opción agregarMarcador
  // de la opción agregarMarcador. Baches->agregar.
  $('#my-modal .modal-content').load('document/formularito.html', function () {
    $('#my-modal').find('#direccion').on('blur', function (event) {
      obtenerLatLng($(this).val(), function(results, status){
          if (status==google.maps.GeocoderStatus.OK){
            var latitud = results[0].geometry.location.lat();
            var longitud = results[0].geometry.location.lng();
            $('#my-modal #latitud').val(latitud);
            $('#my-modal #longitud').val(longitud);
            $('#my-modal #latitud').attr({'readOnly':true});
            $('#my-modal #longitud').attr({'readOnly':true});
          }
      });
    });
    //Utilizando Geocomplete en el input ingresar dirección.
    $('#my-modal').find('#direccion').geocomplete();
    $('#my-modal').find('#direccion').geocomplete({
      map: $('#map_canvas').gmap3('get')
    });
    $('#my-modal').find('#direccion').focus();
    $('#my-modal').find('.form-horizontal').submit(function (event) {
      $('#my-modal').modal('hide');
      return false;
    });
    $('#my-modal').find('.form-horizontal').find('#cancelarBache').click(function (event) {
      $('#my-modal').modal('hide');
      return false;
    });
    $('#my-modal').find('.form-horizontal').find('#aceptarBache').click(function (event) {
      // Se debería deja a registrar la responsabilidad de crear el marcador y
      // agregar el marcador al mapa.
      //crearMarcador();
      // if (registrarBache($('#my-modal').get())==true)
      // {
      //   add_marker([
      //       $('#my-modal').find('#latitud').val(),
      //       $('#my-modal').find('#longitud').val()
      //     ]);
      // }
      registrarBache($('#my-modal').get());
      $('#my-modal').modal('hide');
      return false;
    });
  });
  $('#my-modal').modal('show');
}

function obtenerLatLng (address, func) {
  // func: función que se ejecutará como respuesta al pedido
  // AJAX de Geocoding. 
  // Prototipo: funcion (resultado, status)
  $('#map_canvas').gmap3({
    getlatlng:{
        address: address,
        callback: func
    }
  });
}


function add_marker (latLng,tag) {
  $('#map_canvas').gmap3({
    marker: {
      latLng: latLng, 
      id: tag,
      //BACKUP
      //latLng: latLng,
      events: {
        click: function (marker, event, context) {
          marcadorSeleccionado = marker;
          mostrarAgregarComentarios(marcadorSeleccionado);
          //mostrarModalMarcador();
        },
        mouseover: function (marker, event, context) {
          var pos= marker.getPosition();
          var point= $("#map_canvas").gmap3("get").getProjection().fromLatLngToPoint(pos);
          tooltip.get().css({
            'position': 'absolute',
            'top': point.y + 200,
            'left': point.x + 50
          });
          tooltip.open();
        },
        mouseout: function () {
          tooltip.remove();
        },
        rightclick:function(marker,event,context){
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
}




function obtenerDireccion (latLng, func) {
  // func: función que se ejecutará como respuesta al pedido
  // AJAX de Geocoding. 
  // Prototipo: funcion (resultado, status)
  $('#map_canvas').gmap3({
    getaddress:{
        latLng: latLng,
        callback: func
    }
  });
}

function agregarMarcador (map, event) {
  //Si se esta exportando un marcador se llama a al funcion de dibujar rectangulo
  if(seEstaExportando){
    dibujarRect(event);
    return; 
  }
  $('#my-modal .modal-content').load('document/formularito.html', function () {
    $('#my-modal').find('#cancelarBache').on('click', function () {
      $('#my-modal').modal('hide');
      new PNotify({
        title: 'Oh No!',
        text: 'Se canceló la edición del bache.',
        type: 'error'
      });
      return false;
    });
    $('#my-modal').find('.form-horizontal').submit(function (event) {
      $('#my-modal').modal('hide');
      return false;
    });
    obtenerDireccion(event.latLng, function (results, status) {
      // La función se ejecuta como respuesta al pedido por AJAX.
      if (status==google.maps.GeocoderStatus.OK){
        debugger;
        $('#my-modal #direccion').val(results[0].formatted_address);
      }
    });
    $('#my-modal #latitud').val(event.latLng.k);
    $('#my-modal #longitud').val(event.latLng.A);
    $('#my-modal #aceptarBache').on('click', function () {
      // if (registrarBache($('#my-modal').get())==true)
      //   add_marker(event.latLng);
      registrarBache($('#my-modal').get());
      $('#my-modal').modal('hide');
      return false;
    });
    $('#my-modal').modal('show');
  });
}
  
function clickComentario(event) {
  $('#formComentario').slideToggle();
}


function agregarComentarios (elementoDOM) {
  var id = buscarBache(marcadorSeleccionado.getPosition());
  var idJSON={ "id": id };
  $.ajax({
      type:'GET',
      url: 'obtener_comentario.php',
      data: idJSON,
      success: function  (respuesta) {
        var respJSON= JSON.parse(respuesta);
        if(respJSON!=undefined){
          $(elementoDOM).empty();
          $.each(respJSON,function(i,elem){
              $(elementoDOM).append(' <div contenteditable="true" class="jumbotron-special"><p style="text-align: center !important;color:#FFFFFF;"> '+ elem.descripcion+'</p> </div>');
          });
        }else{
            new PNotify({
              title: 'ERROR',
              text: 'Error al registrar el comentario en la base de datos',
              type: 'error'
            });   
        }
        $("#cabeceraComentario").append('<p style="text-align: center !important;color:#000000;"> '+ id+'</p> </div>');
        // if(respJSON.estado=="OK"){
        //   $(elementoDOM).append();         
        // }else{
        //   new PNotify({
        //     title: 'ERROR',
        //     text: 'Error al registrar el comentario en la base de datos',
        //     type: 'error'
        //   });   
        // }
      }
    });
}


function mostrarAgregarComentarios(marcador) {
  //BACKUP
  // $('#modalComentario').find('.modal-body').load('document/comentarios.html', function () {
  // });

  agregarComentarios('#modalComentario .modal-body');

  $('#modalComentario').modal('show');
  
  $('#enviarBache').click(function (argument) {
    debugger;
    var id = buscarBache(marcadorSeleccionado.getPosition());
    if (id==null)
    {
      new PNotify({
        title: 'Error',
        text: 'Error al buscar el identificador del bache' + marcadorSeleccionado.getPosition(),
        type: 'error'
      });
      return;
    }
    new PNotify({
      title: 'OK',
      text: 'Identificador del bache' + id,
      type: 'success'
    });
    var comentario = {'id': id, 'descripcion': $('#descripcionBache').val()};
    $.ajax({
      type:'GET',
      url: 'cargar_comentario.php',
      data: comentario,
      success: function  (respuesta) {
        var respJSON= JSON.parse(respuesta);
        if(respJSON.estado=="OK"){
           new PNotify({
            title: 'OK',
            text: 'Se ha registrado el comentario correctamente',
            type: 'success'
          });
          $("#modalComentario").modal('hide'); 
        }else{
          new PNotify({
            title: 'ERROR',
            text: 'Error al registrar el comentario en la base de datos',
            type: 'error'
          });   
        }
      }
    });
  });
  // $.ajax({
  //   type:'GET',
  //   url: 'cargar_comentario.php',
  //   data: unArray[0],
  //   success: function (data) {
  //     debugger;
  //     new PNotify({
  //       title: 'OK',
  //       text: 'Se agregó el comentario exitosamente: ' + data,
  //       type: 'success'
  //     });
  //   }
  // }).done(function(data) {
  //   //$('#my-modal').modal('hide');
  //   //$('#small-modal').find('.modal-content').append(alertHtml);
  //   //$('#small-modal').modal('show');
  // }).fail(function() {
  //   new PNotify({
  //           title: 'Error',
  //           text: 'No se pudo agregar el comentario',
  //           type: 'error'
  //         });
  //   return false;
  // }).always(function() {
  //   //alert( "complete" );
  // });

}




function obtenerBaches () {
  // fire off the request to localhost/my_examples/obtener_bache.php
  $.get( "obtener_bache.php", function( data ) {
    var lista_marcadores = JSON.parse(data);
    lista_marcadores.forEach(agregarMarcadores);
  });

}

//Agregar marcadores del servidor
function agregarMarcadores (marcador) { 
  debugger;
  var claves = [];
  for (var key in marcadores)
  {
    claves.push(key);
  }
  //Verificamos si ya existe el marcador obtenido de la bd en la lista
  //que mantiene el cliente se sus marcadores.
  var result = $.inArray(marcador.id, claves);
  //var result = $.inArray(parseInt(marcador.id), claves);
  if (result>=0)
    return;


  add_marker([marcador.latitud, marcador.longitud],marcador.id);
  //BACKUP
  //add_marker([marcador.latitud, marcador.longitud]);
  marcadores[marcador.id] = marcador;
}



function registrarBache (dialog) {
  var datos = {};
  //Se obtiene del objeto Marcador
  //datos['nombre'] =   $('#my-modal').find('.modal-content').find('#titulo').val();
  //datos['descripcion'] =$('#my-modal').find('.modal-content').find('#descripcion').val();
  datos['latitud']  = $(dialog).find('#latitud').val();
  datos['longitud'] = $(dialog).find('#longitud').val();
  datos['altura'] = $(dialog).find('#altura').val();
  datos['criticidad'] = $(dialog).find('#criticidad').val();
  var direccion = $(dialog).find('#direccion').val();
  var dir_split = direccion.split(' ');
  datos['calle'] = dir_split[0];

  var unArray = $.makeArray(datos);
  //Se envian los datos por ajax
  $.ajax({
    type:'GET',
    //url: '/my_examples/cargar_bache.php',
    url: 'cargar_bache.php',
    data: unArray[0],
    success: function (marcador) {
      var data = JSON.parse(marcador);
      new PNotify({
        title: 'OK',
        text: 'Se agregó el marcador exitosamente: ' + data.latitud + ', ' +data.longitud ,
        type: 'success'
      });
      add_marker([data.latitud, data.longitud], data.id);
      marcadores[data.id] = data;
    }
  }).done(function(data) {
    //$('#my-modal').modal('hide');
    //$('#small-modal').find('.modal-content').append(alertHtml);
    //$('#small-modal').modal('show');
  }).fail(function() {
    new PNotify({
            title: 'Error',
            text: 'No se pudo agregar el marcador',
            type: 'error'
          });
    return false;
  }).always(function() {
    //alert( "complete" );
  });

  return true;
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
  //if(navigator.geolocation) {
    $('#map_canvas').gmap3({
      getgeoloc:{
        callback: function(latLng){
            if(latLng){
                $(this).gmap3({
                    marker:{
                      latLng: latLng,
                      tag: ['centrado'],
                      options:{
                          icon: "imagenes/you-are-here-2.png"
                      }
                    },
                    map:{
                      options:{
                        zoom: 18,
                        center: latLng                    
                      }
                    }
                });
            }else{
              new PNotify({
                title: 'Error',
                text: 'Tu navegador no soporta la geolicacion para detectar tu ubicación actual :-(',
                type: 'error'
              });        
            }
        }
      }
    });
    // navigator.geolocation.getCurrentPosition(function(position) {
      // var ubicacionAct = [position.coords.latitude,position.coords.longitude];
      // debugger;
      // $('#map_canvas').gmap3({
      //         map: {
      //           options:{
      //             center: [latitud, longitud],
      //             zoom: 18 
      //           }
      //         },
      //         marker:{
      //           latLng: [latitud, longitud],
      //           options:{
      //             icon: "imagenes/direction_down.png"
      //           },
      //           tag: ['centrado']
      //         }
      // });
    // });//FIn de getcurrentPositionHandler
      // var marker = new google.maps.Marker({
      //     posicionsition: ubicacionAct,
      //     map: map,
      //     title: 'Mi posicion actual'
      // });
      // marker.setMap(map);
      //   map.setCenter(ubicacionAct);
      // });
  // }else {// Browser doesn't support Geolocation
  //  new PNotify({
  //             title: 'Error',
  //             text: 'Tu navegador no soporta la geolicacion para detectar tu ubicación actual :-(',
  //             type: 'error'
  //     });        
  // }


} 

//Este metodo borra los marcadores tanto del mapa en el webbrowser, como en la base de datos!
function borrarMarcador(){
  debugger;
  //Se borra el contenido de cluster y se actualiza
  // mycluster.clear();
  // //Se actualiza la lista del marcadores (vaciando el diccionario de marcadores) con los marcadores traidos desde el servidor
  // //añadiendo de nuevo la lista de marcadores actualizados desde el servidor
  // marcadores={};
  // obtenerBaches();

  // //Se borra el marcador del mapa y de la coleccion de marcadores
  // //mantenida en el navegador
  marcadorSeleccionado.setMap(null);
  delete marcadores[idMarcadorAEliminar];
  $.get( "borrarBache.php", { "idbache": idMarcadorAEliminar} ,function(data) { 
    var rta= JSON.parse(data);
    if(rta.estado=="BORRADO_FALLO"){
      new PNotify({
        title: 'Error en el borrado del bache',
        text: 'Ocurrio un error al borrar el bache de la base de datos',
        type: 'error'
      });  
    }else{
      new PNotify({
              title: 'Ok',
              text: 'Se eliminó el marcador exitósamente.',
              type: 'success'
      });
      mycluster.clearById(idMarcadorAEliminar);
      //ejemplo
      //mycluster.clearById("19");
    }
  });
  // debugger;
  //Se actualiza la coleccion de marcadores añadidos a la funcion de clustering
  // mycluster.clear();
  // $.each(marcadores,function(i,elem){
  //     debugger;
  //     add_marker(elem.latitud,elem.longitud]);
  // });
}

function buscarBache (pos) {
  var id = null;
  $.each(marcadores,function(i,elem){
    if(elem.latitud==String(pos.lat()) && elem.longitud==String(pos.lng())){
          id=elem.id;
    }
  });
  return id;
}