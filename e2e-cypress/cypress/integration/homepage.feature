Feature: HomePage

  I want to see all necessary content on the home page

  Scenario: Open the home page
    Given I open the home page
    Then I see "WirLernenOnline" in the title
    And I see the search bar input field
    And I see the search button
    And I see the search button label " Suche "
    And I see the filter button
    And I see the filter button label "Filter"
    And I see search results
#    And I see all recommendations of the editorial department
    When I scroll down to paginator
    Then I see the paginator
