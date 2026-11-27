# CNTE-VSL immersive demonstrator architecture

The room experience is intended to replace static instrument illustrations with a continuous spatial practical. An avatar moves through the laboratory, handles objects and uses equipment; the scene presents the resulting state rather than serving as a decorative diagram.

## Current foundation

`room.html` is a water-measurement training room. `src/room.js` owns rendering, walking, pointer targeting, camera views and transfer animation. `src/roomState.js` owns inventory, capacity, liquid conservation, scale observations and practice assessment. The simulation uses water and has no real chemicals or specimens. Existing discipline-specific laboratories remain available.

The pilot supports one local operator. It is not a synchronized classroom, a calibrated instrument, a fluid-dynamics solver or a certified competency assessment. Its current avatar and scenery are procedural placeholders for professionally authored assets.

## Acceptance gates for each discipline

1. A navigable, accurately laid-out room with task-specific storage, instrument stations and safe traversal.
2. Direct pointer-based selecting, carrying, docking, manipulating, adjusting and operating equipment, with accessible equivalent controls.
3. State-driven observations, realistic constraints, recoverable mistakes and traceable measurements. Scientific assumptions must be documented and reviewed before release.
4. A persistent notebook and competency rubric derived from observed actions, with contextual guidance without automatic completion of student tasks.
5. Instructor demonstration and independent learner practice with authenticated, authorized control transfer and synchronized state; institutional telemetry requires appropriate privacy controls.
6. Validated mouse and touch workflows, device performance, accessibility, curriculum review and instructor acceptance.

## Development sequence

Expand the reusable interaction engine (inventory, object transforms, docking sockets, collisions, instrument controls, camera, observations) before migrating individual workbenches. Use the water studio to verify the complete physical interaction loop, then migrate the existing ideal physics, chemistry and safe educational microscopy models. Further discipline modules require appropriate scientific, safety and curriculum reviews. Keep the old workbenches available until their replacements pass the same acceptance gates.
