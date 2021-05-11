from repo import JsonRepo

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel
from typing import Optional

import os

repo = JsonRepo('/var/www/html/app/python/synchrona/synchrona14.json')
app = FastAPI()

ip = ''
while len(ip) < 4:
    stream = os.popen('hostname -I')
    ip = stream.read()

ip = ip.split(' ', 1)[0]
ip = ip.replace(' ', '')
ip = ip.replace('\n', '')
ip = ip.replace('\r', '')
address =  'http://' + ip
address_port = address + ':8000'

origins = [
    'http://localhost',
    'http://localhost:8000',
    address,
    address_port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Channel(BaseModel):
    id: int
    enable: Optional[bool]
    mode: Optional[str]
    output: Optional[str]
    frequency: Optional[int]
    slip: Optional[int]
    digital_delay: Optional[int]
    analog_delay: Optional[int]


@app.get("/")
async def read_root():
    return {"Hello": "World"}


@app.get("/synchrona/status")
async def get_status():
    status = repo.read_status()
    return {"status": status}


@app.get("/synchrona/channels/{ch_id}")
async def read_item(ch_id: int):
    return repo.read_ch(ch_id)


@app.patch("/synchrona/channels/{ch_id}", response_model=Channel)
async def update_item(ch_id: int, ch: Channel):
    return repo.update_ch(ch)
