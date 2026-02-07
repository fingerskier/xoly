# xoly
# Quartic

A Lisp dialect with four semantic bracket types for domain-tagged expressions.

| Bracket | Domain       | Behavior        |
|---------|-------------|-----------------|
| `( )`   | Logic       | Pure computation |
| `[ ]`   | Data        | Const literals   |
| `{ }`   | IO          | Side effects     |
| `< >`   | Presentation | Rendering/UI    |

## Quick Start

```bash
# Run test suite
node cli.js test

# Transpile a file
node cli.js transpile example.q --target=js
node cli.js transpile example.q --target=python

# Dump AST
node cli.js ast example.q

# Generate synthetic training data
node cli.js generate --count=1000 --format=jsonl --output=train.jsonl
node cli.js generate --count=500 --format=pairs --target=js --output=pairs.json
```

## Example

```quartic
(module dashboard
  (import sensors [read-calibrated])

  <defview gauge-card (sensor-id)
    <card [title: (concat "Sensor " (str sensor-id))]
      <gauge [value: {read-calibrated sensor-id}]
             [min: 0] [max: 100]>>>

  {defproc run ()
    {do
      (assign readings (map read-calibrated [1, 2, 3]))
      {write-log (concat "Read " (str (len readings)) " sensors")}
      <grid (map gauge-card [1, 2, 3])>}})
```

## Files

```
SPEC.md                   Language specification
cli.js                    CLI entry point
src/
  tokenizer.js            Four-bracket-aware tokenizer
  parser.js               AST builder with domain tags
  transpile-js.js         JavaScript target
  transpile-py.js         Python target
  generate.js             Synthetic data generator (29 patterns)
training_data.jsonl       500 generated samples (JSONL)
training_pairs_js.json    200 prompt/completion pairs (JS target)
training_pairs_py.json    200 prompt/completion pairs (Python target)
```

## Training Data Generation

The generator includes 29 pattern templates covering:
- Arithmetic, comparisons, conditionals
- Data literals (lists, maps, nested)
- Function definitions (pure, IO, views)
- Control flow (for, while, do blocks)
- Decorators and bracket enhancements
- Pipelines and higher-order functions
- Error handling, modules, schema definitions

Each sample produces a Quartic source string paired with JS and Python transpilations.
