import os
import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel
from typing import Optional
from typing import List

from synchrona import configure_synchrona, get_devicetree_status, read_channel, read_status, get_input_ref_status


app = FastAPI()
origins = [
    '*',
    'http://localhost',
    'http://localhost:8000',
]

ips = ''
while len(ips) < 4:
    # repreat the operation while the ips were assigned
    stream = os.popen('hostname -I')
    ips = stream.read()
ips = ips.replace('\n', '')
ips = ips.replace('\r', '')
ips = ips.split(' ')

for ip in ips:
    if ip != '':
        address =  'http://' + ip
        address_port = address + ':8000'
        origins.append(address)
        origins.append(address_port)

ips = ''
while len(ips) < 4:
    # repreat the operation while the ips were assigned
    stream = os.popen('hostname -s')
    ips = stream.read()
ips = ips.replace('\n', '')
ips = ips.replace('\r', '')
ips = ips.split(' ')

for ip in ips:
    if ip != '':
        address =  'http://' + ip + '.local'
        address_port = address + ':8000'
        origins.append(address)
        origins.append(address_port)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Channel(BaseModel):
    id: int
    enable: bool
    mode: Optional[str]
    cmos: Optional[int]
    frequency: int
    divider: Optional[int]
    coarse_delay: int
    fine_delay: int


class SynchronaConfig(BaseModel):
    vcxo: int
    mode: Optional[str]
    input_priority: list
    channels: List[Channel]

@app.get("/")
async def read_root():
    return {"synchrona": "restapi"}


@app.get("/synchrona/channels")
async def get_channels():
    return read_channel()

class input_reference():
    def __init__(self):
        self.ref = "unknown"
        self.locked = False

@app.get("/synchrona/status")
async def get_status():
    status_msg = read_status()
    dt_status = get_devicetree_status()
    input_ref = input_reference()

    get_input_ref_status(input_ref)

    if status_msg is None:
        return {"status": "disconnected", "message": "none", "dt_status": dt_status,
                "input_ref": input_ref.ref, "pll_locked": input_ref.locked}

    return {"status": "connected", "message": status_msg, "dt_status": dt_status,
            "input_ref": input_ref.ref, "pll_locked": input_ref.locked}


@app.patch("/synchrona/outputs", response_model=SynchronaConfig)
async def update_all(config: SynchronaConfig):
    retConfig = configure_synchrona(config)
    return retConfig
