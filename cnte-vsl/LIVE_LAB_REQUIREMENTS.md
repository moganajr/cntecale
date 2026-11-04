# CNTE-VSL — Non-negotiable interactive live laboratory requirements

**Development directive:** CNTE-VSL must enable learners and lecturers to **perform and supervise practical laboratory actions**, not merely watch animations, images, or prerecorded demonstrations. PraxiLabs is a reference for the level of interactive educational capability, not an authorization to copy its software or designs.

## Required learner experience (all disciplines)

1. Choose and handle apparatus. Selection, placement, assembly, adjustments, and safe operations must change the state of a simulated experiment, not only the appearance of a control.
2. Perform procedural actions in scientifically meaningful sequences. Invalid steps produce reasoned guidance; safety violations are blocked and logged for instructor review.
3. Observe the consequences of interventions through independently validated scientific or educational reference models, including controlled measurement uncertainty where appropriate.
4. Measure, record, repeat, compare, calculate, interpret, and submit work in an electronic laboratory notebook. Preserve the sequence of actions and relevant evidence.
5. Support guided, independent, supervised, and competency-assessment modes with accessible non-3D alternatives.
6. Provide realistic manipulable 3D equipment, where technically feasible, not merely rotatable objects or stylized illustrations. Introduce AR/VR only after the core simulation model is verified.
7. Support low-bandwidth conditions and offline individual learning, while clearly indicating that simultaneous multi-user presence requires a connected real-time service.

## Required lecturer experience

- Create a practical class and assign an experiment.
- Demonstrate the experiment from a lecturer workbench while students see changes.
- View individual student workbenches and their measurement/procedure status in real time.
- Provide individual and class feedback, pause/resume a practical, and authorize a retry after serious procedural errors.
- Review electronic lab notes, raw data, calculations, event logs, safety events, rubric components, and attempted-versus-passed competencies.
- Approve/return submitted experiments based on actual work rather than only final numerical answers.
- Support later co-navigation / supervised demonstration and authoring of versioned experiments with subject-specialist approval.

## Implementation status (v0.8)

A functioning **development implementation in source code** exists for the first multi-user live chemistry titration pilot: Node.js WebSocket classroom service; lecturer room creation; student join codes and separate benches; lecturer demo; apparatus placement, PPE, indicator, burette calibration, dispensing and repeated titres; server-side action checks; numerical outputs; lecturer feedback and pause/reset; development JSON export.

The other six labs remain individual educational prototype modules. Several have 3D equipment representations, but not fully physically manipulated 3D objects. There is **no production CNTE/CALE account integration, persistent storage, or validated clinical/academic certification**. Full browser/server integration and deployment must be verified separately.

## Quality release gates

- A practical task cannot be completed through a superficial animation or a single “run” button without required setup, inputs and observations.
- The authoritative scientific engine — not client-side UI — validates action order, values, and safety restrictions.
- Verify model units, conservation and limiting cases, replicate/reproducibility behaviour, human-review decisions, accessibility and performance.
- Multi-user integration tests must verify that a learner's actions appear in the lecturer dashboard but do not alter another learner's experiment.
- In production: authorized institution and course enrollment, lecturer and learner roles, tenant isolation, end-to-end encryption in transit, secure durable audit logs, backups, consent and retention.
- Published laboratory modules require scientific reviewer, safety reviewer, curriculum reviewer, QA, and academic approval. A passed simulation cannot automatically certify physical competency.

## Next implementations

1. Test and deploy the **restricted** live chemistry pilot in a separate development environment.
2. Add equipment-direct mouse/keyboard manipulation and realistic fluid, meniscus, calibration and uncertainty behaviour with subject-matter review.
3. Extend the live session adapter to physics circuits (component wiring/voltage measurements), biology microscopy (shared slide/individual observations), synthetic medical laboratory workflows (QC and specimen gates), and TVET fault diagnosis (realistic tool selection and electrical safety).
4. Integrate authenticated CNTE/CALE gradebook, portfolio, LMS, student roster and instructor approval through audited adapters; preserve all existing CNTE features.
5. Conduct controlled faculty/student pilots before declaring readiness for WASSCE practicals or professional training.
