import { useCallback, useEffect, useMemo, useState } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';
import { BlockControls, InspectorControls, PlainText, useBlockProps } from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarButton, PanelBody, ComboboxControl, Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import './editor.scss';
import { highlightCode, LANGUAGE_OPTIONS } from "./highlight";

const getTextFromHighlighted = ( highlightedCode ) => {
	const node = new DOMParser().parseFromString( highlightedCode ?? '', 'text/html' );
	return node.querySelector( 'pre' )?.innerText ?? node.body.textContent ?? '';
}

const Edit = ( {
	clientId,
	attributes: {
		code,
		language,
		highlighted
	},
	setAttributes
} ) => {
	const [ isPreviewEnabled, setIsPreviewEnabled ] = useState( false );
	const [ isHighlighting, setIsHighlighting ] = useState( false );
	const [ highlightError, setHighlightError ] = useState( null );

	const { lockPostSaving, unlockPostSaving } = useDispatch( 'core/editor' ) ?? {};
	const { __unstableMarkNextChangeAsNotPersistent } = useDispatch( 'core/block-editor' ) ?? {};

	const highlightedCode = useMemo( () => getTextFromHighlighted( highlighted ), [ highlighted ] )
	const isHighlightedCodeDirty = code !== highlightedCode;

	const updateHighlighting = useCallback( async () => {
		setIsHighlighting( true );
		try {
			const newHighlighted = await highlightCode( code, language );
			__unstableMarkNextChangeAsNotPersistent?.();
			setAttributes( { highlighted: newHighlighted } );
			setHighlightError( null );
			return true;
		} catch ( e ) {
			console.error( '[witchfire] highlighting failed:', e )
			setHighlightError( e );
			return false;
		} finally {
			setIsHighlighting( false );
		}
	}, [
		code,
		language,
		__unstableMarkNextChangeAsNotPersistent,
		setAttributes,
	] );

	const enablePreview = useCallback( async () => {
		if ( !isHighlightedCodeDirty ) {
			setIsPreviewEnabled( true );
			return;
		}
		await updateHighlighting() && setIsPreviewEnabled( true );
	}, [
		isHighlightedCodeDirty,
		updateHighlighting
	] )

	useEffect( () => {
		const lockKey = `reidrun-witchfire-highlight-${ clientId }`;

		if ( isHighlightedCodeDirty || isHighlighting ) {
			lockPostSaving?.( lockKey );
			return () => {
				unlockPostSaving?.( lockKey );
			}
		}

		unlockPostSaving?.( lockKey );
	}, [
		clientId,
		lockPostSaving,
		unlockPostSaving,
		isHighlightedCodeDirty,
		isHighlighting,
	] )

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						isPressed={ !isPreviewEnabled }
						onClick={ () => setIsPreviewEnabled( false ) }
					>
						{ __( 'Edit', 'witchfire' ) }
					</ToolbarButton>
					<ToolbarButton
						isPressed={ isPreviewEnabled }
						disabled={ isHighlighting }
						onClick={ enablePreview }
					>
						{ isHighlighting
							? __( 'Highlighting...', 'witchfire' )
							: __( 'Preview', 'witchfire' ) }
					</ToolbarButton>
					<ToolbarButton disabled={ isHighlighting } onClick={ updateHighlighting }>
						{ __( 'Update Highlighting', 'witchfire' ) }
					</ToolbarButton>
				</ToolbarGroup>
			</BlockControls>
			<InspectorControls>
				<PanelBody title={ __( 'Witchfire Settings', 'witchfire' ) }>
					{ isHighlightedCodeDirty && (
						<Notice status="warning" isDismissible={ false }>
							{ __( 'Saving is temporarily blocked. Code has been updated in a WitchFire code block, but highlighted code has not been updated. Click "Update Highlighting" to apply changes.', 'witchfire' ) }
						</Notice>
					) }
					{ highlightError && (
						<Notice status="error" isDismissible={ false }>
							{ __( 'WitchFire syntax highlighting failed. Check code for syntax errors, or switch to plaintext language.', 'witchfire' ) }
						</Notice>
					) }
					<ComboboxControl
						label={ __( 'Language', 'witchfire' ) }
						value={ language }
						options={ LANGUAGE_OPTIONS }
						onChange={ ( next ) => setAttributes( {
							language: next ?? 'plaintext',
							highlighted: ''
						} ) }
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...useBlockProps( { className: 'lumis' } ) }>
				{ isPreviewEnabled
					? <div dangerouslySetInnerHTML={ { __html: highlighted } }/>
					: (
						<PlainText
							value={ code }
							onChange={ ( next ) => setAttributes( {
								code: next,
								highlighted: ''
							} ) }
							placeholder={ __( 'Enter code here', 'witchfire' ) }
							aria-label={ __( 'Enter code here', 'witchfire' ) }
							spellCheck={ false }
						/>
					)
				}
			</div>
		</>
	);
}

export default Edit;
