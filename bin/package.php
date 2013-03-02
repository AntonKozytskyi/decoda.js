<?php
/**
 * @copyright	Copyright 2006-2013, Miles Johnson - http://milesj.me
 * @license		http://opensource.org/licenses/mit-license.php - Licensed under the MIT License
 * @link		http://milesj.me/code/mootools/decoda
 */

require_once '../vendor/autoload.php';

use Packager\Packager;
use Packager\Minifier\JsMinifier;
use Packager\Minifier\CssMinifier;
use Symfony\Component\Console\Application;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Output\ConsoleOutput;

define('VERSION', file_get_contents('../version.md'));

// Callback to execute packaging logic
$callback = function(InputInterface $input, OutputInterface $output) {
	$output->writeln(sprintf('<comment>MooTools Decoda %s</comment>', VERSION));

	$packager = new Packager(dirname(__DIR__));

	// Add minifiers
	if ($input->getOption('minify')) {
		$packager->addMinifier(new JsMinifier());
		$packager->addMinifier(new CssMinifier());
	}

	// Package the contents
	$output->writeln('');
	$output->writeln('--- Packaging ---');

	if ($packager->package(array('js'), array('outputFile' => 'bin/{name}-{version}.min.js'))) {
		$output->writeln('<info>Javascript packaged</info>');
	} else {
		$output->writeln('<error>Javascript failed to package</error>');
	}

	if ($packager->package(array('css'), array('outputFile' => 'bin/{name}-{version}.min.css'))) {
		$output->writeln('<info>CSS packaged</info>');
	} else {
		$output->writeln('<error>CSS failed to package</error>');
	}

	if ($packager->package(array('css/ie'), array('outputFile' => 'bin/{name}-ie-{version}.min.css'))) {
		$output->writeln('<info>IE CSS packaged</info>');
	} else {
		$output->writeln('<error>IE CSS failed to package</error>');
	}

	// Archive the output
	if ($outputFile = $input->getOption('archive')) {
		$output->writeln('');
		$output->writeln('--- Archiving ---');

		$archive = array(
			array('path' => 'bin/{name}-{version}.min.css', 'folder' => 'css/'),
			array('path' => 'bin/{name}-ie-{version}.min.css', 'folder' => 'css/'),
			array('path' => 'bin/{name}-{version}.min.js', 'folder' => 'js/'),
			array('path' => 'src/img/icons-black.png', 'folder' => 'img/'),
			array('path' => 'src/img/icons-white.png', 'folder' => 'img/'),
			'license.md',
			'readme.md',
			'version.md'
		);

		if ($packager->archive($outputFile, $archive)) {
			$output->writeln('<info>Contents archived</info>');
		} else {
			$output->writeln('<error>Contents failed to archive</error>');
		}
	}
};

// Start the console and run
array_splice($_SERVER['argv'], 1, 0, 'package');

$console = new Application('Decoda', VERSION);

$console->register('package')
	->setDescription('Compress and package the static assets')
	->addOption('minify', null, InputOption::VALUE_NONE, 'Enable static asset minification')
	->addOption('archive', null, InputOption::VALUE_OPTIONAL, 'Archive the packaged files into a single zip', 'bin/{name}-{version}')
	->setCode($callback);

$console->run();