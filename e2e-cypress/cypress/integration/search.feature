Feature: Search

  I want to search for "Mathematik"

  Scenario: Open the german home page and search for "Mathematik"
    Given I open the german version of the home page
    And I search for "Mathematik"
    Then I see search results
    And I see the paginator
    And I see the search bar input field
    And I see the search button
    And I see the search button label "Suchen"
    And I see the filter button
