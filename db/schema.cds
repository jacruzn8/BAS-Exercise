namespace exam.logistics;

entity Shipments
{
    key ID : UUID;
    customer : String;
    mode : TransportMode(100);
    totalWeight : Decimal(10,2);
    shippingFee : Decimal(10,2);
    packages : Composition of many Packages on packages.parent = $self;
}

entity Packages
{
    key ID : UUID;
    contents : String;
    weight : Decimal(10,2);
    parent : Association to one Shipments;
}

type TransportMode : String enum
{
    Sea = 'S';
    Air = 'A';
    Rail = 'R';
}
