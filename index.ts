#!/usr/bin/env bun

import { $, which } from "bun";

function help() {
	console.log(`
  LaraFast is a very opinionated Laravel setup script that will create a laravel project.
  Configs:
    -Git
    -Breeze (Livewire)
    -Pest
  Packages:
    -Telescope
    -Pulse
    -Laradumps
    -Laravel Debugbar

  Usage: lara-fast <project-name>`);
}

function needHelp(args: string[]) {
	if (
		args[0] === "--help" ||
		args[0] === "-h" ||
		args[0] === "--h" ||
		args[0] === "help"
	) {
		help();
		process.exit(0);
	}
}

function hasName(args: string[]) {
	if (!args[0]) {
		console.error("Error: Project name is required");
		help();
		process.exit(1);
	}
}

async function checkLaravelInstaller() {
	if (!which("laravel")) {
		console.error("Error: Laravel Installer not found");
		console.log("Installing Laravel Installer...");
		await $`composer global require laravel/installer`;
	}
}

async function createLaravelProject(projectName: string) {
	await $`laravel new --git --breeze --stack=livewire --dark --pest -n ${projectName}`;
}

function installer() {
	return {
		telescope: async () => {
			await $`composer require laravel/telescope`;
			await $`php artisan telescope:install;`;
			await $`php artisan migrate`;
		},

		pulse: async () => {
			await $`composer require laravel/pulse`;
			await $`php artisan vendor:publish --provider="Laravel\\Pulse\\PulseServiceProvider`;
			await $`php artisan migrate`;
		},

		laradumps: async () => {
			await $`composer require laradumps/laradumps`;
			await $`php artisan ds:init $(pwd)`;
		},

		debugbar: async () => {
			await $`composer require barryvdh/laravel-debugbar --dev`;
		},
	};
}

async function main(args: string[] = []) {
	needHelp(args);
	hasName(args);
	await checkLaravelInstaller();

	const projectName = args[0];

	createLaravelProject(projectName);

	$.cwd(projectName);

	const installers = installer();

	for (const [key, value] of Object.entries(installers)) {
		console.log(`🚀Installing ${key}...`);
		await value();
	}
}

main(Bun.argv.slice(2));
