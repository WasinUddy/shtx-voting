Feature: OBS overlay browser sources
  As a stream operator
  I want separate OBS pages for frame, plate, board, and pop
  So that the live show updates without manual refresh

  Background:
    Given the admin is logged in
    And the audience is on the voting page
    And the OBS browser sources are open

  Scenario: Live overlays stay hidden until a team is on stage
    Then the OBS frame shows title "SHTX Live"
    And the OBS frame client area is transparent
    And the OBS plate is not visible
    And the OBS board is not visible
    And the OBS pop is not visible
    When the admin creates a session named "OBS Night"
    And the admin opens session "OBS Night"
    And the admin adds team "Alpha"
    And the admin adds team "Beta"
    And the admin starts the session from the desk
    Then the OBS plate is not visible
    And the OBS board is not visible
    And the OBS pop is not visible

  Scenario: Stage, vote, score pop, and leaderboard order
    Given the admin has a session "OBS Live" with teams "Team One" and "Team Two" in progress
    When the admin opens team "Team One" on stage
    Then the OBS plate shows team "Team One" with score "0" and lean "zero"
    And the OBS board lists teams in order: "Team One", "Team Two"
    And the OBS board row for "Team One" has score "0" and is active
    And the OBS pop stays hidden
    When the audience votes score "+2"
    Then the OBS plate shows team "Team One" with score "+2" and lean "positive"
    And the OBS board row for "Team One" has score "+2" and is active
    And the OBS pop shows vote "+2"
    When the OBS pop has dismissed
    And the audience votes score "-1"
    Then the OBS plate shows team "Team One" with score "-1" and lean "negative"
    And the OBS pop shows vote "-1"
    When the admin opens team "Team Two" on stage
    And the audience votes score "-1"
    Then the OBS board lists teams in order: "Team One", "Team Two"
    And the OBS board row for "Team Two" has score "-1" and is active
    When the admin clears the stage from the desk
    Then the OBS plate is not visible
    And the OBS board is not visible
    And the OBS pop is not visible

  Scenario: Ending the session hides live overlays
    Given the admin has a session "OBS End" with teams "Solo" and "Other" in progress
    When the admin opens team "Solo" on stage
    Then the OBS plate shows team "Solo" with score "0" and lean "zero"
    When the admin ends the session from the desk
    Then the OBS plate is not visible
    And the OBS board is not visible
    And the OBS pop is not visible
    And the OBS frame shows title "SHTX Live"
