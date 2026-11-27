# Physics model validation — ideal DC practical

Date: 2026-11-27

## Model scope

The two-resistor simulator uses an ideal steady-state DC source and constant ohmic resistance. The form controls and scientific engine determine the result; the 3D illustration is a visual aid. The model omits component tolerances, source internal resistance, meter loading, transient effects and thermal effects. The protection state is an educational interlock, not a physical protective device model.

## Reference equations

- Series: equivalent resistance is the sum of the two resistances.
- Parallel: reciprocal equivalent resistance is the sum of reciprocal resistances.
- Ohm's law: current equals voltage divided by resistance.
- Power: supply voltage times supply current, equal to the sum of ideal resistive power dissipation.

References: OpenStax, *University Physics Volume 2*, [9.4 Ohm's Law](https://openstax.org/books/university-physics-volume-2/pages/9-4-ohms-law) and [10.2 Resistors in Series and Parallel](https://openstax.org/books/university-physics-volume-2/pages/10-2-resistors-in-series-and-parallel).

## Numerical reference cases

For the existing default teaching case (6 V, 100 Ω and 200 Ω), the independent expected values are:

| Quantity | Series | Parallel |
| --- | ---: | ---: |
| Equivalent resistance | 300 Ω | 66.6667 Ω |
| Supply current | 0.020 A | 0.090 A |
| Supply power | 0.120 W | 0.540 W |

Automated reference checks in `tests/science.test.mjs` cover these values, conservation of current and voltage, and agreement between total supply power and the sum of resistor power.

## Assessment evidence

The comparison score requires successful observations for both series and parallel networks. Repeated measurements of the same topology cannot earn those points. A practice pass requires the safety, preparation and isolation checks, both network observations and a score of at least 70. An unsafe measurement attempt invalidates the attempt and records the safety failure. Report length is a completeness check; a lecturer must assess scientific reasoning.

## Validation status

Reference equation checks and software regression tests establish numerical consistency within the stated ideal model. Subject-specialist review, curriculum mapping, learner trials and comparison against physical instrument data remain outstanding before formal competency assessment.
