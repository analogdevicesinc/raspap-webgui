import iio


class SynchronaIIO():
    def __init__(self):
        self.ctx = iio.Context('local:')
        if self.ctx is not None:
            self.hmc7044 = self.ctx.find_device('hmc7044')
        else:
            self.hmc7044 = None

    def is_connected(self):
        if self.hmc7044 is None:
            return False
        return True

    def __get_attr(self, ch_id):
        if self.hmc7044 is None:
            return None
        ch = self.hmc7044.find_channel('altvoltage' + str(ch_id), True)
        return ch.attrs['frequency']

    def read_frequency(self, ch_id):
        attr = self.__get_attr(ch_id)
        if attr is None:
            return None
        return attr.value

    def write_frequency(self, ch_id, val):
        attr = self.__get_attr(ch_id)
        if attr is None:
            return None
        attr.value = str(val)
        return attr.value
