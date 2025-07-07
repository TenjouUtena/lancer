from models import *


def get_last_n_orders(n):
    return Order.select().join(Customer).order_by(Order.order_date.desc())[:n]


def get_top_n_artists(n):
    return [x for x in Artist.select().dicts() ]

def new_artist(artist):
    a = Artist()
    a.name = artist['name']
    a.faname = artist['faname']
    a.platform = artist['platform']

    print(a.save())
    print(a)



