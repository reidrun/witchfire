import { createHighlighter } from '@lumis-sh/lumis';
import { htmlLinked } from '@lumis-sh/lumis/formatters';
import { available } from '@lumis-sh/lumis/languages';
import fullBundle from '@lumis-sh/wasm-bundle-full';
import wgsl from '@lumis-sh/wasm-wgsl';

const languages = {
	...fullBundle,
	[ wgsl.id ]: wgsl,
};

const catalog = available();

export const LANGUAGE_OPTIONS = [
	{ label: 'Plain Text', value: 'plaintext' },
	...Object.keys( languages )
		.map( ( id ) => (
			{ value: id, label: catalog[ id ]?.name ?? id }
		) )
		.sort( ( l, r ) => l.label.localeCompare( r.label ) )
];

let highlighterPromise;

export const getHighlighter = () => {
	highlighterPromise = highlighterPromise ?? createHighlighter( {
		languages: [
			fullBundle,
			wgsl,
		],
	} );

	return highlighterPromise;
};

export const highlightCode = async ( code, language ) => {
	const highlighter = await getHighlighter();
	const languageDefinition = languages[ language ];

	if ( languageDefinition ) {
		await highlighter.loadLanguage( languageDefinition );
	}

	return highlighter.highlight(
		code,
		htmlLinked( {
			language: languageDefinition ?? 'plaintext',
		} )
	);
};
