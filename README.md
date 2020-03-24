# Purpose

This tool is meant to visualise the current state of the COVID-19 pandemic in a given area, e.g., to determine when hospital beds will be at capacity.

Currently the data is only for Delaware County, Pennsylvania.  It would be nice to be able to add arbitrary data sets, but I haven't made it do that yet.

# Use

The tool may be accessed live at https://jonorthwash.github.io/covid19math/ .

Feel free to submit issues or PRs, or simply fork and modify.

# Data sources

Delaware County data from
* https://www.health.pa.gov/topics/disease/coronavirus/Pages/Archives.aspx
* https://www.health.pa.gov/topics/disease/coronavirus/Pages/Cases.aspx

# Code sources

* `statsFunctions.js` functions from https://stackoverflow.com/questions/8816729/javascript-equivalent-for-inverse-normal-function-eg-excels-normsinv-or-nor/55837025
* `jquery.csv.min.js` from http://bl.ocks.org/espinielli/8d106a5cf9aa99734d43#jquery.csv.min.js
* `drawAdditionalHAxis` function and supporting functions based on https://stackoverflow.com/a/32060010/5181692

# License

[GPL v3](https://www.gnu.org/licenses/gpl-3.0.html)
