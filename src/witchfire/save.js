import { useBlockProps } from '@wordpress/block-editor';

const save = ( { attributes: { highlighted } } ) => {
	return (
		<div
			{ ...useBlockProps.save( {
				className: 'lumis'
			} ) }
			dangerouslySetInnerHTML={ { __html: highlighted } }
		/>
	);
}

export default save;
