<?php
//echo $_SERVER["QUERY_STRING"];
require_once('FirePHPCore/FirePHP.class.php');
ob_start();
$firephp = FirePHP::getInstance(true);    
$firephp->log("El query sting recibido es:".$_SERVER["QUERY_STRING"]);

if (isset($_POST["action"])) { 
  $nombre = $_POST['nombre']; 

  $dbconection = pg_connect('host=localhost dbname=basebaches user=adminpepe password=adminpepe') or die('No se ha podido conectar: ' . pg_last_error());


  $query = "INSERT INTO ".'baches'."(descripcion, latitud, longitud)
                                VALUES ( '".$_POST["descripcion"]."', ".$_POST["latitud"].", ".$_POST["longitud"].")";


     
  // $query = "INSERT INTO baches (nombre, descripcion, latitud, longitud)
  // $query = "INSERT INTO ".'baches'."(nombre, descripcion, latitud, longitud)
  //                               VALUES ('".$_POST["nombre"]."', '".$_POST["descripcion"]."', ".$_POST["latitud"].", ".$_POST["longitud"].")";
  $result = pg_query($query) or die('La consulta falló: ' . pg_last_error()); 
  if ($result) { 
    // success(array('latitud' =>$_POST['latitud'], 'descripcion' =>$_POST['descripcion'],'longitud' =>$_POST['longitud'], 'nombre' =>$_POST['nombre'])); 
    success(array('latitud' =>$_POST['latitud'], 'descripcion' =>$_POST['descripcion'],'longitud' =>$_POST['longitud'])); 
  } else { 
    fail('Failed to add point.'); 
  }

  //Liberando el conjunto de los resultados
  pg_free_result($result);
  //Cerrando la conexion
  pg_close($dbconection);
}
if (isset($_SERVER["QUERY_STRING"])) { 
  //$nombre = $_GET["nombre"];

  $dbconection = pg_connect('host=localhost dbname=basebaches user=adminpepe password=adminpepe') or die('No se ha podido conectar: ' . pg_last_error());

  //Falta controlar que el bache no se encuentre en la bd.
  //$query = "SELECT nombre FROM".'baches';
  //$query = "INSERT INTO ".'baches'."( descripcion, latitud, longitud)
  //                              VALUES ( '".$_GET["descripcion"]."', ".$_GET["latitud"].", ".$_GET["longitud"].")";
  $query = "SELECT id FROM criticidad WHERE valor='".$_GET["criticidad"]."'";
  //$firephp->log("La query armada en criticidad es: ".$query);

  $result = pg_query($query) or die('La consulta falló: ' . pg_last_error());
  if(!$result)
  {
    echo "An error occurred.\n";
    exit;
  }
  $array = pg_fetch_array($result, null,PGSQL_ASSOC);
  $id_criticidad = $array["id"];

  $calle=$_GET["calle"];
  $altura=$_GET["altura"];

  //$firephp->log("La calle= ".$calle ."; altura=".$altura."id_criticidad=".$id_criticidad);


  //$query = "SELECT id FROM calle WHERE '$calle'=nombre";
  $query = "INSERT INTO calle (nombre) SELECT '$calle' where NOT EXISTS (SELECT id FROM calle WHERE '$calle'=nombre)";
  //$query = "INSERT INTO calle (nombre) SELECT '$calle' NOT EXISTS (SELECT nombre FROM calle WHERE '$calle'=nombre)";
  $result = pg_query($query) or die('La consulta falló: ' . pg_last_error());
  $query = "SELECT id FROM calle WHERE '$calle'=nombre";
  $result = pg_query($query) or die('La consulta falló: ' . pg_last_error());
  if(!$result)
  {
    echo "An error occurred.\n";
    exit;
  }
  //$result = pg_query($query) or die('La consulta falló: ' . pg_last_error());
  $array = pg_fetch_array($result, null,PGSQL_ASSOC);
  $id_calle = $array["id"];
  //$firephp->log("El resultado despues de obtener la calle como array es: ".$array." y id_calle=".$id_calle);

  $query = "INSERT INTO ".'baches'."( latitud, longitud, altura, id_criticidad, id_calle)
                                VALUES ( ".$_GET["latitud"].", ".$_GET["longitud"].", ".$_GET["altura"].", $id_criticidad, $id_calle)";
  $result = pg_query($query) or die('La consulta falló: ' . pg_last_error()); 
  
  $query = "SELECT * FROM baches WHERE latitud=".$_GET["latitud"]." and longitud=".$_GET["longitud"]." 
            and altura=".$_GET["altura"]." and  id_criticidad=$id_criticidad and id_calle=$id_calle";
  
  $result = pg_query($query) or die('La consulta falló: ' . pg_last_error());

  if ($result) { 
    $row = pg_fetch_array($result, null,PGSQL_ASSOC);
    $firephp->log("La query final para insertar el bache fue: ".$row["id"]);
    echo json_encode($row);
  } else { 
    fail('Failed to add point.'); 
  }
  
  //echo "\n".json_encode(array('latitud' =>$_GET['latitud'], 'descripcion' =>$_GET['descripcion'],'longitud' =>$_GET['longitud'], 'nombre' =>$_GET['nombre']));  //Liberando el conjunto de los resultados
  pg_free_result($result);
  //Cerrando la conexion
  pg_close($dbconection);
}
// else
//  $firephp->log("No Hay POST!");
	//echo "No hay POST!";

?>