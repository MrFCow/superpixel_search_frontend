import React from "react";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import makeStyles from "@material-ui/styles/makeStyles";

import InputFileField from "./inputFileField";
import ImageCanvas from "./canvas/imageCanvas";
import SuperPixelCanvas from "./canvas/superPixCanvas";
import ResultCanvas from "./canvas/resultCanvas";
import ResultContainer from "./search/resultContainer";


const useStyles = makeStyles({
  root: {
		// flexGrow:1,
		margin: 20,
		padding:20,
		width: "80%",
		textAlign: "center",
		marginLeft: "auto",
		marginRight: "auto",
	},
	canvasOuterContainer: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		padding:20,
	},
	canvasInnerContainer:{
		display:"flex", 
		flexDirection:"row",
	}
});

export default function MainContainer(props){
	const classes = useStyles();

	return (
		<Paper className={classes.root}>
			<Grid container>
				<Grid item xs={12}>
					<InputFileField/>
				</Grid>
				<Grid item xs={12} className={classes.canvasOuterContainer}>
					<Grid item xs={12} className={classes.canvasInnerContainer} >
						<ImageCanvas id="image_canvas" alt="image canvas"/>
						<ResultCanvas id="result_canvas" alt="result canvas"/>
					</Grid>
					<SuperPixelCanvas id="superPixCanvas" alt="super pixel canvas"/>
				</Grid>
			</Grid>
			<ResultContainer/>
		</Paper>
	)
}