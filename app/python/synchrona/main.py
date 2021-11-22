from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel
from typing import Optional
from typing import List

from synchrona import configure_synchrona, read_channel


app = FastAPI()
origins = [
    'http://localhost',
    'http://localhost:8000',
]

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
    cmos: Optional[int]
    frequency: int
    divider: Optional[int]
    coarse_delay: int
    fine_delay: int


class SynchronaConfig(BaseModel):
    vcxo: int
    input_priority: list
    channels: List[Channel]

@app.get("/")
async def read_root():
    return {"Hello": "World"}


@app.get("/synchrona/channels")
async def get_channels():
    return read_channel()


@app.get("/synchrona/status")
async def get_status():
    return {"status": "connected"}


@app.patch("/synchrona/outputs", response_model=SynchronaConfig)
async def update_all(config: SynchronaConfig):
    retConfig = configure_synchrona(config)
    return retConfig
