import { ToastType } from "../components/Toast/ToastUtils/toast-type";
import { createTextToast } from "../components/Toast/ToastUtils/ToastUtils";

const DownloadFile = async (name: string, byEndpoint: boolean, fetch: Promise<any>): Promise<void> => {
    if(name) {
        fetch.then(response => {
                const url = window.URL.createObjectURL(new Blob([response]));
                const link = document.createElement('a');
                // Append to html page
                link.href = url;
                link.setAttribute('download', `${name}.yml`);
                document.body.appendChild(link);
                // Force download
                link.click();
                // Clean up and remove the link
                link.parentNode!.removeChild(link);
            })
            .catch(() => createTextToast(ToastType.ERROR, `Could not get API Spec file for ${byEndpoint ? 'Endpoint' : 'App Source'}: ${name}`));
    } else {
        createTextToast(ToastType.ERROR, `Could not send request for API Spec file`);
    }
}

export default DownloadFile;
