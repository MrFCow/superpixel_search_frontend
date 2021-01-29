import React, {useState} from "react";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import makeStyles from "@material-ui/styles/makeStyles";

import searchPinterest from "../../utils/queryPinterest";
import {useDebugMsg} from "../../contexts/debugMsgCtx";

import ImageGridList from "./resultGrid";

const useStyles = makeStyles({
  resultPanal: {
		// width: "50%",
	},
});

export default function ResultContainer(props){
	const [searchResult, setSearchResult] = useState(null);
	const [isSearching, setIsSearching] = useState(false);
	const [openDrawer, setOpenDrawer] = useState(false);

	const classes = useStyles();

	const [, appendDebugMsg] = useDebugMsg();

	const handleSearch = () => {
		const canvasName = "result_canvas";
		const canvasRef = document.getElementById(canvasName);

		if (canvasRef && !isSearching){
			setIsSearching(true);

			canvasRef.toBlob(imageBlob => {
				let formData = new FormData();
				formData.append("image", imageBlob, "Search Input Image");
				formData.append("x", "0");
				formData.append("y", "0");
				formData.append("w", "1.0");
				formData.append("h", "1.0");
				// formData.append("x", xywh.x.toString());
				// formData.append("y", xywh.y.toString());
				// formData.append("w", xywh.w.toString());
				// formData.append("h", xywh.h.toString());

				const resultPromise = searchPinterest(formData);
				resultPromise.then(resultData => {
					setSearchResult(resultData.data);
					setOpenDrawer(true);
				}).catch(err => {
					console.error(err);
				}).finally(()=>{
					setIsSearching(false);
				});
			});
		}
	}

	return (
		<Grid item xs={12}>
			<Button variant="outlined" onClick={handleSearch} disabled={isSearching}>Search</Button>
			<SwipeableDrawer anchor="left" open={openDrawer}
				onClose={()=>setOpenDrawer(false)}
				className={classes.resultPanal}
			>
				<ImageGridList data={searchResult?.data || []}/>
			</SwipeableDrawer>
		</Grid>
	)
};