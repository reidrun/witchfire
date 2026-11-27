import { createBlock } from "@wordpress/blocks";
import { create, toHTMLString } from '@wordpress/rich-text';

const toRichText = ( text ) => toHTMLString( { value: create( { text } ) } );

const createBlockCodeToContent = ( slug ) => (
	{
		type: 'block',
		blocks: [ slug ],
		transform: ( { code } ) => {
			return createBlock(
				slug,
				{
					content: toRichText( code ),
				}
			);
		}
	}
);

export default {
	from: [
		{
			type: 'block',
			blocks: [
				'core/code',
				'core/paragraph',
				'core/preformatted',
			],
			transform: ( { content } ) => {
				return createBlock(
					'reidrun/witchfire',
					{
						code: create( { html: content } ).text,
					}
				);
			}
		}
	],
	to: [
		createBlockCodeToContent( 'core/code' ),
		createBlockCodeToContent( 'core/paragraph' ),
		createBlockCodeToContent( 'core/preformatted' ),
	],
}
