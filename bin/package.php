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
$zip = isset($_GET['zip']) ? (bool) $_GET['zip'] : false;

$packager = new Packager(dirname(__DIR__));

if ($minify) {
	$packager->addMinifier(new JsMinifier());
	$packager->addMinifier(new CssMinifier());
}

// Package the contents
if ($packager->package(array('Js'), array('outputFile' => 'bin/{name}-{version}.min.js'))) {
	echo 'Javascript packaged<br>';
} else {
	echo 'Javascript failed to package<br>';
}

if ($packager->package(array('Css'), array('outputFile' => 'bin/{name}-{version}.min.css'))) {
	echo 'CSS packaged<br>';
} else {
	echo 'CSS failed to package<br>';
}

if ($packager->package(array('Css.IE'), array('outputFile' => 'bin/{name}-ie-{version}.min.css'))) {
	echo 'CSS.IE packaged<br>';
} else {
	echo 'CSS.IE failed to package<br>';
}

// Archive the output into a zip file
if ($zip) {
	$archive = array(
		array('path' => 'bin/{name}-{version}.min.css', 'folder' => 'css/'),
		array('path' => 'bin/{name}-ie-{version}.min.css', 'folder' => 'css/'),
		array('path' => 'bin/{name}-{version}.min.js', 'folder' => 'js/'),
		array('path' => 'src/img/icons-black.png', 'folder' => 'img/'),
		array('path' => 'src/img/icons-white.png', 'folder' => 'img/'),
		'license.md',
		'readme.md'
	);

	if ($packager->archive('bin/{name}-{version}', $archive)) {
		echo 'Contents archived';
	} else {
		echo 'Contents failed to archive';
	}
}