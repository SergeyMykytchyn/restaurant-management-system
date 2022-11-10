create table restaurant.user(
  id int primary key AUTO_INCREMENT,
  name varchar(255),
  contactNumber varchar(20),
  email varchar(255),
  password varchar(255),
  status enum('true', 'false'),
  role enum('admin', 'user'),
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
  price decimal(15,2),
  status enum('true', 'false')
);

create table restaurant.bill(
  id int primary key AUTO_INCREMENT,
  uuid varchar(255) NOT NULL,
  name varchar(255) NOT NULL,
  email varchar(255) NOT NULL,
  contactNumber varchar(20) NOT NULL,
  paymentMethod varchar(255) NOT NULL,
  total decimal(15,2) NOT NULL,
  productDetails JSON DEFAULT NULL,
  createdBy varchar(255) NOT NULL 
);
