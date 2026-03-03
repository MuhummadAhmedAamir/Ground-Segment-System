EXPLAIN ANALYZE
SELECT * FROM Telemetry_Logs WHERE val > 20.0;

-- Before Indexing
| QUERY PLAN                                                                                                   |
| ------------------------------------------------------------------------------------------------------------ |
| Seq Scan on telemetry_logs  (cost=0.00..21.88 rows=358 width=33) (actual time=0.018..2.857 rows=359 loops=1) |
|   Filter: (val > 20.0)                                                                                       |
|   Rows Removed by Filter: 671                                                                                |
| Planning Time: 0.323 ms                                                                                      |
| Execution Time: 2.936 ms                                                                                     |

-- After Indexing
| QUERY PLAN                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------- |
| Index Scan using idx_telemetry_val on telemetry_logs  (cost=0.28..19.74 rows=358 width=33) (actual time=0.017..0.183 rows=359 loops=1) |
|   Index Cond: (val > 20.0)                                                                                                             |
| Planning Time: 0.442 ms                                                                                                                |
| Execution Time: 0.284 ms                                                                                                               |


EXPLAIN ANALYSE 
SELECT FROM space_debris_catalog where orbit_id = 101 and danger_radius_km  > 5;

-- Before Indexing
| QUERY PLAN                                                                                                        |
| ----------------------------------------------------------------------------------------------------------------- |
| Seq Scan on space_debris_catalog  (cost=0.00..48.69 rows=744 width=0) (actual time=0.013..0.427 rows=959 loops=1) |
|   Filter: ((danger_radius_km > '5'::numeric) AND (orbit_id = 101))                                                |
|   Rows Removed by Filter: 1087                                                                                    |
| Planning Time: 0.339 ms                                                                                           |
| Execution Time: 0.505 ms                                                                                          |

-- After Indexing
| QUERY PLAN                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Index Only Scan using idx_debris_spatial_risk on space_debris_catalog  (cost=0.28..20.66 rows=744 width=0) (actual time=0.040..0.173 rows=959 loops=1) |
|   Index Cond: ((orbit_id = 101) AND (danger_radius_km > '5'::numeric))                                                                                 |
|   Heap Fetches: 0                                                                                                                                      |
| Planning Time: 0.447 ms                                                                                                                                |
| Execution Time: 0.264 ms                                                                                                                               |



EXPLAIN ANALYZE

SELECT *
FROM dish d
join access_time a
on d.gs_id = a.gs_id
join satellite_state s
on a.sat_id = s.sat_id;

-- Before Indexing
| QUERY PLAN                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------- |
| Hash Join  (cost=49.70..297.71 rows=6154 width=224) (actual time=2.467..2.470 rows=2 loops=1)                                          |
|   Hash Cond: (d.gs_id = a.gs_id)                                                                                                       |
|   ->  Seq Scan on dish d  (cost=0.00..28.10 rows=1810 width=17) (actual time=2.373..2.374 rows=3 loops=1)                              |
|   ->  Hash  (cost=41.20..41.20 rows=680 width=207) (actual time=0.068..0.070 rows=2 loops=1)                                           |
|         Buckets: 1024  Batches: 1  Memory Usage: 9kB                                                                                   |
|         ->  Hash Join  (cost=22.60..41.20 rows=680 width=207) (actual time=0.063..0.065 rows=2 loops=1)                                |
|               Hash Cond: (a.sat_id = s.sat_id)                                                                                         |
|               ->  Seq Scan on access_time a  (cost=0.00..16.80 rows=680 width=91) (actual time=0.022..0.023 rows=2 loops=1)            |
|               ->  Hash  (cost=15.60..15.60 rows=560 width=116) (actual time=0.026..0.027 rows=5 loops=1)                               |
|                     Buckets: 1024  Batches: 1  Memory Usage: 9kB                                                                       |
|                     ->  Seq Scan on satellite_state s  (cost=0.00..15.60 rows=560 width=116) (actual time=0.013..0.014 rows=5 loops=1) |
| Planning Time: 4.789 ms                                                                                                                |
| Execution Time: 2.585 ms                                                                                                     |


-- After Indexing
| QUERY PLAN                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------ |
| Hash Join  (cost=2.13..3.22 rows=2 width=224) (actual time=0.070..0.073 rows=2 loops=1)                                        |
|   Hash Cond: (s.sat_id = a.sat_id)                                                                                             |
|   ->  Seq Scan on satellite_state s  (cost=0.00..1.05 rows=5 width=116) (actual time=0.011..0.011 rows=5 loops=1)              |
|   ->  Hash  (cost=2.11..2.11 rows=2 width=108) (actual time=0.041..0.042 rows=2 loops=1)                                       |
|         Buckets: 1024  Batches: 1  Memory Usage: 9kB                                                                           |
|         ->  Hash Join  (cost=1.04..2.11 rows=2 width=108) (actual time=0.035..0.037 rows=2 loops=1)                            |
|               Hash Cond: (d.gs_id = a.gs_id)                                                                                   |
|               ->  Seq Scan on dish d  (cost=0.00..1.03 rows=3 width=17) (actual time=0.009..0.010 rows=3 loops=1)              |
|               ->  Hash  (cost=1.02..1.02 rows=2 width=91) (actual time=0.011..0.012 rows=2 loops=1)                            |
|                     Buckets: 1024  Batches: 1  Memory Usage: 9kB                                                               |
|                     ->  Seq Scan on access_time a  (cost=0.00..1.02 rows=2 width=91) (actual time=0.006..0.007 rows=2 loops=1) |
| Planning Time: 0.887 ms                                                                                                        |
| Execution Time: 0.194 ms                                                                                                       |                                                                                                  |
