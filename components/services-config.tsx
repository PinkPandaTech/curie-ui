// API endpoints configuration
const API_ENDPOINTS = {
    IMAGES: "https://capp-imagescurie-dev-001.calmgrass-38ffeef2.eastus2.azurecontainerapps.io",
    NLP: "https://capp-nlpcurie-dev-001.calmgrass-38ffeef2.eastus2.azurecontainerapps.io",
    BIOSIGNALS: "https://capp-biosignalscurie-dev-001.calmgrass-38ffeef2.eastus2.azurecontainerapps.io"
};

export const services = [
    { name: 'XRay', url: `${API_ENDPOINTS.IMAGES}/images` },
    { name: 'Medical History', url: `${API_ENDPOINTS.NLP}/nlp/` },
    { name: 'ECG', url: `${API_ENDPOINTS.BIOSIGNALS}/biosignals/` }
];
console.log(services)