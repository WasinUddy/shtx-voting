Feature: Admin session management
  As an administrator
  I want to manage voting sessions and teams
  So that live events can run smoothly

  Scenario: Admin logs in with valid credentials
    Given the admin is on the login page
    When the admin signs in with password "admin"
    Then the admin sees the sessions console

  Scenario: Admin sees an error for invalid login
    Given the admin is on the login page
    When the admin signs in with password "wrong-password"
    Then the admin sees login error "Invalid password"

  Scenario: Admin creates a new session
    Given the admin is logged in
    When the admin creates a session named "Demo Night"
    Then the admin sees session "Demo Night" with status "Not started"

  Scenario: Admin configures teams before starting
    Given the admin is logged in
    When the admin creates a session named "Team Setup"
    And the admin opens session "Team Setup"
    And the admin adds team "Alpha"
    And the admin adds team "Beta"
    Then the admin sees team "Alpha" in the session desk
    And the admin sees team "Beta" in the session desk

  Scenario: Admin starts and completes a session
    Given the admin is logged in
    When the admin creates a session named "Full Run"
    And the admin opens session "Full Run"
    And the admin adds team "Solo"
    And the admin starts the session from the desk
    Then the admin sees session status "In progress"
    When the admin ends the session from the desk
    Then the admin sees session status "Completed"
    And the admin sees final results for the session

  Scenario: Starting a session completes another in-progress session
    Given the admin is logged in
    When the admin creates a session named "Session A"
    And the admin opens session "Session A"
    And the admin adds team "A1"
    And the admin starts the session from the desk
    And the admin goes back to the sessions list
    And the admin creates a session named "Session B"
    And the admin opens session "Session B"
    And the admin adds team "B1"
    And the admin starts the session from the desk
    And the admin goes back to the sessions list
    Then the admin sees session "Session A" with status "Completed"
    And the admin sees session "Session B" with status "In progress"

  Scenario: Admin deletes a completed session
    Given the admin is logged in
    When the admin creates a session named "Disposable"
    And the admin opens session "Disposable"
    And the admin adds team "One"
    And the admin starts the session from the desk
    And the admin ends the session from the desk
    And the admin goes back to the sessions list
    And the admin removes session "Disposable"
    Then the admin does not see session "Disposable"
