import React, { useState } from "react";

import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import Backdrop from '@material-ui/core/Backdrop';

import makeStyles from '@material-ui/core/styles/makeStyles';
import { Link } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 345,
  },
  // media: {
  //   height: 0,
  //   paddingTop: '56.25%', // 16:9
	// },
	backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
}));

export default function ResultPopUp(props){
	const classes = useStyles();
	const [open, setOpen] = useState(false);

	const handleClose = () => {
    setOpen(false);
  };
  const handleToggle = () => {
    setOpen(!open);
	};
	
	return (
		<>
			<img src={props.item.image_square_url} alt="" onClick={handleToggle}/>
			<Backdrop className={classes.backdrop} open={open} onClick={handleClose}>
				<Card className={classes.root}>
					<CardMedia
						component="img"
						// className={classes.media}
						image={props.item.image_large_url}
					/>
					<CardContent>
						<Typography>{props.item.description}</Typography>
						<Typography>{props.item.domain}</Typography>
						<Link href={props.item.link}>{props.item.link}</Link>
					</CardContent>
				</Card>
			</Backdrop>
		</>
	)
}