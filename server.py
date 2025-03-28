import json
from fastapi import FastAPI, File, UploadFile, APIRouter
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from inference import run_inference
from pathlib import Path
import datetime
import zipfile
import numpy as np
import base64
import os
import cv2

router = APIRouter(
    prefix="/images",
    responses={404: {"description": "Not found"}},
)

tags_metadata = [
    {
        "name": "Curie_v1",
        "description": """Curie multiclass model for Neumonia detection"""
    }
]


origins = ["*"]

def create_validate_tmp_folder():
    tmp_path = os.getcwd() + "/tmp/"
    if not os.path.exists(tmp_path):
        os.mkdir(tmp_path)
    return

def process_image_request(contents):
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    cv2.imwrite('temp_request.png', img)
    return img

def to_base64(img):
    retval, buffer = cv2.imencode('.jpg', img)
    jpg_as_text = base64.b64encode(buffer)
    return jpg_as_text

def zip_files(file_paths, output_path):
    """
    Compresses a list of files into a ZIP archive.

    Args:
        file_paths (List[str]): A list of file paths to include in the archive.
        output_path (str): The path to save the ZIP archive.

    Returns:
        None
    """
    with zipfile.ZipFile(output_path, "w") as zip_file:
        for file_path in file_paths:
            zip_file.write(file_path)

@router.post("/Curie_v1/", tags=["polarity"])
async def classify_image(image: UploadFile):
    try:
        contents = await image.read()
        img = process_image_request(contents)
    except:
        raise 'Send a proper request'

    output_json = run_inference(img)
    output_json['mask'] = to_base64(output_json['mask'])
    output_json['heatmap'] = to_base64(output_json['heatmap'])

    return json.dumps(str(output_json))

@router.post('/Curie_file/', tags=['file'])
async def get_curie_file(image: UploadFile):
    try:
        content = await image.read()
        img = process_image_request(content)
    except:
        raise 'Send a proper request'

    output_json = run_inference(img)
    combined_img = output_json['combined']
    cv2.imwrite('output_data.png', combined_img)

    # Delete no needed images
    del output_json['mask']
    del output_json['heatmap']
    del output_json['combined']
    # write json from dictionary
    with open('json_data.json', 'w') as outfile:
        outfile.write(str(output_json))

    # List of files to include in the ZIP archive to send in response
    file_paths = ["output_data.png", "json_data.json"]
    zip_path = "results.zip"
    zip_files(file_paths, zip_path)

    # Get the current time as a datetime object
    now = datetime.datetime.now()
    time_str = now.strftime("%Y-%m-%d_%H-%M-%S")
    filename = f"curie_results_{time_str}.zip"

    return FileResponse(path=Path(zip_path), filename=filename)

app = FastAPI(
    title="Curie Model",
    description="Deep models for image clasification and neumonia detection.",
    openapi_tags=tags_metadata,
    version='1.0',
    openapi_url="/images/openapi.json", 
    docs_url="/images/docs"
)
app.include_router(router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="localhost", port=8000)
