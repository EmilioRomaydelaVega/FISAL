INSERT INTO public.custom_machines (id, data) VALUES
('1', '{"id":1,"name":"Komatsu D61PX-24","serial":"S/N 40673","image":"🚜","category":"Bulldozer"}'),
('2', '{"id":2,"name":"Komatsu HB365 LC-3","serial":"S/N 5072","image":"🏗️","category":"Excavadora Híbrida"}'),
('3', '{"id":3,"name":"Komatsu HM300-3","serial":"S/N 3532","image":"🚛","category":"Dúmper articulado"}'),
('4', '{"id":4,"name":"Komatsu HM300-3","serial":"S/N 3538","image":"🚛","category":"Dúmper articulado"}'),
('5', '{"id":5,"name":"Komatsu HM300-3","serial":"S/N 3562","image":"🚛","category":"Dúmper articulado"}'),
('6', '{"id":6,"name":"Komatsu PC138US-11","serial":"S/N F51156","image":"🏗️","category":"Excavadora"}'),
('7', '{"id":7,"name":"Komatsu PC160LC-8","serial":"S/N K50228","image":"🏗️","category":"Excavadora"}'),
('8', '{"id":8,"name":"Komatsu PC210LC-10","serial":"S/N K60365","image":"🏗️","category":"Excavadora"}'),
('9', '{"id":9,"name":"Komatsu PC240LC-10","serial":"S/N K60625","image":"🏗️","category":"Excavadora"}'),
('10', '{"id":10,"name":"Komatsu PC450-7EO","serial":"S/N K45167","image":"🏗️","category":"Excavadora"}'),
('11', '{"id":11,"name":"Komatsu WA380-6","serial":"S/N H60815","image":"🚜","category":"Cargadora"}'),
('12', '{"id":12,"name":"Komatsu WA470-8","serial":"S/N H55149","image":"🚜","category":"Cargadora"}'),
('13', '{"id":13,"name":"Komatsu WA500-8","serial":"S/N H50071","image":"🚜","category":"Cargadora"}')
ON CONFLICT (id) DO NOTHING;