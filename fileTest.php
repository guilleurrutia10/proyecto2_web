<?php
	$name = "lalalalal.txt";
	header("Content-disposition: attachment; filename=$name");
	header("Content-type: application/octet-stream");
	print "TEST TEXT FOR THE DOWNLOAD OF MY FILE EHHEHEHEHEHEHEHE, HERE IT'D BE SUIT THE JSON FILE CONTENT";
?>