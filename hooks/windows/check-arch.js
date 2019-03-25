#!/usr/bin/env node

"use strict";

module.exports = context => {
	if( context.opts && context.opts.platforms && context.opts.platforms.indexOf( "windows" ) > -1 &&
		context.opts.options ) {
		const path  = require( "path" );
		const shell = require( "shelljs" );
		const nopt  = require( "nopt" );

		// parse and validate args
		const args = nopt( {
			archs : [ String ],
			appx : String,
			phone : Boolean,
			win : Boolean,
			bundle : Boolean,
			packageCertificateKeyFile : String,
			packageThumbprint : String,
			publisherId : String,
			buildConfig : String
		}, {}, context.opts.options.argv, 0 );

		// Check if --appx flag is passed so that we have a project build version override:
		let isWin10 = args.appx && args.appx.toLowerCase() === "uap";

		// Else check "windows-target-version" preference:
		if( !isWin10 ) {
			const configXml = shell.ls( path.join( context.opts.projectRoot, "config.xml" ) )[ 0 ];

			const reTargetVersion = /<preference\s+name="windows-target-version"\s+value="(.+)"\s*\/>/i;
			const targetVersion   = shell.grep( reTargetVersion, configXml );

			const result = reTargetVersion.exec( targetVersion );
			if( result !== null ) {
				const match = result[ 1 ];
				isWin10 = parseInt( match.split( "." ) ) > 8;
			}
		}

		// Non-AnyCPU arch is required for Windows 10 (UWP) projects only:
		if( isWin10 ) {
			const rawArchs = context.opts.options.archs || args.archs;
			const archs    = rawArchs ? rawArchs.split( " " ) : [];

			// Avoid "anycpu" arch:
			if( archs.length === 0 || archs.some( item => item.toLowerCase() === "anycpu" ) ) {
				throw new Error( "You must specify an architecture to include the proper ZXing library version." +
					"\nUse 'cordova run windows -- --arch=\"x64\"' or 'cordova run windows -- --arch=\"arm\" --phone --device' for example." );
			}
		}
	}
};
