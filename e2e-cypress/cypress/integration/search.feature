Feature: Search

  I want to search for "Mathematik"

  Scenario: Open the home page and search for "Mathematik"
    Given I open the home page
    Then I see "WirLernenOnline" in the title
#    And I see the search bar
