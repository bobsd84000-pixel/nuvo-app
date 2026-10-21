# Graph Report - nuvo-app  (2026-10-21)

## Corpus Check
- 6 files · ~1,090 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 2 file(s) not represented in the graph (top: (none) 1, .css 1)

## Summary
- 29 nodes · 28 edges · 8 communities (4 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e75e0337`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- scripts
- react
- dependencies
- devDependencies
- README.md

## God Nodes (most connected - your core abstractions)
1. `scripts` - 4 edges
2. `react` - 3 edges
3. `react-dom` - 2 edges
4. `@vitejs/plugin-react` - 2 edges
5. `vite` - 2 edges
6. `dev` - 1 edges
7. `build` - 1 edges
8. `preview` - 1 edges
9. `react` - 1 edges
10. `react-dom` - 1 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (8 total, 4 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.33
Nodes (5): name, type, version, vite, @vitejs/plugin-react

### Community 1 - "scripts"
Cohesion: 0.50
Nodes (4): scripts, build, dev, preview

### Community 4 - "dependencies"
Cohesion: 0.67
Nodes (3): dependencies, react, react-dom

### Community 5 - "devDependencies"
Cohesion: 0.67
Nodes (3): devDependencies, vite, @vitejs/plugin-react

## Knowledge Gaps
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `package.json`, `nuvo.jsx`?**
  _High betweenness centrality (0.257) - this node is a cross-community bridge._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.175) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.119) - this node is a cross-community bridge._