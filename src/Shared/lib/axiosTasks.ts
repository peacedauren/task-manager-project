import axios from "axios";

axios.defaults.baseURL = "https://task-manager-project-66e0f-default-rtdb.firebaseio.com/";

const axiosTasks = axios;

export default axiosTasks;