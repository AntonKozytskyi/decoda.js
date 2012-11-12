<?php

// Includes, no need for an auto-loader
require_once 'cssmin.php';
require_once 'jsmin/jsmin.php';
require_once 'packager/Packager.php';
require_once 'packager/Minifier.php';
require_once 'packager/minifiers/JsMinifier.php';
require_once 'packager/minifiers/CssMinifier.php';

use \mjohnson\packager\Packager;
use \mjohnson\packager\minifiers\JsMinifier;
use \mjohnson\packager\minifiers\CssMinifier;

// Fetch variables
$minify = isset($_GET['minify']) ? (bool) $_GET['minify'] : true;
$path = dirname(__DIR__);

if ($minify) {
	$js = new Packager($path, new JsMinifier());
	$css = new Packager($path, new CssMinifier());

} else {
	$js = new Packager($path);
	$css = new Packager($path);
}

// Package the contents
if ($js->package(array('Js'), array('outputFile' => 'bin/{name}-{version}.min.js', 'docBlocks' => false))) {
	echo 'Javascript packaged.<br>';
}

if ($css->package(array('Css'), array('outputFile' => 'bin/{name}-{version}.min.css', 'docBlocks' => false))) {
	echo 'CSS packaged.<br>';
}