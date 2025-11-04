## k6 test results with CPU 0.1

```
     execution: local
        script: /tests/k6-tests.js
        output: -

     scenarios: (100.00%) 1 scenario, 5 max VUs, 40s max duration (incl. graceful stop):
              * default: 5 looping VUs for 10s (gracefulStop: 30s)


  █ TOTAL RESULTS 

    checks_total.......: 2116    211.387673/s
    checks_succeeded...: 100.00% 2116 out of 2116
    checks_failed......: 0.00%   0 out of 2116

    ✓ status is 200

    HTTP
    http_req_duration..............: avg=23.49ms min=209.84µs med=810.52µs max=1.91s p(90)=93.16ms p(95)=96.1ms 
      { expected_response:true }...: avg=23.49ms min=209.84µs med=810.52µs max=1.91s p(90)=93.16ms p(95)=96.1ms 
    http_req_failed................: 0.00%  0 out of 2116
    http_reqs......................: 2116   211.387673/s

    EXECUTION
    iteration_duration.............: avg=23.63ms min=273.12µs med=892.83µs max=1.91s p(90)=93.41ms p(95)=96.37ms
    iterations.....................: 2116   211.387673/s
    vus............................: 5      min=5         max=5
    vus_max........................: 5      min=5         max=5

    NETWORK
    data_received..................: 542 kB 54 kB/s
    data_sent......................: 142 kB 14 kB/s

running (10.0s), 0/5 VUs, 2116 complete and 0 interrupted iterations
default ✓ [ 100% ] 5 VUs  10s
```

## k6 test results with CPU 0.5

```
     execution: local
        script: /tests/k6-tests.js
        output: -

     scenarios: (100.00%) 1 scenario, 5 max VUs, 40s max duration (incl. graceful stop):
              * default: 5 looping VUs for 10s (gracefulStop: 30s)


  █ TOTAL RESULTS 

    checks_total.......: 45319   4531.453756/s
    checks_succeeded...: 100.00% 45319 out of 45319
    checks_failed......: 0.00%   0 out of 45319

    ✓ status is 200

    HTTP
    http_req_duration..............: avg=1.01ms min=135.32µs med=421.09µs max=52.21ms p(90)=875.55µs p(95)=1.38ms
      { expected_response:true }...: avg=1.01ms min=135.32µs med=421.09µs max=52.21ms p(90)=875.55µs p(95)=1.38ms
    http_req_failed................: 0.00%  0 out of 45319
    http_reqs......................: 45319  4531.453756/s

    EXECUTION
    iteration_duration.............: avg=1.09ms min=175.2µs  med=481.73µs max=52.28ms p(90)=1.01ms   p(95)=1.6ms 
    iterations.....................: 45319  4531.453756/s
    vus............................: 5      min=5          max=5
    vus_max........................: 5      min=5          max=5

    NETWORK
    data_received..................: 12 MB  1.2 MB/s
    data_sent......................: 3.0 MB 304 kB/s

running (10.0s), 0/5 VUs, 45319 complete and 0 interrupted iterations
default ✓ [======================================] 5 VUs  10s
```

## Reflection

The performance improvement from 0.1 CPU to 0.5 CPU was substantial, but not a direct five-fold increase:

**Key metrics comparison:**
- **Requests per second**: Increased from 211.39 req/s to 4531.45 req/s (~**21.4x improvement**)
- **Total iterations**: Increased from 2,116 to 45,319 (~**21.4x improvement**)
- **Average response time**: Decreased from 23.49ms to 1.01ms (~**23.3x faster**)

The endpoint returns a static JSON response (`{"message":"Hello world!"}`), which is very lightweight. Once CPU constraints were removed, the application could process requests extremely quickly.
