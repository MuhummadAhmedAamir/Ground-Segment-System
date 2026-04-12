-- 1. Base Tables (No Foreign Keys)
CREATE TABLE public.ground_station (
  gs_id SERIAL PRIMARY KEY,
  gs_location character varying,
  theta_deg numeric DEFAULT 0
);

CREATE TABLE public.mission_control_centers (
  mcc_id SERIAL PRIMARY KEY,
  center_name character varying,
  location_city character varying,
  timezone character varying
);

CREATE TABLE public.celestial_bodies (
  body_id SERIAL PRIMARY KEY,
  body_name character varying,
  fixed_theta numeric
);

CREATE TABLE public.command_vault (
  cmd_id SERIAL PRIMARY KEY,
  hex_code character varying UNIQUE,
  description text,
  power_cost_watts numeric
);

CREATE TABLE public.space_debris_catalog (
  debris_id SERIAL PRIMARY KEY,
  cluster_id integer,
  theta_deg numeric,
  orbit_id integer,
  danger_radius_km numeric
);

-- 2. Tables dependent on Level 1
CREATE TABLE public.missions (
  mission_id SERIAL PRIMARY KEY,
  mcc_id integer REFERENCES public.mission_control_centers(mcc_id),
  mission_name character varying,
  mission_goal text,
  start_date date
);

CREATE TABLE public.department (
  dep_id SERIAL PRIMARY KEY,
  gs_id integer REFERENCES public.ground_station(gs_id),
  dep_name character varying
);

CREATE TABLE public.dish (
  dish_id SERIAL PRIMARY KEY,
  gs_id integer REFERENCES public.ground_station(gs_id),
  elevation_angle integer,
  max_distance integer,
  is_transmitting boolean
);

-- 3. Tables dependent on Missions/Departments
CREATE TABLE public.satellites (
  sat_id SERIAL PRIMARY KEY,
  mission_id integer REFERENCES public.missions(mission_id),
  model_name character varying,
  status character varying
);

CREATE TABLE public.personnel (
  person_id SERIAL PRIMARY KEY,
  dep_id integer REFERENCES public.department(dep_id),
  person_name character varying,
  role character varying,
  is_working boolean
);

CREATE TABLE public.users (
  user_id SERIAL PRIMARY KEY,
  username character varying NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role character varying NOT NULL,
  mission_id integer REFERENCES public.missions(mission_id)
);

-- 4. Tables dependent on Satellites/Personnel
CREATE TABLE public.access_time (
  access_id SERIAL PRIMARY KEY,
  state_id integer REFERENCES public.satellites(sat_id),
  gs_id integer REFERENCES public.ground_station(gs_id),
  extra_start time without time zone,
  extra_end time without time zone,
  date date,
  status character varying,
  is_successful boolean,
  start_time timestamp with time zone,
  end_time timestamp with time zone
);

CREATE TABLE public.subsystems (
  sub_id SERIAL PRIMARY KEY,
  sat_id integer REFERENCES public.satellites(sat_id),
  sub_type character varying,
  mode character varying
);

CREATE TABLE public.satellite_state (
  state_id SERIAL PRIMARY KEY,
  sat_id integer UNIQUE REFERENCES public.satellites(sat_id),
  orbit_id integer,
  theta_deg numeric,
  altitude_km numeric,
  velocity_kms numeric,
  last_updated timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  fuel_level numeric
);

CREATE TABLE public.maneuver_plans (
  plan_id SERIAL PRIMARY KEY,
  sat_id integer REFERENCES public.satellites(sat_id),
  target_orbit integer,
  thrust_val numeric,
  approval_status character varying,
  execution_time timestamp without time zone
);

CREATE TABLE public.command_history (
  hist_id SERIAL PRIMARY KEY,
  sat_id integer REFERENCES public.satellites(sat_id),
  cmd_id integer REFERENCES public.command_vault(cmd_id),
  execution_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.command_authorization (
  auth_id SERIAL PRIMARY KEY,
  cmd_id integer REFERENCES public.command_vault(cmd_id),
  person_id integer REFERENCES public.personnel(person_id),
  approval_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- 5. Deeply nested dependencies
CREATE TABLE public.components (
  comp_id SERIAL PRIMARY KEY,
  sub_id integer REFERENCES public.subsystems(sub_id),
  part_name character varying,
  health_index integer
);

CREATE TABLE public.observations (
  obs_id SERIAL PRIMARY KEY,
  sat_id integer REFERENCES public.satellites(sat_id),
  debris_id integer REFERENCES public.space_debris_catalog(debris_id),
  detection_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  confidence_score numeric
);

CREATE TABLE public.pass_assignment (
  assignment_id SERIAL PRIMARY KEY,
  access_id integer REFERENCES public.access_time(access_id),
  dish_id integer REFERENCES public.dish(dish_id),
  actual_time time without time zone,
  actual_date date
);

CREATE TABLE public.telemetry_logs (
  log_id BIGSERIAL PRIMARY KEY,
  comp_id integer REFERENCES public.components(comp_id),
  log_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  val numeric,
  is_eclipse boolean
);

CREATE TABLE public.transaction_logs (
  tx_id SERIAL PRIMARY KEY,
  plan_id integer REFERENCES public.maneuver_plans(plan_id),
  pre_fuel_kg numeric,
  pre_altitude_km numeric,
  tx_status character varying
);


-- 1. Corrected Indexes (Fixed missing semicolon and column names)
CREATE INDEX idx_telemetry_val ON telemetry_logs(val);
-- Note: 'risk_level' doesn't exist in your schema, changed to 'danger_radius_km'
CREATE INDEX idx_debris_spatial_risk ON space_debris_catalog(orbit_id, danger_radius_km);
CREATE INDEX idx_satellite_state ON satellite_state(sat_id);
-- Changed sat_id to state_id to match your access_time table definition
CREATE INDEX idx_access_time_sat ON access_time(state_id);
CREATE INDEX idx_access_time_gs ON access_time(gs_id);
CREATE INDEX idx_access_time_dish ON dish(gs_id);

-- 2. Corrected Views (Updated column names like fuel_level)
CREATE OR REPLACE VIEW MCE_Satellite_Status AS
SELECT 
    s.sat_id,
    s.model_name AS satellite,
    s.status AS operational_status,
    ss.altitude_km,
    ss.velocity_kms,
    ss.fuel_level AS fuel_remaining,
    ss.last_updated,
    m.mission_name,
    mcc.center_name AS controlled_by
FROM satellites s
JOIN satellite_state ss ON s.sat_id = ss.sat_id
JOIN missions m ON s.mission_id = m.mission_id
JOIN mission_control_centers mcc ON m.mcc_id = mcc.mcc_id;

CREATE OR REPLACE VIEW MCE_Next_Passes AS
SELECT 
    a.access_id,
    a.date,
    a.start_time,
    a.end_time,
    s.sat_id,
    s.model_name AS satellite,
    gs.gs_location AS ground_station,
    a.status AS pass_status
FROM access_time a
JOIN satellites s ON a.state_id = s.sat_id
JOIN ground_station gs ON a.gs_id = gs.gs_id
WHERE a.status = 'scheduled'
  -- Added ::time cast below to fix the operator error
  AND (a.date > CURRENT_DATE OR (a.date = CURRENT_DATE AND a.start_time::time > CURRENT_TIME))
  AND a.date <= CURRENT_DATE + INTERVAL '1 day'
ORDER BY a.date, a.start_time;

-- 3. Corrected Trigger Functions (Removed "FK" suffix from column names)
CREATE OR REPLACE FUNCTION update_sat_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.approval_status = 'COMPLETED' THEN
        UPDATE satellites
        SET status = 'ACTIVE'
        WHERE sat_id = NEW.sat_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_health()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.val < 5 THEN
        UPDATE components
        SET health_index = 10
        WHERE comp_id = NEW.comp_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_reentry()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.altitude_km < 200 THEN
        UPDATE satellites
        SET status = 'DECOMMISSIONED'
        WHERE sat_id = NEW.sat_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Re-creating Triggers
DROP TRIGGER IF EXISTS trg_update_sat_status ON maneuver_plans;
CREATE TRIGGER trg_update_sat_status
AFTER UPDATE ON maneuver_plans
FOR EACH ROW EXECUTE FUNCTION update_sat_status();

DROP TRIGGER IF EXISTS trg_health_alert ON telemetry_logs;
CREATE TRIGGER trg_health_alert
AFTER INSERT ON telemetry_logs
FOR EACH ROW EXECUTE FUNCTION check_health();

DROP TRIGGER IF EXISTS trg_reentry_check ON satellite_state;
CREATE TRIGGER trg_reentry_check
AFTER UPDATE ON satellite_state
FOR EACH ROW EXECUTE FUNCTION check_reentry();