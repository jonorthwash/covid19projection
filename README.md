# About

## Purpose

This tool is meant to visualise the current state of the COVID-19 pandemic in a given area and project where things are headed, e.g., to determine when hospital beds will be at capacity.

Currently the data is only for a couple counties in Pennsylvania.  Feel free to submit more data via pull request!

## Use

The tool may be accessed live at https://jonorthwash.github.io/covid19math/ .

Feel free to submit issues or PRs, or simply fork and modify.

## Assumptions

This tool relies on the following assumptions:
* the distribution of new cases in time is roughly a Bell curve,
* a single standard deviation's worth of cases will span a certain number of days,
* mitigation factors can affect the length of this span,
* mitigation factors can affect the infection rate,
* the efficacy of testing falls somewhere between detecting only those cases needing hospitalisation and detecting every single infection.



# Sources
## Data

Delaware County data (`pa_delco.csv`) and Montgomery County (`pa_montco.csv`) from:
* https://www.health.pa.gov/topics/disease/coronavirus/Pages/Archives.aspx
* https://www.health.pa.gov/topics/disease/coronavirus/Pages/Cases.aspx

Alternative data (`pa_delco1.csv`) from:
* https://www.chesco.org/4376/Coronavirus-COVID-19

## Code

* `statsFunctions.js` functions from https://stackoverflow.com/questions/8816729/javascript-equivalent-for-inverse-normal-function-eg-excels-normsinv-or-nor/55837025
* `jquery.csv.min.js` from http://bl.ocks.org/espinielli/8d106a5cf9aa99734d43#jquery.csv.min.js
* `drawAdditionalHAxis` function and supporting functions based on https://stackoverflow.com/a/32060010/5181692
* `moment.min.js` from https://momentjs.com/

# License

The terms of use are governed by the [GPL v3 licence](LICENSE).
