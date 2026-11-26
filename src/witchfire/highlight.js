import { createHighlighter, htmlLinked } from '@lumis-sh/lumis';
import { available } from '@lumis-sh/lumis/languages';

const config = window.witchfireConfig ?? { runtimeWasmUrl: '', languages: {} };
const catalog = available();

export const LANGUAGE_OPTIONS = [
	{ label: 'Plain Text', value: 'plaintext' },
	...Object.keys( config.languages )
		.filter( ( id ) => id !== 'plaintext' )
		.map( ( id ) => ({ value: id, label: catalog[id]?.name ?? id }) )
		.sort( ( l, r ) => l.label.localeCompare( r.label ) )
]

let highlighterPromise;
export const getHighlighter = () => {
	highlighterPromise = highlighterPromise ?? createHighlighter({ languages: [] });
	return highlighterPromise;
}

export const highlightCode = async ( code, language ) => {
	const highlighter = await getHighlighter();
	const wasm = config.languages[language]

	if ( language !== 'plaintext' && wasm ) {
		await highlighter.loadLanguage({ id: language, wasm });
	}

	return highlighter.highlight( code, {
		language: wasm ? language : 'plaintext',
		formatter: htmlLinked(),
	} )
}
