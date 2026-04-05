CREATE TABLE public.access_time (
  access_id integer NOT NULL DEFAULT nextval('access_time_access_id_seq'::regclass),
  state_id integer,
  gs_id integer,
  extra_start time without time zone,
  extra_end time without time zone,
  date date,
  status character varying,
  is_successful boolean,
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  CONSTRAINT access_time_pkey PRIMARY KEY (access_id),
  CONSTRAINT access_time_gs_id_fkey FOREIGN KEY (gs_id) REFERENCES public.ground_station(gs_id),
  CONSTRAINT access_time_state_id_fkey FOREIGN KEY (state_id) REFERENCES public.satellites(sat_id)
);
CREATE TABLE public.celestial_bodies (
  body_id integer NOT NULL DEFAULT nextval('celestial_bodies_body_id_seq'::regclass),
  body_name character varying,
  fixed_theta numeric,
  CONSTRAINT celestial_bodies_pkey PRIMARY KEY (body_id)
);
CREATE TABLE public.command_authorization (
  auth_id integer NOT NULL DEFAULT nextval('command_authorization_auth_id_seq'::regclass),
  cmd_id integer,
  person_id integer,
  approval_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT command_authorization_pkey PRIMARY KEY (auth_id),
  CONSTRAINT command_authorization_cmd_id_fkey FOREIGN KEY (cmd_id) REFERENCES public.command_vault(cmd_id),
  CONSTRAINT command_authorization_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.personnel(person_id)
);
CREATE TABLE public.command_history (
  hist_id integer NOT NULL DEFAULT nextval('command_history_hist_id_seq'::regclass),
  sat_id integer,
  cmd_id integer,
  execution_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT command_history_pkey PRIMARY KEY (hist_id),
  CONSTRAINT command_history_sat_id_fkey FOREIGN KEY (sat_id) REFERENCES public.satellites(sat_id),
  CONSTRAINT command_history_cmd_id_fkey FOREIGN KEY (cmd_id) REFERENCES public.command_vault(cmd_id)
);
CREATE TABLE public.command_vault (
  cmd_id integer NOT NULL DEFAULT nextval('command_vault_cmd_id_seq'::regclass),
  hex_code character varying UNIQUE,
  description text,
  power_cost_watts numeric,
  CONSTRAINT command_vault_pkey PRIMARY KEY (cmd_id)
);
CREATE TABLE public.components (
  comp_id integer NOT NULL DEFAULT nextval('components_comp_id_seq'::regclass),
  sub_id integer,
  part_name character varying,
  health_index integer,
  CONSTRAINT components_pkey PRIMARY KEY (comp_id),
  CONSTRAINT components_sub_id_fkey FOREIGN KEY (sub_id) REFERENCES public.subsystems(sub_id)
);
CREATE TABLE public.department (
  dep_id integer NOT NULL DEFAULT nextval('department_dep_id_seq'::regclass),
  gs_id integer,
  dep_name character varying,
  CONSTRAINT department_pkey PRIMARY KEY (dep_id),
  CONSTRAINT department_gs_id_fkey FOREIGN KEY (gs_id) REFERENCES public.ground_station(gs_id)
);
CREATE TABLE public.dish (
  dish_id integer NOT NULL DEFAULT nextval('dish_dish_id_seq'::regclass),
  gs_id integer,
  elevation_angle integer,
  max_distance integer,
  is_transmitting boolean,
  CONSTRAINT dish_pkey PRIMARY KEY (dish_id),
  CONSTRAINT dish_gs_id_fkey FOREIGN KEY (gs_id) REFERENCES public.ground_station(gs_id)
);
CREATE TABLE public.ground_station (
  gs_id integer NOT NULL DEFAULT nextval('ground_station_gs_id_seq'::regclass),
  gs_location character varying,
  theta_deg numeric DEFAULT '0'::numeric,
  CONSTRAINT ground_station_pkey PRIMARY KEY (gs_id)
);
CREATE TABLE public.maneuver_plans (
  plan_id integer NOT NULL DEFAULT nextval('maneuver_plans_plan_id_seq'::regclass),
  sat_id integer,
  target_orbit integer,
  thrust_val numeric,
  approval_status character varying,
  execution_time timestamp without time zone,
  CONSTRAINT maneuver_plans_pkey PRIMARY KEY (plan_id),
  CONSTRAINT maneuver_plans_sat_id_fkey FOREIGN KEY (sat_id) REFERENCES public.satellites(sat_id)
);
CREATE TABLE public.mission_control_centers (
  mcc_id integer NOT NULL DEFAULT nextval('mission_control_centers_mcc_id_seq'::regclass),
  center_name character varying,
  location_city character varying,
  timezone character varying,
  CONSTRAINT mission_control_centers_pkey PRIMARY KEY (mcc_id)
);
CREATE TABLE public.missions (
  mission_id integer NOT NULL DEFAULT nextval('missions_mission_id_seq'::regclass),
  mcc_id integer,
  mission_name character varying,
  mission_goal text,
  start_date date,
  CONSTRAINT missions_pkey PRIMARY KEY (mission_id),
  CONSTRAINT missions_mcc_id_fkey FOREIGN KEY (mcc_id) REFERENCES public.mission_control_centers(mcc_id)
);
CREATE TABLE public.observations (
  obs_id integer NOT NULL DEFAULT nextval('observations_obs_id_seq'::regclass),
  sat_id integer,
  debris_id integer,
  detection_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  confidence_score numeric,
  CONSTRAINT observations_pkey PRIMARY KEY (obs_id),
  CONSTRAINT observations_sat_id_fkey FOREIGN KEY (sat_id) REFERENCES public.satellites(sat_id),
  CONSTRAINT observations_debris_id_fkey FOREIGN KEY (debris_id) REFERENCES public.space_debris_catalog(debris_id)
);
CREATE TABLE public.pass_assignment (
  assignment_id integer NOT NULL DEFAULT nextval('pass_assignment_assignment_id_seq'::regclass),
  access_id integer,
  dish_id integer,
  actual_time time without time zone,
  actual_date date,
  CONSTRAINT pass_assignment_pkey PRIMARY KEY (assignment_id),
  CONSTRAINT pass_assignment_access_id_fkey FOREIGN KEY (access_id) REFERENCES public.access_time(access_id),
  CONSTRAINT pass_assignment_dish_id_fkey FOREIGN KEY (dish_id) REFERENCES public.dish(dish_id)
);
CREATE TABLE public.personnel (
  person_id integer NOT NULL DEFAULT nextval('personnel_person_id_seq'::regclass),
  dep_id integer,
  person_name character varying,
  role character varying,
  is_working boolean,
  CONSTRAINT personnel_pkey PRIMARY KEY (person_id),
  CONSTRAINT personnel_dep_id_fkey FOREIGN KEY (dep_id) REFERENCES public.department(dep_id)
);
CREATE TABLE public.satellite_state (
  state_id integer NOT NULL DEFAULT nextval('satellite_state_state_id_seq'::regclass),
  sat_id integer UNIQUE,
  orbit_id integer,
  theta_deg numeric,
  altitude_km numeric,
  velocity_kms numeric,
  last_updated timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  fuel_level numeric,
  CONSTRAINT satellite_state_pkey PRIMARY KEY (state_id),
  CONSTRAINT satellite_state_sat_id_fkey FOREIGN KEY (sat_id) REFERENCES public.satellites(sat_id)
);
CREATE TABLE public.satellites (
  sat_id integer NOT NULL DEFAULT nextval('satellites_sat_id_seq'::regclass),
  mission_id integer,
  model_name character varying,
  status character varying,
  CONSTRAINT satellites_pkey PRIMARY KEY (sat_id),
  CONSTRAINT satellites_mission_id_fkey FOREIGN KEY (mission_id) REFERENCES public.missions(mission_id)
);
CREATE TABLE public.space_debris_catalog (
  debris_id integer NOT NULL DEFAULT nextval('space_debris_catalog_debris_id_seq'::regclass),
  cluster_id integer,
  theta_deg numeric,
  orbit_id integer,
  danger_radius_km numeric,
  CONSTRAINT space_debris_catalog_pkey PRIMARY KEY (debris_id)
);
CREATE TABLE public.subsystems (
  sub_id integer NOT NULL DEFAULT nextval('subsystems_sub_id_seq'::regclass),
  sat_id integer,
  sub_type character varying,
  mode character varying,
  CONSTRAINT subsystems_pkey PRIMARY KEY (sub_id),
  CONSTRAINT subsystems_sat_id_fkey FOREIGN KEY (sat_id) REFERENCES public.satellites(sat_id)
);
CREATE TABLE public.telemetry_logs (
  log_id bigint NOT NULL DEFAULT nextval('telemetry_logs_log_id_seq'::regclass),
  comp_id integer,
  log_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  val numeric,
  is_eclipse boolean,
  CONSTRAINT telemetry_logs_pkey PRIMARY KEY (log_id),
  CONSTRAINT telemetry_logs_comp_id_fkey FOREIGN KEY (comp_id) REFERENCES public.components(comp_id)
);
CREATE TABLE public.transaction_logs (
  tx_id integer NOT NULL DEFAULT nextval('transaction_logs_tx_id_seq'::regclass),
  plan_id integer,
  pre_fuel_kg numeric,
  pre_altitude_km numeric,
  tx_status character varying,
  CONSTRAINT transaction_logs_pkey PRIMARY KEY (tx_id),
  CONSTRAINT transaction_logs_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.maneuver_plans(plan_id)
);
CREATE TABLE public.users (
  user_id integer NOT NULL DEFAULT nextval('users_user_id_seq'::regclass),
  username character varying NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role character varying NOT NULL,
  mission_id integer,
  CONSTRAINT users_pkey PRIMARY KEY (user_id),
  CONSTRAINT users_mission_id_fkey FOREIGN KEY (mission_id) REFERENCES public.missions(mission_id)
);




Create INDEX idx_telemetry_val ON Telemetry_Logs(val)
CREATE INDEX idx_debris_spatial_risk ON Space_Debris_Catalog(orbit_id, risk_level)
CREATE INDEX idx_satellite_state ON satellite_state(sat_id);
CREATE INDEX idx_access_time_sat ON access_time(sat_id);
CREATE INDEX idx_access_time_gs ON access_time(gs_id);
CREATE INDEX idx_access_time_dish ON dish(gs_id);




CREATE VIEW MCE_Satellite_Status AS
SELECT 
    s.sat_id,
    s.model_name AS satellite,
    s.status AS operational_status,
    ss.altitude_km,
    ss.velocity_kms,
    ss.fuel_remaining_kg,
    ss.last_updated,
    m.mission_name,
    mcc.center_name AS controlled_by
FROM Satellites s
JOIN Satellite_State ss ON s.sat_id = ss.sat_id
JOIN Missions m ON s.mission_id = m.mission_id
JOIN Mission_Control_Centers mcc ON m.mcc_id = mcc.mcc_id;



CREATE VIEW MCE_Next_Passes AS
SELECT 
    a.access_id,
    a.date,
    a.start_time,
    a.end_time,
    s.sat_id,
    s.model_name AS satellite,
    gs.gs_location AS ground_station,
    a.status AS pass_status
FROM Access_Time a
JOIN Satellites s ON a.sat_id = s.sat_id
JOIN Ground_Station gs ON a.gs_id = gs.gs_id
WHERE a.status = 'scheduled'
  AND (a.date > CURRENT_DATE OR (a.date = CURRENT_DATE AND a.start_time > CURRENT_TIME))
  AND a.date <= CURRENT_DATE + INTERVAL '1 day'
ORDER BY a.date, a.start_time;




CREATE OR REPLACE FUNCTION update_sat_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.approval_status = 'COMPLETED' THEN
        UPDATE "Satellites"
        SET "status" = 'ACTIVE'
        WHERE "sat_id" = NEW."sat_id FK";
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_sat_status
AFTER UPDATE ON maneuver_plans
FOR EACH ROW
EXECUTE FUNCTION update_sat_status();

CREATE OR REPLACE FUNCTION check_health()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.val < 5 THEN
        UPDATE "Components"
        SET "health_index" = 10
        WHERE "comp_id" = NEW."comp_id FK";
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_health_alert
AFTER INSERT ON telemetry_logs
FOR EACH ROW
EXECUTE FUNCTION check_health();

CREATE OR REPLACE FUNCTION check_reentry()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.altitude_km < 200 THEN
        UPDATE "Satellites"
        SET "status" = 'DECOMMISSIONED'
        WHERE "sat_id" = NEW."sat_id FK UNIQUE";
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reentry_check
AFTER UPDATE ON satellite_state
FOR EACH ROW
EXECUTE FUNCTION check_reentry();