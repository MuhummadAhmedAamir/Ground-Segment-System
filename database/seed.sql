-- =============================================================
--  Ground Segment System (Simulation) — Seed Data
--  Run: psql $DATABASE_URL -f seed.sql
--  Ordered by foreign key dependencies.
-- =============================================================


-- -------------------------------------------------------------
-- 1. MISSION CONTROL CENTERS
-- -------------------------------------------------------------
INSERT INTO public.mission_control_centers (mcc_id, center_name, location_city, timezone) VALUES
  (1, 'NASA Johnson', 'Houston',   'CST'),
  (2, 'ESA ESOC',     'Darmstadt', 'CET');


-- -------------------------------------------------------------
-- 2. GROUND STATIONS
-- -------------------------------------------------------------
INSERT INTO public.ground_station (gs_id, gs_location, theta_deg) VALUES
  (1, 'Houston, USA',        70),
  (2, 'Madrid, Spain',        0),
  (3, 'Canberra, Australia',  0);


-- -------------------------------------------------------------
-- 3. MISSIONS
--    (depends on: mission_control_centers)
-- -------------------------------------------------------------
INSERT INTO public.missions (mission_id, mcc_id, mission_name, mission_goal, start_date) VALUES
  (1, 1, 'Artemis I',                  'Lunar Exploration',             '2026-01-01'),
  (2, 1, 'Starlink-Gen2',              'Internet Constellation',        '2026-02-15'),
  (3, 2, 'Sentinel-Ocean',             'Climate Mapping',               '2025-11-20'),
  (4, 2, 'Orbit Promotion Test Mission','Test full maneuver lifecycle',  '2026-03-15');


-- -------------------------------------------------------------
-- 4. COMMAND VAULT
-- -------------------------------------------------------------
INSERT INTO public.command_vault (cmd_id, hex_code, description, power_cost_watts) VALUES
  (1, '0xAF', 'Reboot System', 50.0),
  (2, '0xBC', 'Thruster Burn', 120.0),
  (3, '0xDE', 'Deploy Solar',  15.0),
  (4, '0x11', 'Ping',          1.0);


-- -------------------------------------------------------------
-- 5. SATELLITES
--    (depends on: missions)
-- -------------------------------------------------------------
INSERT INTO public.satellites (sat_id, mission_id, model_name, status) VALUES
  (1, 1, 'Orion-Alpha', 'DECOMMISSIONED'),
  (2, 2, 'Star-01',     'ACTIVE'),
  (3, 2, 'Star-02',     'ACTIVE'),
  (4, 3, 'Aqua-Scan',   'ACTIVE'),
  (5, 1, 'Lunar-Relay', 'SAFE_MODE'),
  (8, 4, 'HS-1',        'ACTIVE');


-- -------------------------------------------------------------
-- 6. SATELLITE STATE
--    (depends on: satellites)
-- -------------------------------------------------------------
INSERT INTO public.satellite_state (state_id, sat_id, orbit_id, theta_deg, altitude_km, velocity_kms, last_updated, fuel_level) VALUES
  (1, 1, 1, 343.4, 2,     7.8,     '2026-04-05 17:47:08.045434', 1),
  (2, 2, 2, 225.1, 410.5, 7.7,     '2026-04-05 17:47:08.045434', 70.0),
  (3, 3, 1, 320.3, 412.0, 7.7,     '2026-04-05 17:47:08.045434', 75),
  (4, 4, 2, 11.5,  850.0, 6.5,     '2026-04-05 17:47:08.045434', 75),
  (5, 5, 2, 33.2,  860.0, 6.4,     '2026-04-05 17:47:08.045434', 75),
  (6, 8, 2, 103,   300,   750011,  '2026-04-05 17:47:08.045434', 84);


-- -------------------------------------------------------------
-- 7. SUBSYSTEMS
--    (depends on: satellites)
-- -------------------------------------------------------------
INSERT INTO public.subsystems (sub_id, sat_id, sub_type, mode) VALUES
  (1,  1, 'Power',        'ACTIVE'),
  (2,  1, 'Propulsion',   'ACTIVE'),
  (3,  1, 'Comm',         'ACTIVE'),
  (4,  2, 'Power',        'ACTIVE'),
  (5,  2, 'Propulsion',   'ACTIVE'),
  (6,  2, 'Comm',         'ACTIVE'),
  (23, 1, 'Power System', NULL),
  (24, 2, 'Power System', NULL),
  (25, 3, 'Power System', NULL),
  (26, 4, 'Power System', NULL);


-- -------------------------------------------------------------
-- 8. COMPONENTS
--    (depends on: subsystems)
-- -------------------------------------------------------------
INSERT INTO public.components (comp_id, sub_id, part_name, health_index) VALUES
  (1, 1, 'Solar Array', 98),
  (2, 2, 'Thruster A',  100),
  (3, 3, 'Transponder', 95),
  (4, 1, 'Battery',     60);


-- -------------------------------------------------------------
-- 9. MANEUVER PLANS
--    (depends on: satellites)
-- -------------------------------------------------------------
INSERT INTO public.maneuver_plans (plan_id, sat_id, target_orbit, thrust_val, approval_status, execution_time) VALUES
  (1, 1, 2, 10.5, 'PENDING',   '2026-03-13 13:57:42.686915'),
  (2, 2, 1, 5.0,  'COMPLETED', '2026-03-14 02:27:49.832657'),
  (3, 8, 2, 20,   'COMPLETED', '2026-03-15 07:00:57.039703');


-- -------------------------------------------------------------
-- 10. TRANSACTION LOGS
--     (depends on: maneuver_plans)
-- -------------------------------------------------------------
INSERT INTO public.transaction_logs (tx_id, plan_id, pre_fuel_kg, pre_altitude_km, tx_status) VALUES
  (1, 1, 500.0, 400.0, 'SUCCESS'),
  (2, 2, 450.0, 410.5, 'PENDING'),
  (3, 3, 100,   NULL,  'SUCCESS'),
  (4, 3, 100,   1,     'SUCCESS');


-- -------------------------------------------------------------
-- 11. SPACE DEBRIS CATALOG
--     (no foreign keys — required before observations)
-- -------------------------------------------------------------
-- NOTE: observations references debris_id 1–5; insert matching rows.
-- Only debris_id values referenced in observations are included.
INSERT INTO public.space_debris_catalog (debris_id, cluster_id, theta_deg, orbit_id, danger_radius_km) VALUES
  (1, 1, 0,   1, 5.0),
  (2, 1, 45,  1, 3.0),
  (3, 2, 90,  2, 4.0),
  (4, 2, 135, 2, 6.0),
  (5, 3, 180, 3, 2.0);


-- -------------------------------------------------------------
-- 12. OBSERVATIONS
--     (depends on: satellites, space_debris_catalog)
-- -------------------------------------------------------------
INSERT INTO public.observations (obs_id, sat_id, debris_id, detection_timestamp, confidence_score) VALUES
  (1,  1, 1, '2026-02-22 19:07:33.085283', 0.95),
  (2,  4, 4, '2026-02-22 19:07:33.085283', 0.88),
  (3,  5, 4, '2026-03-15 14:19:55.937602', 0.8),
  (4,  5, 4, '2026-03-15 14:19:55.937379', 0.8),
  (5,  5, 5, '2026-03-15 14:19:56.058935', 0.8),
  (6,  5, 5, '2026-03-15 14:19:56.096708', 0.8),
  (7,  3, 1, '2026-03-15 14:19:56.164372', 0.8),
  (8,  3, 1, '2026-03-15 14:19:56.199444', 0.8),
  (9,  3, 2, '2026-03-15 14:19:56.339981', 0.8),
  (10, 3, 2, '2026-03-15 14:19:56.340317', 0.8),
  (11, 3, 3, '2026-03-15 14:19:56.441868', 0.8),
  (12, 3, 3, '2026-03-15 14:19:56.443043', 0.8),
  (13, 4, 4, '2026-03-15 14:19:56.579453', 0.8),
  (14, 4, 4, '2026-03-15 14:19:56.579843', 0.8),
  (15, 4, 5, '2026-03-15 14:19:56.681060', 0.8),
  (16, 4, 5, '2026-03-15 14:19:56.710345', 0.8),
  (17, 2, 4, '2026-03-15 14:19:56.785430', 0.8),
  (18, 2, 4, '2026-03-15 14:19:56.815097', 0.8),
  (19, 2, 5, '2026-03-15 14:19:56.887917', 0.8),
  (20, 2, 5, '2026-03-15 14:19:56.918837', 0.8),
  (21, 1, 1, '2026-03-15 14:19:57.185386', 0.8),
  (22, 1, 1, '2026-03-15 14:19:57.185577', 0.8),
  (23, 1, 2, '2026-03-15 14:19:57.332190', 0.8),
  (24, 1, 2, '2026-03-15 14:19:57.333058', 0.8),
  (25, 1, 3, '2026-03-15 14:19:57.470439', 0.8),
  (26, 1, 3, '2026-03-15 14:19:57.471039', 0.8),
  (27, 8, 4, '2026-03-15 14:19:57.574193', 0.8),
  (28, 8, 4, '2026-03-15 14:19:57.574575', 0.8),
  (29, 8, 5, '2026-03-15 14:19:57.678155', 0.8),
  (30, 8, 5, '2026-03-15 14:19:57.678667', 0.8),
  (31, 5, 4, '2026-03-15 14:19:59.985846', 0.8),
  (32, 5, 4, '2026-03-15 14:19:59.989964', 0.8),
  (33, 5, 5, '2026-03-15 14:20:00.583526', 0.8),
  (34, 5, 5, '2026-03-15 14:20:00.586564', 0.8),
  (35, 3, 1, '2026-03-15 14:20:00.734508', 0.8),
  (36, 3, 1, '2026-03-15 14:20:00.737997', 0.8),
  (37, 3, 2, '2026-03-15 14:20:00.843045', 0.8),
  (38, 3, 2, '2026-03-15 14:20:00.843045', 0.8);


-- -------------------------------------------------------------
-- 13. DEPARTMENTS
--     (depends on: ground_station)
-- -------------------------------------------------------------
INSERT INTO public.department (dep_id, gs_id, dep_name) VALUES
  (1, 1, 'Antenna Maintenance'),
  (2, 2, 'Signal Processing'),
  (3, 3, 'Security');


-- -------------------------------------------------------------
-- 14. PERSONNEL
--     (depends on: department)
-- -------------------------------------------------------------
INSERT INTO public.personnel (person_id, dep_id, person_name, role, is_working) VALUES
  (1,  1, 'Commander Chris',   'Lead',        true),
  (2,  1, 'Buzz Lightyear',    'Engineer',    true),
  (3,  1, 'Neil A.',           'Tech',        true),
  (4,  1, 'Sally Ride',        'Engineer',    true),
  (5,  1, 'Jim Lovell',        'Engineer',    true),
  (6,  1, 'Fred Haise',        'Maintenance', true),
  (7,  1, 'Jack Swigert',      'Analyst',     true),
  (8,  1, 'Gene Kranz',        'Engineer',    true),
  (9,  1, 'Katherine Johnson', 'Engineer',    true),
  (10, 1, 'Margaret H.',       'Software',    true);


-- -------------------------------------------------------------
-- 15. DISHES
--     (depends on: ground_station)
-- -------------------------------------------------------------
INSERT INTO public.dish (dish_id, gs_id, elevation_angle, max_distance, is_transmitting) VALUES
  (1, 1, 75, 1200, true),
  (2, 2, 30, 1500, false),
  (3, 3, 60, 2000, true);


-- -------------------------------------------------------------
-- 16. ACCESS TIME
--     (depends on: satellites [state_id → sat_id], ground_station)
-- -------------------------------------------------------------
INSERT INTO public.access_time (access_id, state_id, gs_id, extra_start, extra_end, date, status, is_successful, start_time, end_time) VALUES
  (1,  1, 1, '10:00:00', '10:15:00', '2026-02-23', 'COMPLETED', true,  NULL,                        NULL),
  (2,  2, 2, '11:30:00', '11:45:00', '2026-02-23', 'FAILED',    false, NULL,                        NULL),
  (9,  1, 1, NULL,       NULL,       '1970-01-01', 'PENDING',   NULL,  '1970-01-01 00:00:00+00',    '1970-01-01 00:00:00+00'),
  (10, 1, 1, NULL,       NULL,       '1970-01-01', 'PENDING',   NULL,  '1970-01-01 00:00:00+00',    '1970-01-01 00:00:00+00');


-- -------------------------------------------------------------
-- 17. PASS ASSIGNMENTS
--     (depends on: access_time, dish)
-- -------------------------------------------------------------
INSERT INTO public.pass_assignment (assignment_id, access_id, dish_id, actual_time, actual_date) VALUES
  (1, 1, 1, '10:02:00', '2026-02-23'),
  (2, 2, 2, '11:30:00', '2026-02-23');


-- -------------------------------------------------------------
-- 18. TELEMETRY LOGS
--     (depends on: components)
--     NOTE: rows 3 and the tail of row 31 were corrupted in the
--     source dump and have been reconstructed from context.
-- -------------------------------------------------------------
INSERT INTO public.telemetry_logs (log_id, comp_id, log_timestamp, val, is_eclipse) VALUES
  (1,  1, '2026-02-22 18:46:51.241681', 14.1,   false),
  (2,  1, '2026-02-22 18:46:51.241681', 14.2,   false),
  (3,  1, '2026-02-22 18:46:51.241681', 99.9,   false),
  (17, 2, '2026-02-22 18:46:51.241681', 100.0,  false),
  (18, 2, '2026-02-22 18:46:51.241681', 100.1,  false),
  (19, 2, '2026-02-22 18:46:51.241681', 100.0,  false),
  (20, 2, '2026-02-22 18:46:51.241681', 99.7,   false),
  (21, 3, '2026-02-22 18:46:51.241681', -10.1,  true),
  (22, 3, '2026-02-22 18:46:51.241681', -10.2,  true),
  (23, 3, '2026-02-22 18:46:51.241681', -10.1,  true),
  (24, 3, '2026-02-22 18:46:51.241681', -10.3,  true),
  (25, 3, '2026-02-22 18:46:51.241681', -10.2,  true),
  (26, 3, '2026-02-22 18:46:51.241681', -10.1,  true),
  (27, 3, '2026-02-22 18:46:51.241681', -10.4,  true),
  (28, 3, '2026-02-22 18:46:51.241681', -10.2,  true),
  (29, 3, '2026-02-22 18:46:51.241681', -10.1,  true),
  (30, 3, '2026-02-22 18:46:51.241681', -10.3,  true),
  (31, 1, '2026-02-22 19:08:33.081730', 18.94,  false);


-- -------------------------------------------------------------
-- 19. USERS
--     (depends on: missions)
-- -------------------------------------------------------------
INSERT INTO public.users (user_id, username, password_hash, role, mission_id) VALUES
  (1, 'Abdul Rafay', '$2a$04$oe/pgZz4JvkIJxhCaOCwv.5tkqrA9ipyjHA26.4H2S9X9V8k2RHeu', 'GROUND_STATION_OPERATOR', 1),
  (3, 'Ahmed',       '$2a$04$zwOSVMAmEcVNEzGeJTnIpOVTl7BJ8SKa.XDoUng5LPYGfaep4OQ7C', 'MISSION_ENGINEER',        1);
