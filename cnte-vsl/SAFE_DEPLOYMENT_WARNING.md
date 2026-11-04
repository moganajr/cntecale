# CNTE-VSL live classroom release hold — Version 1.5

**Status: development source completed for this milestone; live deployment NOT approved.**

The live classroom now has source isolation controls, independent student benches, lecturer-only demonstration and pause/reset, server-side role checks, a bounded event timeline, monotonic room revision numbers, and manual reconnect.

Verified:
- 35 classroom authorization, two-student isolation and ordered-revision assertions passed in a JavaScript test harness
- Updated server, browser clients, protocol engine and integration test pass syntax parsing
- GitHub workflow registers the updated model tests and a two-student HTTP/WebSocket integration suite

Not yet verified:
- Successful live Node/WebSocket server execution with installed `ws`
- Successful remote CI completion or live browser interaction
- Lecturer plus two students working simultaneously in separate browsers
- Network reliability/performance, institutional identity, persistent portfolios, safety and expert review

Do not deploy into CNTE/CALE production. Follow `LIVE_CLASSROOM_QA.md` to perform the isolated development acceptance test with demonstration identities and synthetic records only. No external virtual laboratory is integrated.
