import React, { useEffect, useCallback } from "react";
import makeStyles from "@material-ui/styles/makeStyles";

import {useData} from "../../contexts/dataCtx";
import {useDebugMsg} from "../../contexts/debugMsgCtx";

import * as tf from "@tensorflow/tfjs";

const useStyles = makeStyles({
  canvasRoot:{
		height: "auto",
	},
});

export default function ResultCanvas(props){
	const classes = useStyles();
	const canvasRef = React.useRef(null);

	const [, appendDebugMsg] = useDebugMsg();
	const [data, updateData] = useData();

	useEffect(()=>{
		if (data.imageTensor && data.maskTensor){
			// console.log(data.imageTensor.shape);
			// img * mask + (1-mask)*1
			const canvasTensor = data.imageTensor.mul(data.maskTensor.toInt()).add(data.maskTensor.logicalNot().toInt().mul(tf.scalar(255)));

			tf.browser.toPixels(canvasTensor.toInt(), canvasRef.current);
		}
	}, [data.maskTensor, data.imageTensor]);

	return (
		<div className={classes.canvasRoot}>
			<canvas 
				ref={ref => {canvasRef.current = ref}} 
				id={`${props.id}`} alt={props.alt}
			/>
		</div>
	)
};