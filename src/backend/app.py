from fastapi import FastAPI
import root

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = ["http://localhost:5173"]

app.add_middleware(CORSMiddleware,
                   allow_origins = origins,
                   allow_credentials = True,
                   allow_methods = ["*"],
                   allow_headers = ["*"])

@app.get("/create")
async def create(bpm: int, length: int):
    return root.json_to_dict(root.bpm_search(bpm, length))