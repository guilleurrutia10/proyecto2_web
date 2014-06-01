<?php 
	require_once('FirePHPCore/FirePHP.class.php');
	ob_start();
	$firephp = FirePHP::getInstance(true);
	$datos=$_POST["content"];
	$firephp->log("parametros POST--> ".$_POST["content"]);
	if($datos!=false){
		//$firephp->log('El query string recibido en el server es:'. file_get_contents('php://input'));
		$objetosDatos=json_decode($datos,true);
		//CUenta la cantidad de elementos efectivos en la coleccion
		$firephp->log("El la cantidad de elementos es:".count($objetosDatos));
		//Se concatenan todos los objetos JSON en una variable String
	 	$fechaRandom=microtime(true);	
		$datosArchivo="[";
		for ($i=0; $i < count($objetosDatos); $i++) { 
			$firephp->log('Objeto['.$i.']'.'='.$objetosDatos[$i]["nombre"]);
			$nombre=$objetosDatos[$i]["nombre"];
			$descripcion=$objetosDatos[$i]["descripcion"];
			$latitud=$objetosDatos[$i]["latitud"];
			$longitud=$objetosDatos[$i]["longitud"];
			$direccion=$objetosDatos[$i]["direccion"];
		 	$firephp->log('La direccion leida en el server es:'. strval($direccion));
			$datos = '{ "nombre":'.$nombre.', "descripcion" :'.$descripcion.', "latitud": '.$latitud.', "longitud":'.$longitud.', "direccion":'. strval($direccion).'}';
			//$datos = '{ "nombre":'.$nombre.', "descripcion" :'.$descripcion.', "latitud": '.$latitud.', "longitud":'.$longitud.'}';
			$datosArchivo.=$datos;
		}
		$datosArchivo.="]";
		$firephp->log('Datos del archivo: '.$datosArchivo);
		$archivo="marcadoresJSON.txt";
		//Se configuran las cabeceras para que el webbrowser interprete el arhcivo como un archivo de descarga
		header("Cache-Control: ");
		header("Content-disposition: attachment; filename=$archivo");
		header("Content-type: application/octet-stream");
		header("Content-Description: File Transfer");
		print json_encode($datosArchivo,JSON_UNESCAPED_UNICODE);
		$firephp->log("Se imprimio el archivo");		
		exit();
	}
?>