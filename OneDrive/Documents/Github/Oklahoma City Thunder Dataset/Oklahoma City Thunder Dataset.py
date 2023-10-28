import pandas as pd
import numpy as np
import math

df = pd.read_csv("shots_data.csv")
#convert x and y columns to floats
df["x"] = df["x"].astype(float)
df["y"] = df["y"].astype(float)

#calculates whether x and y position is within 2 points area
def within2pts(row):
    x = row.x
    y = row.y

    if y >= 7.8:
        #assume top arc is spherical
        if math.sqrt(math.pow(x, 2) + math.pow(y, 2)) <= 23.75:
            return pd.Series([row.team, 1], index=["team", "within2pts"])
        else:
            return pd.Series([row.team, 0], index=["team", "within2pts"])
    else:
        if abs(x) <= 22:
            return pd.Series([row.team, 1], index=["team", "within2pts"])
        else:
            return pd.Series([row.team, 0], index=["team", "within2pts"])

#calculates whether x and y position is within nc3 zone
def withinNC3(row):
    x = row.x
    y = row.y

    if y > 7.8 and math.sqrt(math.pow(x, 2) + math.pow(y, 2)) > 23.75:
        return pd.Series([row.team, 1], index=["team", "withinNC3"])
    else:
        return pd.Series([row.team, 0], index=["team", "withinNC3"])

#calculates whether x and y position is within c3 zone
def withinC3(row):
    x = row.x
    y = row.y
    
    #assume line is low on dataset because it's inclusive on lower bound of NC3
    if y <= 7.8 and abs(x) > 22:
        return pd.Series([row.team, 1], index=["team", "withinC3"])
    else:
        return pd.Series([row.team, 0], index=["team", "withinC3"])





#For Team A, what percentage of their shots were attempted in the 2PT zone?
totalTeamAShots = df["team"].value_counts()["Team A"]
teamAShotsWithin2ptZoneTable = df[(df.team == "Team A")].apply(within2pts, axis=1)
totalTeamAShotsWithin2ptZone = teamAShotsWithin2ptZoneTable["within2pts"].value_counts()[1]
print("Team A within 2 pt zone:")
print(totalTeamAShotsWithin2ptZone / totalTeamAShots)

#For Team A, what percentage of their shots were attempted in the NC3 zone?
teamAShotsWithinNC3ZoneTable = df[(df.team == "Team A")].apply(withinNC3, axis=1)
totalTeamAShotsWithinNC3Zone = teamAShotsWithinNC3ZoneTable["withinNC3"].value_counts()[1]
print("Team A within NC3 zone:")
print(totalTeamAShotsWithinNC3Zone / totalTeamAShots)

#For Team A, what percentage of their shots were attempted in the C3 zone?
teamAShotsWithinC3ZoneTable = df[(df.team == "Team A")].apply(withinC3, axis=1)
totalTeamAShotsWithinC3Zone = teamAShotsWithinC3ZoneTable["withinC3"].value_counts()[1]
print("Team A within C3 zone:")
print(totalTeamAShotsWithinC3Zone / totalTeamAShots)

#check aggregated attempts against the number 1 

#Effective Field Goal Percentage; the formula is (FG + 0.5 * 3P) / FGA
#For Team A, what was the eFG in the 2PT zone?
madeTeamAShotsWithin2ptZoneTable = df[(df.team == "Team A") & (df.fgmade == 1)].apply(within2pts, axis=1)
totalMadeTeamAShotsWithin2ptZone = madeTeamAShotsWithin2ptZoneTable["within2pts"].value_counts()[1]
print("Team A made within 2 pt zone:")
print(totalMadeTeamAShotsWithin2ptZone / totalTeamAShotsWithin2ptZone)

#For Team A, what was the eFG in the NC3 zone?
madeTeamAShotsWithinNC3ZoneTable = df[(df.team == "Team A") & (df.fgmade == 1)].apply(withinNC3, axis=1)
totalMadeTeamAShotsWithinNC3Zone = madeTeamAShotsWithinNC3ZoneTable["withinNC3"].value_counts()[1]
print("Team A made within NC3 zone:")
print((totalMadeTeamAShotsWithinNC3Zone * 1.5) / totalTeamAShotsWithinNC3Zone)

#For Team A, what was the eFG in the C3 zone?
madeTeamAShotsWithinC3ZoneTable = df[(df.team == "Team A") & (df.fgmade == 1)].apply(withinC3, axis=1)
totalMadeTeamAShotsWithinC3Zone = madeTeamAShotsWithinC3ZoneTable["withinC3"].value_counts()[1]
print("Team A made within C3 zone:")
print((1.5 * totalMadeTeamAShotsWithinC3Zone) / totalTeamAShotsWithinC3Zone)



#now, do the same for B

#For Team B, what percentage of their shots were attempted in the 2PT zone?
totalTeamBShots = df["team"].value_counts()["Team B"]
teamBShotsWithin2ptZoneTable = df[(df.team == "Team B")].apply(within2pts, axis=1)
totalTeamBShotsWithin2ptZone = teamBShotsWithin2ptZoneTable["within2pts"].value_counts()[1]
print("Team B within 2 pt zone:")
print(totalTeamBShotsWithin2ptZone / totalTeamBShots)

#For Team B, what percentage of their shots were attempted in the NC3 zone?
teamBShotsWithinNC3ZoneTable = df[(df.team == "Team B")].apply(withinNC3, axis=1)
totalTeamBShotsWithinNC3Zone = teamBShotsWithinNC3ZoneTable["withinNC3"].value_counts()[1]
print("Team B within NC3 zone:")
print(totalTeamBShotsWithinNC3Zone / totalTeamBShots)

#For Team B, what percentage of their shots were attempted in the C3 zone?
teamBShotsWithinC3ZoneTable = df[(df.team == "Team B")].apply(withinC3, axis=1)
totalTeamBShotsWithinC3Zone = teamBShotsWithinC3ZoneTable["withinC3"].value_counts()[1]
print("Team B within C3 zone:")
print(totalTeamBShotsWithinC3Zone / totalTeamBShots)

#check aggregated attempts against the number 1 

#For Team B, what was the eFG in the 2PT zone?
madeTeamBShotsWithin2ptZoneTable = df[(df.team == "Team B") & (df.fgmade == 1)].apply(within2pts, axis=1)
totalMadeTeamBShotsWithin2ptZone = madeTeamBShotsWithin2ptZoneTable["within2pts"].value_counts()[1]
print("Team B made within 2 pt zone:")
print(totalMadeTeamBShotsWithin2ptZone / totalTeamBShotsWithin2ptZone)

#For Team B, what was the eFG in the NC3 zone?
madeTeamBShotsWithinNC3ZoneTable = df[(df.team == "Team B") & (df.fgmade == 1)].apply(withinNC3, axis=1)
totalMadeTeamBShotsWithinNC3Zone = madeTeamBShotsWithinNC3ZoneTable["withinNC3"].value_counts()[1]
print("Team B made within NC3 zone:")
print((totalMadeTeamBShotsWithinNC3Zone * 1.5) / totalTeamBShotsWithinNC3Zone)

#For Team B, what was the eFG in the C3 zone?
madeTeamBShotsWithinC3ZoneTable = df[(df.team == "Team B") & (df.fgmade == 1)].apply(withinC3, axis=1)
totalMadeTeamBShotsWithinC3Zone = madeTeamBShotsWithinC3ZoneTable["withinC3"].value_counts()[1]
print("Team B made within C3 zone:")
print((1.5 * totalMadeTeamBShotsWithinC3Zone) / totalTeamBShotsWithinC3Zone)
