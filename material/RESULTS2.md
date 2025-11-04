## k6 test results with a single replica with CPU limit 0.1

```
     execution: local
        script: /tests/k6-tests.js
        output: -

     scenarios: (100.00%) 1 scenario, 5 max VUs, 40s max duration (incl. graceful stop):
              * default: 5 looping VUs for 10s (gracefulStop: 30s)


  █ TOTAL RESULTS 

    checks_total.......: 6898    689.747475/s
    checks_succeeded...: 100.00% 6898 out of 6898
    checks_failed......: 0.00%   0 out of 6898

    ✓ status is 200

    HTTP
    http_req_duration..............: avg=7.16ms min=259.37µs med=584.98µs max=195.21ms p(90)=1.13ms p(95)=89.56ms
      { expected_response:true }...: avg=7.16ms min=259.37µs med=584.98µs max=195.21ms p(90)=1.13ms p(95)=89.56ms
    http_req_failed................: 0.00%  0 out of 6898
    http_reqs......................: 6898   689.747475/s

    EXECUTION
    iteration_duration.............: avg=7.23ms min=313.09µs med=651.73µs max=195.35ms p(90)=1.28ms p(95)=89.67ms
    iterations.....................: 6898   689.747475/s
    vus............................: 5      min=5         max=5
    vus_max........................: 5      min=5         max=5

    NETWORK
    data_received..................: 1.8 MB 177 kB/s
    data_sent......................: 469 kB 47 kB/s

running (10.0s), 0/5 VUs, 6898 complete and 0 interrupted iterations
default ✓ [ 100% ] 5 VUs  10s
```

## k6 test results with five replicas, each with CPU limit 0.1

```
     execution: local
        script: /tests/k6-tests.js
        output: -

     scenarios: (100.00%) 1 scenario, 5 max VUs, 40s max duration (incl. graceful stop):
              * default: 5 looping VUs for 10s (gracefulStop: 30s)


  █ TOTAL RESULTS 

    checks_total.......: 14544   1453.213257/s
    checks_succeeded...: 100.00% 14544 out of 14544
    checks_failed......: 0.00%   0 out of 14544

    ✓ status is 200

    HTTP
    http_req_duration..............: avg=3.34ms min=287.79µs med=682.77µs max=168.33ms p(90)=1.41ms p(95)=20.74ms
      { expected_response:true }...: avg=3.34ms min=287.79µs med=682.77µs max=168.33ms p(90)=1.41ms p(95)=20.74ms
    http_req_failed................: 0.00%  0 out of 14544
    http_reqs......................: 14544  1453.213257/s

    EXECUTION
    iteration_duration.............: avg=3.42ms min=339.24µs med=765.98µs max=168.47ms p(90)=1.55ms p(95)=20.81ms
    iterations.....................: 14544  1453.213257/s
    vus............................: 5      min=5          max=5
    vus_max........................: 5      min=5          max=5

    NETWORK
    data_received..................: 3.7 MB 372 kB/s
    data_sent......................: 989 kB 99 kB/s

running (10.0s), 0/5 VUs, 14544 complete and 0 interrupted iterations
default ✓ [ 100% ] 5 VUs  10s
```

## Reflection

The performance improvement from 1 replica to 5 replicas was significant, but **not a five-fold increase**:

**Key metrics comparison:**
- **Requests per second**: Increased from 689.75 req/s to 1,453.21 req/s (~**2.11x improvement**)
- **Total iterations**: Increased from 6,898 to 14,544 (~**2.11x improvement**)
- **Average response time**: Decreased from 7.16ms to 3.34ms (~**2.14x faster**)

**Why the performance did not increase by 5x:**

Traefik adds overhead when distributing requests across multiple replicas. Each request incurs routing decisions, health checks, and connection management overhead that wasn't present with a single replica. Additionally, with only 5 VUs generating load, the system may not have been saturated enough to fully utilize all replicas, leading to underutilization of available resources.

**Why we still see ~2x improvement:**

The approximate doubling in throughput makes sense because:
- With 5 replicas, we can handle more concurrent requests without queuing
- Multiple replicas reduce the CPU contention that a single replica experiences
- The workload benefits from horizontal scaling, even if not linearly
- The system can better handle request bursts by distributing them across multiple instances

The ~2x improvement instead of 5x demonstrates that **horizontal scaling has diminishing returns** and that simply adding more replicas doesn't guarantee proportional performance gains, especially when other factors like load balancer overhead, resource constraints per replica, and client-side limitations come into play.
