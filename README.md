# fhir-filter
Simple FHIR [_filter](https://www.hl7.org/fhir/search_filter.html) implementation.

## Installation
This is supposed to be used as a dependency in other projects. It is not
currently available on NPM but can be installed from GitHub like so:
```sh
npm install https://github.com/smart-on-fhir/fhir-filter.git
```

To install specific version use:
```sh
npm install https://github.com/smart-on-fhir/fhir-filter.git@1.0.0
```

## Usage

```ts
import fhirFilter from "fhir-filter/dist"

// Assuming that you have an array of objects `myArray` that needs to be filtered,
// there are two ways to use this library:

// Option 1:
// Having an array of objects we can filter it like so:
const myResult = fhirFilter(myArray, 'given eq "peter" and birthdate ge 2014-10-10')

// Option 2:
// Compile the filter expression into a function, which can then be passed to
// the native filter method of arrays. This is useful in case a filter can be
// created once and reused multiple times afterwards.
const myFilterFn = fhirFilter.create('given eq "peter" and birthdate ge 2014-10-10')
const myResult = myArray.filter(myFilterFn)
```

Dates can be in full ISO format (FHIR Instant type) like `2020-05-22T10:12:22.1234Z`
or partial dates like `2020-05-22` or `2020-05`. Year-only dates like `2020` are not supported.

## Supported Operators

| Operator | Meaning             | Works with                            | Example              |
|----------|---------------------|---------------------------------------|----------------------|
| `eq`     | equal               | String, Number, Quantity, Date, Token | `a eq 3`             |
| `ne`     | not equal           | String, Number, Quantity, Date, Token | `a ne 3`             |
| `gt`     | greater than        | String, Number, Quantity, Date        | `a gt 3`             |
| `ge`     | greater or equal    | String, Number, Quantity, Date        | `a ge 3`             |
| `lt`     | less than           | String, Number, Quantity, Date        | `a lt 3`             |
| `le`     | less or equal       | String, Number, Quantity, Date        | `a le 3`             |
| `sw`     | starts with         | String                                | `a sw "x"`           |
| `ew`     | ends with           | String                                | `a ew "x"`           |
| `co`     | contains            | String, Number, Date Period           | `a co "x"`           |
| `ap`     | approximately equal | Number, Date Period                   | `date ap 2020-03`    |
| `sa`     | starts after        | Date Period                           | `date sa 2020-03`    |
| `eb`     | ends before         | Date Period                           | `date eb 2020-03`    |
| `po`     | overlaps            | Date Period                           | `date po 2020-03`    |
| `re`     | references          | Reference                             | `obj re "http://..."`|
| `and`    | logical and         | use between expressions               | `a gt 3 and a lt 5`  |
| `or`     | logical or          | use between expressions               | `a gt 3 or a lt 5`   |


