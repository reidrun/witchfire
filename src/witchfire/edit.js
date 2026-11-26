import {useEffect, useRef, useState} from '@wordpress/element';
import { useDispatch } from '@wordpress/data';
import {BlockControls, InspectorControls, PlainText, useBlockProps} from '@wordpress/block-editor';
import {ToolbarGroup, ToolbarButton, PanelBody, ComboboxControl} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';
import {highlightCode, LANGUAGE_OPTIONS} from "./highlight";

const DEBOUNCE_MS = 150;

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {Element} Element to render.
 */
const Edit = ({
  clientId,
  attributes: {
	  code,
	  language,
	  highlighted},
  setAttributes
}) => {
	const [ isPreviewEnabled, setIsPreviewEnabled ] = useState( false );
	const blockProps = useBlockProps()

	const { lockPostSaving, unlockPostSaving } = useDispatch( 'core/editor' ) ?? {};
	const { __unstableMarkNextChangeAsNotPersistent } = useDispatch( 'core/block-editor' ) ?? {};

	const highlightedRef = useRef( highlighted );
	highlightedRef.current = highlighted;

	useEffect( () => {
		let cancelled = false;
		const lockKey = `reidrun-witchfire-highlight-${clientId}`;

		lockPostSaving?.( lockKey );

		const debounce = setTimeout( () => {
			highlightCode( code, language )
				.then( (newHighlighted ) => {
					if ( cancelled || newHighlighted === highlightedRef.current ) return;
					__unstableMarkNextChangeAsNotPersistent?.();
					setAttributes({ highlighted: newHighlighted })
				} )
				.catch( ( e ) => {
					console.error( '[witchfire] highlighting failed: ', e );
				} )
				.finally( () => {
					!!cancelled || unlockPostSaving?.( lockKey );
				} )
		}, DEBOUNCE_MS )

		return () => {
			cancelled = true;
			clearTimeout( debounce );
			unlockPostSaving?.( lockKey );
		}
	}, [
		clientId,
		code,
		language,
		lockPostSaving,
		unlockPostSaving,
		__unstableMarkNextChangeAsNotPersistent,
		setAttributes,
	] )

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						isPressed={!isPreviewEnabled}
						onClick={() => setIsPreviewEnabled( false )}
					>
						{__('Edit', 'witchfire')}
					</ToolbarButton>
					<ToolbarButton
						isPressed={isPreviewEnabled}
						onClick={() => setIsPreviewEnabled( true )}
					>
						{__('Preview', 'witchfire')}
					</ToolbarButton>
				</ToolbarGroup>
			</BlockControls>
			<InspectorControls>
				<PanelBody title={__('Witchfire Settings', 'witchfire')}>
					<ComboboxControl
						label={__('Language', 'witchfire')}
						value={language}
						options={LANGUAGE_OPTIONS}
						onChange={( next ) => setAttributes({ language: next ?? 'plaintext' })}
					/>
				</PanelBody>
			</InspectorControls>
			<div {...blockProps}>
				{isPreviewEnabled
					? <div dangerouslySetInnerHTML={{__html: highlighted}} />
					: (
						<PlainText
							value={code}
							onChange={( next ) => setAttributes({ code: next })}
							placeholder={__('Enter code here', 'witchfire')}
							aria-label={__('Enter code here', 'witchfire')}
							spellCheck={false}
						/>
					)
				}
			</div>
		</>
	);
}

export default Edit;
