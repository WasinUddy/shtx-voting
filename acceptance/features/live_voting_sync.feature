Feature: Live voting synchronization
  As an event operator and audience
  We want real-time updates between admin desk and voting clients
  So that scores and stage changes appear without refreshing

  Background:
    Given the admin is logged in
    And the audience is on the voting page
    And the admin has a session "Live Sync" with teams "Team One" and "Team Two" in progress

  Scenario: Stage change appears on the audience screen
    When the admin opens team "Team One" on stage
    Then the audience sees team "Team One" ready to vote

  Scenario: Audience vote updates the admin score desk
    When the admin opens team "Team One" on stage
    And the audience votes score "+3"
    Then the admin sees team "Team One" with 1 vote and total score "+3"

  Scenario: Clearing the stage updates the audience screen
    When the admin opens team "Team One" on stage
    Then the audience sees team "Team One" ready to vote
    When the admin clears the stage from the desk
    Then the audience sees "Waiting for the next team."
