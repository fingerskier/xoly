# xoly
A client/server language

## Concepts

It has spreadsheetish sort of structure.
Individual modules are "cells" that are aggregated into "sheets" which are part of a "book".

Cells, columns, rows, sheets, and books can all be named and have their own metadata.

Project structure:
```
mybook/
  sheet1.xoly
  ~ cells are defined in the sheet text-file
  sheet2.xoly
  ...
another-book/
  sheet1.xoly
  ...
```

## Syntax

`[`, `]` - range selector

`{`, `}` - exectuable block delimiters

`(`, `)` - data grouping delimiters

`_` - "me": the current cell
* `_row` - this cell's row
* `_col` - this cell's column
* `_sheet` - this cell's sheet
* `_book` - this cell's book
* `_???` - these are named outputs of the current cell

`.` - decimal point
`-` - member access operator
`:` - hierarchy separator
`@` - reference to a named entity

e.g. `@sheet1:cellA1` - reference to cellA1 in sheet1~ it is implied that the current book is being referenced
e.g. `@book1:sheet1:cellA1` - same as above if the current book is `book1`, explicitly names the book
e.g. `@sheet1[4,3]` - reference to the cell at row 4, column 3 in sheet1 (current book implied)
e.g. `{ @pi=3.14 }` - executable block that assigns the value 3.14 to the named entity `pi`~ there must be a cell named `pi` in the current sheet or book
e.g. 

`=` - assignment operator

`#` - comment delimiter

### Comparisons

`eq` - equality
`ne` - not equal
`lt` - less than
`le` - less than or equal
`gt` - greater than
`ge` - greater than or equal

## Runtime

Each cell has inputs and outputs.
When the program ticks it updates all cells with new inputs, in order (top to bottom, left to right), then cells with new outputs, in order (top to bottom, left to right).
Inputs are any properties of other named entities
* e.g. `@cellA1.value`
Outputs are properties of the current cell
* e.g. `_value`
