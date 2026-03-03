CREATE TABLE "Ground Station" (
  "gs_id" INT PRIMARY KEY,
  "gs_location" VARCHAR
);

CREATE TABLE "Dish" (
  "dish_id" INT PRIMARY KEY,
  "gs_id" INT REFERENCES "Ground Station"("gs_id"),
  "elevation_angle" INT,
  "max_distance" INT,
  "is_transmitting" BOOLEAN
);

CREATE TABLE "Department" (
  "dep_id" INT PRIMARY KEY,
  "gs_id" INT REFERENCES "Ground Station"("gs_id"),
  "dep_name" VARCHAR
);

CREATE TABLE "Personnel" (
  "person_id" INT PRIMARY KEY,
  "dep_id" INT REFERENCES "Department"("dep_id"),
  "person_name" VARCHAR,
  "role" VARCHAR,
  "is_working" BOOLEAN
);

CREATE TABLE "Mission_Control_Centers" (
  "mcc_id" INT PRIMARY KEY,
  "center_name" VARCHAR,
  "location_city" VARCHAR,
  "timezone" VARCHAR
);

CREATE TABLE "Missions" (
  "mission_id" INT PRIMARY KEY,
  "mcc_id" INT REFERENCES "Mission_Control_Centers"("mcc_id"),
  "mission_name" VARCHAR,
  "mission_goal" TEXT,
  "start_date" DATE
);

CREATE TABLE "Satellites" (
  "sat_id" INT PRIMARY KEY,
  "mission_id" INT REFERENCES "Missions"("mission_id"),
  "model_name" VARCHAR,
  "status" VARCHAR
);

CREATE TABLE "Subsystems" (
  "sub_id" INT PRIMARY KEY,
  "sat_id" INT REFERENCES "Satellites"("sat_id"),
  "sub_type" VARCHAR,
  "mode" VARCHAR
);

CREATE TABLE "Components" (
  "comp_id" INT PRIMARY KEY,
  "sub_id" INT REFERENCES "Subsystems"("sub_id"),
  "part_name" VARCHAR,
  "health_index" INT
);

CREATE TABLE "Satellite_State" (
  "state_id" INT PRIMARY KEY,
  "sat_id" INT UNIQUE REFERENCES "Satellites"("sat_id"),
  "orbit_id" INT,
  "theta_deg" DECIMAL,
  "altitude_km" DECIMAL,
  "velocity_kms" DECIMAL,
  "last_updated" TIMESTAMP
);

CREATE TABLE "Telemetry_Logs" (
  "log_id" BIGINT PRIMARY KEY,
  "comp_id" INT REFERENCES "Components"("comp_id"),
  "log_timestamp" TIMESTAMP,
  "val" DECIMAL,
  "is_eclipse" BOOLEAN
);

CREATE TABLE "Command_Vault" (
  "cmd_id" INT PRIMARY KEY,
  "hex_code" VARCHAR UNIQUE,
  "description" TEXT,
  "power_cost_watts" DECIMAL
);

CREATE TABLE "Command_History" (
  "hist_id" INT PRIMARY KEY,
  "sat_id" INT REFERENCES "Satellites"("sat_id"),
  "cmd_id" INT REFERENCES "Command_Vault"("cmd_id"),
  "execution_time" TIMESTAMP
);

CREATE TABLE "Command Authorization" (
  "auth_id" INT PRIMARY KEY,
  "cmd_id" INT REFERENCES "Command_Vault"("cmd_id"),
  "person_id" INT REFERENCES "Personnel"("person_id"),
  "approval_time" TIMESTAMP
);

CREATE TABLE "Space_Debris_Catalog" (
  "debris_id" INT PRIMARY KEY,
  "cluster_id" INT,
  "theta_deg" DECIMAL,
  "orbit_id" INT,
  "danger_radius_km" DECIMAL,
  "risk_level" VARCHAR
);

CREATE TABLE "Observations" (
  "obs_id" INT PRIMARY KEY,
  "sat_id" INT REFERENCES "Satellites"("sat_id"),
  "debris_id" INT REFERENCES "Space_Debris_Catalog"("debris_id"),
  "detection_timestamp" TIMESTAMP,
  "confidence_score" DECIMAL
);

CREATE TABLE "Maneuver_Plans" (
  "plan_id" INT PRIMARY KEY,
  "sat_id" INT REFERENCES "Satellites"("sat_id"),
  "target_orbit" INT,
  "thrust_val" DECIMAL,
  "approval_status" VARCHAR,
  "execution_time" TIMESTAMP
);

CREATE TABLE "Transaction_Logs" (
  "tx_id" INT PRIMARY KEY,
  "plan_id" INT REFERENCES "Maneuver_Plans"("plan_id"),
  "pre_fuel_kg" DECIMAL,
  "pre_altitude_km" DECIMAL,
  "tx_status" VARCHAR
);

CREATE TABLE "Access Time" (
  "access_id" INT PRIMARY KEY,
  "sat_id" INT REFERENCES "Satellites"("sat_id"),
  "gs_id" INT REFERENCES "Ground Station"("gs_id"),
  "start_time" TIME,
  "end_time" TIME,
  "date" DATE,
  "status" VARCHAR,
  "is_succesful" BOOLEAN
);

CREATE TABLE "Pass Assignment" (
  "assignment_id" INT PRIMARY KEY,
  "access_id" INT REFERENCES "Access Time"("access_id"),
  "dish_id" INT REFERENCES "Dish"("dish_id"),
  "actual_time" TIME,
  "actual_date" DATE
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
