#!/usr/bin/env python3

import sys
import re
from copy import copy

matchDate = re.compile("([0-9]{1,2})\/([0-9]{1,2})\/([0-9]{4,4})")
matchTotal = re.compile("TOTAL:\s+Positives:\s+([0-9,]{1,6})\s+\|\s+Negatives:\s+([0-9,]{1,7})\s+\|\s+Deaths:\s+([0-9,]{1,5})")
matchDaily = re.compile("DAILY:\s+Positives:\s+([0-9,]{1,6})\s+\|\s+Negatives:\s+([0-9,]{1,7})\s+\|\s+Deaths:\s+([0-9,]{1,5})")

empty = {0: None, 1: None, 2: None, 3: None, 4: None}

with open(sys.argv[1]) as infile:
    allLines = []
    thisLine = copy(empty)
    for line in infile.read().split('\n'):
        dateMatches = matchDate.search(line)
        if dateMatches:
            date = "{}-{:>02s}-{:>02s}".format(dateMatches[3],dateMatches[1],dateMatches[2])
            thisLine[0] = date
        totalMatches = matchTotal.search(line)
        if totalMatches:
            totalCases = totalMatches[1].replace(",", "")
            totalDeaths = totalMatches[3].replace(",", "")
            thisLine[2] = totalCases
            thisLine[4] = totalDeaths
        dailyMatches = matchDaily.search(line)
        if dailyMatches:
            dailyCases = dailyMatches[1].replace(",", "")
            dailyDeaths = dailyMatches[3].replace(",", "")
            thisLine[1] = dailyCases
            thisLine[3] = dailyDeaths


        if None not in thisLine.values():
            allLines.append(thisLine)
            thisLine = copy(empty)

for line in sorted(allLines, key=lambda i: i[0]):
    print(",".join(line.values()))
