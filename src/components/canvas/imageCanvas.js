import React, { useEffect, useLayoutEffect, useCallback } from "react";
import makeStyles from "@material-ui/styles/makeStyles";
import * as tf from "@tensorflow/tfjs";

import {useData} from "../../contexts/dataCtx";
import {useDebugMsg} from "../../contexts/debugMsgCtx";

const maxWidth = 300;

const useStyles = makeStyles({
  canvasRoot: {
		// position: "absolute", // do not use absolute here to make parent container know the height, while the overlay canvas use absolute to overlay
		height: "auto",
	},
});

export default function ImageCanvas(props){
	const classes = useStyles();
	const canvasRef = React.useRef(null);

	const [, appendDebugMsg] = useDebugMsg();
	const [data, updateData] = useData();

	// update from canvas a TF tensor to DataProvider, note that the tensor is with shape (y,x,channel) due to canvas layout (?)
	const updateTfTensor = useCallback(()=>{
		const prefix="[Canvas Effect 2]";
		appendDebugMsg(`${prefix} - Canvas Changed`);
		try{
			const imageTensor = tf.browser.fromPixels(canvasRef.current);
			appendDebugMsg(`${prefix} - Tensor with shape: ${imageTensor.shape}`);

			return imageTensor;
		}
		catch(err){
			appendDebugMsg(`(ERR) ${prefix} - Canvas Changed`);
			console.error(err);
		}
	})

	// when image update, draw on canvas, and then update TF tensor by calling "updateTfTensor"
	const updateCanvasAndTfTensor = useCallback(()=>{
		const prefix="[Canvas Effect 1]";
		appendDebugMsg(`${prefix} - Image Data Changed Effect`);
		// load data to canvas
		try{
			const ctx = canvasRef.current.getContext("2d");
			const image = new Image();	
			image.onload = function(){
				appendDebugMsg(`${prefix} - Image onLoad`);
				// console.log(image.width, image.height)
				ctx.canvas.width = maxWidth;
				ctx.canvas.height = image.height*maxWidth/image.width;
				ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, ctx.canvas.width, ctx.canvas.height);

				const imageTensor = updateTfTensor();
				const canvasBoundingRect = canvasRef.current.getBoundingClientRect();
				const canvasBase64 = canvasRef.current.toDataURL();
				updateData({
					imageTensor: imageTensor,
					// canvasW: ctx.canvas.width,
					// canvasH: ctx.canvas.height,
					canvasW: canvasBoundingRect.width,
					canvasH: canvasBoundingRect.height,
					canvasX: canvasBoundingRect.x, // this is buggy as the windows resize would chnage the position of the canvas but is not accounted in useEffect calling this
					canvasY: canvasBoundingRect.y, // same buggy
					canvasDataUrl: canvasBase64,
					canvasDataUrlStripped: canvasBase64.split(",")?.[1],
				});
				appendDebugMsg(`${prefix} - Update Data: TF tensor and Canvas size`);

			};
			image.src = data?.dataUrl;
		}
		catch(err){
			appendDebugMsg(`(ERR) ${prefix} - Image Data Changed`);
			console.error(err);
		}
	},[data?.dataUrl]);

	// Draw image to canvas, then update tensor
	useEffect(()=>{
		updateCanvasAndTfTensor();		
	},[data?.dataUrl])

	return (
		<>
		  <div className={classes.canvasRoot} >
				<canvas ref={ref => canvasRef.current = ref} id={`${props.id}`} alt={props.alt}/>
			</div>
		</>
	);
}