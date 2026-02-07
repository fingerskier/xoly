# Xoly Language Specification (Working Draft)

*A Lisp dialect with four semantic bracket types*

## 1. Core Principles

- **Homoiconic**: Code is data, data is code
- **Lazy by default**: Assignment captures structure, not result
- **Domain-tagged**: Bracket type signals evaluation domain
- **Addressable AST**: Every assigned expression is a live, mutable structure

## 2. Bracket Semantics

| Bracket | Domain       | Volatility | Description                         |
|---------|-------------|------------|-------------------------------------|
| `( )`   | Logic       | Depends on inputs | Pure computation, transforms, conditionals |
| `[ ]`   | Data        | Stable (const)    | Literals, structures, collections   |
| `{ }`   | IO          | Volatile          | Side effects, network, file, device |
| `< >`   | Presentation| Depends on children | Rendering, UI, display             |

### 2.1 Bracket Nesting

Brackets nest freely. The nesting pattern forms an implicit effect signature:

```xoly
<div {fetch-user [id]}>     ; presentation → IO → data
(if (> x 0) {write x})      ; logic → logic → IO
```

A linter/compiler can analyze nesting depth and patterns for warnings.

### 2.2 Implied Constancy

`[]` data blocks are **inherently const**. Expressions that bottom out in
pure data and pure logic can be auto-detected as const:

```xoly
[1, 2, 3]                   ; const — pure data
(+ 1 2)                     ; const-eligible — pure logic, literal inputs
{read-sensor 5}             ; NOT const — contains IO
<gauge {read-sensor 5}>     ; NOT const — child contains IO
```

## 3. Evaluation Model

### 3.1 Default: Lazy + Dynamic

Assignment captures the expression tree, not the result:

```xoly
(assign X {read-sensor 5})
; X holds the INTENT to read sensor 5
; each reference to X re-evaluates
```

### 3.2 Const / Fixed Values

Use `const` or `@fixed` to evaluate once and pin:

```xoly
(const Y {read-sensor 5})         ; evaluates once at assignment
(@fixed assign Z {read-sensor 5}) ; same, decorator style
```

### 3.3 Evaluation Policy Decorators

```xoly
; re-reads every time (default)
(assign temp {read-sensor 5})

; reads once
(const temp {read-sensor 5})

; caches for 500ms
(@throttle 500 assign temp {read-sensor 5})

; recomputes when dependencies change
(@watch assign display <gauge [value: {read-sensor 5}]>)

; explicit evaluation in IO context
{eval X}
```

### 3.4 Sequencing

`{do ...}` forces sequential evaluation of IO:

```xoly
{do
  (assign data {read-sensor 5})
  {write-log data}
  <update-display data>}
```

Within `{do}`, only `{}` children are strictly sequenced.
`()` and `[]` children may remain lazy.

## 4. Definitions

### 4.1 Functions (Logic Domain)

```xoly
(defn factorial (n)
  (if (= n 0) 1 (* n (factorial (- n 1)))))

(defn clamp (val lo hi)
  (max lo (min hi val)))
```

### 4.2 Procedures (IO Domain)

```xoly
{defproc fetch-member (id)
  {http-get (concat "/api/members/" [id])}}

{defproc write-reading (sensor-id value)
  {do
    {db-insert [table: "readings"] [sensor: sensor-id] [value: value]}
    {log (concat "Wrote " value " for sensor " sensor-id)}}}
```

### 4.3 Views (Presentation Domain)

```xoly
<defview member-card (member)
  <div
    <h2 (get member :name)>
    <p (get member :email)>
    <span {fetch-member-status (get member :id)}>
  >>
```

### 4.4 Data Schemas (Data Domain)

```xoly
[defschema sensor-reading
  [id: Int]
  [sensor-id: Int]
  [value: Float]
  [timestamp: DateTime]]
```

## 5. Addressable AST

### 5.1 Structure Access

Every assigned expression is an addressable node:

```xoly
(assign X <print [A: "hello"] [B: "world"] [C: "!"]>)

X.0          ; → print (the verb)
X.1          ; → [A: "hello"] (first argument, full datum)
X.2          ; → [B: "world"]
X.type       ; → <> (presentation domain)
X.length     ; → 4 (verb + 3 args)
```

### 5.2 Named Access

Arguments carrying data keys support named access:

```xoly
X_A          ; → "hello" (value of datum keyed A)
X_B          ; → "world"
X.1.key      ; → A
X.1.value    ; → "hello"
```

### 5.3 Mutation

Lazy structures can be patched:

```xoly
(assign X <print [A: "hello"] [B: "world"]>)
(set! X_B "everyone")
; X is now <print [A: "hello"] [B: "everyone"]>
{eval X}     ; prints "hello everyone"
```

## 6. Decorators

### 6.1 Standard Decorators

Decorators modify evaluation policy:

```xoly
@fixed       ; evaluate once, pin result
@watch       ; re-evaluate on dependency change
@throttle N  ; cache result for N milliseconds
@debounce N  ; delay evaluation until N ms of quiet
@memo        ; memoize based on arguments
@async       ; evaluate asynchronously
@validate    ; run schema validation on result
```

### 6.2 Bracket Enhancement Decorators

`@<`, `@{`, `@()`, `@[]` reinterpret a block under another domain's rules:

```xoly
; IO block with presentation rules (auto-format output)
@<{read-sensor 5}

; data block with logic rules (lazy eval, constraint validation)
@([min: 0, max: 100, value: {read-sensor 5}])

; logic block with IO rules (side-effect logging)
@{(+ a b)}
```

These are **bracket reinterpretation operators** — they say
"evaluate this block, but apply additional rules from the target domain."

## 7. Macros

### 7.1 Basic Macros

Macros operate on the AST at expansion time:

```xoly
(defmacro when (condition body)
  (list 'if condition body 'nil))

(when (> x 10) {alert "high"})
; expands to: (if (> x 10) {alert "high"} nil)
```

### 7.2 Bracket-Aware Macros

Macros can inspect and transform bracket types:

```xoly
(defmacro with-loading (expr)
  (if (= (bracket-type expr) :io)
    <div <spinner> (defer expr)>
    expr))

; wraps IO in a loading spinner, passes other types through
(with-loading {fetch-member 42})
; expands to: <div <spinner> (defer {fetch-member 42})>
```

### 7.3 Domain-Restricted Macros

```xoly
; this macro can only produce presentation output
<defmacro card (title content)
  <div [class: "card"]
    <h3 title>
    <div [class: "card-body"] content>>>

; this macro can only produce IO output
{defmacro with-retry (n expr)
  {do
    (assign attempts 0)
    (assign result nil)
    {while (and (< attempts n) (nil? result))
      {try
        (set! result expr)
        (catch e (set! attempts (+ attempts 1)))}}
    result}}
```

## 8. Operators

### 8.1 Built-in Operators

Standard prefix operators:

```xoly
; arithmetic
(+ 1 2)  (- 5 3)  (* 2 4)  (/ 10 2)  (% 7 3)

; comparison
(= a b)  (!= a b)  (> a b)  (< a b)  (>= a b)  (<= a b)

; logical
(and a b)  (or a b)  (not a)

; string
(concat "hello" " " "world")
(len "hello")
(substr "hello" 1 3)
```

### 8.2 User-Defined Operators

```xoly
(defop |> (val fn)       ; pipe operator
  (fn val))

(defop ?? (val default)  ; null coalesce
  (if (nil? val) default val))

; usage
(|> 5 (fn (x) (* x 2)))   ; → 10
(?? {get-config "port"} 3000) ; → 3000 if config missing
```

## 9. Data Structures

### 9.1 Literals

```xoly
; numbers
42  3.14  -17  0xFF

; strings
"hello world"

; booleans
true  false

; nil
nil

; keywords (self-evaluating symbols)
:name  :id  :value
```

### 9.2 Collections

```xoly
; list (ordered)
[1, 2, 3, 4]

; map (key-value)
[name: "Matt", age: 30, active: true]

; nested
[users: [
  [name: "Alice", role: :admin],
  [name: "Bob", role: :user]
]]
```

### 9.3 Schema-Validated Data

```xoly
[defschema Point [x: Float] [y: Float]]

; creates a validated Point
(@validate Point [x: 3.0, y: 4.5])
```

## 10. Control Flow

```xoly
; conditional
(if (> x 0) "positive" "non-positive")

; multi-branch
(cond
  (< x 0)  "negative"
  (= x 0)  "zero"
  true      "positive")

; pattern match
(match value
  [x: _]     (concat "has x: " x)
  [_ _]      "pair"
  _          "other")

; looping (IO context for side effects)
{for item in [1, 2, 3]
  {print item}}

{while (< i 10)
  {do
    {print i}
    (set! i (+ i 1))}}

; functional iteration (logic context, lazy)
(map (fn (x) (* x 2)) [1, 2, 3])
(filter (fn (x) (> x 2)) [1, 2, 3, 4])
(reduce + 0 [1, 2, 3])
```

## 11. Error Handling

```xoly
{try
  {read-sensor 5}
  (catch IOError e
    {log (concat "Sensor error: " (get e :message))}
    [value: 0, error: true])
  (finally
    {release-sensor 5})}
```

## 12. Module System

```xoly
; define a module
(module sensors
  (export read-calibrated write-reading)

  [calibration-offset: 0.05]

  (defn read-calibrated (sensor-id)
    (- {read-sensor sensor-id} calibration-offset))

  {defproc write-reading (sensor-id)
    {db-insert [value: (read-calibrated sensor-id)]}})

; import
(import sensors [read-calibrated])
(import sensors :all)
```

## 13. Example Programs

### 13.1 Sensor Dashboard

```xoly
(module dashboard
  (import sensors [read-calibrated])
  (import ui [gauge, card, grid])

  [sensor-ids: [1, 2, 3, 4, 5]]

  (defn sensor-label (id)
    (concat "Sensor " (str id)))

  <defview sensor-gauge (id)
    <card [title: (sensor-label id)]
      <gauge [value: {read-calibrated id}]
             [min: 0]
             [max: 100]
             [unit: "lbs"]>>>

  <defview main ()
    <grid [cols: 3]
      (map sensor-gauge sensor-ids)>>)
```

### 13.2 Data Pipeline

```xoly
(module pipeline
  (import db [query, insert])
  (import transform [normalize, validate])

  [schema: [id: Int, value: Float, status: String]]

  (defn process-record (record)
    (-> record
        (normalize :value [0, 100])
        (@validate schema)))

  {defproc run-pipeline ()
    {do
      (assign raw {query "SELECT * FROM readings WHERE status = 'new'"})
      (assign processed (map process-record raw))
      (assign valid (filter (fn (r) (not (get r :error))) processed))
      {for record in valid
        {insert "processed_readings" record}}
      {log (concat "Processed " (str (len valid)) " records")}}})
```
