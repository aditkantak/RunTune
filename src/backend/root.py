import os, requests
import urllib
import json
from dotenv import find_dotenv, load_dotenv

#loading api key
load_dotenv(find_dotenv())

_GSBPM_KEY = os.getenv("GSBPM_KEY")
_BASE_URL = "https://api.getsong.co/"

# Spotify OAuth config
SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID", "")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET", "")
SPOTIFY_REDIRECT_URI = os.getenv("SPOTIFY_REDIRECT_URI", "http://localhost:5173")

# Strava OAuth config
STRAVA_CLIENT_ID = os.getenv("STRAVA_CLIENT_ID", "")
STRAVA_CLIENT_SECRET = os.getenv("STRAVA_CLIENT_SECRET", "")
STRAVA_REDIRECT_URI = os.getenv("STRAVA_REDIRECT_URI", "http://localhost:5173")


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


# ── Spotify OAuth helpers ──

def get_spotify_auth_url():
    scopes = "user-read-private user-read-email playlist-modify-public playlist-modify-private"
    params = {
        "client_id": SPOTIFY_CLIENT_ID,
        "response_type": "code",
        "redirect_uri": SPOTIFY_REDIRECT_URI,
        "scope": scopes,
        "state": "spotify",
    }
    return f"https://accounts.spotify.com/authorize?{urllib.parse.urlencode(params)}"

def exchange_spotify_code(code: str):
    response = requests.post(
        "https://accounts.spotify.com/api/token",
        data={
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": SPOTIFY_REDIRECT_URI,
            "client_id": SPOTIFY_CLIENT_ID,
            "client_secret": SPOTIFY_CLIENT_SECRET,
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    response.raise_for_status()
    return response.json()


# ── Strava OAuth helpers ──

def get_strava_auth_url():
    params = {
        "client_id": STRAVA_CLIENT_ID,
        "response_type": "code",
        "redirect_uri": STRAVA_REDIRECT_URI,
        "scope": "activity:read_all",
        "state": "strava",
    }
    return f"https://www.strava.com/oauth/authorize?{urllib.parse.urlencode(params)}"

def exchange_strava_code(code: str):
    response = requests.post(
        "https://www.strava.com/oauth/token",
        data={
            "client_id": STRAVA_CLIENT_ID,
            "client_secret": STRAVA_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
        },
    )
    response.raise_for_status()
    return response.json()


# ── Album cover via iTunes Search API ──

def fetch_album_cover(title: str, artist: str) -> str | None:
    try:
        term = f"{artist} {title}"
        url = f"https://itunes.apple.com/search?{urllib.parse.urlencode({'term': term, 'entity': 'song', 'limit': 1})}"
        resp = requests.get(url, timeout=5)
        resp.raise_for_status()
        results = resp.json().get("results", [])
        if results:
            artwork = results[0].get("artworkUrl100", "")
            return artwork.replace("100x100", "600x600") if artwork else None
        return None
    except Exception:
        return None
