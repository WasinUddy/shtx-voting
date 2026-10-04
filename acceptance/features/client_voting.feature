Feature: Client voting
  As an audience member
  I want to vote for teams on stage
  So that my score is counted during the event

  Background:
    Given the admin is logged in
    And the audience is on the voting page

  Scenario: Audience waits when no session is in progress
    Then the audience sees "Waiting for a session to start."

  Scenario: Audience waits when no team is on stage
    When the admin creates a session named "Lobby"
    And the admin opens session "Lobby"
    And the admin adds team "First"
    And the admin starts the session from the desk
    Then the audience sees "Waiting for the next team."

  Scenario: Audience votes and changes their score
    When the admin creates a session named "Vote Night"
    And the admin opens session "Vote Night"
    And the admin adds team "On Stage"
    And the admin starts the session from the desk
    And the admin opens team "On Stage" on stage
    Then the audience sees team "On Stage" ready to vote
    When the audience votes score "+2"
    Then the audience sees their vote as "+2"
    When the audience votes score "-1"
    Then the audience sees their vote as "-1"
