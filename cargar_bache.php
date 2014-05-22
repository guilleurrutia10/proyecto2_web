<?php
echo $_SERVER["QUERY_STRING"];
if (isset($_POST["action"])) { 
  $nombre = $_POST['nombre']; 

  $dbconection = pg_connect('host=localhost dbname=universidad user=postgres password=guillermo') or die('No se ha podido conectar: ' . pg_last_error());

  $query = "INSERT INTO baches (nombre, descripcion, latitud, longitud)
                                VALUES ('".$_POST["nombre"]."', '".$_POST["descripcion"]."', ".$_POST["latitud"].", ".$_POST["longitud"].")";
  $result = pg_query($query) or die('La consulta falló: ' . pg_last_error()); 
  if ($result) { 
    success(array('latitud' =>$_POST['latitud'], 'descripcion' =>$_POST['descripcion'],'longitud' =>$_POST['longitud'], 'nombre' =>$_POST['nombre'])); 
  } else { 
    fail('Failed to add point.'); 
  }

  //Liberando el conjunto de los resultados
  pg_free_result($result);
  //Cerrando la conexion
  pg_close($dbconection);
}
if (isset($_SERVER["QUERY_STRING"])) { 
  $nombre = $_GET["nombre"];

  $dbconection = pg_connect('host=localhost dbname=universidad user=postgres password=guillermo') or die('No se ha podido conectar: ' . pg_last_error());

  //Falta controlar que el bache no se encuentre en la bd.

  $query = 'SELECT nombre FROM baches ';
  $query = "INSERT INTO baches (nombre, descripcion, latitud, longitud)
                                VALUES ('".$_GET["nombre"]."', '".$_GET["descripcion"]."', ".$_GET["latitud"].", ".$_GET["longitud"].")";
  $result = pg_query($query) or die('La consulta falló: ' . pg_last_error()); 

  //echo "\n".json_encode(array('latitud' =>$_GET['latitud'], 'descripcion' =>$_GET['descripcion'],'longitud' =>$_GET['longitud'], 'nombre' =>$_GET['nombre']));  //Liberando el conjunto de los resultados
  pg_free_result($result);
  //Cerrando la conexion
  pg_close($dbconection);
}
else
	echo "No hay POST!";

?>