create table restaurant.user(
  id int primary key AUTO_INCREMENT,
  name varchar(250),
  contactNumber varchar(20),
  email varchar(50),
  password varchar(250),
  status varchar(20),
  role varchar(20),
  UNIQUE (email)
);

insert into restaurant.user(
  name,
  contactNumber,
  email,
  password,
  status,
  role
) values (
  'admin',
  '1231231231',
  'admin@gmail.com',
  'admin',
  'true',
  'admin'
);

create table restaurant.category(
  id int primary key AUTO_INCREMENT,
  name varchar(255) NOT NULL
);

create table restaurant.product(
  id int primary key AUTO_INCREMENT,
  name varchar(255) NOT NULL,
  categoryId int NOT NULL,
  description varchar(255),
  price int,
  status varchar(20)
);

create table restaurant.bill(
  id int primary key AUTO_INCREMENT,
  uuid varchar(200) NOT NULL,
  name varchar(255) NOT NULL,
  email varchar(255) NOT NULL,
  contactNumber varchar(20) NOT NULL,
  paymentMethod varchar(50) NOT NULL,
  total int NOT NULL,
  productDetails JSON DEFAULT NULL,
  createdBy varchar(255) NOT NULL 
);
