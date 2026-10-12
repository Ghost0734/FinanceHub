---
name: FinPilot AI
description: A composed workspace for evidence-led finance-risk decisions.
---

# Design System: FinPilot AI

## Overview

**Creative North Star: "The Finance Control Room"**

FinPilot is an operational workspace for assessing unusual spend, inspecting evidence, and acting with confidence. It should feel composed, calm, and premium: the interface supports a financial decision rather than competing for attention. Risk is clear, documentation is available when needed, and every signal should lead naturally to an understandable next step.

The current implementation uses Streamlit's native wide-layout interface and components. It has no project-owned CSS, custom theme, token file, or bespoke component library yet. The system record therefore distinguishes between the current framework baseline and the agreed direction for future UI work; it does not invent unimplemented color or typography tokens.

**Key Characteristics:**

- Wide, task-oriented workspace with a clear overview → investigation → forecast progression.
- Calm, generously spaced information groups that retain enough density for finance workflows.
- Evidence-led risk communication with plain-language explanations and visible confidence.
- Documentation and policy detail available progressively, rather than crowding the initial scan.

## Colors

The current app inherits Streamlit's default theme; no project-owned color values are implemented yet. Future styling must establish a restrained enterprise-finance palette from the confirmed color roles below before treating them as reusable tokens.

### Named Rules

**The Reserved Severity Rule.** Deep Ledger Navy is the foundation; Signal Teal is reserved for primary actions and positive states. Review Amber and Escalation Red communicate only risk, exceptions, or required review. Risk must never rely on color alone.

## Typography

The current app inherits Streamlit's typography; no project-owned font stack or type scale is implemented yet. Future typography must prioritize readable, plain-language finance decisions over decorative display treatment.

### Named Rules

**The Evidence-First Rule.** Titles establish the decision context, supporting copy explains the signal in plain language, and policy evidence remains readable when expanded. Do not use display typography that obscures scanability.

## Layout

The dashboard uses Streamlit's wide page layout with a collapsed sidebar for settings. The Overview tab follows a scan-friendly sequence: local-data upload, four summary metrics, a two-column risk-analysis area, then a full-width review queue. Investigation places a transaction selector before a three-metric fact row and reveals policy evidence progressively. Forecast presents a single focused chart.

Use calm, generous spacing between decision groups. Preserve visual grouping and the dashboard's progression from summary to evidence to action; do not increase density merely to expose more data at once.

## Elevation & Depth

The current framework baseline is mostly flat. Preserve that principle: use subtle borders to define resting groups and reserve soft shadows for genuinely elevated or selected states, such as modals, key action cards, or selected investigation results. Charts, tables, and ordinary content cards should not receive decorative elevation.

### Named Rules

**The Earned Elevation Rule.** A shadow must communicate state or hierarchy, never merely ornament a container.

## Shapes

The current app inherits Streamlit's standard control shapes. Future project-owned controls should remain restrained and legible, with subtle outlines and no novelty geometry. Compact controls are acceptable where they support a dense finance task; decision groups should still have generous breathing room.

## Components

### Buttons

The dashboard uses Streamlit primary buttons for uploading data and initiating an investigation. Their wording is explicit and task-based. Future primary actions should use Signal Teal, stay keyboard-accessible, and be reserved for the next meaningful step; use a text label that explains the outcome.

### Cards / Containers

The current interface relies on Streamlit columns, metric blocks, an expander, and inline status components rather than project-owned cards. Future containers should be flat at rest, separated by subtle borders, and only elevated when selection or action priority warrants it.

### Inputs / Fields

The existing API connection field, CSV uploader, and transaction selector are native Streamlit controls. Preserve visible labels, readable helper text, keyboard operation, and plain-language validation. Do not use color alone to indicate invalid, risky, or selected states.

### Navigation

Primary workspace navigation is a three-tab sequence: Overview, Investigate, Forecast. Keep the labels direct and workflow-based. Settings remain secondary in the collapsed sidebar.

### Risk Communication

The review queue, anomaly scores, warnings, policy evidence, and confidence caption work together to communicate risk. Every severity treatment must include text, iconography, labels, or other non-color cues, and must make the next action clear.

## Do's and Don'ts

### Do:

- **Do** design FinPilot as a composed finance-control workspace, not a generic analytics dashboard.
- **Do** make the reason, policy evidence, confidence, and recommended next action easy to find together.
- **Do** retain local-session data handling and make that privacy assurance clear near CSV upload.
- **Do** favor generous grouping and progressive disclosure over visually cramming policy and investigation detail into the first view.
- **Do** use accessible contrast, readable type, visible labels, and keyboard-friendly controls.

### Don't:

- **Don't** introduce flashy “AI” motifs, decorative gradients, glowing effects, or speculative visual claims.
- **Don't** use Signal Teal for risk, or use amber/red as general decoration.
- **Don't** convey risk, success, error, or selection through color alone.
- **Don't** use shadows on every panel; elevation is reserved for meaningful state.
- **Don't** fabricate brand values, customer proof, financial benchmarks, or compliance claims.
