from fastapi import FastAPI, HTTPException
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


@app.get("/cover")
async def cover(title: str, artist: str):
    cover_url = root.fetch_album_cover(title, artist)
    return {"cover_url": cover_url}


# ── Spotify OAuth ──

@app.get("/auth/spotify")
async def auth_spotify():
    auth_url = root.get_spotify_auth_url()
    return {"auth_url": auth_url}

@app.get("/auth/spotify/callback")
async def auth_spotify_callback(code: str):
    try:
        tokens = root.exchange_spotify_code(code)
        return tokens
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── Strava OAuth ──

@app.get("/auth/strava")
async def auth_strava():
    auth_url = root.get_strava_auth_url()
    return {"auth_url": auth_url}

@app.get("/auth/strava/callback")
async def auth_strava_callback(code: str):
    try:
        tokens = root.exchange_strava_code(code)
        return tokens
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
