
INSERT INTO Ground_Station (gs_id, gs_location) VALUES 
(1, 'Houston, USA'), (2, 'Madrid, Spain'), (3, 'Canberra, Australia');

INSERT INTO Department (dep_id, gs_id, dep_name) VALUES 
(1, 1, 'Antenna Maintenance'), 
(2, 2, 'Signal Processing'), 
(3, 3, 'Security');

INSERT INTO Mission_Control_Centers (mcc_id, center_name, location_city, timezone) VALUES 
(1, 'NASA Johnson', 'Houston', 'CST'), (2, 'ESA ESOC', 'Darmstadt', 'CET');

INSERT INTO Missions (mission_id, mcc_id, mission_name, mission_goal, start_date) VALUES 
(1, 1, 'Artemis I', 'Lunar Exploration', '2026-01-01'),
(2, 1, 'Starlink-Gen2', 'Internet Constellation', '2026-02-15'),
(3, 2, 'Sentinel-Ocean', 'Climate Mapping', '2025-11-20');

INSERT INTO Satellites (sat_id, mission_id, model_name, status) VALUES 
(1, 1, 'Orion-Alpha', 'ACTIVE'),
(2, 2, 'Star-01', 'ACTIVE'),
(3, 2, 'Star-02', 'ACTIVE'),
(4, 3, 'Aqua-Scan', 'ACTIVE'),
(5, 1, 'Lunar-Relay', 'SAFE_MODE');

INSERT INTO Subsystems (sub_id, sat_id, sub_type, mode) VALUES 
(1, 1, 'Power', 'ACTIVE'), (2, 1, 'Propulsion', 'ACTIVE'), (3, 1, 'Comm', 'ACTIVE'),
(4, 2, 'Power', 'ACTIVE'), (5, 2, 'Propulsion', 'ACTIVE'), (6, 2, 'Comm', 'ACTIVE');

INSERT INTO Components (comp_id, sub_id, part_name, health_index) VALUES 
(1, 1, 'Solar Array', 98), (2, 2, 'Thruster A', 100), (3, 3, 'Transponder', 95);

INSERT INTO Telemetry_Logs (comp_id, val, is_eclipse) VALUES 
(1,14.1,false),(1,14.2,false),(1,14.3,false),(1,14.1,false),(1,14.0,false),
(1,14.2,false),(1,14.1,false),(1,14.3,false),(1,14.2,false),(1,14.1,false),
(2,100.0,false),(2,99.9,false),(2,100.1,false),(2,100.0,false),(2,99.8,false),
(2,99.9,false),(2,100.0,false),(2,100.1,false),(2,100.0,false),(2,99.7,false),
(3,-10.1,true),(3,-10.2,true),(3,-10.1,true),(3,-10.3,true),(3,-10.2,true),
(3,-10.1,true),(3,-10.4,true),(3,-10.2,true),(3,-10.1,true),(3,-10.3,true);

INSERT INTO Personnel (person_id, dep_id, person_name, role, is_working) VALUES 
(1, 1, 'Commander Chris', 'Lead', true), (2, 1, 'Buzz Lightyear', 'Tech', true),
(3, 1, 'Neil A.', 'Tech', true), (4, 1, 'Sally Ride', 'Engineer', true),
(5, 1, 'Jim Lovell', 'Engineer', true), (6, 1, 'Fred Haise', 'Maintenance', true),
(7, 1, 'Jack Swigert', 'Analyst', true), (8, 1, 'Gene Kranz', 'Director', true),
(9, 1, 'Katherine Johnson', 'Math', true), (10, 1, 'Margaret H.', 'Software', true);

INSERT INTO Space_Debris_Catalog (debris_id, cluster_id, theta_deg, orbit_id, danger_radius_km) VALUES 
(1, 101, 12.5, 1, 5.0), (2, 101, 15.2, 1, 2.0), (3, 101, 18.9, 1, 1.5), (4, 102, 180.0, 2, 10.0), (5, 102, 185.1, 2, 4.0);

INSERT INTO Dish (dish_id, gs_id, elevation_angle, max_distance, is_transmitting) VALUES 
(1, 1, 45, 1200, true),
(2, 2, 30, 1500, false),
(3, 3, 60, 2000, true);

INSERT INTO Celestial_Bodies (body_id, body_name, fixed_theta) VALUES 
(1, 'Moon', 12.5),
(2, 'Mars', 45.0),
(3, 'Sun', 0.0);

INSERT INTO Command_Vault (cmd_id, hex_code, description, power_cost_watts) VALUES 
(1, '0xAF', 'Reboot System', 50.0),
(2, '0xBC', 'Thruster Burn', 120.0),
(3, '0xDE', 'Deploy Solar', 15.0),
(4, '0x11', 'Ping', 1.0);

INSERT INTO Command_Authorization (auth_id, cmd_id, person_id) VALUES 
(1, 1, 1), 
(2, 2, 1), 
(3, 3, 4);

INSERT INTO Command_History (hist_id, sat_id, cmd_id) VALUES 
(1, 1, 1), 
(2, 2, 3), 
(3, 5, 4);

INSERT INTO Satellite_State (state_id, sat_id, orbit_id, theta_deg, altitude_km, velocity_kms) VALUES 
(1, 1, 1, 45.5, 400.0, 7.8),
(2, 2, 1, 90.0, 410.5, 7.7),
(3, 3, 1, 185.2, 412.0, 7.7),
(4, 4, 2, 12.0, 850.0, 6.5),
(5, 5, 2, 270.0, 860.0, 6.4);

INSERT INTO Observations (obs_id, sat_id, debris_id, confidence_score) VALUES 
(1, 1, 1, 0.95),
(2, 4, 4, 0.88);

INSERT INTO Maneuver_Plans (plan_id, sat_id, target_orbit, thrust_val, approval_status, execution_time) VALUES 
(1, 1, 2, 10.5, 'APPROVED', '2026-03-01 12:00:00'),
(2, 2, 1, 5.0, 'PENDING', '2026-03-02 14:30:00');

INSERT INTO Transaction_Logs (tx_id, plan_id, pre_fuel_kg, pre_altitude_km, tx_status) VALUES 
(1, 1, 500.0, 400.0, 'SUCCESS'),
(2, 2, 450.0, 410.5, 'PENDING');

INSERT INTO Access_Time (access_id, sat_id, gs_id, start_time, end_time, date, status, is_successful) VALUES 
(1, 1, 1, '10:00:00', '10:15:00', '2026-02-23', 'COMPLETED', true),
(2, 2, 2, '11:30:00', '11:45:00', '2026-02-23', 'FAILED', false);

INSERT INTO Pass_Assignment (assignment_id, access_id, dish_id, actual_time, actual_date) VALUES 
(1, 1, 1, '10:02:00', '2026-02-23'),
(2, 2, 2, '11:30:00', '2026-02-23');
