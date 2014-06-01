<?php
if(isset($_SERVER["QUERY_STRING"])) { 
  $baches = array();
  $dbconection = pg_connect('host=localhost dbname=universidad user=postgres password=rodrigoh') or die('No se ha podido conectar: ' . pg_last_error());
  $query = 'SELECT * FROM'. '"Baches"';
  $result = pg_query($query) or die('La consulta falló: ' . pg_last_error()); 
  if ($result) { 
    while ($line = pg_fetch_array($result, null, PGSQL_ASSOC)) {
      # code...
      array_push($baches, $line);
    }
    echo json_encode($baches);
  } else { 
    fail('Failed to add point.'); 
  }
  //Liberando el conjunto de los resultados
  pg_free_result($result);
  //Cerrando la conexion
  pg_close($dbconection);
}
?>