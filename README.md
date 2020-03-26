# About

## Purpose

This tool uses Farr's law to model where in the beginning of the COVID-19 pandemic a given area is, and to project when hospitals may reach capacity.

The tool assumes a Gaussian curve of new cases over time based on population size, proportion of the population anticipated to be affected, and other variables; calculates where in the curve we are now; and extrapolates the rest of the curve based on that.

This tool is *not* meant to give an exact model of the course of the pandemic.

Currently the data being tracked is only for a couple counties in Pennsylvania.  Feel free to submit more data via pull request!

## Use

The tool may be accessed live at https://jonorthwash.github.io/covid19projection/ .

Feel free to submit issues or PRs, or simply fork and modify.

## Assumptions

This tool relies on the following assumptions:
* the distribution of new cases in time is roughly a Gaussian curve,
* a single standard deviation's worth of cases will span a certain number of days,
* mitigation factors can affect the length of this span,
* mitigation factors can affect the infection rate,
* the efficacy of testing falls somewhere between detecting only those cases needing hospitalisation and detecting every single infection.

## Math

Assume the following constants/variables:

```
δ - duration of hospitalization stay
D - days per standard deviation (around peak)
C - number of people infected
I - infection rate (percentage of population affected)
J - hospitalization rate (percentage of those infected needing hospitalization)
N - total population
H - cumulative hospitalizations 
h - daily hospitalizations
t - time (in days)
ₜ - [for current time] 
ₓ - [a given index]
T - factor of testing efficacy (ranges from J to 1)
```

To solve for daily hospitalisations on a given day (*hₓ*):
```
σₜ = normsinv( ( Cₜ × ( J / (J + T) ) ) / ( N × I × J ) )
σₓ = σₜ + ( ( tₓ - tₜ) / D )
Hₓ = ( ( 1 + erf( σₓ / √2 ) ) / 2 ) × H
hₓ = Hₓ - H₍ ₓ - δ ₎
```


# Sources
## Data

Delaware County data (`pa_delco.csv`) and Montgomery County (`pa_montco.csv`) from:
* https://www.health.pa.gov/topics/disease/coronavirus/Pages/Archives.aspx
* https://www.health.pa.gov/topics/disease/coronavirus/Pages/Cases.aspx

Alternative data (`pa_delco1.csv`) from:
* https://www.chesco.org/4376/Coronavirus-COVID-19

Mississippi data (`ms.csv`) from:
* https://msdh.ms.gov/msdhsite/_static/14,0,420.html

Hospital data from:
* [List of hospitals in Pennsylvania](https://en.wikipedia.org/wiki/List_of_hospitals_in_Pennsylvania)
* [Springfield Hospital](https://www.crozerkeystone.org/springfield)
* [Mississippi Acute Care Facilities and Services Overview](http://www.msdh.state.ms.us/msdhsite/_static/resources/7756.pdf)

Population data rounded from [Wikipedia](https://wikipedia.org/) figures.

## Code

* `statsFunctions.js` functions from https://stackoverflow.com/questions/8816729/javascript-equivalent-for-inverse-normal-function-eg-excels-normsinv-or-nor/55837025
* `jquery.csv.min.js` from http://bl.ocks.org/espinielli/8d106a5cf9aa99734d43#jquery.csv.min.js
* `drawAdditionalHAxis` function and supporting functions based on https://stackoverflow.com/a/32060010/5181692
* `moment.min.js` from https://momentjs.com/

# License

The terms of use are governed by the [GPL v3 licence](LICENSE).
