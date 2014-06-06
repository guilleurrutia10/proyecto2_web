<?php 
	require_once('FirePHPCore/FirePHP.class.php');
	ob_start();
	$firephp = FirePHP::getInstance(true);		
	$idbache=$_GET['id'];	
	$descripcion=$_GET['descripcion'];	
	$dbconection = pg_connect('host=localhost dbname=basebaches user=adminpepe password=adminpepe') or die('No se ha podido conectar: ' . pg_last_error());
	$query="INSERT INTO observacion(descripcion,id_bache) VALUES ('$descripcion',$idbache)";
	$firephp->log("La query string creada : ".$query);

	$result = pg_query($query) or die('La consulta falló: ' . pg_last_error()); 
	if ($result) {
		$valores= array("estado" =>"OK");			

	}else{ 
		$valores= array("estado" =>"ERROR");
	}
	//$firephp->log("Resultado de la consulta: ".$result);
	$datos_json=json_encode($valores);
	$firephp->log("EL resultado en JSON retornado fue el siguiente: ".$datos_json);
	echo $datos_json;
	//Liberando el conjunto de los resultados
	pg_free_result($result);
	//Cerrando la conexion
	pg_close($dbconection);
	exit;
?>