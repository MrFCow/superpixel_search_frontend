import axios from "axios";

const searchHeaders = (formData) => {
	return {
		authority: "api.pinterest.com",
		"Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
		// charset: "UTF-8",
		accept: "*/*",
	}
};

const cors = "https://cors-anywhere.herokuapp.com/";
// const cors = "";

export default async function searchPinterest(formData){
	const result = await axios({
		method: "put",
		url: `${cors}https://api.pinterest.com/v3/visual_search/extension/image/`,
		// headers: {...searchHeaders(formData), ...formData.getHeaders()},
		headers: searchHeaders(formData),
		data: formData,
	})
	
	return result;
};