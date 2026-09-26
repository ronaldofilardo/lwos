INSERT INTO users (name, email, "passwordHash", role, "lastSignedIn") VALUES
('Sócio', 'socio@adv.com', '$2a$12$5g3DeC37mCa5vfAkOKzZUe9ORAqJFY8/JII.TH5yg3yHW8uDlg762', 'SOCIO', NOW()),
('Analista', 'analista@adv.com', '$2a$12$g6GKn2WOQAUpDpulekgfge2qlaWEHlkJ.IuSpya3.HDy.5Lj3dzjy', 'ANALISTA', NOW()),
('Admin', 'admin@adv.com', '$2a$12$zvFweUYn1pLzAQk3urOUgO.9GqseqezxjTZm0VHYLhcW2KA7kq/sW', 'ADMIN', NOW()),
('Cliente', 'cliente@adv.com', '$2a$12$2ERAJo.977KIzcdcf3R7iOzRH92HU.7zij7RTWnzNhWvYHzpLj96K', 'CLIENTE', NOW())
ON CONFLICT (email) DO NOTHING;
