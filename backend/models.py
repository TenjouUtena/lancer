from peewee import * # type: ignore

db = SqliteDatabase('lancer.db')


class BaseModel(Model):
    id = AutoField()
    class Meta:
        database = db

class ContactTypes(BaseModel):
    name = CharField()

class Image(BaseModel):
    s3_key = CharField()

class Artist(BaseModel):
    name = CharField()
    faname = CharField()
    platform = CharField()

class ArtistBase(BaseModel):
    name = CharField()
    url = CharField()
    price = DecimalField()

class ArtistBaseTagsSet(BaseModel):
    name = CharField()

class ArtistBaseTags(BaseModel):
    artistbaseid = ForeignKeyField(ArtistBase)
    tag = ForeignKeyField(ArtistBaseTagsSet)

class Customer(BaseModel):
    name = CharField()
    email_address = CharField()
    fa_user = CharField()
    fa_link = CharField()
    discord = CharField()
    telegram = CharField()

class CustomerImage(BaseModel):
    image = ForeignKeyField(Image)
    customer = ForeignKeyField(Customer)

class Product(BaseModel):
    name = CharField()
    artist = ForeignKeyField(Artist)
    ad = ForeignKeyField(Image)
    price = DecimalField()

class Order(BaseModel):
    customer = ForeignKeyField(Customer)
    order_date = DateField()


class OrderLine(BaseModel):
    product = ForeignKeyField(Product)
    order = ForeignKeyField(Order)
    discount = CharField()
    netprice = DecimalField()

def create_tables():
    with db:
        db.create_tables([ContactTypes, Image, Artist, ArtistBase, ArtistBaseTags, ArtistBaseTagsSet, Customer, CustomerImage, Product, Order, OrderLine])
