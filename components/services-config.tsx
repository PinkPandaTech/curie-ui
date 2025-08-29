const API_URL = "https://humath-curie-api.thankfulmoss-7950af75.westus2.azurecontainerapps.io/";

export const services = [
    { name: 'XRay', url: `${API_URL}images` },
    { name: 'Medical History', url: `${API_URL}nlp` },
    { name: 'ECG', url: `${API_URL}biosignals` }
];