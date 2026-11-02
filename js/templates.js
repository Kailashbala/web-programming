/**
 * Markdown Previewer - Document Templates
 * Realistic, hand-crafted templates for technical writing, documentation, and notes.
 */

const TEMPLATES = {
  readme: `# Antigravity Protocol (v2.8.0)

> A lightweight, zero-dependency streaming state synchronization engine designed for edge runtimes and local-first applications.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](#)
[![Coverage](https://img.shields.io/badge/coverage-98.4%25-success)](#)

---

## ⚡ Highlights

- **Sub-millisecond Rehydration**: Snapshot parsing powered by direct byte buffers.
- **Deterministic CRDTs**: Conflict-free resolution across distributed mesh peers.
- **Pluggable Storage**: First-class adaptors for SQLite, IndexedDB, and memory.
- **Zero Runtime Dependencies**: Compiled size strictly bounded under \`12KB\` min+brotli.

---

## 📦 Installation

Install via your preferred package manager:

\`\`\`bash
# Using pnpm
pnpm add @core/antigravity-sync

# Using bun
bun add @core/antigravity-sync
\`\`\`

---

## 🚀 Quick Start

Here is a minimal example demonstrating peer-to-peer state hydration:

\`\`\`typescript
import { createEngine, MemoryAdapter } from '@core/antigravity-sync';

// Initialize engine instance with in-memory backing
const engine = await createEngine({
  nodeId: 'peer-alpha-09',
  storage: new MemoryAdapter(),
  heartbeatMs: 250,
});

// Subscribe to state mutation stream
engine.on('state:mutation', (patch) => {
  console.log('[Delta Received]', patch.path, '->', patch.value);
});

// Commit an atomic state transaction
await engine.commit({
  op: 'MERGE',
  path: 'workspace.settings',
  value: { theme: 'obsidian-dark', splitRatio: 0.5 },
});
\`\`\`

---

## 📊 Benchmark Comparison

| Engine / Library | Latency (p99) | Heap Footprint | Wire Protocol | CRDT Support |
| :--- | :--- | :--- | :--- | :--- |
| **Antigravity v2.8** | **0.42 ms** | **1.8 MB** | CBOR Streams | Full Delta-State |
| Automerge v2 | 1.84 ms | 8.2 MB | JSON Buffers | Automerge CRDT |
| Yjs (Standard) | 0.95 ms | 4.6 MB | Binary Blocks | YATA Array |
| Raw WebSockets | 0.31 ms | 0.9 MB | Custom / Text | None (Manual) |

> [!NOTE]
> Benchmarks were conducted on an Apple M3 Max (36GB RAM, Node.js v22.4.0) over 100,000 concurrent mutations.

---

## 🛡️ Architectural Notes

> [!WARNING]
> While peer discovery supports mDNS on local networks, distributed mesh routing requires signaling relays when crossing symmetric NAT boundaries.

### State Transitions

The engine enforces an immutable state pipeline:

1. **Ingress**: Raw frames are validated against runtime type contracts.
2. **Clock Alignment**: Lamport timestamps establish causal order across partitions.
3. **Delta Merging**: LWW (Last-Write-Wins) and sequence reconcilers merge state trees.
4. **Broadcast**: Pruned compact diffs are dispatched to connected neighbors.

\`\`\`json
{
  "protocol": "ag/v2",
  "lamportClock": 10429,
  "nodeId": "peer-alpha-09",
  "delta": {
    "op": "SET",
    "key": "system.status",
    "val": "HEALTHY"
  }
}
\`\`\`

---

## 📋 Roadmap & Sprint Priorities

- [x] Initial wire format specification and fuzzing tests
- [x] IndexedDB persistent ledger for browser environments
- [x] Automated latency regression suite in CI
- [ ] Direct WebRTC DataChannel transport layer
- [ ] End-to-end payload encryption with AES-GCM 256
- [ ] Live visual debugger companion extension

---

## 📜 License

Distributed under the **MIT License**. See \`LICENSE\` for full details.
`,

  article: `# The Typography of Software: Why Tactile Interfaces Endure

*By Maya Lin · Published in System Craft · 8 min read*

In an era saturated with glossy gradients, floating cards, and homogeneous design systems, digital tools frequently sacrifice functional permanence for surface novelty. Yet, if you observe the software that people keep open for ten hours a day—text editors, CAD viewports, terminals, and spreadsheets—an entirely different design philosophy emerges.

> "A tool should feel like an extension of the hand. It should have weight, predictability, and a quiet refusal to distract."
> — *Dieter Rams, Adapted Notes on Utilitarian Ergonomics*

---

## The Illusion of Frictionless Design

Modern interface design often conflates *frictionlessness* with *usability*. In our rush to eliminate every click and hide every control behind ambiguous swipe gestures or automated guesses, we often strip away the very affordances that grant power users **spatial muscle memory**.

Consider the physical notebook. A notebook has distinct properties:

1. **Deterministic boundaries**: You always know exactly where page 42 sits relative to the back cover.
2. **Zero latency feedback**: Graphite transfers to fibrous paper without a 60Hz display cycle or an animated loading skeleton.
3. **Contextual resilience**: It does not rearrange its layout based on what an algorithm thinks you want to read next.

\`\`\`css
/* Subtle tactile borders define spatial confidence */
.surface-panel {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: border-color 150ms ease-in-out;
}

.surface-panel:focus-within {
  border-color: var(--accent-focus);
}
\`\`\`

---

## Typographic Hierarchy as Visual Navigation

When crafting documents that demand deep cognitive retention, typography is not decoration—it is the **information architecture**.

> [!TIP]
> Maintain strict baseline grids and proportional line heights. Body paragraphs should breathe between \`1.55\` and \`1.7\` line-height, with measure capped between 65 and 75 characters per line for optimal saccadic eye movements.

### Key Contrast Metrics

- **Headings**: High contrast, tighter tracking (\`-0.02em\`), substantial bottom margin to anchor the following thought.
- **Monospace Elements**: Scaled down to \`88%\` of body text size to match the visual optical weight of proportional letterforms.
- **Tabular Data**: Fixed-width tabular lining numerals (\`font-variant-numeric: tabular-nums\`) so columns align naturally without manual spacing hacks.

---

## Mathematical Precision in Layout

When sizing layout intervals, geometric scales create a coherent sense of rhythm:

$$ R_n = S_0 \\cdot \\phi^n $$

Where $\\phi \\approx 1.618$ represents the harmonic ratio, and $S_0 = 16\\text{px}$ acts as the fundamental base unit.

---

## Reflections for Builders

Before adding an animation or introducing an automated smart feature, ask:

- Does this make the user feel more capable, or merely entertained?
- Will this layout hold its dignity when rendered on a low-DPI screen in direct sunlight?
- Can this interface be operated entirely via tactile keystrokes?

When software honors these constraints, it stops feeling like disposable digital ephemera. It becomes an authentic instrument.
`,

  notes: `# Weekly Engineering Sync & Operations

**Date**: Monday, October 26  
**Facilitator**: Devon Vance  
**Participants**: @devon, @elena, @marcus, @priya  
**Status**: 🟢 In Progress

---

## 🎯 Primary Sprint Goals

1. **Database Migration**: Complete zero-downtime cutover of customer shards to Postgres 16.
2. **Billing Webhooks**: Re-architect retry loop with exponential backoff and dead-letter queues.
3. **Accessibility Audit**: Resolve contrast and keyboard trap warnings on onboarding modal.

---

## 📋 Action Item Tracking

- [x] Cut release candidate \`v4.11.0-rc2\` and push to staging clusters
- [x] Patch CVE-2026-4401 in dependencies
- [ ] Run benchmark stress test on shard 4 replica
- [ ] Review PR #382: Resilient connection pooler timeout handling
- [ ] Sync with design team on dark mode color tokens
- [ ] Draft incident postmortem for last Thursday's 4-minute cache desync

---

## 🚨 Blockers & Decisions Needed

> [!IMPORTANT]
> **Decision Required by 3:00 PM**: Choose between Redis Cluster vs Dragonfly for the distributed rate limiter.

| Solution | Memory Overhead | Complexity | P99 Latency | Cost / Mo |
| :--- | :--- | :--- | :--- | :--- |
| **Dragonfly** | **1.2 GB** | Low (Single node) | 0.28 ms | $140 |
| **Redis Cluster** | 3.4 GB | Medium (6 nodes) | 0.65 ms | $320 |
| **Cloudflare KV** | Negligible | Low (Edge-based) | 12.4 ms | Variable |

---

## 📝 Discussion Summary

### 1. Shard 4 Load Spike
Marcus noted that batch indexing jobs at 04:00 UTC caused connection saturation:

\`\`\`sql
-- Problematic query identified in slow query log
SELECT id, tenant_id, payload, created_at
FROM event_stream
WHERE status = 'PENDING'
ORDER BY priority DESC, created_at ASC
FOR UPDATE SKIP LOCKED
LIMIT 500;
\`\`\`

**Resolution**: Add compound index on \`(status, priority DESC, created_at ASC)\` before next batch run.

---

## 📌 Next Meeting
- **When**: Thursday, 10:00 AM EST  
- **Agenda**: Postmortem review & staging validation sign-off.
`,

  cheatsheet: `# Markdown Quick Reference & Showcase

This interactive cheatsheet demonstrates all supported syntax features. You can edit this text directly or copy snippets into your notes.

---

## 1. Typography & Text Formatting

You can write text with **bold emphasis**, *classic italics*, ***bold italics***, or ~~strikethrough~~. You can also highlight \`inline code snippets\` with backticks.

Subscript and superscript can be formatted using standard tags: H<sub>2</sub>O and E = mc<sup>2</sup>.

---

## 2. Headings & Hierarchy

# Heading Level 1 (Document Title)
## Heading Level 2 (Major Section)
### Heading Level 3 (Sub-section)
#### Heading Level 4 (Component / Detail)
##### Heading Level 5 (Minor Annotation)
###### Heading Level 6 (Micro Label)

---

## 3. Lists & Checklists

### Unordered Bullet Points
- Unordered item level 1
  - Nested sub-item level 2
  - Another nested point
    - Deep indentation level 3
- Back to level 1

### Ordered Numbered Lists
1. First procedural step
2. Second sequential action
3. Final verification and review

### Interactive Task Checklists
- [x] Initialize Git repository and add gitignore
- [x] Configure strict TypeScript compiler flags
- [ ] Implement dark and editorial sepia themes
- [ ] Write integration test coverage for parser

*(Tip: In this previewer, you can click on the checkboxes right in the preview pane!)*

---

## 4. Blockquotes & Callout Alerts

Standard multi-paragraph blockquote:

> Good writing is clear thinking made visible.
> 
> Good software is respectful ergonomics made tangible.

### GitHub-Style Alert Callouts

> [!NOTE]
> Useful information that users should know, even when skimming.

> [!TIP]
> Helpful advice for doing things better, faster, or more cleanly.

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.

> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.

---

## 5. Code Blocks with Syntax Highlighting

\`\`\`javascript
// Asynchronous fetch with abort timeout
async function fetchWithTimeout(url, timeoutMs = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(\`HTTP \${res.status}: \${res.statusText}\`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}
\`\`\`

\`\`\`python
# Python list comprehension & type annotations
from typing import List, Dict

def filter_active_peers(nodes: List[Dict[str, any]]) -> List[str]:
    return [
        node["hostname"]
        for node in nodes
        if node.get("is_active") and node.get("latency_ms", 999) < 50
    ]
\`\`\`

---

## 6. Rich Tables

| Feature | Markdown Support | Live Sync | Theme Customization |
| :--- | :---: | :---: | :--- |
| **GFM Tables** | ✅ Supported | Full | Follows active theme |
| **Task Lists** | ✅ Clickable | Bidirectional | Custom SVG checkmarks |
| **Code Copy** | ✅ 1-Click | Instant | Toast confirmation |
| **KaTeX Math** | ✅ Formulas | Fast | LaTeX standard |

---

## 7. Mathematical Expressions (KaTeX)

Inline math: When $a \\ne 0$, there are two solutions to $ax^2 + bx + c = 0$:

$$ x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} $$

Standard Gaussian normal distribution:

$$ f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^2} $$

---

## 8. Links, Images & Footnotes

- [Antigravity GitHub Workspace](https://github.com)
- Relative anchor link: [Jump back to Highlights](#1-typography--text-formatting)

Horizontal dividers are created with three hyphens \`---\`:

---

*Handcrafted Markdown Studio · Clean, tactile, and fast.*
`
};

window.TEMPLATES = TEMPLATES;

