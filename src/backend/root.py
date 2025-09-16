import os, requests
import urllib
import requests
import json
from dotenv import find_dotenv, load_dotenv

#loading api key
load_dotenv(find_dotenv())

_GSBPM_KEY = os.getenv("GSBPM_KEY")
_BASE_URL = "https://api.getsong.co/"

def create_url(request_type: str, params: dict):
    params["api_key"] = _GSBPM_KEY
    return f"{_BASE_URL}{request_type}/?{urllib.parse.urlencode(params)}" # type: ignore

def bpm_search(bpm: int, length: int = 250):
    url = create_url("tempo", {"bpm": bpm, "limit": length})
    return requests.get(url)

def json_to_dict(data):
    return json.loads(data.text)

def dump_json(data):
    with open("src/sample.json", "w") as file:
        json.dump(data, file)

def read_json(filepath):
    with open(filepath, "r") as file:
        return json.load(file)
    

