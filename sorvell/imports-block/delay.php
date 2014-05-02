<?php

sleep(4);

// header('ContentType: text/html');

$url = $_GET["url"];
readfile($url);

?>
