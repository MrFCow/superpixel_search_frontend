import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';

import ResultPopUp from "./resultPopup";

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    // justifyContent: 'space-around',
    overflow: 'hidden',
		backgroundColor: theme.palette.background.paper,
		width: 450,
  },
}));


export default function ImageGridList(props) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
			{props.data.map((item)=>{
					return <ResultPopUp item={item} key={item.id}/>
			})}
    </div>
  );
}