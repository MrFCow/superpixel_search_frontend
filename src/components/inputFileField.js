import React, { useCallback, useState } from "react";

import {useData} from "../contexts/dataCtx";
import {useDebugMsg} from "../contexts/debugMsgCtx";


export default function InputFileField(props){
	const [isLoading, setIsLoading] = useState(false);
	const [, updateData] = useData();
	const [, appendDebugMsg] = useDebugMsg();
	const fileInput = React.createRef();

	const handleLoad = useCallback( () => {
		const prefix="[Input Field]";
		const fileToUpload = fileInput.current.files[0];

		const fileReader = new FileReader();

		fileReader.onloadstart = async () => {
			setIsLoading(true);
			appendDebugMsg(`${prefix} - Start Image Loading: ${fileToUpload.name}`);
		}

		fileReader.onloadend = async () => {
			const base64Result = fileReader.result;
			const dataUrlStripped = base64Result.split(",")?.[1];
			updateData({dataUrl: base64Result, dataUrlStripped: dataUrlStripped});
			setIsLoading(false);
			appendDebugMsg(`${prefix} - Finish Image Loading: ${fileToUpload.name}`);
		}

		fileReader.onerror = function (e) {
			console.error(e);
			setIsLoading(false);
			appendDebugMsg(`(ERR) ${prefix} - Image Loading: ${fileToUpload.name}`);
		};

		// Read content - base 64
		fileReader.readAsDataURL(fileToUpload);
	}, [fileInput]);

	return (		
		<input type="file" id="image_input" name="Load File" ref={fileInput} onChange={handleLoad} disabled={isLoading}/>
	)
};