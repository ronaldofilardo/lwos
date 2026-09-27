INSERT INTO users (name, email, "passwordHash", role, "lastSignedIn") VALUES
('Sócio', 'socio@adv.com', '$2a$12$29AALStWazJALwfzsZsSp.PzKOCopfiy.XKAFaCL8ns6iocotA0Iy', 'SOCIO', NOW()),
('Analista', 'analista@adv.com', '$2a$12$29AALStWazJALwfzsZsSp.PzKOCopfiy.XKAFaCL8ns6iocotA0Iy', 'ANALISTA', NOW()),
('Admin', 'admin@adv.com', '$2a$12$29AALStWazJALwfzsZsSp.PzKOCopfiy.XKAFaCL8ns6iocotA0Iy', 'ADMIN', NOW()),
('Cliente', 'cliente@adv.com', '$2a$12$29AALStWazJALwfzsZsSp.PzKOCopfiy.XKAFaCL8ns6iocotA0Iy', 'CLIENTE', NOW())
ON CONFLICT (email) DO NOTHING;
