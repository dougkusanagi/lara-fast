#!/usr/bin/env bun

import { $, which } from "bun";

const installers = getInstallers();

export function getInstallers() {
	const laravel = async () =>
		await $`composer global require -q laravel/installer`;

	const packages = {
		"Laravel Telescope": async () => {
			await $`composer require -q laravel/telescope`;
			await $`php artisan -q telescope:install;`;
			await $`php artisan -q migrate`;
		},

		"Laravel Pulse": async () => {
			await $`composer require -q laravel/pulse`;
			await $`php artisan -q vendor:publish --provider="Laravel\\Pulse\\PulseServiceProvider`;
			await $`php artisan -q migrate`;
		},

		Laradumps: async () => {
			await $`composer require -q laradumps/laradumps`;
			await $`php artisan -q ds:init $(pwd)`;
		},

		Debugbar: async () => {
			await $`composer require -q barryvdh/laravel-debugbar --dev`;
		},
	};

	return {
		packages,
		laravel,
	};
}

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
		console.error("🚧 Laravel Installer not found.\n");
		console.log("🚀 Installing laravel/installer...");

		await installers.laravel();

		console.log("✅ Done!\n");
	}
}

async function createLaravelProject(projectName: string) {
	console.log(`🚀 Creating Laravel project ${projectName}...`);
	await $`laravel new --git --breeze --stack=livewire --dark --pest -n -q ${projectName}`;
	console.log("✅ Done!\n");
}

async function main(args: string[] = []) {
	needHelp(args);
	hasName(args);

	await checkLaravelInstaller();

	const projectName = args[0];

	await createLaravelProject(projectName);

	$.cwd(projectName);

	for (const [key, value] of Object.entries(installers.packages)) {
		console.log(`🚀 Installing ${key}...`);
		await value();
		console.log("✅ Done!\n");
	}

	console.log("🎉 Project created successfully!");
}

main(Bun.argv.slice(2));
