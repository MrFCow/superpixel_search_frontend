import React from "react";
import makeStyles from "@material-ui/styles/makeStyles";
import {useDebugMsg} from "../contexts/debugMsgCtx";

import {configs} from "../config/config";

const useStyles = makeStyles({
  debug: {		
		position: "fixed",
		backgroundColor: "rgb(0,0,255,0.25)",	
    top: 0,
    right: 0,
		maxHeight: "100%",
		overflowY: "scroll",
		"&::-webkit-scrollbar":{
			width: 10,
		},
		"&::-webkit-scrollbar-thumb":{
			background: "rgba(0,0,255,0.5)",
		},
	},
	debugMsgItemContainer: {
		borderWidth: "0px 0px 2px 0px", // top, right, bottom, left 
		borderStyle: "dashed",
		borderColor: "rgb(0,0,255,0.5)",
		padding: 5,
		display:"flex",
		flexDirection:"row",
		"&:last-child":{
			borderStyle: "none",
		}
	},
	debugMsgIdx:{
		width: 25,
		textAlign: "right",
		paddingRight: 5,
	},
	debugMsgItem:{
		width: 180,
	},
});

export default function DebugMsg(props){
	const classes = useStyles();
	const [debugMsg] = useDebugMsg();
	
	return (
		<>
			{configs.DEBUG_MODE ? <div className={classes.debug}>
				{/* // Last 100 items only */}
				{/* {debugMsg.slice(Math.max(debugMsg.length - 100, 0), debugMsg.length).map( (item, idx)=>{ */}
				{/* // All items */}
				{debugMsg.map( (item, idx)=>{
					return (
						<div className={classes.debugMsgItemContainer} key={`container_${idx}`}>
							<span className={classes.debugMsgIdx} key={`idx_${idx}`}>{`${idx+1}. `}</span>
							<span className={classes.debugMsgItem} key={`item_${idx}`}>{item}</span>
						</div>
					)
				})}
			</div> : null}
		</>
	)
}