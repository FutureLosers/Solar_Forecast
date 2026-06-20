class Battery:

    def __init__(
        self,
        capacity_wh,
        current_wh,
        status=""
    ):
        self.capacity_wh = capacity_wh
        self.current_wh = current_wh
        self.status = status

    def get_remaining_percent(self):
        return (
            self.current_wh /
            self.capacity_wh
        ) * 100

    def judgement(self):

        remaining_percent = self.get_remaining_percent()

        if remaining_percent > 50:
            self.status = "安全"

        elif remaining_percent > 30:
            self.status = "注意"

        elif remaining_percent > 10:
            self.status = "充電切れるかも"

        else:
            self.status = "充電切れ"

        return self.status