import json
from iio_interface import SynchronaIIO


class JsonRepo():
    def __init__(self, path):
        self.__path = path
        self.__synchrona = SynchronaIIO()

    def __read_json(self):
        with open(self.__path) as file:
            data = json.load(file)
            file.close()
            return data

    def read_status(self):
        if self.__synchrona.is_connected():
            return 'connected'
        return 'disconnected'

    def read_ch(self, ch_id):
        data = self.__read_json()
        if data is None:
            return None
        for ch in data['channels']:
            if ch['id'] == ch_id:
                if self.__synchrona.is_connected():
                    ch['frequency'] = self.__synchrona.read_frequency(ch['id'] - 1)
                return ch
        return None

    def update_ch(self, channel):
        data = self.__read_json()
        if data is None:
            return None
        ret_ch = None
        for ch in data['channels']:
            if ch['id'] == channel.id:
                if self.__synchrona.is_connected():
                    ch['frequency'] = self.__synchrona.read_frequency(ch['id'] - 1)
                ch_dict = channel.dict()

                for key in ch_dict:
                    if ch_dict[key] != None:
                        if key == 'frequency' and self.__synchrona.is_connected():
                            ch[key] = self.__synchrona.write_frequency(ch['id'] - 1, ch_dict[key])
                        else:
                            ch[key] = ch_dict[key]
                ret_ch = ch
                break

        file = open(self.__path, 'w')
        json.dump(data, file)
        file.close()
        return ret_ch
