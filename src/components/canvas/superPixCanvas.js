import React, { useEffect, useLayoutEffect, useCallback, useState, useRef } from "react";
import makeStyles from "@material-ui/styles/makeStyles";

import {useData} from "../../contexts/dataCtx";
import {useDebugMsg} from "../../contexts/debugMsgCtx";

import axios from "axios";
import axiosRetry from "axios-retry";
import * as tf from "@tensorflow/tfjs";
import {useGesture} from "react-use-gesture";

const alphaValue = 1.0;

axiosRetry(axios, { retries: 3 });

const useStyles = makeStyles({
  canvasRoot: (props) => ({
		height: "auto",
		position: "absolute",
		left: props.left,
	}),
	canvas: (props) => ({
		opacity: props.alpha,
	}),
});

async function getSuperPixel(base64Image, noSegments, sigma){
	const url = `https://superpixels.herokuapp.com/process`;
	const postData = {
		image: base64Image,
		noSegments: noSegments,
		sigma: sigma,
	}

	const result = await axios({
		method: "post",
		url: url,
		data: postData,
		timeout: 10000, 
	});

	return result;
};


// mask: h,w,1, segment h,w,1, calueSelected: scalar (num, provided by onClick)
function calculateMask(mask, segment, valueSelected){
	return tf.tidy(()=>{
		const valueHitMask = segment.equal(tf.scalar(valueSelected));
		return mask.logicalXor(valueHitMask);
	});
}

function prepareTfSegments(segmentTensor){
	return tf.tidy(()=>{
		const inputMax = segmentTensor.max();
		const inputMin = segmentTensor.min();
		// (value - min) / (max - min) * 255
		const normalizedInputs = segmentTensor.sub(inputMin).div(inputMax.sub(inputMin)).mul(tf.scalar(255));
		// stack 3 times, then add alpha
		let expandedInputs = normalizedInputs;
		expandedInputs = expandedInputs.expandDims(2); // h,w => h,w,1
		expandedInputs = tf.tile(expandedInputs, [1, 1, 3]); // repeat at last dim (channel) | h,w,1 => h,w,3
		const alpha = tf.onesLike(normalizedInputs).mul(tf.scalar(255*alphaValue)).expandDims(2); // h,w => h,w,1
		expandedInputs = tf.concat([expandedInputs,alpha], 2); // h,w,4

		// tf.enableDebugMode();
		// edge detection
		const kernel = tf.tensor([
			[-1,-1,-1],
			[-1, 8,-1],
			[-1,-1,-1]
		]).expandDims(2).expandDims(3);

		const [imgH, imgW] = normalizedInputs.shape
		const model = tf.sequential({
			layers: [tf.layers.conv2d({kernelSize:3, filters:1, strides:1, useBias:false, padding:"same", inputShape: [imgH, imgW, 1], weights:[kernel]})]
		});

		const edgeResult = model.predict(normalizedInputs.expandDims(2).expandDims(0)); // h,w => 1, h, w, 1
		// edgeResult.print()
		// tf.slice(edgeResult, [0,530,2,0], [1,1,1,1]).print();

		let edgeMask = tf.greater(edgeResult.toInt(), tf.scalar(0)).mul(tf.scalar(255)).toInt().squeeze(0); // 1, h, w, 1 => h, w, 1
		const zeroChannels = tf.zerosLike(normalizedInputs).expandDims(2); // h,w => h,w,1
		edgeMask = tf.concat([edgeMask,zeroChannels,zeroChannels,edgeMask], 2);
		// tf.enableProdMode();

		// BOTH h,w,4
		return [expandedInputs, edgeMask];
	});
}

export default function SuperPixelCanvas(props){
	const [alpha, setAlpha] = useState(0.3);
	const maskSelectedValue = useRef(new Set());
	const canvasTensor = useRef(null);
	const canvasMaskTensor = useRef(null);

	const canvasRef = React.useRef(null);
	const canvasMaskRef = React.useRef(null);

	const [, appendDebugMsg] = useDebugMsg();
	const [data, updateData] = useData();

	const classes = useStyles({
		alpha: alpha,
		left: data.canvasX,
	});

	const transformFn = useCallback(([x, y]) => [x - data.canvasX, y - data.canvasY], [data.canvasX, data.canvasY])

	const bind = useGesture({
		onDrag: ({down, event, xy: [x,y]}) => {
			event.preventDefault();
			if (down){
				console.log(`xy: (${x.toFixed(2)}, ${y.toFixed(2)})` );
			}
		},
		onClick: (event) => {
			const [x,y] = transformFn([event.event.clientX, event.event.clientY]);
			console.log(`clicked ${x.toFixed(2)}, ${y.toFixed(2)}`);
			// canvasTensor.current.print();
			// console.log(canvasTensor.current.shape) // h,w,4
			
			tf.slice(canvasTensor.current,[y,x,0],[1,1,1]).data().then((v) => {
				// tf.tidy( () => {
					const value = v[0];
					
					canvasMaskTensor.current = calculateMask(canvasMaskTensor.current, canvasTensor.current, value);
					
					// Mask from h,w,4 => h,w,3 (as data.imageTensor is h,w,3)
					// also it should be 1-mask to invert it
					const maskTensor = tf.slice(canvasMaskTensor.current, [0,0,0], [-1,-1,3]).logicalNot();
					updateData({maskTensor: maskTensor});
					
					if (value in maskSelectedValue.current){
						console.log(`Try delete value ${value}`)
						maskSelectedValue.current.delete(value);
					}
					else{
						console.log(`Try add value ${value}`)
						maskSelectedValue.current.add(value);
					}

					const printTensor = canvasMaskTensor.current.toFloat();
					tf.browser.toPixels(printTensor, canvasMaskRef.current);
				// });
			})
		},
		onMouseEnter: (event) => {
			// console.log("MouseEnter");
			setAlpha(0.8);
		},
		onMouseLeave: (event) => {
			// console.log("MouseLeave");
			setAlpha(0.3);
		},
	},
	//config
	{
		transform: transformFn,
	}
	)

	const processAndDrawSegments = useCallback(async (segments, canvas) => {
		const superpixels = tf.tensor(segments); // shape: [h, w]

		// expandedInputs (h,w,4); 
		// edgeMask (h,w,4), with Red channel only
		const [expandedInputs, edgeMask] = prepareTfSegments(superpixels);

		// set ref for masking interaction (as side effect for other functions)
		canvasTensor.current = tf.slice(expandedInputs, [0,0,0], [-1,-1,1]); // (h,w,4) => (h,w,1) => only care about the first channel
		// console.log(`canvasTensor.current: ${canvasTensor.current.shape}`);
		canvasMaskTensor.current = tf.onesLike(expandedInputs).toBool();

		// Merging the patches and edge
		let printTensor = expandedInputs.toInt();
		// printTensor = printTensor.maximum(edgeMask); // try to merge
		printTensor = edgeMask; // only draw edges

		return tf.browser.toPixels(printTensor, canvas); // a Promise
	},[]);

	const drawCentroids = useCallback((centroids, ctx) => {
		ctx.globalAlpha = alphaValue;
		centroids.map((centroid, idx)=>{
			const [cy, cx] = centroid;
			ctx.fillStyle = "#00ff00";
			ctx.font = "15px Georgia";
			ctx.fillText(`${cx.toFixed(2)},${cy.toFixed(2)}`, cx+10, cy+25);
			// ctx.fillText(idx, cx+10, cy+25)
			ctx.fillStyle = "#ff0000";
			ctx.fillRect(cx,cy,5,5);
		});
	}, []);


	// Get superpixel from request and draw on canvas
	useEffect(()=>{
		if (data?.canvasDataUrl){
			const prefix="[SuperPixel Canvas Effect 1]";
			try {
				appendDebugMsg(`${prefix} - try call getSuperPixel`);

				// Clear canvas first
				const ctx = canvasRef.current.getContext('2d');
				ctx.globalAlpha = alphaValue;
				ctx.clearRect(0, 0, data.canvasW, data.canvasH);

				// call API, then draw
				getSuperPixel(data.canvasDataUrlStripped, 100).then(result => {
					console.log(result);
					appendDebugMsg(`${prefix} - getSuperPixel call completed`);

					try {
						const {centroids, segments} = result?.data?.data;
						processAndDrawSegments(segments,canvasRef.current).then(()=>{
							// drawCentroids(centroids, ctx);	
						})
					}
					catch(err){
						appendDebugMsg(`(ERR) ${prefix} - Draw fail`);
						console.error(err);
					}
				});
			}
			catch(err){
				appendDebugMsg(`(ERR) ${prefix} - Superpixel`);
				console.error(err);
			}
		}
	}, [data?.canvasDataUrl]);

	return (
		<>
		  <div className={classes.canvasRoot} {...bind()} style={{zIndex: 2}}>
				<canvas 
					className={classes.canvas} 
					ref={ref => {canvasRef.current = ref}} 
					id={`${props.id}`} alt={props.alt}
				/>
			</div>
			<div className={classes.canvasRoot} style={{zIndex: 1}} >
				<canvas 
					className={classes.canvas} 
					ref={ref => {canvasMaskRef.current = ref}} 
					id={`${props.id}_mask`} alt={`${props.alt} Mask`}
				/>
			</div>
		</>
	);
};