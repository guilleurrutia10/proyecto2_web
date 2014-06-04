<?php 
		//TODO BORRAR ESTO!! Solo para propositos de debugging!
		// require_once('FirePHPCore/FirePHP.class.php');
		// ob_start();
		// $firephp = FirePHP::getInstance(true);		
		$idbache=$_GET['idbache'];	
		//$id=$_GET['idBache'];	
		// $latitud=$_GET['latitud'];	
		// $longitud=$_GET['longitud'];	
		//$firephp->log("parametros recibidos por GET--> Latitud=".$latitud."; longitud=".$longitud);
		$dbconection = pg_connect('host=localhost dbname=basebaches user=adminpepe password=adminpepe') or die('No se ha podido conectar: ' . pg_last_error());
		$query ='DELETE FROM baches WHERE  id='."'".$idbache."'";
		//$firephp->log("La queryString armada es=".$query);

		//BACKUPS DE OTRAS QUERYS DE PHP
		// $query ='DELETE FROM "Baches" WHERE  latitud='."'".$latitud."'".' AND longitud='."'".$longitud."'";
		//$query ='DELETE FROM "Baches" WHERE id='."'".$id."'".' AND latitud='.$latitud.' AND longitud='.$longitud.';';
		//$query ='DELETE FROM "Baches" WHERE id='."'".$id."'"; 
		$result = pg_query($query) or die('La consulta falló: ' . pg_last_error()); 
		if ($result) {
			$valores= array("estado" =>"BORRADO_OK");			
		}else{ 
			$valores= array("estado" =>"BORRADO_OK");
		}
		//$firephp->log("Resultado de la consulta: ".$result);
		$datos_json=json_encode($valores);
		echo $datos_json;
		//Liberando el conjunto de los resultados
		pg_free_result($result);
		//Cerrando la conexion
		pg_close($dbconection);
		exit;
?>
